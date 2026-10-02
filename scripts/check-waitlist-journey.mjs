import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";

const port = Number(process.env.WAITLIST_JOURNEY_PORT || 5298);
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { stdio: "ignore" });
let browser;
const body = (publicRows) => ({ source: { mode: "public-safe" }, updatedAt: "2026-10-02", publicRows });
const fixture = body([{ breed: "Bernedoodle", position: 7, display_name: "Fixture Q.", status: "Active", show_publicly: "Yes" }]);

try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { ready = (await fetch(origin)).ok; } catch { /* local startup */ }
    if (ready) break;
    await delay(250);
  }
  assert(ready, "Local server did not start");
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.clock.install();
  let held;
  let mode = "hold";
  let requests = 0;
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (!url.startsWith(origin)) return route.abort();
    if (url.endsWith("/api/waitlist")) {
      requests += 1;
      if (mode === "hold") { held = route; return; }
      if (mode === "network") return route.abort();
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mode === "empty" ? body([]) : mode === "malformed" ? {} : mode === "invalid-row" ? body([{ breed: "Bernedoodle", display_name: {}, position: 7 }]) : fixture) });
    }
    if (route.request().method() !== "GET") throw new Error("Unexpected write request");
    return route.continue();
  });
  const noPositions = async () => {
    assert.equal(await page.locator(".public-waitlist-card").count(), 0, "Unverified names/ranks must not render");
    assert.equal(await page.locator(".process-status-strip").count(), 0, "Unverified counts must not render");
    assert.equal(await page.locator(".waitlist-updated").count(), 0, "Unverified timestamp must not render");
    assert.equal(await page.getByText("Elise M.", { exact: true }).count(), 0, "Bundled fallback must not render");
  };
  const load = async () => {
    held = null;
    await page.goto(`${origin}/process/waitlist`, { waitUntil: "domcontentloaded" });
  };
  await load();
  await page.getByText("Loading current waitlist…", { exact: true }).waitFor();
  await noPositions();
  for (let i = 0; !held && i < 40; i += 1) await delay(25);
  assert(held, "Request must be intercepted");
  await held.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ message: "unavailable" }) });
  await page.getByRole("alert").waitFor();
  await noPositions();
  assert.equal(await page.locator(".note-panel").getByRole("link", { name: "Contact Us" }).getAttribute("href"), "/contact");

  const beforeRetry = requests;
  mode = "hold";
  held = null;
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await page.getByText("Loading current waitlist…", { exact: true }).waitFor();
  await noPositions();
  for (let i = 0; !held && i < 40; i += 1) await delay(25);
  assert(held);
  await held.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fixture) });
  await page.getByText("Fixture Q.", { exact: true }).waitFor();
  assert.equal(await page.locator(".public-waitlist-card li").count(), 1);
  assert.equal(await page.locator(".public-waitlist-card li span").innerText(), "7");
  assert.equal(requests - beforeRetry, 1, "Retry should make one fresh GET");
  assert.equal(await page.getByText("Elise M.", { exact: true }).count(), 0);

  for (mode of ["malformed", "invalid-row", "network"]) {
    await load();
    await page.getByRole("alert").waitFor();
    await noPositions();
  }
  mode = "hold";
  await load();
  await page.getByText("Loading current waitlist…", { exact: true }).waitFor();
  await page.clock.fastForward(16000);
  await page.getByRole("alert").waitFor();
  await noPositions();

  mode = "empty";
  await load();
  await page.getByText("No public waitlist positions are listed right now.", { exact: true }).waitFor();
  assert.equal(await page.locator(".public-waitlist-card").count(), 0);
  assert.equal(await page.locator(".process-status-strip").count(), 1, "Verified empty feed may show zero counts");
  assert.equal(await page.getByRole("alert").count(), 0, "Empty success must not imply failure");
  await page.goto(origin);
  await page.getByText("Explore upcoming litters or join the waitlist.", { exact: true }).waitFor();
  assert(!(await page.locator("main").innerText()).includes("All current puppies have families"));
  console.log("Waitlist journey PASS: no stale rows/counts/date during loading, HTTP/network/malformed/timeout errors, retry then verified rows, empty success, neutral homepage. All external requests blocked; no writes.");
} finally {
  if (browser) await browser.close();
  if (server.exitCode === null) {
    const exited = new Promise((resolve) => server.once("exit", resolve));
    server.kill("SIGTERM");
    await Promise.race([exited, delay(3000).then(() => server.exitCode === null && server.kill("SIGKILL"))]);
  }
}

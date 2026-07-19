import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";

const root = process.cwd();
const port = Number(process.env.GA4_CONTRACT_PORT || 5229);
const baseUrl = `http://127.0.0.1:${port}`;
const privateTestValues = [
  "Rejected Contact Test",
  "rejected-contact@example.com",
  "555-010-1111",
  "This rejected contact message must stay private.",
  "Application Test Family",
  "application-test@example.com",
  "555-010-2222",
  "This application answer must stay private.",
  "TEST-SUBMISSION-ID"
];

function read(filePath) {
  return fs.readFileSync(path.join(root, filePath), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function startDevServer() {
  return spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
    cwd: root,
    env: {
      ...process.env,
      VITE_GA_MEASUREMENT_ID: "G-REDRANCHTEST",
      VITE_GA_DEBUG_MODE: "true"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
}

async function stopDevServer(server) {
  if (!server || server.exitCode !== null) return;

  const exited = new Promise((resolve) => server.once("exit", resolve));
  server.kill("SIGTERM");

  await Promise.race([
    exited,
    delay(3000).then(() => {
      if (server.exitCode === null) server.kill("SIGKILL");
    })
  ]);
}

async function waitForServer() {
  const started = Date.now();

  while (Date.now() - started < 25000) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Keep polling while the local Vite server starts.
    }
    await delay(400);
  }

  throw new Error(`GA4 contract server did not respond at ${baseUrl}`);
}

async function launchBrowser() {
  try {
    return await chromium.launch({ channel: "chrome", headless: true });
  } catch {
    return chromium.launch({ headless: true });
  }
}

async function gaEvents(page) {
  return page.evaluate(() => {
    return (window.dataLayer || [])
      .filter((entry) => entry?.[0] === "event")
      .map((entry) => ({
        name: entry[1],
        params: entry[2] || {}
      }));
  });
}

async function waitForEventCount(page, eventName, expectedCount) {
  await page.waitForFunction(
    ({ eventName: name, expectedCount: count }) => {
      return (window.dataLayer || []).filter((entry) => entry?.[0] === "event" && entry[1] === name).length >= count;
    },
    { eventName, expectedCount },
    { timeout: 8000 }
  );
}

async function clickFirstVisible(page, selector) {
  const clicked = await page.locator(selector).evaluateAll((nodes) => {
    const target = nodes.find((node) => {
      const rect = node.getBoundingClientRect();
      const style = window.getComputedStyle(node);
      return rect.width > 1 && rect.height > 1 && style.visibility !== "hidden" && style.display !== "none";
    });

    target?.click();
    return Boolean(target);
  });

  assert(clicked, `No visible clickable element found for ${selector}`);
}

async function runBrowserContract() {
  const server = startDevServer();
  let browser;

  try {
    await waitForServer();
    browser = await launchBrowser();
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

    await page.route("https://www.googletagmanager.com/gtag/js**", (route) => {
      route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
    });

    await page.route("**/api/forms", (route) => {
      const payload = route.request().postDataJSON();
      if (payload.formType !== "application") {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ ok: false, message: "Controlled test rejection." })
        });
        return;
      }

      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          submissionId: "TEST-SUBMISSION-ID",
          formType: "application",
          leadType: "Puppy Application",
          routingBucket: "application",
          message: "Thank you. We received your submission."
        })
      });
    });

    await page.goto(baseUrl);
    await waitForEventCount(page, "page_view", 1);

    const gaScriptCount = await page.locator('script[data-red-ranch-ga4="G-REDRANCHTEST"]').count();
    assert(gaScriptCount === 1, `Expected one GA4 script, found ${gaScriptCount}.`);

    await clickFirstVisible(page, 'a[href="/puppies/available"]');
    await page.waitForURL(`${baseUrl}/puppies/available`, { timeout: 8000 });
    await waitForEventCount(page, "view_available_puppies_click", 1);
    await waitForEventCount(page, "page_view", 2);

    await clickFirstVisible(page, 'a[href="/apply"]');
    await page.waitForURL(`${baseUrl}/apply`, { timeout: 8000 });
    await waitForEventCount(page, "cta_apply_click", 1);
    await waitForEventCount(page, "page_view", 3);

    await page.evaluate(() => {
      window.history.pushState({}, "", "/contact");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await page.waitForURL(`${baseUrl}/contact`, { timeout: 8000 });
    await waitForEventCount(page, "page_view", 4);

    const form = page.locator('form[data-form-type="contact"]');
    await form.locator('input[name="name"]').fill("Rejected Contact Test");
    await waitForEventCount(page, "form_start", 1);
    await form.locator('input[name="email"]').fill("rejected-contact@example.com");
    await form.locator('input[name="phone"]').fill("555-010-1111");
    await form.locator('textarea[name="message"]').fill("This rejected contact message must stay private.");
    await form.locator('button[type="submit"]').click();
    await form.locator(".form-status.error").waitFor({ state: "visible" });
    assert(!(await gaEvents(page)).some((event) => event.name === "form_submit_success"), "GA4 form_submit_success must not fire after an API rejection.");

    await page.evaluate(() => {
      window.history.pushState({}, "", "/apply");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await page.waitForURL(`${baseUrl}/apply`, { timeout: 8000 });
    await waitForEventCount(page, "page_view", 5);

    const applicationForm = page.locator('form[data-form-type="application"]');
    await applicationForm.locator('input[name="name"]').fill("Application Test Family");
    await waitForEventCount(page, "form_start", 2);
    await applicationForm.locator('input[name="email"]').fill("application-test@example.com");
    await applicationForm.locator('input[name="phone"]').fill("555-010-2222");
    await applicationForm.locator('input[name="preferredBreed"][value="Goldendoodle"]').check();
    await applicationForm.locator('textarea[name="message"]').fill("This application answer must stay private.");
    await applicationForm.locator('input[name="processAgreement"]').check();
    await applicationForm.locator('input[name="signature"]').fill("Application Test Family");
    await applicationForm.locator('button[type="submit"]').click();
    await waitForEventCount(page, "form_submit_success", 1);

    await page.evaluate(() => {
      const sms = document.createElement("a");
      sms.href = "sms:+15550109999";
      sms.textContent = "Text test";
      document.body.appendChild(sms);
      sms.dispatchEvent(new globalThis.MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
      sms.remove();
    });
    await waitForEventCount(page, "cta_text_click", 1);

    await page.evaluate(() => {
      window.history.pushState({}, "", "/puppies/upcoming-litters");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await page.waitForURL(`${baseUrl}/puppies/upcoming-litters`, { timeout: 8000 });
    await waitForEventCount(page, "page_view", 6);
    await clickFirstVisible(page, ".upcoming-litter-groups .upcoming-breed-toggle");
    await clickFirstVisible(page, 'a[href^="/litters/"]');
    await page.waitForFunction(() => window.location.pathname.startsWith("/litters/"), {}, { timeout: 8000 });
    await waitForEventCount(page, "view_litter_click", 1);
    await waitForEventCount(page, "page_view", 7);

    const events = await gaEvents(page);
    const eventNames = events.map((event) => event.name);
    [
      "page_view",
      "form_start",
      "form_submit_success",
      "cta_apply_click",
      "cta_text_click",
      "view_available_puppies_click",
      "view_litter_click"
    ].forEach((eventName) => {
      assert(eventNames.includes(eventName), `Missing GA4 event ${eventName}.`);
    });

    assert(eventNames.filter((eventName) => eventName === "page_view").length === 7, "GA4 emitted duplicate or missing page views during route checks.");

    const serializedEvents = JSON.stringify(events);
    privateTestValues.forEach((privateValue) => {
      assert(!serializedEvents.includes(privateValue), `GA4 dataLayer included private test value: ${privateValue}`);
    });

    const formSuccess = events.find((event) => event.name === "form_submit_success");
    assert(formSuccess?.params?.form_type === "application", "GA4 form_submit_success should identify puppy applications with form_type=application.");
    assert(!("submissionId" in (formSuccess?.params || {})), "GA4 form_submit_success must not include submissionId.");

    return events;
  } finally {
    if (browser) await browser.close();
    await stopDevServer(server);
  }
}

function runStaticContract() {
  const appSource = read("src/App.jsx");
  const mainSource = read("src/main.jsx");
  const gaSource = read("src/ga4.js");
  const envExample = read(".env.example");

  assert(mainSource.includes("<Analytics />"), "Vercel Analytics component must remain mounted.");
  assert(appSource.includes("trackGa4Event") && appSource.includes("trackGa4PageView"), "src/App.jsx must wire GA4 event and page-view helpers.");
  assert(gaSource.includes("VITE_GA_MEASUREMENT_ID"), "GA4 must be gated behind VITE_GA_MEASUREMENT_ID.");
  assert(gaSource.includes("send_page_view: false"), "GA4 config must disable automatic page_view to avoid SPA duplicates.");
  assert(envExample.includes("VITE_GA_MEASUREMENT_ID"), ".env.example must document VITE_GA_MEASUREMENT_ID.");

  [
    "form_start",
    "form_submit_success",
    "cta_apply_click",
    "cta_text_click",
    "view_available_puppies_click",
    "view_litter_click"
  ].forEach((eventName) => {
    assert(gaSource.includes(`"${eventName}"`), `GA4 mirrored event list is missing ${eventName}.`);
  });

  [
    "submissionId",
    "data.email",
    "data.phone",
    "data.message",
    "data.address",
    "payload"
  ].forEach((forbiddenMarker) => {
    assert(!gaSource.includes(forbiddenMarker), `GA4 helper should not reference private marker ${forbiddenMarker}.`);
  });
}

runStaticContract();
const events = await runBrowserContract();

console.log(`GA4 contract check passed: ${events.length} GA4 dataLayer events observed, Vercel Analytics remains mounted, and private form values stayed out of GA4.`);

import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";

const port = Number(process.env.APPLICATION_JOURNEY_PORT || 5230);
const baseUrl = `http://127.0.0.1:${port}`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function startDevServer() {
  return spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
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
  await Promise.race([exited, delay(3000).then(() => server.exitCode === null && server.kill("SIGKILL"))]);
}

async function waitForServer() {
  const started = Date.now();
  while (Date.now() - started < 25000) {
    try {
      if ((await fetch(baseUrl)).ok) return;
    } catch {
      // Keep polling while Vite starts.
    }
    await delay(300);
  }
  throw new Error(`Application journey server did not respond at ${baseUrl}`);
}

async function fillRequiredApplication(form, { breed = "Cavapoo", name = "Local Journey Test" } = {}) {
  await form.locator('input[name="name"]').fill(name);
  await form.locator('input[name="email"]').fill("local-journey@example.test");
  await form.locator('input[name="phone"]').fill("555-010-9090");
  const chosenBreed = form.locator(`input[name="preferredBreed"][value="${breed}"]`);
  if (!(await chosenBreed.isChecked())) await chosenBreed.check();
  await form.locator('input[name="processAgreement"]').check();
  await form.locator('input[name="signature"]').fill(name);
}

async function buyerApplicationEvents(page) {
  return page.evaluate(() => (window.dataLayer || [])
    .filter((entry) => entry?.[0] === "event" && entry[1] === "puppy_buyer_application_success")
    .map((entry) => entry[2] || {}));
}

async function waitForInquiryPuppy(page, slug) {
  await page.waitForFunction((expected) =>
    document.querySelector('#beatrix-inquiry select[name="puppySlug"]')?.value === expected,
  slug, { timeout: 5000 });
}

const server = startDevServer();
let browser;

try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const submissions = [];
  let responseMode = "failure";

  await page.route("https://www.googletagmanager.com/**", (route) => route.abort());
  await page.route("**/api/forms", async (route) => {
    submissions.push(route.request().postDataJSON());
    if (responseMode === "failure") {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ message: "Controlled local delivery failure." })
      });
      return;
    }

    await delay(250);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        message: "Thank you. We received your submission.",
        submissionId: "LOCAL-JOURNEY-TEST",
        formType: "application",
        leadType: "Puppy Application"
      })
    });
  });

  await page.goto(`${baseUrl}/apply`, { waitUntil: "networkidle" });
  const generalForm = page.locator('form[data-form-type="application"]');
  assert((await generalForm.locator('input[name="specificInterest"]').inputValue()) === "", "General Apply should not invent a litter interest.");
  assert((await generalForm.locator('input[name="preferredBreed"]:checked').count()) === 0, "General Apply should not preselect a breed.");
  assert((await page.locator(".application-reserve-hero").count()) === 0, "General Apply should use the general application introduction.");

  await fillRequiredApplication(generalForm);
  await generalForm.locator('button[type="submit"]').click();
  await generalForm.locator(".form-status.error").waitFor();
  assert((await generalForm.locator('input[name="name"]').inputValue()) === "Local Journey Test", "Recoverable errors must preserve entered values.");
  assert(await generalForm.locator('button[type="submit"]').isEnabled(), "A failed submission must remain retryable.");
  assert((await generalForm.locator(".form-success-panel").count()) === 0, "A failed submission must not show confirmation.");
  assert((await buyerApplicationEvents(page)).length === 0, "A failed application must not emit a successful buyer conversion.");

  await page.goto(`${baseUrl}/apply?litter=georgia-waylon-may-2026`, { waitUntil: "networkidle" });
  assert((await page.locator(".application-reserve-hero h1").innerText()) === "Apply for a Similar Litter", "A previous litter must not be presented as currently open to apply for.");
  assert((await page.locator('input[name="specificInterest"]').first().inputValue()).startsWith("Georgia + Waylon"), "A previous litter should remain an editable style reference.");

  await page.goto(`${baseUrl}/litters/beatrix-enzo-planned-2026`, { waitUntil: "networkidle" });
  const inquiryForm = page.locator('#beatrix-inquiry form[data-form-type="contact"]');
  await page.getByRole("link", { name: "Ask about Atticus", exact: true }).click();
  await waitForInquiryPuppy(page, "atticus");
  await inquiryForm.locator('input[name="name"]').fill("Inquiry Draft Test");
  await inquiryForm.locator('textarea[name="message"]').fill("Please tell me about this puppy's personality.");
  await page.getByRole("link", { name: "Ask about Twain", exact: true }).click();
  await waitForInquiryPuppy(page, "twain");
  assert((await inquiryForm.locator('input[name="name"]').inputValue()) === "Inquiry Draft Test", "Changing puppy interest must preserve the inquiry name.");
  assert((await inquiryForm.locator('textarea[name="message"]').inputValue()) === "Please tell me about this puppy's personality.", "Changing puppy interest must preserve the inquiry message.");
  await page.goBack();
  await waitForInquiryPuppy(page, "atticus");
  assert((await inquiryForm.locator('input[name="name"]').inputValue()) === "Inquiry Draft Test", "Back to the previous puppy must preserve the inquiry name.");
  assert((await inquiryForm.locator('textarea[name="message"]').inputValue()) === "Please tell me about this puppy's personality.", "Back to the previous puppy must preserve the inquiry message.");
  const litterApply = page.locator(".litter-primary-cta-section a.button.primary");
  assert((await litterApply.getAttribute("href")) === "/apply?litter=beatrix-enzo-planned-2026", "Litter Apply must carry the verified litter slug.");
  const stickyLitterApply = page.locator(".sticky-mobile-cta a.button.primary");
  assert((await stickyLitterApply.getAttribute("href")) === "/apply?litter=beatrix-enzo-planned-2026", "The mobile litter Apply must also preserve the litter slug.");
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.locator(".sticky-mobile-cta.visible").waitFor();
  await stickyLitterApply.click();
  await page.waitForURL(`${baseUrl}/apply?litter=beatrix-enzo-planned-2026`);

  const litterForm = page.locator('form[data-form-type="application"]');
  assert((await page.locator(".application-reserve-hero h1").innerText()) === "Apply for Beatrix + Enzo", "The application must visibly confirm the selected litter.");
  assert((await litterForm.locator('input[name="specificInterest"]').first().inputValue()).startsWith("Beatrix + Enzo"), "The specific-interest field must carry the litter name.");
  assert(await litterForm.locator('input[name="preferredBreed"][value="Goldendoodle"]').isChecked(), "The litter breed should be preselected.");
  const opennessChoice = litterForm.locator('input[name="specificInterest"][type="checkbox"]');
  assert(!(await opennessChoice.isChecked()), "Openness to similar or future litters must start unspecified.");

  responseMode = "success";
  await fillRequiredApplication(litterForm, { breed: "Goldendoodle", name: "Litter Journey Test" });
  await litterForm.locator('button[type="submit"]').click();
  await page.getByText("Sending...").waitFor();
  await litterForm.locator(".form-success-panel").waitFor();

  const successText = await litterForm.innerText();
  assert(successText.toLowerCase().includes("application received"), `Confirmed delivery should show the received state. Saw: ${successText}`);
  assert(successText.includes("does not reserve a puppy or create a waitlist position"), "Confirmation must distinguish an application from a reservation.");
  assert((await litterForm.locator('button[type="submit"]').count()) === 0, "The confirmed state must not offer a duplicate submit button.");
  assert(submissions.length === 2, `Expected one failed attempt and one confirmed attempt, received ${submissions.length}.`);
  assert(submissions[1].specificInterest.includes("Beatrix + Enzo"), "Submitted payload must preserve the selected litter.");
  assert(!submissions[1].specificInterest.includes("open to similar or future litters"), "An unset openness choice must not assert that preference.");

  await page.keyboard.press("Enter");
  await delay(300);
  assert(submissions.length === 2, "The confirmation state must prevent a repeat submission.");

  await page.goto(`${baseUrl}/apply?litter=beatrix-enzo-planned-2026`, { waitUntil: "networkidle" });
  const openLitterForm = page.locator('form[data-form-type="application"]');
  await fillRequiredApplication(openLitterForm, { breed: "Goldendoodle", name: "Open Journey Test" });
  await openLitterForm.locator('input[name="specificInterest"][type="checkbox"]').check();
  await openLitterForm.locator('button[type="submit"]').click();
  await openLitterForm.locator(".form-success-panel").waitFor();
  assert(submissions.length === 3, `Expected the explicit-openness submission to be recorded once, received ${submissions.length} total requests.`);
  assert(submissions[2].specificInterest.includes("Beatrix + Enzo"), "Explicit-openness payload must preserve the selected litter.");
  assert(submissions[2].specificInterest.includes("open to similar or future litters"), "A selected openness choice must survive submission.");

  for (const entry of [
    { route: "/apply", name: "General Buyer Test", breedSlug: "" },
    { route: "/apply?breed=goldendoodle-puppies", name: "Breed Buyer Test", breedSlug: "goldendoodle-puppies" }
  ]) {
    await page.goto(`${baseUrl}${entry.route}`, { waitUntil: "networkidle" });
    const form = page.locator('form[data-form-type="application"]');
    const beforeSubmissions = submissions.length;
    await fillRequiredApplication(form, { breed: "Goldendoodle", name: entry.name });
    await form.locator('button[type="submit"]').click();
    await form.locator(".form-success-panel").waitFor();
    const events = await buyerApplicationEvents(page);
    assert(events.length === 1, `${entry.route} must emit exactly one successful buyer application conversion.`);
    assert(events[0].form_type === "application", "Buyer conversion must identify the application form.");
    assert((events[0].breed_slug || "") === entry.breedSlug, "Buyer conversion must preserve a supplied breed identifier without inventing one.");
    assert(!events[0].puppy_slug && !events[0].litter_slug, "General and breed-only applications must not invent puppy or litter identifiers.");
    assert(!JSON.stringify(events).includes(entry.name), "Buyer analytics must not expose the applicant name.");
    await page.keyboard.press("Enter");
    await delay(300);
    assert(submissions.length === beforeSubmissions + 1, `${entry.route} must prevent duplicate successful submissions.`);
    assert((await buyerApplicationEvents(page)).length === 1, "Duplicate prevention must also prevent a second buyer conversion.");
  }

  console.log("Application journey passed: same-page puppy inquiry and Back preserve drafts, mobile litter context, general and breed buyer conversions, failure retention, loading, confirmed receipt, explicit openness, and duplicate prevention.");
} finally {
  if (browser) await browser.close();
  await stopDevServer(server);
}

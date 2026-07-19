const GA_MEASUREMENT_ID = String(import.meta.env.VITE_GA_MEASUREMENT_ID || "").trim();
const GA_DEBUG_MODE = String(import.meta.env.VITE_GA_DEBUG_MODE || "").trim().toLowerCase() === "true";

const mirroredEvents = new Set([
  "form_start",
  "form_submit_success",
  "cta_apply_click",
  "cta_text_click",
  "view_available_puppies_click",
  "view_litter_click"
]);

let initialized = false;
let lastPageViewKey = "";

function canUseBrowserAnalytics() {
  return Boolean(GA_MEASUREMENT_ID && typeof window !== "undefined" && typeof document !== "undefined");
}

function gtag() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(arguments);
}

function normalizedPath(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "/";

  try {
    const url = raw.startsWith("http") ? new window.URL(raw) : new window.URL(raw, window.location.origin);
    return url.pathname.replace(/\/$/, "") || "/";
  } catch {
    return raw.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";
  }
}

function normalizedTarget(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("sms:")) return "sms";
  if (raw.startsWith("tel:")) return "tel";
  if (raw.startsWith("mailto:")) return "mailto";
  return normalizedPath(raw).slice(0, 96);
}

function gaEventParams(eventName, data = {}) {
  const params = {
    event_category: eventName.startsWith("form_") ? "form" : "navigation"
  };

  if (data.formType) params.form_type = String(data.formType).slice(0, 48);
  if (data.path) params.page_path = normalizedPath(data.path);
  if (data.from) params.from_path = normalizedPath(data.from);
  if (data.target) params.link_target = normalizedTarget(data.target);
  if (GA_DEBUG_MODE) params.debug_mode = true;

  return params;
}

export function hasGaMeasurementId() {
  return Boolean(GA_MEASUREMENT_ID);
}

export function initGa4() {
  if (!canUseBrowserAnalytics()) return false;
  if (initialized) return true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || gtag;

  const existingScript = document.querySelector(`script[data-red-ranch-ga4="${GA_MEASUREMENT_ID}"]`);
  if (!existingScript) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    script.dataset.redRanchGa4 = GA_MEASUREMENT_ID;
    document.head.appendChild(script);
  }

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    send_page_view: false,
    ...(GA_DEBUG_MODE ? { debug_mode: true } : {})
  });

  initialized = true;
  return true;
}

export function trackGa4PageView(path) {
  if (!initGa4()) return;

  const pagePath = normalizedPath(path || window.location.pathname);
  const pageLocation = `${window.location.origin}${pagePath}`;
  const pageTitle = document.title || "Red Ranch Dogs";
  const pageViewKey = `${pagePath}|${pageTitle}`;

  if (pageViewKey === lastPageViewKey) return;
  lastPageViewKey = pageViewKey;

  window.gtag("event", "page_view", {
    page_title: pageTitle,
    page_location: pageLocation,
    page_path: pagePath,
    ...(GA_DEBUG_MODE ? { debug_mode: true } : {})
  });
}

export function trackGa4Event(eventName, data = {}) {
  if (!mirroredEvents.has(eventName) || !initGa4()) return;
  window.gtag("event", eventName, gaEventParams(eventName, data));
}

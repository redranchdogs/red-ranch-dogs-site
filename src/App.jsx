import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { track } from "@vercel/analytics";
import {
  ArrowRight,
  Camera,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Heart,
  Home as HomeIcon,
  Instagram,
  Mail,
  MessageCircle,
  PawPrint,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Star
} from "lucide-react";
import {
  brand,
  breeds as homepageBreeds,
  damDetails,
  damGroups,
  faqs,
  familyStory,
  guardianProgram,
  images,
  litterDetails,
  navGroups,
  parentDogs,
  previousLitterArchiveGroups,
  previousLitterDetails,
  priceGroups,
  puppyIncludedSections,
  reproductiveSections,
  reviews,
  stopMarkingGuide,
  studCatalog,
  studDetails,
  teamMembers,
  upcomingLitters
} from "./data/siteData.js";
import breedProfiles from "./data/breeds.json";
import puppyProfiles from "./data/puppies.json";
import litterProfiles from "./data/litters.json";
import parentProfiles from "./data/parents.json";
import testimonialProfiles from "./data/testimonials.json";
import faqProfiles from "./data/faqs.json";
import pricingProfiles from "./data/pricing.json";
import teamProfiles from "./data/team.json";
import waitlistData from "./data/waitlist.json";

function pathNow() {
  return window.location.pathname.replace(/\/$/, "") || "/";
}

function hashNow() {
  return window.location.hash.replace(/^#/, "");
}

function scrollToRouteTarget(hash, behavior = "auto") {
  if (hash) {
    document.getElementById(hash)?.scrollIntoView({ behavior, block: "start" });
    return;
  }
  window.scrollTo({ top: 0, left: 0, behavior });
}

function scheduleRouteScroll(hash, behavior = "auto") {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => scrollToRouteTarget(hash, behavior));
  });
}

function compactPath(path = "") {
  if (!path) return "/";
  return path.replace(/\/$/, "") || "/";
}

function cleanAnalyticsTarget(value = "") {
  return String(value || "")
    .replace(siteOrigin, "")
    .replace(/^https?:\/\/(www\.)?redranchdogs\.com/i, "")
    .slice(0, 96) || "/";
}

function trackSiteEvent(name, data = {}) {
  try {
    track(name, data);
  } catch {
    // Analytics should never interfere with puppy families using the site.
  }
}

function analyticsEventForHref(href = "") {
  if (!href) return null;
  if (href.startsWith("sms:")) return "cta_text_click";
  if (href.startsWith("mailto:")) return "cta_email_click";
  if (href.startsWith("tel:")) return "cta_call_click";
  if (href.includes("instagram.com")) return "social_instagram_click";
  if (href.includes("google.com") || href.includes("g.page")) return "social_google_reviews_click";
  if (href === "/apply" || href === "/puppy-application") return "cta_apply_click";
  if (href.includes("/process/application-and-waitlist")) return "view_application_waitlist_click";
  if (href.includes("/process/how-it-works")) return "view_process_click";
  if (href.includes("/process/pickup-and-delivery")) return "view_pickup_delivery_click";
  if (href.includes("/litters/")) return "view_litter_click";
  if (href.includes("/puppies/available")) return "view_available_puppies_click";
  if (href.includes("/puppies/current-litters")) return "view_current_litters_click";
  if (href.includes("/puppies/upcoming-litters")) return "view_upcoming_litters_click";
  if (href.includes("/puppies/goldendoodle-puppies") || href.includes("/puppies/cavapoo-puppies") || href.includes("/puppies/bernedoodle-puppies")) return "view_breed_page_click";
  if (href.includes("/puppies/") && !href.includes("/puppies/current-litters") && !href.includes("/puppies/available")) return "view_puppy_or_breed_click";
  if (href.includes("/parents/")) return "view_parent_click";
  if (href.includes("/process/pricing")) return "view_pricing_click";
  if (href.includes("/guardian-program")) return "view_guardian_program_click";
  if (href.includes("/stud-services")) return "view_stud_services_click";
  return null;
}

function trackNavigationIntent(href) {
  const eventName = analyticsEventForHref(href);
  if (!eventName || typeof window === "undefined") return;
  trackSiteEvent(eventName, {
    from: compactPath(window.location.pathname),
    target: cleanAnalyticsTarget(href)
  });
}

function goTo(href) {
  const hash = href.includes("#") ? href.split("#")[1] : "";
  if (!hash) {
    scrollToRouteTarget("", "auto");
  }
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
  scheduleRouteScroll(hash, hash ? "smooth" : "auto");
}

function Link({ href, children, className, onClick, ...props }) {
  const handleClick = (event) => {
    if (href?.startsWith("http") || href?.startsWith("sms:") || href?.startsWith("mailto:")) {
      return;
    }
    event.preventDefault();
    trackNavigationIntent(href);
    onClick?.();
    goTo(href);
  };

  return (
    <a href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

const siteOrigin = "https://www.redranchdogs.com";
const notFoundSeo = {
  title: "Page Moved | Red Ranch Dogs",
  description: "Find the right Red Ranch Dogs page for current litters, upcoming litters, puppy applications, process details, and contact information."
};
const defaultSocialImage = `${siteOrigin}/images/home/red-ranch-dogs-goldendoodle-puppy-hero-900.jpeg`;
const socialProfiles = [brand.instagram, brand.googleReviews].filter(Boolean);
const localGeo = {
  region: "US-TX",
  placeName: brand.location || "Salado, Texas"
};

const architectureSeo = {
  "/puppies": {
    title: "Puppies | Red Ranch Dogs",
    description: "Browse Red Ranch Dogs puppy availability, upcoming litters, breed pages, and puppy care resources."
  },
  "/puppies/available": {
    title: "Available Puppies | Red Ranch Dogs",
    description: "View current Red Ranch Dogs puppy cards with status, litter, breed, and go-home timing."
  },
  "/puppies/current-litters": {
    title: "Current Litters | Red Ranch Dogs",
    description: "Follow current Red Ranch Dogs litters, weekly puppy photos, go-home dates, and availability notes."
  },
  "/puppies/upcoming-litters": {
    title: "Upcoming Litters | Red Ranch Dogs",
    description: "See planned Goldendoodle, Cavapoo, and Bernedoodle litters from Red Ranch Dogs."
  },
  "/puppies/previous-litters": {
    title: "Previous Litters | Red Ranch Dogs",
    description: "Browse past Red Ranch Dogs litters by breed, pairing, puppy photo history, size, coat, and color."
  },
  "/puppies/what-comes-with-your-puppy": {
    title: "What Comes With Your Puppy | Red Ranch Dogs",
    description: "Review what Red Ranch Dogs puppies come home with, including care, socialization, records, and transition support."
  },
  "/puppies/coat-traits": {
    title: "Coat Traits | Red Ranch Dogs",
    description: "Learn about Red Ranch Dogs doodle coat colors, markings, textures, and lower-shedding trait planning."
  },
  "/parents": {
    title: "Parent Dogs | Red Ranch Dogs",
    description: "Meet Red Ranch Dogs mamas and studs with structured profiles, photos, traits, and related litters."
  },
  "/parents/mamas": {
    title: "Mamas | Red Ranch Dogs",
    description: "Meet the Red Ranch Dogs mamas organized by breed, weight, coat, status, and related litters."
  },
  "/parents/studs": {
    title: "Studs | Red Ranch Dogs",
    description: "Meet Red Ranch Dogs studs organized for puppy families and breeder service inquiries."
  },
  "/parents/goldendoodle-parents": {
    title: "Goldendoodle Parents | Red Ranch Dogs",
    description: "Meet Red Ranch Dogs Goldendoodle program parents with structured photos, traits, testing links, and related litters."
  },
  "/parents/cavapoo-parents": {
    title: "Cavapoo Parents | Red Ranch Dogs",
    description: "Meet Red Ranch Dogs Cavapoo program parents with structured photos, traits, testing links, and related litters."
  },
  "/parents/bernedoodle-parents": {
    title: "Bernedoodle Parents | Red Ranch Dogs",
    description: "Meet Red Ranch Dogs Bernedoodle program parents with structured photos, traits, testing links, and related litters."
  },
  "/process": {
    title: "Process | Red Ranch Dogs",
    description: "Learn how Red Ranch Dogs applications, pricing, waitlists, pickup, delivery, and FAQs fit together."
  },
  "/process/how-it-works": {
    title: "How It Works | Red Ranch Dogs",
    description: "Review the Red Ranch Dogs process from application and deposit through puppy selection and go-home day."
  },
  "/process/pricing": {
    title: "Pricing | Red Ranch Dogs",
    description: "Review Red Ranch Dogs pricing guidance by breed, size, deposits, and what is included with each puppy."
  },
  "/process/application-and-waitlist": {
    title: "Application & Waitlist | Red Ranch Dogs",
    description: "Start the Red Ranch Dogs application and waitlist process for Goldendoodles, Cavapoos, and Bernedoodles."
  },
  "/process/waitlist": {
    title: "Current Waitlist | Red Ranch Dogs",
    description: "View current public Red Ranch Dogs waitlist positions for Goldendoodles, Cavapoos, and Bernedoodles."
  },
  "/process/faq": {
    title: "FAQ | Red Ranch Dogs",
    description: "Answers to common Red Ranch Dogs questions about process, pricing, waitlists, and breed fit."
  },
  "/process/pickup-and-delivery": {
    title: "Puppy Pickup & Delivery | Red Ranch Dogs",
    description: "Learn how Red Ranch Dogs pickup, delivery, and go-home preparation will be organized."
  },
  "/stud-services": {
    title: "Stud Services | Red Ranch Dogs",
    description: "Browse Red Ranch Dogs stud services, reproductive education, timing, and breeder inquiry information."
  },
  "/stud-services/our-studs": {
    title: "Our Studs | Red Ranch Dogs",
    description: "Review Red Ranch Dogs stud profiles and service information."
  },
  "/stud-services/reproductive-services": {
    title: "Reproductive Services | Red Ranch Dogs",
    description: "Review Red Ranch Dogs reproductive service information for stud service inquiries."
  },
  "/stud-services/reproductive-education": {
    title: "Reproductive Education | Red Ranch Dogs",
    description: "Educational breeding timing and progesterone resources from Red Ranch Dogs."
  },
  "/guardian-program": {
    title: "Guardian Program | Red Ranch Dogs",
    description: "Learn about the Red Ranch Dogs guardian family program, application, opportunities, and FAQs."
  },
  "/guardian-program/application": {
    title: "Guardian Application | Red Ranch Dogs",
    description: "Apply to become a Red Ranch Dogs guardian family near Salado, Texas."
  },
  "/guardian-program/current-guardian-opportunities": {
    title: "Guardian Opportunities | Red Ranch Dogs",
    description: "Review current Red Ranch Dogs guardian opportunities as they become available."
  },
  "/guardian-program/faq": {
    title: "Guardian FAQ | Red Ranch Dogs",
    description: "Frequently asked questions about the Red Ranch Dogs guardian family program."
  },
  "/about": {
    title: "About | Red Ranch Dogs",
    description: "Learn about the Red Ranch Dogs family, team, reviews, and contact information."
  },
  "/about/our-family": {
    title: "Our Family | Red Ranch Dogs",
    description: "Read the family story behind Red Ranch Dogs in Salado, Texas."
  },
  "/about/meet-the-team": {
    title: "Meet the Team | Red Ranch Dogs",
    description: "Meet the Red Ranch Dogs team behind daily puppy care and family communication."
  },
  "/about/reviews": {
    title: "Reviews | Red Ranch Dogs",
    description: "Read Red Ranch Dogs family testimonials and Google review highlights."
  },
  "/apply": {
    title: "Apply | Red Ranch Dogs",
    description: "Submit a puppy application for Red Ranch Dogs Goldendoodle, Cavapoo, and Bernedoodle availability."
  },
  "/privacy": {
    title: "Privacy Policy | Red Ranch Dogs",
    description: "Review how Red Ranch Dogs collects, uses, and protects information submitted through website forms and everyday communication."
  }
};

const staticSeo = {
  "/": {
    title: "Red Ranch Dogs | Goldendoodle, Cavapoo & Bernedoodle Puppies in Texas",
    description: "Country-raised Goldendoodle, Cavapoo, and Bernedoodle puppies from Red Ranch Dogs in Salado, Texas."
  },
  "/home-maple": {
    title: "Red Ranch Dogs | Goldendoodle, Cavapoo & Bernedoodle Puppies in Texas",
    description: "Country-raised Goldendoodle, Cavapoo, and Bernedoodle puppies from Red Ranch Dogs in Salado, Texas."
  },
  "/prices": {
    title: "Puppy Prices & Deposits | Red Ranch Dogs",
    description: "Review Red Ranch Dogs puppy prices, deposit details, and payment expectations for Goldendoodles, Cavapoos, and Bernedoodles."
  },
  "/faq": {
    title: "Puppy FAQ | Red Ranch Dogs",
    description: "Answers about Red Ranch Dogs pricing, waitlists, puppy visits, health testing, go-home supplies, and doodle generations."
  },
  "/contact": {
    title: "Contact Red Ranch Dogs | Salado, Texas",
    description: "Contact Red Ranch Dogs in Salado, Texas by phone, text, email, or online form."
  },
  "/meet-our-team": {
    title: "Meet Our Team | Red Ranch Dogs",
    description: "Meet the Red Ranch Dogs team caring for puppies, parent dogs, socialization, feeding, grooming, and family communication."
  },
  "/our-family": {
    title: "Our Family | Red Ranch Dogs",
    description: "Learn the family story behind Red Ranch Dogs and the Salado, Texas breeding program."
  },
  "/reviews-1": {
    title: "Reviews | Red Ranch Dogs",
    description: "Read testimonials and customer reviews from families who brought home Red Ranch Dogs puppies."
  },
  "/what-come-with-your-puppy": {
    title: "What Comes With Your Puppy | Red Ranch Dogs",
    description: "See the health care, microchip, genetic guarantee, socialization, starter supplies, and support included with each Red Ranch Dogs puppy."
  },
  "/available-puppies": {
    title: "Available Puppies | Red Ranch Dogs",
    description: "Check current available puppy information and contact Red Ranch Dogs about upcoming availability."
  },
  "/current-litters": {
    title: "Current Litters | Red Ranch Dogs",
    description: "View current Red Ranch Dogs litters, birth dates, go-home timing, sizes, coats, and pricing."
  },
  "/upcoming-litters": {
    title: "Upcoming Litters | Red Ranch Dogs",
    description: "See planned upcoming Goldendoodle, Bernedoodle, and Cavapoo litters from Red Ranch Dogs."
  },
  "/previous-litters": {
    title: "Previous Litters | Red Ranch Dogs",
    description: "Browse Red Ranch Dogs previous Goldendoodle, Bernedoodle, Cavapoo, and Poodle litters."
  },
  "/coat-traits": {
    title: "Coat Traits Guide | Red Ranch Dogs",
    description: "Learn about doodle coat traits including red abstract, parti, tri color, wavy, curly, and straight coats."
  },
  "/dams": {
    title: "Dams | Red Ranch Dogs",
    description: "Meet the Red Ranch Dogs dams and dam breed groups behind the Goldendoodle, Cavapoo, Bernedoodle, Poodle, and Retriever lines."
  },
  "/evie-nicks": {
    title: "Dams | Red Ranch Dogs",
    description: "Meet the Red Ranch Dogs dams and dam breed groups behind the Goldendoodle, Cavapoo, Bernedoodle, Poodle, and Retriever lines."
  },
  "/studs": {
    title: "Studs | Red Ranch Dogs",
    description: "Browse Red Ranch Dogs stud categories and health-tested stud service information."
  },
  "/our-studs": {
    title: "Our Studs | Red Ranch Dogs",
    description: "Review Red Ranch Dogs health-tested studs by breed, weight, genetics, and profile."
  },
  "/reproductive-education": {
    title: "Reproductive Education | Red Ranch Dogs",
    description: "Breeding timing and progesterone education for breeders using Red Ranch Dogs stud services."
  },
  "/guardianprogram": {
    title: "Guardian Family Program | Red Ranch Dogs",
    description: "Learn about the Red Ranch Dogs guardian family program, expectations, benefits, and ownership transfer."
  },
  "/guardian-application": {
    title: "Guardian Application | Red Ranch Dogs",
    description: "Apply to become a Red Ranch Dogs guardian family near Salado, Texas."
  },
  "/stop-the-marking": {
    title: "Stop Indoor Marking Guide | Red Ranch Dogs",
    description: "A practical Red Ranch Dogs marking reset guide for preventing indoor marks and rebuilding an outdoor potty routine."
  },
  "/join-our-waitlist": {
    title: "Join the Waitlist | Red Ranch Dogs",
    description: "Start the Red Ranch Dogs waitlist process for Goldendoodle, Cavapoo, and Bernedoodle puppies."
  },
  "/application-process": {
    title: "Puppy Application Process | Red Ranch Dogs",
    description: "Learn the Red Ranch Dogs application, waitlist, litter update, final payment, and go-home process."
  },
  "/waitlist": {
    title: "Waitlist | Red Ranch Dogs",
    description: "Review Red Ranch Dogs waitlist notes and current Goldendoodle, Cavapoo, and Bernedoodle waitlist groups."
  },
  "/puppy-application": {
    title: "Puppy Application | Red Ranch Dogs",
    description: "Submit a Red Ranch Dogs puppy application with your family details, timing, breed preference, and questions."
  }
};

const clientRedirects = Object.fromEntries([
  ["/available-puppies", "/puppies/available"],
  ["/current-litters", "/puppies/current-litters"],
  ["/upcoming-litters", "/puppies/upcoming-litters"],
  ["/join-our-waitlist", "/process/application-and-waitlist"],
  ["/application-process", "/process/how-it-works"],
  ["/waitlist", "/process/waitlist"],
  ["/puppy-application", "/apply"],
  ["/prices", "/process/pricing"],
  ["/faq", "/process/faq"],
  ["/what-come-with-your-puppy", "/puppies/what-comes-with-your-puppy"],
  ["/coat-traits", "/puppies/coat-traits"],
  ["/dams", "/parents/mamas"],
  ["/studs", "/parents/studs"],
  ["/goldendoodle-dams", "/parents/goldendoodle-parents"],
  ["/cavapoo-dams", "/parents/cavapoo-parents"],
  ["/bernedoodle-dams", "/parents/bernedoodle-parents"],
  ["/poodle-dams", "/parents/mamas"],
  ["/golden-retriever-dams", "/parents/mamas"],
  ["/our-studs", "/stud-services/our-studs"],
  ["/reproductive-education", "/stud-services/reproductive-education"],
  ["/stud-services/shipping-and-collection-info", "/stud-services"],
  ["/guardianprogram", "/guardian-program"],
  ["/guardian-application", "/guardian-program/application"],
  ["/our-family", "/about/our-family"],
  ["/meet-our-team", "/about/meet-the-team"],
  ["/reviews-1", "/about/reviews"],
  ["/contact-1", "/contact"],
  ["/birdie-waylon-jennings-1", "/litters/birdie-waylon-spring-2026"],
  ["/penny-wyatt", "/litters/penny-wyatt-spring-2026"],
  ["/ginnybutch", "/litters/ginny-butch-spring-2026"],
  ["/winnie-wyatt", "/litters/winnie-wyatt-spring-2026"],
  ["/winnie-redford", "/litters/winnie-wyatt-spring-2026"],
  ["/kylie-ranger", "/litters/kylie-ranger-late-summer-2026"],
  ["/birdie", "/parents/birdie"],
  ["/honey", "/parents/honey"],
  ["/phoebe", "/parents/phoebe"],
  ["/daisy", "/parents/daisy"],
  ["/beatrix", "/parents/beatrix"],
  ["/june-2", "/parents/june"],
  ["/georgia", "/parents/georgia"],
  ["/evie-nicks", "/parents/mamas"],
  ["/ginny", "/parents/ginny"],
  ["/trudy", "/parents/trudy"],
  ["/faye", "/parents/faye"],
  ["/kylie", "/parents/kylie"],
  ["/tilly", "/parents/tilly"],
  ["/sylvee", "/parents/sylvee"],
  ["/penny-2", "/parents/penny"],
  ["/whitley", "/parents/whitley"],
  ["/winnie", "/parents/winnie"],
  ["/reece", "/parents/reece"],
  ["/garth-brooks", "/parents/garth-brooks"],
  ["/hank-williams", "/parents/hank-williams"],
  ["/beau", "/parents/beau"],
  ["/waylon-jennings", "/parents/waylon-jennings"],
  ["/sundance", "/parents/sundance"],
  ["/enzo", "/parents/enzo"],
  ["/butch-cassidy", "/parents/butch-cassidy"],
  ["/knox", "/parents/knox"],
  ["/robert-redford", "/parents/robert-redford"],
  ["/johnn-cash", "/parents/johnny-cash"],
  ["/johnny-cash", "/parents/johnny-cash"],
  ["/wyatt", "/parents/wyatt-earp"],
  ["/wyatt-earp", "/parents/wyatt-earp"],
  ["/bodhe", "/parents/bodhe"],
  ["/wayne", "/parents/studs"],
  ["/flora", "/parents/mamas"],
  ["/lady", "/parents/mamas"],
  ["/lady-redford", "/puppies/previous-litters"],
  ["/lady-enzo", "/puppies/previous-litters"],
  ["/lady-enzo-2", "/puppies/previous-litters"],
  ["/floraenzo", "/puppies/previous-litters"],
  ["/flora-enzo-2", "/puppies/previous-litters"],
  ["/ruby-bodhe", "/puppies/previous-litters"],
  ["/ruby-bodhe-2", "/puppies/previous-litters"],
  ["/new-page-2", "/previous-litters-bernedoodles"],
  ["/june-enzo-1", "/previous-litters-cavapoos"],
  ["/june-enzo-2", "/previous-litters-cavapoos"],
  ["/services-6", "/"]
]);

function isKnownPublicPath(path) {
  return Boolean(
    architectureSeo[path] ||
      staticSeo[path] ||
      breedProfiles.some((item) => item.route === path) ||
      publicPuppyProfiles.some((item) => `/puppies/${item.slug}` === path) ||
      publicLitterProfiles.some((item) => `/litters/${item.slug}` === path) ||
      publicParentProfiles.some((item) => `/parents/${item.slug}` === path) ||
      litterDetails[path] ||
      previousLitterArchiveGroups[path] ||
      previousLitterDetails[path] ||
      studDetails[path] ||
      damGroups[path] ||
      damDetails[path] ||
      categories[path]
  );
}

function seoFor(path) {
  if (architectureSeo[path]) return architectureSeo[path];
  const breed = breedProfiles.find((item) => item.route === path);
  if (breed) {
    return {
      title: `${breed.pluralName} | Red Ranch Dogs`,
      description: breed.intro
    };
  }
  if (path.startsWith("/puppies/")) {
    const puppy = publicPuppyProfiles.find((item) => `/puppies/${item.slug}` === path);
    if (puppy) {
      return {
        title: `${puppy.name} | ${puppy.breed} Puppy | Red Ranch Dogs`,
        description: `${puppy.name} is a ${puppy.gender} ${puppy.breed} puppy from the ${puppy.litter} litter.`
      };
    }
  }
  if (path.startsWith("/litters/")) {
    const litter = publicLitterProfiles.find((item) => `/litters/${item.slug}` === path);
    if (litter) {
      return {
        title: `${litter.name} | ${litter.breed} Litter | Red Ranch Dogs`,
        description: litter.availabilitySummary
      };
    }
  }
  if (path.startsWith("/parents/")) {
    const parent = publicParentProfiles.find((item) => `/parents/${item.slug}` === path);
    if (parent) {
      return {
        title: `${parent.name} | Parent Dog | Red Ranch Dogs`,
        description: parent.description
      };
    }
  }
  if (staticSeo[path]) return staticSeo[path];
  if (previousLitterArchiveGroups[path]) {
    const archive = previousLitterArchiveGroups[path];
    return {
      title: `${archive.title} | Red Ranch Dogs`,
      description: archive.copy
    };
  }
  if (previousLitterDetails[path]) {
    const litter = previousLitterDetails[path];
    return {
      title: `${litter.name} | Previous Litter | Red Ranch Dogs`,
      description: `Archive details for the ${litter.name} ${litter.breed} litter from Red Ranch Dogs.`
    };
  }
  if (litterDetails[path]) {
    const litter = litterDetails[path];
    return {
      title: `${litter.name} | ${litter.breed} | Red Ranch Dogs`,
      description: `Details for the ${litter.name} ${litter.breed} litter, including timing, size, coat, color, and puppy milestones.`
    };
  }
  if (studDetails[path]) {
    const stud = studDetails[path];
    return {
      title: `${stud.name} | Stud Profile | Red Ranch Dogs`,
      description: `${stud.name} is a ${stud.type} stud at Red Ranch Dogs with ${stud.weight} listed weight and health-testing notes.`
    };
  }
  if (damGroups[path]) {
    const group = damGroups[path];
    return {
      title: `${group.name} | Red Ranch Dogs`,
      description: group.copy
    };
  }
  if (damDetails[path]) {
    const dam = damDetails[path];
    return {
      title: `${dam.name} | Dam Profile | Red Ranch Dogs`,
      description: `${dam.name} is a ${dam.type} in the Red Ranch Dogs ${dam.group} program.`
    };
  }
  if (categories[path]) {
    const category = categories[path];
    return {
      title: `${category.title} | Red Ranch Dogs`,
      description: category.copy
    };
  }
  return notFoundSeo;
}

function upsertMeta(selector, createTag, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement(createTag);
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
}

function upsertJsonLd(id, data) {
  let element = document.head.querySelector(`script[data-schema="${id}"]`);
  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.dataset.schema = id;
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(data);
}

const breadcrumbLabels = {
  puppies: "Puppies",
  available: "Available Puppies",
  "current-litters": "Current Litters",
  "upcoming-litters": "Upcoming Litters",
  "previous-litters": "Previous Litters",
  "goldendoodle-puppies": "Goldendoodle Puppies",
  "cavapoo-puppies": "Cavapoo Puppies",
  "bernedoodle-puppies": "Bernedoodle Puppies",
  "what-comes-with-your-puppy": "What Comes With Your Puppy",
  "coat-traits": "Coat Traits",
  litters: "Litters",
  parents: "Parents",
  mamas: "Mamas",
  studs: "Studs",
  "goldendoodle-parents": "Goldendoodle Parents",
  "cavapoo-parents": "Cavapoo Parents",
  "bernedoodle-parents": "Bernedoodle Parents",
  process: "Process",
  "how-it-works": "How It Works",
  pricing: "Pricing",
  "application-and-waitlist": "Application & Waitlist",
  waitlist: "Current Waitlist",
  faq: "FAQ",
  "pickup-and-delivery": "Pickup & Delivery",
  "stud-services": "Stud Services",
  "our-studs": "Our Studs",
  "reproductive-services": "Reproductive Services",
  "reproductive-education": "Reproductive Education",
  "guardian-program": "Guardian Program",
  application: "Application",
  "current-guardian-opportunities": "Guardian Opportunities",
  about: "About",
  "our-family": "Our Family",
  "meet-the-team": "Meet the Team",
  reviews: "Reviews",
  contact: "Contact",
  apply: "Apply",
  privacy: "Privacy Policy"
};

function titleCaseSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function recordTitleForPath(path) {
  const puppy = publicPuppyProfiles.find((item) => `/puppies/${item.slug}` === path);
  if (puppy) return puppy.name;
  const litter = publicLitterProfiles.find((item) => `/litters/${item.slug}` === path);
  if (litter) return litter.name;
  const parent = publicParentProfiles.find((item) => `/parents/${item.slug}` === path);
  if (parent) return parent.name;
  return null;
}

function breadcrumbDataFor(path) {
  if (path === "/") return null;
  const segments = path.split("/").filter(Boolean);
  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${siteOrigin}/`
    }
  ];

  segments.forEach((segment, index) => {
    const partialPath = `/${segments.slice(0, index + 1).join("/")}`;
    const isLast = index === segments.length - 1;
    const name = isLast ? recordTitleForPath(partialPath) || breadcrumbLabels[segment] || titleCaseSlug(segment) : breadcrumbLabels[segment] || titleCaseSlug(segment);
    items.push({
      "@type": "ListItem",
      position: items.length + 1,
      name,
      item: `${siteOrigin}${partialPath}`
    });
  });

  return {
    "@type": "BreadcrumbList",
    itemListElement: items
  };
}

function absoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return defaultSocialImage;
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  if (pathOrUrl.startsWith("/")) return `${siteOrigin}${pathOrUrl}`;
  return `${siteOrigin}/${pathOrUrl}`;
}

function schemaIdSlug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function teamPersonSchema(member) {
  const slug = schemaIdSlug(member.name);

  return {
    "@type": "Person",
    "@id": `${siteOrigin}/about/meet-the-team#${slug}`,
    name: member.name,
    jobTitle: member.role,
    description: member.bio,
    image: member.photo ? absoluteUrl(member.photo) : undefined,
    worksFor: {
      "@id": `${siteOrigin}/#organization`
    }
  };
}

function socialImageFor(path) {
  const puppy = publicPuppyProfiles.find((item) => `/puppies/${item.slug}` === path);
  if (puppy?.mainPhoto) return absoluteUrl(puppy.mainPhoto);

  const litter = publicLitterProfiles.find((item) => `/litters/${item.slug}` === path);
  if (litter?.weeklyUpdateGallery?.[0]) return absoluteUrl(litter.weeklyUpdateGallery[0]);

  const parent = publicParentProfiles.find((item) => `/parents/${item.slug}` === path);
  if (parent?.mainPhoto) return absoluteUrl(parent.mainPhoto);

  return defaultSocialImage;
}

function socialImageAltFor(path, meta) {
  const puppy = publicPuppyProfiles.find((item) => `/puppies/${item.slug}` === path);
  if (puppy?.name) return `${puppy.name}, a ${puppy.breed} puppy at Red Ranch Dogs`;

  const litter = publicLitterProfiles.find((item) => `/litters/${item.slug}` === path);
  if (litter?.name) return `${litter.name} litter at Red Ranch Dogs`;

  const parent = publicParentProfiles.find((item) => `/parents/${item.slug}` === path);
  if (parent?.name) return `${parent.name}, a Red Ranch Dogs ${parent.role || "parent dog"}`;

  return `${meta?.title || "Red Ranch Dogs"} photo`;
}

function normalizeFaqRecord(record) {
  if (Array.isArray(record)) {
    return {
      question: record[0],
      answer: record[1]
    };
  }

  return {
    question: record?.question,
    answer: record?.answer
  };
}

function faqRecordsForPath(path) {
  if (path === "/guardian-program/faq") {
    return guardianProgram.faqs.map(normalizeFaqRecord);
  }

  if (path === "/process/faq" || path === "/faq") {
    return (faqProfiles.length ? faqProfiles : faqs).map(normalizeFaqRecord);
  }

  const breed = breedProfiles.find((item) => item.route === path);
  if (breed?.faqCategory) {
    return faqProfiles
      .filter((item) => item.category === breed.faqCategory)
      .map(normalizeFaqRecord);
  }

  return [];
}

function faqSchemaForPath(path) {
  const records = faqRecordsForPath(path).filter((item) => item.question && item.answer);
  if (!records.length) return null;

  const canonical = `${siteOrigin}${path === "/" ? "/" : path}`;
  return {
    "@type": "FAQPage",
    "@id": `${canonical}#faq`,
    mainEntity: records.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

function listItemForRecord(item, index, url, image) {
  return {
    "@type": "ListItem",
    position: index + 1,
    url,
    item: {
      "@type": "Thing",
      name: item.name,
      description: item.description || item.availabilitySummary || item.availabilityNote || item.breed,
      image: image ? absoluteUrl(image) : undefined,
      url
    }
  };
}

function itemListSchemaForPath(path) {
  const canonical = `${siteOrigin}${path === "/" ? "/" : path}`;
  let name = "";
  let records = [];
  let getUrl = () => canonical;
  let getImage = () => "";

  if (path === "/puppies/available") {
    name = "Available Red Ranch Dogs puppies";
    records = publicPuppyProfiles.filter((item) => item.status === "Available");
    getUrl = (item) => `${siteOrigin}/puppies/${item.slug}`;
    getImage = (item) => item.mainPhoto;
  } else if (path === "/puppies/current-litters") {
    name = "Current Red Ranch Dogs litters";
    records = publicLitterProfiles.filter((item) => String(item.status || "").toLowerCase().includes("current"));
    getUrl = (item) => `${siteOrigin}/litters/${item.slug}`;
    getImage = (item) => item.weeklyUpdateGallery?.[0];
  } else if (path === "/puppies/upcoming-litters") {
    name = "Upcoming Red Ranch Dogs litters";
    records = publicLitterProfiles.filter((item) => {
      const status = String(item.status || "").toLowerCase();
      return status.includes("planned") || status.includes("upcoming");
    });
    getUrl = (item) => `${siteOrigin}/litters/${item.slug}`;
    getImage = (item) => item.weeklyUpdateGallery?.[0];
  } else if (path === "/parents" || path === "/parents/mamas" || path === "/parents/studs") {
    name = path === "/parents/studs" ? "Red Ranch Dogs studs" : path === "/parents/mamas" ? "Red Ranch Dogs mamas" : "Red Ranch Dogs parent dogs";
    records = publicParentProfiles.filter((item) => {
      if (path === "/parents/mamas") return item.role === "mama";
      if (path === "/parents/studs") return item.role === "stud";
      return true;
    });
    getUrl = (item) => `${siteOrigin}/parents/${item.slug}`;
    getImage = (item) => item.mainPhoto;
  } else if (path.endsWith("-parents")) {
    const breedSlug = path.replace("/parents/", "").replace("-parents", "-puppies");
    name = `${breadcrumbLabels[path.split("/").pop()] || "Red Ranch Dogs parents"}`;
    records = publicParentProfiles.filter((item) => item.breedSlug === breedSlug);
    getUrl = (item) => `${siteOrigin}/parents/${item.slug}`;
    getImage = (item) => item.mainPhoto;
  } else {
    const breed = breedProfiles.find((item) => item.route === path);
    if (breed) {
      name = `${breed.pluralName} at Red Ranch Dogs`;
      records = [
        ...publicPuppyProfiles.filter((item) => item.breedSlug === breed.slug && item.status === "Available"),
        ...publicLitterProfiles.filter((item) => item.breedSlug === breed.slug && String(item.status || "").toLowerCase().includes("current"))
      ];
      getUrl = (item) => item.litterNumber !== undefined ? `${siteOrigin}/litters/${item.slug}` : `${siteOrigin}/puppies/${item.slug}`;
      getImage = (item) => item.mainPhoto || item.weeklyUpdateGallery?.[0];
    }
  }

  if (!records.length) return null;

  return {
    "@type": "ItemList",
    "@id": `${canonical}#item-list`,
    name,
    itemListElement: records.map((item, index) => listItemForRecord(item, index, getUrl(item), getImage(item))).map((item) => JSON.parse(JSON.stringify(item)))
  };
}

function pageSpecificSchemaForPath(path) {
  const canonical = `${siteOrigin}${path === "/" ? "/" : path}`;

  if (path.startsWith("/stud-services")) {
    return {
      "@type": "Service",
      "@id": `${canonical}#stud-service`,
      name: "Red Ranch Dogs stud services",
      serviceType: "Dog stud service and reproductive coordination",
      provider: {
        "@id": `${siteOrigin}/#local-business`
      },
      areaServed: "United States"
    };
  }

  if (path === "/contact" || path === "/contact-1") {
    return {
      "@type": "ContactPage",
      "@id": `${canonical}#contact-page`,
      name: "Contact Red Ranch Dogs",
      description: "Contact Red Ranch Dogs in Salado, Texas about puppies, waitlists, current litters, guardian families, or stud services.",
      mainEntity: {
        "@id": `${siteOrigin}/#local-business`
      }
    };
  }

  if (path === "/about" || path === "/about/our-family" || path === "/our-family") {
    return {
      "@type": "AboutPage",
      "@id": `${canonical}#about-page`,
      name: "About Red Ranch Dogs",
      description: "Learn about the family behind Red Ranch Dogs and the Salado, Texas breeding program.",
      mainEntity: {
        "@id": `${siteOrigin}/#organization`
      }
    };
  }

  if (path === "/apply" || path === "/puppy-application") {
    return {
      "@type": "Service",
      "@id": `${canonical}#puppy-application`,
      name: "Red Ranch Dogs puppy application",
      serviceType: "Puppy application and waitlist inquiry",
      provider: {
        "@id": `${siteOrigin}/#local-business`
      }
    };
  }

  return null;
}

function structuredDataFor(path) {
  const canonical = `${siteOrigin}${path === "/" ? "/" : path}`;
  const meta = seoFor(path);
  const socialImage = socialImageFor(path);
  const graph = [
    {
      "@type": "Organization",
      "@id": `${siteOrigin}/#organization`,
      name: "Red Ranch Dogs",
      url: `${siteOrigin}/`,
      description: "A family-run doodle breeding program in Salado, Texas specializing in Goldendoodles, Cavapoos, and Bernedoodles.",
      logo: `${siteOrigin}/images/seed/red-ranch-dogs-2026-logo-wide.png`,
      sameAs: socialProfiles,
      slogan: brand.tagline,
      founder: [
        {
          "@type": "Person",
          "@id": `${siteOrigin}/about/meet-the-team#adam`,
          name: "Adam Dietlein",
          url: `${siteOrigin}/about/meet-the-team`
        },
        {
          "@type": "Person",
          "@id": `${siteOrigin}/about/meet-the-team#callie`,
          name: "Callie Dietlein",
          url: `${siteOrigin}/about/meet-the-team`
        }
      ],
      employee: teamProfiles.map(teamPersonSchema),
      foundingLocation: {
        "@type": "Place",
        name: "Salado, Texas"
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: `+1${brand.phone.replace(/\D/g, "")}`,
          email: brand.email,
          contactType: "customer service",
          areaServed: "US"
        }
      ]
    },
    {
      "@type": "LocalBusiness",
      "@id": `${siteOrigin}/#local-business`,
      name: "Red Ranch Dogs",
      url: `${siteOrigin}/`,
      telephone: `+1${brand.phone.replace(/\D/g, "")}`,
      email: brand.email,
      description: "Red Ranch Dogs is a family-run puppy program in Salado, Texas raising Goldendoodles, Cavapoos, and Bernedoodles.",
      image: socialImage,
      priceRange: "$$$",
      slogan: brand.tagline,
      sameAs: socialProfiles,
      hasMap: brand.googleReviews,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Salado",
        addressRegion: "TX",
        addressCountry: "US"
      },
      areaServed: ["Texas", "United States"],
      knowsAbout: ["Goldendoodles", "Cavapoos", "Bernedoodles", "Poodle genetics", "Doodle puppy waitlists", "Doodle coat traits"],
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: `+1${brand.phone.replace(/\D/g, "")}`,
          email: brand.email,
          contactType: "customer service",
          areaServed: "US",
          availableLanguage: "English"
        }
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Red Ranch Dogs programs",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Goldendoodle puppies and waitlist"
            }
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Cavapoo puppies and waitlist"
            }
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Bernedoodle puppies and waitlist"
            }
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Stud services for breeders"
            }
          }
        ]
      },
      parentOrganization: {
        "@id": `${siteOrigin}/#organization`
      }
    },
    {
      "@type": "WebSite",
      "@id": `${siteOrigin}/#website`,
      name: "Red Ranch Dogs",
      url: `${siteOrigin}/`,
      publisher: {
        "@id": `${siteOrigin}/#organization`
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteOrigin}/puppies/available?query={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "WebPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: meta.title,
      description: meta.description,
      inLanguage: "en-US",
      isPartOf: {
        "@id": `${siteOrigin}/#website`
      },
      author: {
        "@id": `${siteOrigin}/#organization`
      },
      publisher: {
        "@id": `${siteOrigin}/#organization`
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: socialImage
      },
      about: {
        "@id": `${siteOrigin}/#organization`
      }
    },
    breadcrumbDataFor(path),
    faqSchemaForPath(path),
    itemListSchemaForPath(path),
    pageSpecificSchemaForPath(path)
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@graph": graph
  };
}

function applySeo(path) {
  const meta = seoFor(path);
  const canonical = `${siteOrigin}${path === "/" ? "/" : path}`;
  const socialImage = socialImageFor(path);
  const socialImageAlt = socialImageAltFor(path, meta);
  const robots = isKnownPublicPath(path) ? "index, follow" : "noindex, follow";
  document.title = meta.title;
  upsertMeta('meta[name="description"]', "meta", { name: "description", content: meta.description });
  upsertMeta('meta[name="author"]', "meta", { name: "author", content: "Red Ranch Dogs" });
  upsertMeta('meta[name="creator"]', "meta", { name: "creator", content: "Red Ranch Dogs" });
  upsertMeta('meta[name="robots"]', "meta", { name: "robots", content: robots });
  upsertMeta('meta[name="geo.region"]', "meta", { name: "geo.region", content: localGeo.region });
  upsertMeta('meta[name="geo.placename"]', "meta", { name: "geo.placename", content: localGeo.placeName });
  upsertMeta('link[rel="canonical"]', "link", { rel: "canonical", href: canonical });
  upsertMeta('meta[property="og:title"]', "meta", { property: "og:title", content: meta.title });
  upsertMeta('meta[property="og:description"]', "meta", { property: "og:description", content: meta.description });
  upsertMeta('meta[property="og:url"]', "meta", { property: "og:url", content: canonical });
  upsertMeta('meta[property="og:type"]', "meta", { property: "og:type", content: "website" });
  upsertMeta('meta[property="og:site_name"]', "meta", { property: "og:site_name", content: "Red Ranch Dogs" });
  upsertMeta('meta[property="og:locale"]', "meta", { property: "og:locale", content: "en_US" });
  upsertMeta('meta[property="og:image"]', "meta", { property: "og:image", content: socialImage });
  upsertMeta('meta[property="og:image:secure_url"]', "meta", { property: "og:image:secure_url", content: socialImage });
  upsertMeta('meta[property="og:image:alt"]', "meta", { property: "og:image:alt", content: socialImageAlt });
  upsertMeta('meta[name="twitter:card"]', "meta", { name: "twitter:card", content: "summary_large_image" });
  upsertMeta('meta[name="twitter:title"]', "meta", { name: "twitter:title", content: meta.title });
  upsertMeta('meta[name="twitter:description"]', "meta", { name: "twitter:description", content: meta.description });
  upsertMeta('meta[name="twitter:image"]', "meta", { name: "twitter:image", content: socialImage });
  upsertMeta('meta[name="twitter:image:alt"]', "meta", { name: "twitter:image:alt", content: socialImageAlt });
  upsertJsonLd("red-ranch-dogs-schema", structuredDataFor(path));
}

const primaryNav = [
  { label: "Home", href: "/" },
  {
    label: "Puppies",
    href: "/puppies",
    links: [
      { label: "Available Puppies", href: "/puppies/available" },
      { label: "Current Litters", href: "/puppies/current-litters" },
      { label: "Upcoming Litters", href: "/puppies/upcoming-litters" },
      { label: "Previous Litters", href: "/puppies/previous-litters" },
      { label: "Goldendoodle Puppies", href: "/puppies/goldendoodle-puppies" },
      { label: "Cavapoo Puppies", href: "/puppies/cavapoo-puppies" },
      { label: "Bernedoodle Puppies", href: "/puppies/bernedoodle-puppies" }
    ]
  },
  {
    label: "Parents",
    href: "/parents",
    links: [
      { label: "Mamas", href: "/parents/mamas" },
      { label: "Studs", href: "/parents/studs" },
      { label: "Goldendoodle Parents", href: "/parents/goldendoodle-parents" },
      { label: "Cavapoo Parents", href: "/parents/cavapoo-parents" },
      { label: "Bernedoodle Parents", href: "/parents/bernedoodle-parents" }
    ]
  },
  {
    label: "Process",
    href: "/process",
    links: [
      { label: "How It Works", href: "/process/how-it-works" },
      { label: "Pricing", href: "/process/pricing" },
      { label: "Application and Waitlist", href: "/process/application-and-waitlist" },
      { label: "Current Waitlist", href: "/process/waitlist" },
      { label: "What Comes With Your Puppy", href: "/puppies/what-comes-with-your-puppy" },
      { label: "Coat Traits", href: "/puppies/coat-traits" },
      { label: "FAQ", href: "/process/faq" },
      { label: "Puppy Pickup and Delivery", href: "/process/pickup-and-delivery" }
    ]
  },
  {
    label: "Stud Services",
    href: "/stud-services",
    links: [
      { label: "Our Studs", href: "/stud-services/our-studs" },
      { label: "Reproductive Services", href: "/stud-services/reproductive-services" },
      { label: "Reproductive Education", href: "/stud-services/reproductive-education" }
    ]
  },
  {
    label: "Guardian Program",
    href: "/guardian-program",
    links: [
      { label: "Guardian Program Overview", href: "/guardian-program" },
      { label: "Guardian Application", href: "/guardian-program/application" },
      { label: "Current Guardian Opportunities", href: "/guardian-program/current-guardian-opportunities" },
      { label: "FAQ", href: "/guardian-program/faq" }
    ]
  },
  {
    label: "About",
    href: "/about",
    links: [
      { label: "Our Family", href: "/about/our-family" },
      { label: "Meet the Team", href: "/about/meet-the-team" },
      { label: "Reviews", href: "/about/reviews" },
      { label: "Contact", href: "/contact" }
    ]
  },
  { label: "Apply", href: "/apply", cta: true }
];

function AccordionNav({ item, currentPath, onNavigate, index }) {
  const [expanded, setExpanded] = useState(false);
  const panelId = `mobile-nav-${item.label.toLowerCase().replace(/\W+/g, "-")}`;

  if (!item.links) {
    return (
      <Link
        href={item.href}
        className={`mobile-menu-link ${currentPath === item.href ? "active" : ""}`}
        onClick={onNavigate}
        style={{ "--item-index": index }}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="mobile-menu-group" style={{ "--item-index": index }}>
      <button
        type="button"
        className="mobile-menu-trigger"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((value) => !value)}
      >
        {item.label}
        <ChevronDown size={18} />
      </button>
      <div className="mobile-submenu" id={panelId} data-open={expanded}>
        {item.links.map((link) => (
          <Link
            href={link.href}
            className={currentPath === link.href ? "active" : undefined}
            key={`${item.label}-${link.label}-${link.href}`}
            onClick={onNavigate}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const currentPath = pathNow();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 18);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-locked", open);
    return () => document.body.classList.remove("menu-locked");
  }, [open]);

  const closeMenu = () => setOpen(false);
  const isActive = (item) => currentPath === item.href || (item.href !== "/" && currentPath.startsWith(`${item.href}/`));

  return (
    <header className={`premium-header ${scrolled ? "scrolled" : ""}`}>
      <button
        className={`premium-menu-button ${open ? "open" : ""}`}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-controls="mobile-primary-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        <span />
        <span />
      </button>
      <Link href="/" className="premium-logo-link" onClick={closeMenu}>
        <img src={brand.logo} alt="Red Ranch Dogs" />
      </Link>
      <nav className="premium-desktop-nav" aria-label="Primary navigation">
        {primaryNav.map((item) => (
          <div className={`premium-nav-item ${item.links ? "has-menu" : ""} ${item.cta ? "nav-cta" : ""}`} key={item.href}>
            <Link
              href={item.href}
              className={isActive(item) ? "active" : undefined}
            >
              {item.label}
            </Link>
            {item.links && (
              <div className="premium-desktop-menu">
                {item.links.map((link) => (
                  <Link href={link.href} key={link.href}>
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      <a className="premium-icon-link" href={brand.instagram} aria-label="Instagram" target="_blank" rel="noreferrer">
        <Instagram size={18} />
      </a>
      <div id="mobile-primary-menu" className={`premium-mobile-menu ${open ? "open" : ""}`} aria-hidden={!open} inert={open ? undefined : ""}>
        <nav aria-label="Mobile navigation">
          {primaryNav.map((item, index) => (
            <AccordionNav item={item} currentPath={currentPath} key={item.label} index={index} onNavigate={closeMenu} />
          ))}
        </nav>
        <div className="mobile-menu-ctas">
          <Link href="/apply" className="button primary" onClick={closeMenu}>Apply</Link>
          <Link href="/puppies/available" className="button secondary" onClick={closeMenu}>Available Puppies</Link>
          <a href={brand.sms} className="button text-button" onClick={closeMenu}>Text Us Now</a>
        </div>
      </div>
    </header>
  );
}

function Layout({ children }) {
  return (
    <>
      <Header />
      <main className="site-main">{children}</main>
      <Footer />
    </>
  );
}

function PageHero({ eyebrow, title, copy, image = null, imageAlt, actions, className = "" }) {
  return (
    <section className={`page-hero ${image ? "with-image" : "text-only"} ${className}`.trim()}>
      <div className="hero-copy">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {copy && <p className="lead">{copy}</p>}
        {actions && <div className="actions">{actions}</div>}
      </div>
      {image && (
        <div className="hero-image">
          <img src={image} alt={imageAlt || `${title} - Red Ranch Dogs`} />
        </div>
      )}
    </section>
  );
}

function FadeInSection({ as: Element = "section", className = "", children, ...props }) {
  const [visible, setVisible] = useState(false);
  const [node, setNode] = useState(null);

  useEffect(() => {
    if (!node) return undefined;
    const fallback = window.setTimeout(() => setVisible(true), 900);
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.clearTimeout(fallback);
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    observer.observe(node);
    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, [node]);

  return (
    <Element ref={setNode} className={`${className} reveal-section ${visible ? "visible" : ""}`} {...props}>
      {children}
    </Element>
  );
}

function ImagePlaceholder({ label, tall = false }) {
  return (
    <div className={`image-placeholder ${tall ? "tall" : ""}`} role="img" aria-label={label}>
      <span>{label}</span>
    </div>
  );
}

const homeHeroImage = {
  src: "/images/home/red-ranch-dogs-goldendoodle-puppy-hero-1365.jpeg",
  mobileSrc: "/images/home/red-ranch-dogs-goldendoodle-puppy-hero-900.jpeg",
  alt: "Goldendoodle puppy from Red Ranch Dogs in Salado, Texas"
};

const aboutStoryImage = "/images/about/red-ranch-dogs-our-story-family.jpg";
const contactPuppyImage = "/images/puppies/honey-bram-2026/bumble-micro-goldendoodle-puppy-honey-bram-week-6-red-ranch-dogs.jpg";
const guardianApplicationImage = "/images/guardian/red-ranch-dogs-guardian-application-family.jpg";
const reviewHeroStats = [
  { value: "100+", label: "five-star reviews soon" },
  { value: "Family", label: "communication focused" },
  { value: "Texas", label: "raised in Salado" }
];

const reviewThemes = [
  {
    title: "Clear communication",
    copy: "Families know what is happening, what comes next, and how to prepare before go-home.",
    icon: MessageCircle
  },
  {
    title: "Thoughtful puppy matches",
    copy: "We help families think through breed fit, timing, temperament, and the puppy that fits their home.",
    icon: Heart
  },
  {
    title: "Confidence at go-home",
    copy: "Puppies are raised with hands-on care, early routines, and support that continues after pickup.",
    icon: ShieldCheck
  }
];

const socialProofItems = [
  ["Nearly 100 five-star Google reviews", Star],
  ["Nearly 10,000 Instagram followers", Instagram],
  ["Health-tested parent dogs", PawPrint],
  ["Texas-based, family-owned program", HomeIcon]
];

function HomeHero() {
  return (
    <section className="premium-hero" id="home-hero">
      <div className="premium-hero-copy">
        <p className="premium-kicker">Country-raised doodles</p>
        <h1>
          <span className="hero-title-line">Goldendoodle, Cavapoo</span>
          <span className="hero-title-line">&amp; Bernedoodle Puppies</span>
        </h1>
        <p>Lovingly raised in Central Texas.</p>
        <div className="actions hero-actions">
          <Link href="/apply" className="button primary">
            Join the Waitlist
          </Link>
          <Link href="/puppies/available" className="button secondary">
            View Available Puppies
          </Link>
        </div>
      </div>
      <picture className="hero-image-frame">
        <source srcSet={homeHeroImage.mobileSrc} media="(max-width: 760px)" />
        <img
          src={homeHeroImage.src}
          alt={homeHeroImage.alt}
          width="1365"
          height="2048"
          decoding="async"
        />
      </picture>
    </section>
  );
}

function SocialProofStrip({
  heading = "Loved by families nationwide",
  items = socialProofItems,
  className = ""
}) {
  return (
    <section className={`social-proof-strip ${className}`.trim()} aria-labelledby="social-proof-heading">
      <div className="social-proof-inner">
        <h2 id="social-proof-heading" className="social-proof-heading">
          <span>{heading}</span>
        </h2>
        <div className="social-proof-grid">
          {items.map(([label, Icon]) => (
            <TrustItem label={label} Icon={Icon} key={label} className="social-proof-card" />
          ))}
        </div>
      </div>
    </section>
  );
}

function PageSection({ children, className = "", variant = "default", reveal = true, ...props }) {
  const sectionClass = `page-section ${variant !== "default" ? `page-section-${variant}` : ""} ${className}`.trim();

  if (reveal) {
    return (
      <FadeInSection className={sectionClass} {...props}>
        {children}
      </FadeInSection>
    );
  }

  return <section className={sectionClass} {...props}>{children}</section>;
}

function ContentContainer({ children, className = "", size = "standard" }) {
  return (
    <div className={`content-container content-container-${size} ${className}`.trim()}>
      {children}
    </div>
  );
}

function SectionHeader({ eyebrow, title, copy, align = "left" }) {
  return (
    <div className={`section-header section-header-${align}`}>
      {eyebrow && <p className="premium-kicker">{eyebrow}</p>}
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}

function CardGrid({ children, className = "", columns = 3 }) {
  return (
    <div className={`card-grid card-grid-${columns} ${className}`.trim()}>
      {children}
    </div>
  );
}

function CTAButton({ href, children, variant = "primary", className = "", ...props }) {
  const buttonClass = `button ${variant} ${className}`.trim();

  if (href?.startsWith("http") || href?.startsWith("sms:") || href?.startsWith("mailto:")) {
    return (
      <a href={href} className={buttonClass} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={buttonClass} {...props}>
      {children}
    </Link>
  );
}

function TrustItem({ label, Icon, className = "" }) {
  return (
    <article className={`trust-item ${className}`.trim()}>
      <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
      <p>{label}</p>
    </article>
  );
}

function ImageCard({
  title,
  copy,
  image,
  imageLabel,
  imagePosition,
  href,
  ctaLabel = "Learn More",
  className = "",
  variant = "standard"
}) {
  const content = (
    <>
      {image ? (
        <img
          className="image-card-media"
          src={image}
          alt={imageLabel || title}
          loading="lazy"
          style={imagePosition ? { objectPosition: imagePosition } : undefined}
        />
      ) : (
        <ImagePlaceholder label={imageLabel || `${title} photo`} />
      )}
      <div className="image-card-body">
        <h3>{title}</h3>
        <p>{copy}</p>
        {href && (
          <span>
            {ctaLabel} <ArrowRight size={16} />
          </span>
        )}
      </div>
    </>
  );

  const cardClass = `image-card image-card-${variant} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={cardClass}>
        {content}
      </Link>
    );
  }

  return <article className={cardClass}>{content}</article>;
}

const breedPlaceholders = {
  Goldendoodles: "Goldendoodle photo",
  Cavapoos: "Cavapoo photo",
  Bernedoodles: "Bernedoodle photo"
};

const latestSiteUpdates = [
  {
    label: "Current Litters",
    title: "Whitley + Waylon profiles are live",
    copy: "This new mini Goldendoodle litter is in waitlist matching now, with puppy photos coming after photo day.",
    href: "/litters/whitley-waylon-april-2026",
    cta: "View litter"
  },
  {
    label: "Availability",
    title: "Waitlist families pick first",
    copy: "Any public openings after breed-list picks will be posted on the Available Puppies page.",
    href: "/puppies/available",
    cta: "Check availability"
  },
  {
    label: "Photo Updates",
    title: "Weekly photo drops are organized by puppy",
    copy: "Current puppy pages keep weekly photos grouped so families can follow how each puppy grows.",
    href: "/puppies/current-litters",
    cta: "Follow current litters"
  }
];

function SectionIntro({ eyebrow, title, copy }) {
  return (
    <div className="premium-section-intro">
      <p className="premium-kicker">{eyebrow}</p>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}

function LatestUpdates({ className = "" }) {
  return (
    <PageSection className={`latest-updates-section ${className}`.trim()} variant="compact">
      <ContentContainer>
        <SectionHeader
          eyebrow="Latest Updates"
          title="What changed recently"
          copy="A quick place for returning families to see current litter, availability, and photo-update notes."
        />
        <div className="latest-updates-grid">
          {latestSiteUpdates.map((update) => (
            <Link href={update.href} className="latest-update-card" key={update.title}>
              <p className="eyebrow">{update.label}</p>
              <h3>{update.title}</h3>
              <p>{update.copy}</p>
              <span>{update.cta} <ArrowRight size={16} /></span>
            </Link>
          ))}
        </div>
      </ContentContainer>
    </PageSection>
  );
}

function BreedCard({ breed }) {
  return (
    <ImageCard
      title={breed.name}
      copy={breed.copy}
      image={breed.image}
      imageLabel={breed.imageAlt || breedPlaceholders[breed.name] || `${breed.name} photo`}
      imagePosition={breed.imagePosition}
      href={breed.route || "/puppies/available"}
      ctaLabel={`Explore ${breed.name}`}
      variant="compact"
    />
  );
}

function HomeDoodles() {
  return (
    <PageSection id="our-doodles" className="home-doodles-section" variant="compact">
      <ContentContainer>
        <SectionHeader
          eyebrow="Our Doodles"
          title="Find the right fit for your family"
          copy="Goldendoodles, Cavapoos, and Bernedoodles raised with hands-on care in Central Texas."
        />
        <CardGrid className="breed-card-grid" columns={3}>
          {homepageBreeds.map((breed) => <BreedCard breed={breed} key={breed.name} />)}
        </CardGrid>
        <div className="section-cta-row">
          <CTAButton href="/puppies/current-litters" variant="primary">View Current Litters</CTAButton>
          <CTAButton href="/apply" variant="secondary">Join the Waitlist</CTAButton>
        </div>
      </ContentContainer>
    </PageSection>
  );
}

function TrustCard({ title, copy, Icon }) {
  return (
    <article className="premium-trust-card">
      <span className="premium-trust-icon">
        <Icon size={22} />
      </span>
      <h3>{title}</h3>
      <p>{copy}</p>
    </article>
  );
}

function WhyRedRanch() {
  const items = [
    ["Health-Tested Parents", "Pairings are planned around health, temperament, structure, and the traits families care about most.", ShieldCheck],
    ["Hands-On Puppy Raising", "Puppies are raised with daily handling, early socialization, and age-appropriate exposure inside a family-run program.", Heart],
    ["Clear Family Support", "We help families understand timing, puppy fit, go-home preparation, and the transition after pickup.", MessageCircle]
  ];

  return (
    <FadeInSection id="why-red-ranch" className="premium-section trust-section">
      <SectionIntro
        eyebrow="Why Red Ranch Dogs"
        title="Raised with intention, matched with care."
        copy="From health-tested parent dogs to weekly litter updates, our process is built to help families feel confident before, during, and after puppy go-home."
      />
      <div className="premium-card-grid trust-grid">
        {items.map(([title, copy, Icon]) => <TrustCard title={title} copy={copy} Icon={Icon} key={title} />)}
      </div>
    </FadeInSection>
  );
}

function WaitlistSteps() {
  const steps = [
    ["01", "Apply or Ask", "Start with an application, or reach out if you see an available puppy you love."],
    ["02", "Join the Right Waitlist", "A $500 non-refundable deposit reserves your spot on a breed-specific waitlist and applies toward your puppy."],
    ["03", "Pick or Pass", "When a litter is born, families are contacted in deposit order. Choose a puppy or pass and keep your spot."],
    ["04", "Choose Your Puppy", "Puppy picks are guided with photos, videos, personality notes, and video chats so you can feel confident."]
  ];

  return (
    <FadeInSection className="premium-section waitlist-section">
      <SectionIntro
        eyebrow="See How It Works"
        title="A simple, fair waitlist process."
        copy="Apply when you're ready, join the breed waitlist that fits your family, and we'll guide you through each litter announcement, puppy pick, and go-home step."
      />
      <div className="waitlist-steps">
        {steps.map(([number, title, copy]) => (
          <article key={title}>
            <span>{number}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
      <div className="waitlist-actions actions">
        <Link href="/apply" className="button primary">Apply for a Puppy</Link>
        <Link href="/process/application-and-waitlist" className="button secondary">View Full Process</Link>
      </div>
    </FadeInSection>
  );
}

function HomeTestimonials() {
  return (
    <FadeInSection className="premium-section testimonials-section">
      <div className="testimonial-feature">
        <figure className="testimonial-media-card">
          <img
            src="/images/home/red-ranch-dogs-mobile-testimony-banner.jpg"
            alt="Red Ranch Dogs puppy with a family member"
            loading="lazy"
          />
          <figcaption>Red Ranch puppy raised with hands-on family care.</figcaption>
        </figure>
        <div className="testimonial-content">
          <SectionIntro
            eyebrow="Google Reviews"
            title="Kind words from puppy families."
            copy="Families often mention the communication, care, and confidence they felt throughout the Red Ranch Dogs process."
          />
          <div className="testimonial-card-list">
            {reviews.slice(0, 3).map((review) => (
              <article className="premium-testimonial-card" key={review.name}>
                <div className="testimonial-stars" aria-label="Five-star Google review">
                  {[1, 2, 3, 4, 5].map((star) => <Star size={14} fill="currentColor" key={star} />)}
                </div>
                <p>&quot;{review.quote}&quot;</p>
                <div className="testimonial-source">
                  <strong>{review.name}</strong>
                  <span>Google Review</span>
                </div>
              </article>
            ))}
          </div>
          <a className="button secondary testimonial-review-link" href={brand.googleReviews} target="_blank" rel="noreferrer">
            Read Our Google Reviews
          </a>
        </div>
      </div>
    </FadeInSection>
  );
}

function FinalCta() {
  return (
    <FadeInSection className="premium-section final-cta-section">
      <div className="final-cta-panel">
        <img
          className="final-cta-image"
          src="/images/home/red-ranch-dogs-home-lifestyle-puppies.jpg"
          alt="Red Ranch Dogs puppies being held"
          loading="lazy"
        />
        <div>
          <p className="premium-kicker">Ready when you are</p>
          <h2>Let&apos;s help you find the right puppy.</h2>
          <p>Whether you&apos;re ready to apply or still deciding which breed fits your family, we&apos;ll help you understand availability, timing, and the next best step.</p>
          <div className="actions">
            <Link href="/apply" className="button primary">Apply for a Puppy</Link>
            <a href={brand.sms} className="button secondary">Text Us Now</a>
          </div>
        </div>
      </div>
    </FadeInSection>
  );
}

function StickyMobileCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById("home-hero");
      const footer = document.querySelector(".premium-footer");
      const pastHero = hero ? window.scrollY > hero.offsetTop + hero.offsetHeight * 0.7 : window.scrollY > 420;
      const nearFooter = footer ? footer.getBoundingClientRect().top < window.innerHeight + 80 : false;
      setVisible(pastHero && !nearFooter);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`sticky-mobile-cta ${visible ? "visible" : ""}`}>
      <Link href="/apply" className="button primary">Join Waitlist</Link>
      <a href={brand.sms} className="button secondary">Text Us</a>
    </div>
  );
}

function HomePage() {
  return (
    <Layout>
      <HomeHero />
      <SocialProofStrip className="hero-adjacent" />
      <LatestUpdates />
      <HomeDoodles />
      <WhyRedRanch />
      <WaitlistSteps />
      <HomeTestimonials />
      <FinalCta />
      <StickyMobileCta />
    </Layout>
  );
}

function ImageGallery({ images: gallery = [], label = "Gallery image" }) {
  if (!gallery.length) {
    return <ImagePlaceholder label={label} tall />;
  }

  return (
    <div className="image-gallery">
      {gallery.map((image, index) => (
        <img src={image} alt={`${label} ${index + 1}`} key={`${image}-${index}`} loading="lazy" />
      ))}
    </div>
  );
}

function LitterGalleryStatus({ hasGallery, puppyCount }) {
  if (hasGallery) return null;

  return (
    <article className="note-panel litter-gallery-status">
      <Camera size={22} aria-hidden="true" />
      <div>
        <p className="eyebrow">Photos Coming Soon</p>
        <h2>Weekly photos will appear here after photo day.</h2>
        <p>
          {puppyCount
            ? "Puppy profiles are live now, and the photo gallery will fill in as newborn and weekly photos are added."
            : "This litter page is ready for puppy profiles and weekly photos as soon as they are ready to share."}
        </p>
      </div>
    </article>
  );
}

function PuppyCard({ puppy, variant = "default" }) {
  const breed = puppy.breed || "Breed to be announced";
  const gender = puppy.gender || puppy.sex || "To be announced";
  const status = puppy.status || "Status to be announced";
  const displayStatus = puppyDisplayStatus(status);
  const route = puppy.slug ? `/puppies/${puppy.slug}` : puppy.litterHref;
  const litterRoute = puppy.litterSlug ? `/litters/${puppy.litterSlug}` : puppy.litterHref;
  const photo = puppy.mainPhoto || puppy.image;
  const litterName = puppy.litter || puppy.litterName || "Litter to be announced";
  const goHome = puppy.goHomeDate || puppy.goHome || "Go-home timing to be announced";
  const weight = puppy.estimatedAdultWeight || puppy.size || "Estimate to be announced";
  const birthDate = puppy.birthDate || puppy.born;
  const price = puppy.price;
  const isLitterVariant = variant === "litter";
  const isAvailableVariant = variant === "available";
  const isDetailVariant = variant === "detail";
  const HeadingTag = isDetailVariant ? "h1" : "h2";
  const cardClasses = [
    "puppy-card",
    "animal-card",
    isLitterVariant ? "litter-puppy-card" : "",
    isAvailableVariant ? "available-puppy-card" : "",
    isDetailVariant ? "detail-puppy-card" : ""
  ].filter(Boolean).join(" ");
  const puppyFacts = isLitterVariant
    ? [
        ["Gender", gender],
        puppy.collarColor && ["Collar", puppy.collarColor],
        ["Go Home", goHome],
        ["Adult Weight", weight],
        price && ["Price", price]
      ].filter(Boolean)
    : isAvailableVariant
      ? [
          ["Breed", breed],
          ["Litter", litterName],
          ["Gender", gender],
          ["Go Home", goHome],
          ["Adult Weight", weight],
          price && ["Price", price]
        ].filter(Boolean)
    : isDetailVariant
      ? [
          ["Litter", litterName],
          ["Gender", gender],
          puppy.collarColor && ["Collar", puppy.collarColor],
          birthDate && ["Birth Date", birthDate],
          ["Go Home", goHome],
          ["Adult Weight", weight],
          price && ["Price", price]
        ].filter(Boolean)
    : [
        ["Litter", litterName],
        ["Gender", gender],
        puppy.collarColor && ["Collar", puppy.collarColor],
        birthDate && ["Birth Date", birthDate],
        ["Go Home", goHome],
        ["Adult Weight", weight],
        price && ["Price", price]
      ].filter(Boolean);

  return (
    <article className={cardClasses}>
      <figure className="puppy-photo-frame">
        {photo ? (
          <img src={photo} alt={`${puppy.name} - ${breed}`} loading="lazy" />
        ) : (
          <ImagePlaceholder label="Available puppy photo" />
        )}
        <figcaption>{puppy.name}</figcaption>
      </figure>
      <div className="puppy-card-body">
        <div className="card-kicker-row">
          <p className="eyebrow">{breed}</p>
          <span className={`status-badge status-${status.toLowerCase().replace(/\W+/g, "-")}`}>{displayStatus}</span>
        </div>
        <HeadingTag>{puppy.name}</HeadingTag>
        <p className="puppy-card-note">{puppy.personalityNote || puppy.description || "Personality notes are updated as puppies grow and we learn more about their temperament."}</p>
        <dl className="details compact-details">
          {puppyFacts.map(([label, value]) => (
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>
        {puppy.availabilityNote && <p className="small-note">{puppy.availabilityNote}</p>}
        {isAvailableVariant || isDetailVariant ? (
          <div className="puppy-card-actions">
            <Link href="/apply" className="button small">{isDetailVariant ? "Apply" : `Ask About ${puppy.name}`}</Link>
            {litterRoute && <Link href={litterRoute} className="button small secondary">View Litter</Link>}
          </div>
        ) : route && (
          <div className="puppy-card-actions">
            <Link href={route} className="button small">View Puppy</Link>
          </div>
        )}
      </div>
    </article>
  );
}

function ProcessStepCards({ steps, className = "" }) {
  return (
    <div className={`process-step-cards ${className}`.trim()}>
      {steps.map(([title, copy], index) => (
        <article className="process-step-card" key={title}>
          <span className="step-number">{index + 1}</span>
          <div>
            <h2>{title}</h2>
            <p>{copy}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function CompactTextCardGrid({ items = [], columns = "three", className = "" }) {
  if (!items.length) {
    return null;
  }

  return (
    <section className={`tile-grid ${columns} process-card-grid process-compact-grid process-row-list ${className}`.trim()}>
      {items.map((item) => {
        const title = Array.isArray(item) ? item[0] : item.title;
        const copy = Array.isArray(item) ? item[1] : item.copy;
        const Icon = Array.isArray(item) ? item[2] : item.icon;

        return (
          <article className={`text-card compact-card${Icon ? " icon-card" : ""}`} key={title}>
            {Icon ? (
              <>
                <Icon size={24} />
                <div>
                  <h2>{title}</h2>
                  <p>{copy}</p>
                </div>
              </>
            ) : (
              <>
                <h2>{title}</h2>
                <p>{copy}</p>
              </>
            )}
          </article>
        );
      })}
    </section>
  );
}

function ChecklistCardGrid({ items = [], columns = "three", className = "" }) {
  if (!items.length) {
    return null;
  }

  return (
    <section className={`tile-grid ${columns} process-card-grid process-checklist-grid ${className}`.trim()}>
      {items.map((item) => {
        const title = Array.isArray(item) ? item[0] : item.title;
        const points = Array.isArray(item) ? item[1] : item.items;
        const copy = Array.isArray(item) ? item[2] : item.copy;
        const Icon = Array.isArray(item) ? item[3] : item.icon;

        return (
          <article className="text-card compact-card checklist-card" key={title}>
            {Icon ? <Icon size={24} aria-hidden="true" /> : <CheckCircle2 size={24} aria-hidden="true" />}
            <div>
              <h2>{title}</h2>
              {copy && <p>{copy}</p>}
              {points?.length ? (
                <ul className="check-list">
                  {points.map((point) => <li key={point}>{point}</li>)}
                </ul>
              ) : null}
            </div>
          </article>
        );
      })}
    </section>
  );
}

function pastLitterHrefsFor(litter) {
  const hrefs = [
    litter.previousLitterHref,
    litter.pastLitterHref,
    ...(litter.previousLitterHrefs || []),
    ...(litter.pastLitterHrefs || [])
  ].filter(Boolean);

  return [...new Set(hrefs)].filter((href) => previousLitterDetails[href]);
}

function currentLitterHrefForPastLitter(href) {
  const litter = publicLitterProfiles.find((item) => pastLitterHrefsFor(item).includes(href));

  return litter?.slug ? `/litters/${litter.slug}` : "";
}

function LitterCard({ litter }) {
  const route = litter.slug ? `/litters/${litter.slug}` : litter.href;
  const pastLitterHrefs = pastLitterHrefsFor(litter);
  const pastLitterHref = pastLitterHrefs[0] || "";
  const pastLitterLabel = pastLitterHrefs.length > 1 ? "View Past Litters" : "View Past Litter";
  const delivery = litter.birthDate || litter.delivery || "Timing to be announced";
  const goHome = litter.goHomeDate || litter.goHome || "Go-home timing to be announced";
  const size = litter.expectedSize || litter.size || "Estimate to be announced";
  const price = litter.priceRange || litter.price;
  const image = litter.parentPairingImage || litter.image || litter.weeklyUpdateGallery?.[0];
  const mama = parentProfiles.find((parent) => parent.slug === litter.mamaSlug);
  const stud = parentProfiles.find((parent) => parent.slug === litter.studSlug);
  const hasPairingPhotos = mama?.mainPhoto && stud?.mainPhoto;
  const litterPuppies = puppiesForLitter(litter);
  const litterAvailablePuppies = litterPuppies.filter(isAvailablePuppy);
  const litterWaitlistPuppies = litterPuppies.filter(isWaitlistMatchingPuppy);
  const litterReservedPuppies = litterPuppies.filter(isReservedPuppy);
  const isFullyReservedLitter = litterPuppies.length > 0 && litterReservedPuppies.length === litterPuppies.length;
  const puppyCountLabel = litterAvailabilityLabel(litter, litterPuppies);
  const breedProgram = breedProfiles.find((breed) => breed.slug === litter.breedSlug);
  const waitlistName = breedProgram?.name || "breed";
  const publicAvailabilityNote = litterWaitlistPuppies.length ? waitlistFirstNote(waitlistName) : litter.availabilityNote;
  const actionLabel = isCurrentLitter(litter) && isFullyReservedLitter ? "View Updates" : isCurrentLitter(litter) ? "View Litter" : "View Pairing";
  const currentLitterGuidance = !isCurrentLitter(litter)
    ? null
    : litterAvailablePuppies.length
      ? {
          title: "Open now",
          copy: "A puppy may be open for an approved family. Apply and mention this litter or puppy by name."
        }
      : litterWaitlistPuppies.length
        ? {
            title: "Availability note",
            copy: `${waitlistFirstUpdateCopy()} Apply if you want to join this breed's waitlist.`
          }
        : isFullyReservedLitter
          ? {
              title: "Reserved",
              copy: "Matched families receive go-home details directly. New families can use this litter as a reference for future timing."
            }
          : {
              title: "Follow updates",
              copy: "Openings and next steps will be updated as this litter grows."
            };

  return (
    <article className="litter-card animal-card">
      {hasPairingPhotos ? (
        <figure className="pairing-photo-grid" aria-label={`${litter.name} parent pairing`}>
          <div>
            <img src={mama.mainPhoto} alt={`${mama.name} - mama for ${litter.name}`} loading="lazy" />
            <figcaption>{mama.name}</figcaption>
          </div>
          <div>
            <img src={stud.mainPhoto} alt={`${stud.name} - stud for ${litter.name}`} loading="lazy" />
            <figcaption>{stud.name}</figcaption>
          </div>
        </figure>
      ) : image ? (
        <img src={image} alt={litter.name} loading="lazy" />
      ) : (
        <ImagePlaceholder label="Litter photo" />
      )}
      <div className="litter-card-body">
        <div className="litter-card-heading">
          <div className="card-kicker-row">
            <p className="eyebrow">{litter.status || "Litter"}</p>
            <span className="status-badge">{puppyCountLabel}</span>
          </div>
          <h2>{litter.name}</h2>
          <h3>{litter.breed}</h3>
          {litter.availabilitySummary && <p>{litter.availabilitySummary}</p>}
        </div>
        <dl className="details compact-details litter-card-facts">
          <div><dt>Mama</dt><dd>{litter.mama || "Mama to be announced"}</dd></div>
          <div><dt>Stud</dt><dd>{litter.stud || "Stud to be announced"}</dd></div>
          <div><dt>Timing</dt><dd>{litter.expectedTiming || delivery}</dd></div>
          <div><dt>Go Home</dt><dd>{goHome}</dd></div>
          <div><dt>Size</dt><dd>{size}</dd></div>
          {price && <div><dt>Price</dt><dd>{price}</dd></div>}
        </dl>
        {(litter.expectedColors || litter.expectedCoatTraits || litter.coloring || litter.coat) && (
          <div className="litter-preview-notes">
            {(litter.expectedColors || litter.coloring) && <p><strong>Colors:</strong> {litter.expectedColors || litter.coloring}</p>}
            {(litter.expectedCoatTraits || litter.coat) && <p><strong>Coat:</strong> {litter.expectedCoatTraits || litter.coat}</p>}
          </div>
        )}
        {publicAvailabilityNote && <p className="small-note">{publicAvailabilityNote}</p>}
        {currentLitterGuidance && (
          <div className="litter-card-guidance">
            <p className="eyebrow">{currentLitterGuidance.title}</p>
            <p>{currentLitterGuidance.copy}</p>
          </div>
        )}
        {(route || pastLitterHref) && (
          <div className="litter-card-actions">
            {route && <Link href={route} className="button small">{actionLabel}</Link>}
            {pastLitterHref && <Link href={pastLitterHref} className="button small secondary">{pastLitterLabel}</Link>}
          </div>
        )}
      </div>
    </article>
  );
}

const publicPreviousLitterArchivePaths = [
  "/previous-litters-goldendoodles",
  "/previous-litters-cavapoos",
  "/previous-litters-bernedoodles"
];

function previousLitterDate(litter) {
  return litter.facts.find(([label]) => ["Born", "Delivery", "Expected"].includes(label))?.[1] || "Previous litter";
}

function previousLitterFact(litter, labels) {
  return litter.facts.find(([label]) => labels.includes(label))?.[1] || "See litter notes";
}

function publicPreviousLitterFacts(litter) {
  return litter.facts.filter(([label]) => !["Price", "Pricing"].includes(label));
}

function archiveHrefForPreviousLitter(href) {
  return publicPreviousLitterArchivePaths.find((archiveHref) => {
    const archive = previousLitterArchiveGroups[archiveHref];
    return archive?.litters?.includes(href);
  }) || "/puppies/previous-litters";
}

function normalizedParentLookupName(value = "") {
  return String(value)
    .replace(/\boutside stud\b/gi, "")
    .replace(/jennings/gi, "")
    .replace(/robert/gi, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function previousLitterParentNames(litter) {
  return String(litter.parents || litter.name || "")
    .split("+")
    .map((name) => name.split(",")[0].trim())
    .filter(Boolean)
    .slice(0, 2);
}

function previousLitterParentProfile(name) {
  const normalizedName = normalizedParentLookupName(name);

  return publicParentProfiles.find((parent) => {
    const parentName = normalizedParentLookupName(parent.name);
    const parentSlug = normalizedParentLookupName(parent.slug);

    return (
      parentName === normalizedName ||
      parentSlug === normalizedName ||
      parentName.startsWith(normalizedName) ||
      normalizedName.startsWith(parentName)
    );
  });
}

function previousLitterParentPhoto(litter, name) {
  const normalizedName = normalizedParentLookupName(name);

  return (litter.parentPhotos || []).find((photo) => {
    const photoName = normalizedParentLookupName(photo.name);
    return photoName === normalizedName || photoName.startsWith(normalizedName) || normalizedName.startsWith(photoName);
  });
}

function PreviousLitterPairingMedia({ litter, large = false }) {
  const parentNames = previousLitterParentNames(litter);

  if (parentNames.length >= 2) {
    return (
      <figure
        className={`pairing-photo-grid previous-pairing-photo-grid ${large ? "large" : ""}`.trim()}
        aria-label={`${litter.name} parent pairing`}
      >
        {parentNames.map((name) => {
          const parent = previousLitterParentProfile(name);
          const photo = previousLitterParentPhoto(litter, name);
          const image = photo?.image || parent?.mainPhoto;
          const displayName = photo?.name || parent?.name || name;
          const profileHref = photo?.href || (parent?.slug ? `/parents/${parent.slug}` : "");
          const parentWindow = (
            <>
              {image ? (
                <img src={image} alt={`${displayName} - parent for ${litter.name}`} loading="lazy" />
              ) : (
                <ImagePlaceholder label={`${displayName} parent photo`} />
              )}
              <figcaption>{displayName}</figcaption>
            </>
          );

          return (
            <div key={`${litter.name}-${displayName}`}>
              {profileHref ? (
                <Link
                  href={profileHref}
                  className="previous-pairing-parent-link"
                  aria-label={`View ${displayName} profile`}
                >
                  {parentWindow}
                </Link>
              ) : (
                parentWindow
              )}
            </div>
          );
        })}
      </figure>
    );
  }

  return litter.image ? (
    <img src={litter.image} alt={`${litter.name} previous litter`} loading="lazy" />
  ) : (
    <ImagePlaceholder label="Previous litter photo" />
  );
}

function PreviousLitterCard({ litter, href }) {
  const puppyCount = litter.puppyPhotos?.length || litter.puppies?.length || 0;
  const photoLabel = litter.puppyPhotos?.length ? "Puppy photos" : "Names listed";
  const date = previousLitterDate(litter);

  return (
    <article className="litter-card animal-card previous-litter-card">
      <PreviousLitterPairingMedia litter={litter} />
      <div className="litter-card-body">
        <div className="litter-card-heading">
          <div className="card-kicker-row">
            <p className="eyebrow">{litter.group}</p>
            <span className="status-badge">Past litter</span>
          </div>
          <h2>{litter.name}</h2>
          <h3>{litter.breed}</h3>
          {litter.theme && <p>{litter.theme}</p>}
        </div>
        <div className="previous-litter-card-summary" aria-label={`${litter.name} archive summary`}>
          <span>{date}</span>
          {puppyCount > 0 && <span>{puppyCount} puppies</span>}
          <span>{photoLabel}</span>
        </div>
        <dl className="details compact-details litter-card-facts">
          <div><dt>Date</dt><dd>{date}</dd></div>
          <div><dt>Size</dt><dd>{previousLitterFact(litter, ["Size"])}</dd></div>
          <div><dt>Coat</dt><dd>{previousLitterFact(litter, ["Coat"])}</dd></div>
          <div><dt>Parents</dt><dd>{litter.parents}</dd></div>
        </dl>
        <div className="litter-preview-notes">
          <p><strong>Pairing reference:</strong> Past litters show families the puppy style a pairing has produced before.</p>
        </div>
        <div className="litter-card-actions">
          <Link href={href} className="button small">View Past Litter</Link>
        </div>
      </div>
    </article>
  );
}

function FAQSection({ items = faqProfiles, category, grouped = false }) {
  const normalizedItems = items.map((item) => Array.isArray(item) ? { category: "General", question: item[0], answer: item[1] } : item);
  const scopedItems = category
    ? normalizedItems.filter((item) => item.category === category || item.category === "Getting on the waitlist")
    : normalizedItems;

  if (grouped) {
    const categories = [...new Set(scopedItems.map((item) => item.category || "General"))];
    return (
      <section className="faq-list grouped-faq">
        {categories.map((group) => (
          <div className="faq-category" key={group}>
            <h2>{group}</h2>
            {scopedItems.filter((item) => (item.category || "General") === group).map((item, index) => (
              <details key={item.question} open={index === 0}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="faq-list">
      {scopedItems.map((item, index) => (
        <details key={item.question} open={index === 0}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </section>
  );
}

function PricingSection({ items = pricingProfiles }) {
  return (
    <section className="tile-grid three pricing-profile-grid">
      {items.map((group) => {
        const title = group.breed || group[0];
        const summary = group.summary;
        const details = group.items || group[1] || [];

        return (
          <article className="text-card pricing-profile-card" key={title}>
            <div className="pricing-profile-heading">
              <p className="eyebrow">Breed pricing</p>
              <h2>{title}</h2>
            </div>
            {summary && <p>{summary}</p>}
            <dl className="pricing-profile-list">
              {details.map((item) => {
                const [label, value] = String(item).split(":").map((part) => part.trim());

                return (
                  <div key={item}>
                    <dt>{label || item}</dt>
                    <dd>{value || "Confirmed by litter"}</dd>
                  </div>
                );
              })}
            </dl>
          </article>
        );
      })}
    </section>
  );
}

function StarRating() {
  return (
    <div className="star-rating" aria-label="Five-star review">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} size={18} fill="currentColor" />
      ))}
    </div>
  );
}

function TestimonialSection({ items = testimonialProfiles }) {
  return (
    <section className="reviews-row">
      {items.map((review) => (
        <article className="review-card" key={`${review.name}-${review.quote}`}>
          <StarRating />
          {review.photo && <img src={review.photo} alt={review.name} />}
          <p>&quot;{review.quote}&quot;</p>
          <footer>
            <strong>{review.name}</strong>
            <span>Google review</span>
          </footer>
        </article>
      ))}
    </section>
  );
}

function CTASection({ title = "Ready to take the next step?", copy = "Apply now or view current puppy availability.", primaryHref = "/apply", primaryLabel = "Apply", secondaryHref = "/puppies/available", secondaryLabel = "Available Puppies" }) {
  return (
    <section className="content-section narrow">
      <article className="group-panel">
        <h2>{title}</h2>
        <p>{copy}</p>
        <div className="actions">
          <Link href={primaryHref} className="button primary">{primaryLabel}</Link>
          {secondaryHref && secondaryLabel && <Link href={secondaryHref} className="button secondary">{secondaryLabel}</Link>}
        </div>
      </article>
    </section>
  );
}

function ListingStatusStrip({ items = [], className = "" }) {
  if (!items.length) {
    return null;
  }

  return (
    <section className={`availability-summary-band listing-status-strip ${className}`} aria-label="Page snapshot">
      {items.map((item) => (
        <article key={`${item.value}-${item.label}`}>
          <span>{item.value}</span>
          <p>{item.label}</p>
        </article>
      ))}
    </section>
  );
}

function BuyerGuidancePanel({ eyebrow, title, copy, steps = [], primaryHref = "/apply", primaryLabel = "Apply for a Puppy", secondaryHref, secondaryLabel, showActions = true }) {
  return (
    <section className={`buyer-guidance-panel group-panel${showActions ? "" : " no-actions"}`}>
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {copy && <p>{copy}</p>}
      </div>
      {steps.length > 0 && (
        <div className="buyer-guidance-steps">
          {steps.map((step, index) => (
            <article key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>
      )}
      {showActions && (
        <div className="actions">
          {primaryHref && primaryLabel && <Link href={primaryHref} className="button primary">{primaryLabel}</Link>}
          {secondaryHref && secondaryLabel && <Link href={secondaryHref} className="button secondary">{secondaryLabel}</Link>}
        </div>
      )}
    </section>
  );
}

function SmartEmptyState({ eyebrow = "Update", title, copy, steps = [], primaryHref = "/apply", primaryLabel = "Apply for a Puppy", secondaryHref, secondaryLabel }) {
  const hasPrimaryAction = Boolean(primaryHref && primaryLabel);
  const hasSecondaryAction = Boolean(secondaryHref && secondaryLabel);

  return (
    <section className="content-section narrow availability-empty-panel smart-empty-state">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
      {steps.length > 0 && (
        <div className="availability-empty-steps" aria-label="Best next steps">
          {steps.map((step, index) => (
            <article key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>
      )}
      {(hasPrimaryAction || hasSecondaryAction) && (
        <div className="actions">
          {hasPrimaryAction && <Link href={primaryHref} className="button primary">{primaryLabel}</Link>}
          {hasSecondaryAction && <Link href={secondaryHref} className="button secondary">{secondaryLabel}</Link>}
        </div>
      )}
    </section>
  );
}

function BuyerPageTemplate({ eyebrow, title, copy, actions, image, children, cta, heroClassName = "compact-page-hero buyer-page-hero" }) {
  return (
    <Layout>
      <PageHero eyebrow={eyebrow} title={title} copy={copy} image={image} actions={actions} className={heroClassName} />
      {children}
      {cta && <CTASection {...cta} />}
    </Layout>
  );
}

function ProcessPageTemplate({ eyebrow = "Process", title, copy, stats = [], children, cta }) {
  return (
    <Layout>
      <PageHero eyebrow={eyebrow} title={title} copy={copy} className="compact-page-hero" />
      <ListingStatusStrip items={stats} className="process-status-strip" />
      {children}
      {cta && <CTASection {...cta} />}
    </Layout>
  );
}

function ParentCard({ parent }) {
  const hasPublicProfile = parent.visibility !== "private";
  const roleLabel = parent.role === "stud" ? "Stud" : "Mama";
  const program = breedProfiles.find((breed) => breed.slug === parent.breedSlug);
  const previewFacts = [
    ["Breed", parent.breed],
    ["Weight", parent.weight],
    ["Coat", parent.coat],
    ["Color", parent.color]
  ].filter(([, value]) => Boolean(value));

  return (
    <article className="text-card parent-card parent-profile-card">
      <figure className={`parent-card-media ${parent.mainPhoto ? "" : "is-placeholder"}`.trim()}>
        {parent.mainPhoto ? <img src={parent.mainPhoto} alt={parent.name} loading="lazy" /> : <ImagePlaceholder label="Parent dog photo" />}
        <span className="parent-role-badge">{roleLabel}</span>
      </figure>
      <div className="parent-card-body">
        <div className="parent-card-heading">
          <p className="eyebrow">{program?.name || parent.breed}</p>
          <h2>{parent.name}</h2>
          <p>{parent.description}</p>
        </div>
        <dl className="parent-card-facts" aria-label={`${parent.name} quick profile details`}>
          {previewFacts.map(([label, value]) => (
            <div key={`${parent.slug}-${label}`}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="parent-card-meta" aria-label={`${parent.name} status details`}>
          {parent.status && <span>{parent.status}</span>}
          {parent.relatedLitters?.length ? <span>{parent.relatedLitters.length} related litter{parent.relatedLitters.length === 1 ? "" : "s"}</span> : null}
        </div>
        {hasPublicProfile ? (
          <Link href={`/parents/${parent.slug}`} className="inline-link">View profile</Link>
        ) : (
          <p className="small-note">Profile details are shared for this pairing only.</p>
        )}
      </div>
    </article>
  );
}

function StudCard({ stud }) {
  const testingStatus = stud.testing?.length ? "Testing noted" : "Records by request";
  const facts = [
    stud.group,
    stud.weight,
    stud.fee || "$1,500",
    testingStatus
  ].filter(Boolean);

  return (
    <article className="text-card parent-card parent-profile-card stud-card">
      <figure className={`parent-card-media stud-card-media ${stud.image ? "" : "is-placeholder"}`.trim()}>
        {stud.image ? <img src={stud.image} alt={`${stud.name} stud at Red Ranch Dogs`} loading="lazy" /> : <ImagePlaceholder label="Stud photo" />}
        <span className="parent-role-badge stud-role-badge">Stud</span>
      </figure>
      <div className="parent-card-body stud-card-body">
        <div className="parent-card-heading stud-card-heading">
          <p className="eyebrow">{stud.group}</p>
          <h2>{stud.name}</h2>
          <p>{stud.type}</p>
        </div>
        <div className="parent-card-meta stud-card-facts" aria-label={`${stud.name} quick stud details`}>
          {facts.map((fact, index) => <span key={`${fact}-${index}`}>{fact}</span>)}
        </div>
        {stud.genetics && <p className="stud-card-genetics">{stud.genetics}</p>}
        <Link href={stud.href} className="inline-link">View profile</Link>
      </div>
    </article>
  );
}

function StudCatalogSection() {
  return (
    <section className="content-section stud-catalog-section">
      <SectionHeader
        eyebrow="Our Studs"
        title="Available stud profiles"
        copy="Browse current Red Ranch Dogs studs by breed, size, fee, and profile details. Breeders can inquire about a specific stud or ask which fit makes sense for their program."
      />
      {studCatalog.map((group) => {
        const groupLabel = group.breed.endsWith("s") ? group.breed.slice(0, -1) : group.breed;
        return (
          <article className="stud-group-panel" key={group.breed}>
            <div className="stud-group-heading">
              <h2>{groupLabel} Studs</h2>
              <p>{group.breed === "Poodles" ? "Health-tested poodle studs used across select doodle pairings." : `Health-tested ${groupLabel.toLowerCase()} studs for approved breeding programs.`}</p>
            </div>
            <div className="stud-card-grid">
              {group.dogs.map(([name, type, weight, genetics, href]) => {
                const stud = studDetails[href] || {};
                return (
                  <StudCard
                    key={`${group.breed}-${name}`}
                    stud={{
                      href,
                      name,
                      type,
                      weight,
                      genetics,
                      group: groupLabel,
                      image: stud.image,
                      fee: stud.fee,
                      testing: stud.testing
                    }}
                  />
                );
              })}
            </div>
          </article>
        );
      })}
    </section>
  );
}

function ParentDirectoryNav() {
  const links = [
    ["All Parents", "/parents"],
    ["Mamas", "/parents/mamas"],
    ["Studs", "/parents/studs"],
    ["Goldendoodles", "/parents/goldendoodle-parents"],
    ["Cavapoos", "/parents/cavapoo-parents"],
    ["Bernedoodles", "/parents/bernedoodle-parents"]
  ];
  const currentPath = pathNow();

  return (
    <nav className="parent-directory-nav" aria-label="Parent dog categories">
      {links.map(([label, href]) => (
        <Link href={href} className={currentPath === href ? "active" : undefined} key={href}>
          {label}
        </Link>
      ))}
    </nav>
  );
}

function BreedParentsCTA({ breed, parents = [] }) {
  const parentPath = `/parents/${breed.slug.replace("-puppies", "-parents")}`;
  const parentPhotos = parents.filter((parent) => parent.mainPhoto).slice(0, 3);

  return (
    <section className="content-section breed-parent-preview">
      <article className="group-panel">
        <div>
          <p className="eyebrow">Parent Dogs</p>
          <h2>Meet our {breed.name} parents</h2>
          <p>Our {breed.name} mamas and studs are selected for health, temperament, size, coat quality, and family-friendly personalities.</p>
        </div>
        <div className="breed-parent-preview-actions">
          {parentPhotos.length > 0 && (
            <div className="parent-preview-photos" aria-label={`${breed.name} parent photo preview`}>
              {parentPhotos.map((parent) => (
                <img src={parent.mainPhoto} alt={parent.name} key={parent.slug} loading="lazy" />
              ))}
            </div>
          )}
          <div className="actions">
            <Link href={parentPath} className="button primary">View {breed.name} Parents</Link>
            <Link href="/parents" className="button secondary">View All Parents</Link>
          </div>
        </div>
      </article>
    </section>
  );
}

function ParentTestingPanel({ title, links = [], emptyCopy }) {
  return (
    <article className="text-card parent-testing-card">
      <h3>{title}</h3>
      {links.length ? (
        <ul className="clean-list">
          {links.map((href) => <li key={href}><a href={href}>{title}</a></li>)}
        </ul>
      ) : (
        <p>{emptyCopy}</p>
      )}
    </article>
  );
}

const normalizedStatus = (value = "") => String(value).trim().toLowerCase();

function publicRecords(records = []) {
  return records.filter((record) => !["hidden", "private"].includes(normalizedStatus(record?.visibility || "public")));
}

const publicPuppyProfiles = publicRecords(puppyProfiles);
const publicLitterProfiles = publicRecords(litterProfiles);
const publicParentProfiles = publicRecords(parentProfiles);
const puppyData = publicPuppyProfiles;
const isCurrentLitter = (litter) => normalizedStatus(litter?.status).includes("current");
const isPlannedLitter = (litter) => {
  const status = normalizedStatus(litter?.status);
  return status.includes("planned") || status.includes("upcoming");
};

function sortableLitterDate(value = "") {
  const text = String(value).trim();
  const rangeMatch = text.match(/^([A-Za-z]+)\s+(\d{1,2})(?:-\d{1,2})?,\s*(\d{4})$/);
  const monthMatch = text.match(/^([A-Za-z]+)\s+(\d{4})$/);
  const monthInTextMatch = text.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b/i);
  const seasonMatch = text.match(/\b(early summer|late summer|spring|summer|fall|autumn|winter)\s+(\d{4})\b/i);

  if (rangeMatch) {
    return Date.parse(`${rangeMatch[1]} ${rangeMatch[2]}, ${rangeMatch[3]}`);
  }

  if (monthMatch) {
    return Date.parse(`${monthMatch[1]} 1, ${monthMatch[2]}`);
  }

  if (monthInTextMatch) {
    return Date.parse(`${monthInTextMatch[1]} 1, ${monthInTextMatch[2]}`);
  }

  if (seasonMatch) {
    const seasonStartMonth = {
      winter: "January",
      spring: "March",
      "early summer": "June",
      summer: "July",
      "late summer": "August",
      fall: "September",
      autumn: "September"
    };
    return Date.parse(`${seasonStartMonth[seasonMatch[1].toLowerCase()]} 1, ${seasonMatch[2]}`);
  }

  const parsed = Date.parse(text);
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

const currentLitterProfiles = publicLitterProfiles
  .filter(isCurrentLitter)
  .sort((first, second) => sortableLitterDate(first.goHomeDate || first.goHome) - sortableLitterDate(second.goHomeDate || second.goHome));
const plannedLitterProfiles = publicLitterProfiles
  .filter(isPlannedLitter)
  .sort((first, second) => sortableLitterDate(first.expectedTiming || first.delivery || first.goHomeDate || first.goHome) - sortableLitterDate(second.expectedTiming || second.delivery || second.goHomeDate || second.goHome));
const plannedLitterBreedGroups = [
  {
    slug: "goldendoodle-puppies",
    eyebrow: "Goldendoodles",
    title: "Planned Goldendoodle litters",
    copy: "Classic family doodles with mini and petite pairings planned around temperament, coat, and size."
  },
  {
    slug: "cavapoo-puppies",
    eyebrow: "Cavapoos",
    title: "Planned Cavapoo litters",
    copy: "Smaller companion-focused puppies with sweet temperaments and soft coat possibilities."
  },
  {
    slug: "bernedoodle-puppies",
    eyebrow: "Bernedoodles",
    title: "Planned Bernedoodle litters",
    copy: "People-focused Bernedoodles with compact size, beautiful color, and steady family temperament."
  }
];
const puppiesForLitter = (litter) => puppyData.filter((puppy) => puppy.litterSlug === litter.slug);
const statusMatches = (puppy, status) => normalizedStatus(puppy?.status) === normalizedStatus(status);
const isAvailablePuppy = (puppy) => statusMatches(puppy, "available");
const isReservedPuppy = (puppy) => ["reserved", "matched"].includes(normalizedStatus(puppy?.status));
const isWaitlistMatchingPuppy = (puppy) => statusMatches(puppy, "waitlist matching");
const availablePuppiesForLitter = (litter) => puppiesForLitter(litter).filter(isAvailablePuppy);
const WAITLIST_FIRST_LABEL = "Waitlist Picks First";
const puppyDisplayStatus = (status = "") => normalizedStatus(status) === "waitlist matching" ? WAITLIST_FIRST_LABEL : status;
const waitlistFirstNote = (waitlistName) => `${waitlistName} waitlist families pick first for this litter.`;
const waitlistFirstUpdateCopy = () => "If puppies remain after those picks, availability will be posted here.";
const litterAvailabilityLabel = (litter, litterPuppies = puppiesForLitter(litter)) => {
  const availableCount = litterPuppies.filter(isAvailablePuppy).length;
  const waitlistCount = litterPuppies.filter(isWaitlistMatchingPuppy).length;
  const reservedCount = litterPuppies.filter(isReservedPuppy).length;

  if (availableCount) return `${availableCount} available`;
  if (waitlistCount) return WAITLIST_FIRST_LABEL;
  if (litterPuppies.length && reservedCount === litterPuppies.length) return "Reserved";
  if (!isCurrentLitter(litter)) return "Planning";
  if (litterPuppies.length) return `${litterPuppies.length} puppy profiles`;
  return "Updates soon";
};

const puppyNextSteps = [
  ["Apply or Ask", "Start with a quick application or ask about a specific puppy so we understand your family, timing, and preferences."],
  ["Talk Through Fit", "We confirm availability, personality notes, size expectations, and whether this puppy or a future litter is the best path."],
  ["Reserve With Deposit", "When everything lines up, a $500 deposit reserves your puppy or your place on the breed waitlist and applies toward the final price."]
];

const waitlistProcessSteps = [
  ["Apply", "Tell us your preferred breed, size range, timeline, and any questions so we can understand fit."],
  ["Deposit", "A $500 non-refundable deposit reserves your place on that breed's waitlist and applies toward your puppy."],
  ["Updates", "When a litter is born or planned, waitlist families are contacted in order of deposit placed."],
  ["Pick or pass", "You can move forward with a litter or pass and remain on your breed waitlist for a future opportunity."],
  ["Choose puppy", "Puppy picks happen in waitlist order using photos, videos, personality notes, and video calls."],
  ["Go home", "We help with timing, records, supplies, and transition details before pickup."]
];

const processOverviewStats = [
  { value: "$500", label: "deposit applies toward final puppy price" },
  { value: "3", label: "separate breed waitlists" },
  { value: "7-8", label: "weeks old at go-home" }
];

const pricingStats = [
  { value: "$500", label: "non-refundable deposit" },
  { value: "Zelle", label: "preferred payment method" },
  { value: "Before", label: "final payment due before pickup" },
  { value: "Separate", label: "travel costs if needed" }
];

const faqStats = [
  { value: "Waitlist", label: "deposit, order, and pick-or-pass questions" },
  { value: "Pricing", label: "payments, deposits, and timing" },
  { value: "Pickup", label: "go-home and transportation details" },
  { value: "Coats", label: "traits, shedding, and care" }
];

const pickupDeliveryStats = [
  { value: "7-8", label: "weeks old for go-home" },
  { value: "Texas", label: "local pickup coordination" },
  { value: "Travel", label: "flight nanny or delivery by plan" }
];

const pricingTimingCards = [
  ["Deposit", "A $500 non-refundable deposit joins the selected breed waitlist or reserves an available puppy. It applies toward the final puppy price."],
  ["Final Payment", "Final payment is confirmed before pickup so each family knows the amount due and timing. Zelle is currently preferred."],
  ["Transportation", "Pickup, delivery, or flight nanny plans are coordinated by litter and family. Travel costs are separate from puppy pricing."]
];

const pickupDeliveryCards = [
  ["Pickup in Central Texas", "Most families pick up in Salado or Central Texas. We confirm timing, records, and what to bring before go-home."],
  ["Flight nanny coordination", "When travel is needed, we can help coordinate options. Flight nanny or delivery costs are separate from puppy pricing."],
  ["Go-home preparation", "Families receive timing, records, supply notes, and transition guidance before pickup so go-home feels clear."]
];

const goHomeDayGuidanceCards = [
  {
    title: "Ride home",
    copy: "For local pickup, your puppy can usually just sit on your lap for the ride home. Bring a small carrier only if your travel plan or comfort level needs one.",
    icon: HomeIcon
  },
  {
    title: "Potty before leaving",
    copy: "Puppies usually get a quick front yard potty break before leaving Red Ranch so the first drive starts as calmly as possible.",
    icon: PawPrint
  },
  {
    title: "Public-ground safety",
    copy: "Until vaccine protection is complete, keep all four paws off the ground in public places during travel stops.",
    icon: ShieldCheck
  },
  {
    title: "Payment and records",
    copy: "Final payment timing, records, pickup time, and any travel details are confirmed before go-home so each family knows what is due.",
    icon: CheckCircle2
  }
];

const studServiceStats = [
  { value: "$1,500", label: "most Red Ranch Dogs stud fees" },
  { value: "$2,000", label: "Garth Brooks stud fee" },
  { value: "AI", label: "side-by-side included in Salado" },
  { value: "Test", label: "negative brucellosis required" }
];

const studServiceStepCards = [
  ["Start With an Inquiry", "Send the basics about your program, female, timing, and which Red Ranch Dogs stud you are considering.", MessageCircle],
  ["Text When She Is in Heat", "When your girl comes in, we usually start a group text to coordinate cycle timing, progesterone updates, AI, or shipping.", Heart],
  ["Confirm Records and Timing", "Before service, we confirm negative brucellosis, timing, payment, and whether you are coming to Salado or using shipped semen.", ShieldCheck]
];

const reproductiveServiceCards = [
  ["Stud inquiries", "Share your program, female, timing, and which Red Ranch Dogs stud you are considering.", Sparkles],
  ["Timing support", "We help coordinate heat-cycle timing, progesterone updates, side-by-side AI, or shipping details.", Heart],
  ["Breeder communication", "Once timing is close, we keep records, payment, collection, and delivery details clear.", MessageCircle]
];

const guardianOpportunityStats = [
  { value: "Local", label: "guardian homes near Salado" },
  { value: "Females", label: "most common placements" },
  { value: "Fit", label: "conversation before placement" }
];

const guardianOpportunityCards = [
  ["No openings right now", "Guardian openings are shared when we are looking for the right local family fit."],
  ["Apply early", "You can still submit a guardian application so we know your location, home setup, and interest."],
  ["Fit comes first", "We look for great care, clear communication, a fenced yard, and reasonable distance from Salado."]
];

const pricingFactors = [
  ["Breed and pairing", "Each pairing has different size, coat, color, and generation considerations."],
  ["Size range", "Micro, petite mini, and mini ranges can affect availability and pricing."],
  ["Coat and color traits", "Harder-to-produce traits may carry different pricing once confirmed."],
  ["Timing and availability", "Current puppy availability and waitlist demand can affect final placement details."]
];

const includedWithPuppy = [
  "Vet records and age-appropriate care notes",
  "Early handling and socialization foundations",
  "Go-home and transition guidance",
  "Communication as your puppy grows",
  "Support after pickup"
];

const waitlistPolicies = [
  ["One row equals one spot", "Each public position represents one waitlist deposit. If a family has two spots, they appear twice."],
  ["Breed-specific lists", "Goldendoodles, Cavapoos, and Bernedoodles each have their own waitlist."],
  ["Pick or pass", "Families can pass on a litter and remain on their breed waitlist for a future opportunity."],
  ["Privacy first", "The public list uses first name and last initial only."]
];

const waitlistBreedOrder = ["Goldendoodle", "Cavapoo", "Bernedoodle"];

function normalizedWaitlistData(data) {
  const publicRows = Array.isArray(data?.publicRows) ? data.publicRows : [];

  return {
    ...waitlistData,
    ...data,
    publicRows
  };
}

function usePublicWaitlistData(initialData) {
  const [liveWaitlistData, setLiveWaitlistData] = useState(() => normalizedWaitlistData(initialData));

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/waitlist", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Public waitlist feed unavailable.");
        }
        return response.json();
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setLiveWaitlistData(normalizedWaitlistData(data));
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setLiveWaitlistData(normalizedWaitlistData(initialData));
        }
      });

    return () => controller.abort();
  }, [initialData]);

  return liveWaitlistData;
}

function isPublicWaitlistRow(row) {
  return (
    row?.display_name &&
    String(row.status || "").toLowerCase() === "active" &&
    String(row.show_publicly || "").toLowerCase() === "yes"
  );
}

function groupPublicWaitlistRows(rows = []) {
  const grouped = rows.filter(isPublicWaitlistRow).reduce((accumulator, row) => {
    const breed = row.breed || "Other";
    if (!accumulator[breed]) {
      accumulator[breed] = [];
    }

    accumulator[breed].push({
      ...row,
      position: Number(row.position) || accumulator[breed].length + 1
    });
    return accumulator;
  }, {});

  return Object.entries(grouped)
    .map(([breed, breedRows]) => ({
      breed,
      rows: breedRows.sort((first, second) => first.position - second.position)
    }))
    .sort((first, second) => {
      const firstIndex = waitlistBreedOrder.indexOf(first.breed);
      const secondIndex = waitlistBreedOrder.indexOf(second.breed);

      if (firstIndex === -1 && secondIndex === -1) {
        return first.breed.localeCompare(second.breed);
      }

      if (firstIndex === -1) return 1;
      if (secondIndex === -1) return -1;
      return firstIndex - secondIndex;
    });
}

function formatWaitlistDate(dateString) {
  const [year, month, day] = String(dateString || "").split("-").map(Number);

  if (!year || !month || !day) {
    return "";
  }

  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function SectionIndexPage({ eyebrow, title, copy, links, children }) {
  return (
    <Layout>
      <PageHero eyebrow={eyebrow} title={title} copy={copy} />
      <section className="tile-grid architecture-grid page-directory-grid">
        {links.map((link) => (
          <article className="text-card" key={link.href}>
            <h2>{link.label}</h2>
            {link.copy && <p>{link.copy}</p>}
            <Link href={link.href} className="inline-link">View page</Link>
          </article>
        ))}
      </section>
      {children}
    </Layout>
  );
}

function BreedPageTemplate({ breed }) {
  const puppies = puppyData.filter((puppy) => puppy.breedSlug === breed.slug);
  const availableBreedPuppies = puppies.filter(isAvailablePuppy);
  const litters = publicLitterProfiles.filter((litter) => litter.breedSlug === breed.slug);
  const parents = publicParentProfiles.filter((parent) => parent.breedSlug === breed.slug);
  const breedHighlights = [
    ["Best Fit", breed.bestFit || breed.idealFamilyFit, Heart],
    ["Size Expectations", breed.expectedSizeRange, PawPrint],
    ["Temperament", breed.temperament, Sparkles],
    ["Coat and Shedding", `${breed.coatExpectations} ${breed.sheddingAllergyNotes}`, ShieldCheck]
  ];
  const fitSignals = [
    breed.bestFit || breed.idealFamilyFit,
    breed.temperament,
    breed.expectedSizeRange
  ].filter(Boolean);
  const decisionQuestions = [
    `How much size flexibility is comfortable for your family? ${breed.expectedSizeRange}`,
    `How important is lower shedding? ${breed.sheddingAllergyNotes}`,
    `What coat look do you like most? ${breed.coatExpectations}`
  ].filter(Boolean);

  return (
    <BuyerPageTemplate
      eyebrow="Breed Program"
      title={breed.heroTitle}
      copy={breed.intro}
      cta={{
        title: `Interested in a ${breed.name}?`,
        copy: "Apply now and we will help you understand current availability, upcoming litters, and the best next step for your family.",
        primaryLabel: "Apply for a Puppy",
        secondaryHref: "/puppies/current-litters",
        secondaryLabel: "View Current Litters"
      }}
    >
      <ListingStatusStrip
        className="breed-status-strip"
        items={[
          { value: "Fit", label: breed.bestFit || breed.idealFamilyFit },
          { value: "Size", label: breed.expectedSizeRange },
          { value: "Coat", label: breed.coatExpectations }
        ]}
      />
      <section className="content-section breed-template-grid breed-first-section">
        <article className="group-panel">
          <p className="eyebrow">Breed Snapshot</p>
          <h2>What to know about {breed.name}</h2>
          <p>{breed.positioning || breed.intro}</p>
          <dl className="details facts-wide">
            <div><dt>Ideal family fit</dt><dd>{breed.idealFamilyFit}</dd></div>
            <div><dt>Expected size range</dt><dd>{breed.expectedSizeRange}</dd></div>
            <div><dt>Temperament</dt><dd>{breed.temperament}</dd></div>
            <div><dt>Coat expectations</dt><dd>{breed.coatExpectations}</dd></div>
            <div><dt>Shedding and allergies</dt><dd>{breed.sheddingAllergyNotes}</dd></div>
          </dl>
        </article>
      </section>
      <section className="tile-grid four priority-grid">
        {breedHighlights.map(([title, copy, Icon]) => (
          <article className="text-card icon-card" key={title}>
            <Icon size={24} />
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>
      <section className="content-section breed-decision-section">
        <article className="group-panel breed-decision-card">
          <p className="eyebrow">Breed Fit</p>
          <h2>Who tends to love {breed.shortName || breed.pluralName}</h2>
          <ul className="check-list">
            {fitSignals.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
        <article className="group-panel breed-decision-card">
          <p className="eyebrow">Good Questions</p>
          <h2>Questions to ask before choosing this breed</h2>
          <ul className="check-list">
            {decisionQuestions.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
      </section>
      <section className="card-list">
        <SectionHeader eyebrow="Available Puppies" title={`Available ${breed.name} puppies`} copy="Only puppies truly open for an approved family appear here. Reserved puppies stay on their litter pages." />
        {availableBreedPuppies.length ? availableBreedPuppies.map((puppy) => <PuppyCard puppy={puppy} key={puppy.slug || puppy.name} />) : <p className="small-note">We do not have available puppies for this breed right now. Join the waitlist or follow current litters for the newest updates.</p>}
      </section>
      <section className="card-list">
        <SectionHeader eyebrow="Litters" title={`${breed.name} litters`} copy="Current and planned pairings live here so families can follow timing, parent dogs, and weekly updates without crowding the Available Puppies page." />
        {litters.length ? litters.map((litter) => <LitterCard litter={litter} key={litter.slug || litter.name} />) : <p className="small-note">Litter plans for this breed will be shared as pairings and timing are confirmed.</p>}
      </section>
      <BreedParentsCTA breed={breed} parents={parents} />
      <FAQSection category={breed.faqCategory} />
    </BuyerPageTemplate>
  );
}

function PuppyDetailPage({ puppy }) {
  const weeklyPhotoGroups = puppy.weeklyPhotos || [];
  const weeklyPhotoSet = new Set(weeklyPhotoGroups.flatMap((group) => group.photos || []));
  const extraPhotos = (puppy.photos || []).filter((photo) => photo && !weeklyPhotoSet.has(photo));

  return (
    <Layout>
      <section className="card-list puppy-detail-section">
        <PuppyCard puppy={puppy} variant="detail" />
      </section>
      {weeklyPhotoGroups.length > 0 && (
        <section className="content-section puppy-weekly-photo-section">
          <SectionHeader
            eyebrow="Photo Updates"
            title={`${puppy.name}'s weekly photos`}
            copy="Follow this puppy's growth with the newest photos first, then scroll back through earlier updates."
          />
          <div className="puppy-weekly-photo-list">
            {weeklyPhotoGroups.map((group) => (
              <article className="group-panel puppy-weekly-photo-group" key={group.week}>
                <div className="puppy-weekly-photo-heading">
                  <p className="eyebrow">{group.week}</p>
                  <h2>{group.week} photos</h2>
                </div>
                <ImageGallery images={group.photos || []} label={`${puppy.name} ${group.week} puppy photo`} />
              </article>
            ))}
          </div>
        </section>
      )}
      {extraPhotos.length > 0 && (
        <section className="content-section litter-gallery-section puppy-detail-gallery">
          <SectionHeader eyebrow="More Photos" title={`${puppy.name} additional photos`} copy="Additional puppy photos can be added here as this profile grows." />
          <ImageGallery images={extraPhotos} label={`${puppy.name} puppy photo`} />
        </section>
      )}
    </Layout>
  );
}

function LitterPage({ litter }) {
  const puppies = puppyData.filter((puppy) => puppy.litterSlug === litter.slug);
  const parents = parentProfiles.filter((parent) => parent.slug === litter.mamaSlug || parent.slug === litter.studSlug);
  const mama = parentProfiles.find((parent) => parent.slug === litter.mamaSlug);
  const stud = parentProfiles.find((parent) => parent.slug === litter.studSlug);
  const availablePuppies = puppies.filter(isAvailablePuppy);
  const reservedPuppies = puppies.filter(isReservedPuppy);
  const waitlistMatchingPuppies = puppies.filter(isWaitlistMatchingPuppy);
  const isFullyReservedLitter = puppies.length > 0 && reservedPuppies.length === puppies.length;
  const gallery = litter.weeklyUpdateGallery || [];
  const fallbackLitterImage = litter.parentPairingImage || litter.image || gallery[0];
  const hasParentPairing = mama?.mainPhoto && stud?.mainPhoto;
  const hasAboutSection = litter.aboutThisLitter?.length || litter.geneticMakeup?.length || litter.aboutHighlights?.length;
  const aboutParagraphs = litter.aboutThisLitter || [];
  const visibleAboutParagraphs = aboutParagraphs.slice(0, 2);
  const extraAboutParagraphs = aboutParagraphs.slice(2);
  const currentWeek =
    puppies.flatMap((puppy) => puppy.weeklyPhotos?.map((update) => update.week) || [])[0] ||
    litter.weeklyUpdateStatus?.match(/Week\s+\d+/i)?.[0];
  const statusLabel = litterAvailabilityLabel(litter, puppies);
  const pastLitterHrefs = pastLitterHrefsFor(litter);
  const pastLitterHref = pastLitterHrefs[0] || "";
  const pastLitterLabel = pastLitterHrefs.length > 1 ? "View Past Litters" : "View Past Litter";
  const breedProgram = breedProfiles.find((breed) => breed.slug === litter.breedSlug);
  const waitlistName = breedProgram?.name || "breed";
  const publicAvailabilityNote = waitlistMatchingPuppies.length ? waitlistFirstNote(waitlistName) : litter.availabilityNote;
  const availabilityCallout = availablePuppies.length
    ? {
        count: availablePuppies.length,
        copy: `${availablePuppies.length === 1 ? "available puppy" : "available puppies"} from this litter`
      }
    : waitlistMatchingPuppies.length
      ? {
          count: waitlistMatchingPuppies.length,
          copy: `${waitlistMatchingPuppies.length === 1 ? "puppy" : "puppies"} offered to the ${waitlistName} waitlist first`
        }
      : puppies.length && reservedPuppies.length === puppies.length
        ? {
            count: puppies.length,
            copy: `${puppies.length === 1 ? "reserved puppy" : "reserved puppies"} in this litter`
          }
        : puppies.length
          ? {
              count: puppies.length,
              copy: `${puppies.length === 1 ? "puppy profile" : "puppy profiles"} listed from this litter`
            }
          : {
              count: 0,
              copy: "puppy updates will be shared when ready"
            };
  const litterCta = availablePuppies.length
    ? {
        title: "Interested in an available puppy?",
        copy: "Apply now or ask about availability, timing, and whether this puppy is the right fit for your family.",
        primaryLabel: "Apply for a Puppy"
      }
    : waitlistMatchingPuppies.length
      ? {
          title: `Want to join the ${waitlistName} waitlist?`,
          copy: `${waitlistFirstNote(waitlistName)} Apply now to get in line for this breed.`,
          primaryLabel: "Join the Waitlist"
        }
      : isFullyReservedLitter
        ? {
            title: "Want a future litter like this?",
            copy: `${litter.name} is fully reserved. Apply for the ${waitlistName} waitlist and we will help you understand future timing, similar pairings, and the best next step for your family.`,
            primaryLabel: "Apply for a Future Litter"
        }
      : {
          title: "Want updates on future litters?",
          copy: "This litter is currently reserved, but you can apply for a future pairing or ask about upcoming availability.",
          primaryLabel: "Apply for a Puppy"
        };
  const litterNextStep = availablePuppies.length
    ? {
        title: "Best next step",
        copy: "If a puppy here feels like a fit, apply and mention the puppy name so we can follow up clearly."
      }
    : waitlistMatchingPuppies.length
      ? {
          title: "Best next step",
          copy: `${waitlistFirstUpdateCopy()} Apply if you want to join the ${waitlistName} waitlist.`
        }
      : isFullyReservedLitter
        ? {
            title: "Best next step",
            copy: `This litter is fully reserved. Matched families receive go-home details directly, and new families should apply for the ${waitlistName} waitlist or ask about future timing.`
          }
      : {
          title: "Best next step",
          copy: "Use this page to follow the litter photos and details. Apply when you want help with a future pairing or breed waitlist."
        };
  const goHomeNote = isFullyReservedLitter
    ? {
        eyebrow: "Reserved Litter",
        title: "Go-home week is handled directly",
        copy: "Matched families receive exact pickup timing, final payment confirmation, records, and ride-home reminders directly before go-home day.",
        items: [
          "Watch for direct pickup timing and final balance notes.",
          "Health records and transition notes are shared before pickup.",
          "Apply for a future litter if you are not already matched with this one."
        ]
      }
    : {
        eyebrow: "Go-Home Ready",
        title: "Approved families receive full go-home guidance",
        copy: "Pickup timing, final records, ride-home tips, and puppy prep details are shared directly before go-home day.",
        items: []
      };

  return (
    <Layout>
      <PageHero
        eyebrow={litter.status || "Litter"}
        title={litter.name}
        copy={litter.availabilitySummary}
      />
      <section className="litter-detail-shell">
        <article className="litter-pairing-card group-panel">
          {hasParentPairing ? (
            <figure className="pairing-photo-grid large litter-pairing-media" aria-label={`${litter.name} parent pairing`}>
              <div>
                <img src={mama.mainPhoto} alt={`${mama.name} - mama for ${litter.name}`} loading="lazy" />
                <figcaption>{mama.name}</figcaption>
              </div>
              <div>
                <img src={stud.mainPhoto} alt={`${stud.name} - stud for ${litter.name}`} loading="lazy" />
                <figcaption>{stud.name}</figcaption>
              </div>
            </figure>
          ) : fallbackLitterImage ? (
            <img className="litter-feature-photo" src={fallbackLitterImage} alt={`${litter.name} parent pairing`} loading="lazy" />
          ) : (
            <ImagePlaceholder label="Litter pairing photo" tall />
          )}
        </article>
        <aside className="litter-summary-panel group-panel">
          <div className="litter-summary-heading">
            <p className="eyebrow">Litter Snapshot</p>
            <span className="status-badge">{statusLabel}</span>
          </div>
          <h2>{litter.name} at a glance</h2>
          <p>{publicAvailabilityNote || "Approved families are contacted in waitlist order as availability is confirmed."}</p>
          <dl className="details litter-facts">
            <div><dt>Mama</dt><dd>{litter.mama}</dd></div>
            <div><dt>Stud</dt><dd>{litter.stud}</dd></div>
            <div><dt>Birth date</dt><dd>{litter.birthDate}</dd></div>
            <div><dt>Go-home</dt><dd>{litter.goHomeDate}</dd></div>
            <div><dt>Expected size</dt><dd>{litter.expectedSize}</dd></div>
            <div><dt>Price</dt><dd>{litter.priceRange}</dd></div>
          </dl>
          <div className="litter-availability-callout">
            <span>{availabilityCallout.count}</span>
            <p>{availabilityCallout.copy}</p>
          </div>
          <div className="litter-next-step-note">
            <p className="eyebrow">{litterNextStep.title}</p>
            <p>{litterNextStep.copy}</p>
          </div>
          {pastLitterHref && (
            <div className="actions litter-summary-actions">
              <Link href={pastLitterHref} className="button secondary">{pastLitterLabel}</Link>
            </div>
          )}
        </aside>
      </section>
      {hasAboutSection && (
        <section className="content-section litter-about-section">
          <article className="group-panel litter-about-panel">
            <div className="litter-about-copy">
              <p className="eyebrow">About This Litter</p>
              <h2>{litter.aboutTitle || `${litter.name} details`}</h2>
              {visibleAboutParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {extraAboutParagraphs.length > 0 && (
                <details className="litter-more-details">
                  <summary>More about this pairing</summary>
                  {extraAboutParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </details>
              )}
            </div>
            {(litter.geneticMakeup?.length || litter.aboutHighlights?.length) && (
              <aside className="litter-about-aside">
                {litter.geneticMakeup?.length && (
                  <div>
                    <h3>Genetic makeup</h3>
                    <ul className="clean-list">
                      {litter.geneticMakeup.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                )}
                {litter.aboutHighlights?.length && (
                  <div>
                    <h3>What to expect</h3>
                    <ul className="clean-list">
                      {litter.aboutHighlights.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                )}
              </aside>
            )}
          </article>
        </section>
      )}
      <section className="card-list litter-puppy-list">
        <SectionHeader eyebrow={currentWeek || "Puppies"} title="Puppies from this litter" copy="Weekly photos and compact puppy details are updated here as the litter grows." />
        {puppies.length ? puppies.map((puppy) => <PuppyCard puppy={puppy} variant="litter" key={puppy.slug || puppy.name} />) : <p className="small-note">Puppy profiles for this litter will appear here when they are ready to share.</p>}
      </section>
      <section className="tile-grid three litter-parent-grid">
        <SectionHeader eyebrow="Parents" title={`${litter.mama} + ${litter.stud}`} copy="Meet the parent dogs behind this pairing." />
        {parents.map((parent) => <ParentCard parent={parent} key={parent.slug} />)}
      </section>
      <section className="content-section litter-gallery-section">
        <SectionHeader eyebrow="Updates" title="Weekly photo gallery" copy="Follow this litter as the puppies grow, with new photos added along the way." />
        <LitterGalleryStatus hasGallery={gallery.length > 0} puppyCount={puppies.length} />
        {gallery.length > 0 && <ImageGallery images={gallery} label={`${litter.name} weekly update`} />}
      </section>
      {isCurrentLitter(litter) && (
        <section className="content-section narrow litter-go-home-note-section">
          <article className={`note-panel litter-go-home-note${isFullyReservedLitter ? " reserved-litter-go-home-note" : ""}`}>
            <CheckCircle2 size={24} />
            <div>
              <p className="eyebrow">{goHomeNote.eyebrow}</p>
              <h2>{goHomeNote.title}</h2>
              <p>{goHomeNote.copy}</p>
              {goHomeNote.items.length > 0 && (
                <ul className="check-list compact-check-list">
                  {goHomeNote.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
            </div>
          </article>
        </section>
      )}
      <CTASection title={litterCta.title} copy={litterCta.copy} primaryLabel={litterCta.primaryLabel} secondaryHref="/contact" secondaryLabel="Ask a Question" />
    </Layout>
  );
}

function ParentDetailPage({ parent }) {
  const relatedLitters = publicLitterProfiles.filter((litter) => parent.relatedLitters.includes(litter.slug));
  const breed = breedProfiles.find((item) => item.slug === parent.breedSlug);
  const roleLabel = parent.role === "stud" ? "Stud" : "Mama";
  const familyRole = parent.role === "stud" ? "stud" : "mama";
  const gallery = parent.photos?.length ? parent.photos : parent.mainPhoto ? [parent.mainPhoto] : [];

  return (
    <Layout>
      <PageHero
        eyebrow={`${roleLabel} Profile`}
        title={parent.name}
        copy={parent.description}
        image={parent.mainPhoto || images.doodles}
        className="parent-profile-hero"
      />
      <section className="content-section parent-profile-template">
        <article className="group-panel parent-snapshot-panel">
          <p className="eyebrow">Quick Snapshot</p>
          <h2>{parent.name} at a glance</h2>
          <p>{parent.description}</p>
          <dl className="details facts-wide parent-facts">
            <div><dt>Role</dt><dd>{roleLabel}</dd></div>
            <div><dt>Breed</dt><dd>{parent.breed}</dd></div>
            <div><dt>Weight</dt><dd>{parent.weight}</dd></div>
            <div><dt>Color</dt><dd>{parent.color}</dd></div>
            <div><dt>Coat</dt><dd>{parent.coat}</dd></div>
            <div><dt>Status</dt><dd>{parent.status}</dd></div>
          </dl>
        </article>
        <article className="group-panel parent-role-panel">
          <p className="eyebrow">Program Role</p>
          <h2>How {parent.name} fits the program</h2>
          <p>
            {parent.name} is part of the Red Ranch Dogs {breed?.name || parent.breed} program. This profile collects the details families ask about most: size, coat, color, personality notes, health testing, photos, and related litters.
          </p>
          <ul className="clean-list parent-profile-list">
            <li>{parent.name} is one of the {familyRole}s connected to our current and planned puppy program.</li>
            <li>Related litters are listed below when this parent dog has a current or planned pairing.</li>
            <li>Health and genetic testing details are shared when families or breeders need a closer look.</li>
          </ul>
        </article>
      </section>
      <section className="content-section parent-testing-section">
        <SectionHeader eyebrow="Health & Testing" title={`${parent.name}'s records`} copy="Health and genetic records help families understand the care behind each Red Ranch Dogs pairing." />
        <div className="parent-testing-grid">
          <ParentTestingPanel title="Health testing" links={parent.healthTestingLinks} emptyCopy="Ask us for the latest health testing notes for this parent dog." />
          <ParentTestingPanel title="Genetic testing" links={parent.geneticTestingLinks} emptyCopy="Ask us for the latest genetic testing notes for this parent dog." />
        </div>
      </section>
      <section className="content-section parent-gallery-section">
        <SectionHeader eyebrow="Photos" title={`${parent.name} photos`} copy={`A closer look at ${parent.name} from the Red Ranch Dogs program.`} />
        <ImageGallery images={gallery} label={`${parent.name} photo`} />
      </section>
      <section className="card-list parent-related-list">
        <SectionHeader eyebrow="Related Litters" title={`${parent.name}'s related litters`} />
        {relatedLitters.length ? relatedLitters.map((litter) => <LitterCard litter={litter} key={litter.slug} />) : <p className="small-note">Ask us about current or planned pairings connected to this parent dog.</p>}
      </section>
      <CTASection
        title={`Interested in ${parent.name}'s puppies?`}
        copy="Apply now or ask about current and upcoming litter timing, availability, and whether this program is the right fit for your family."
        primaryLabel="Apply for a Puppy"
        secondaryHref="/contact"
        secondaryLabel="Ask a Question"
      />
    </Layout>
  );
}

function PuppiesOverviewPage() {
  const availableNow = puppyData.filter(isAvailablePuppy);
  const nextGoHomeDates = [...new Set(availableNow.map((puppy) => puppy.goHomeDate || puppy.goHome).filter(Boolean))];
  const previewCurrentLitters = currentLitterProfiles.slice(0, 3);

  return (
    <SectionIndexPage
      eyebrow="Puppies"
      title="Puppies"
      copy="Browse current availability, upcoming litters, breed information, and what comes home with each puppy."
      links={primaryNav.find((item) => item.label === "Puppies").links}
    >
      <ListingStatusStrip
        items={[
              { value: availableNow.length, label: `${availableNow.length === 1 ? "puppy" : "puppies"} available now` },
              { value: previewCurrentLitters.length, label: `${previewCurrentLitters.length === 1 ? "current litter" : "current litters"} growing now` },
              { value: nextGoHomeDates[0] || "Waitlist", label: availableNow.length ? "next go-home timing" : "families contacted first" }
        ]}
      />
      <section className="card-list listing-content-section">
        <SectionHeader
          eyebrow="Current Availability"
          title={availableNow.length ? "Available puppies" : "No puppies available right now"}
          copy={availableNow.length ? "Only puppies truly open for an approved family appear here." : "Most picks happen through our breed-specific waitlists first. When a puppy opens for a new family, it will appear on the Available Puppies page."}
        />
        {availableNow.length ? (
          availableNow.slice(0, 2).map((puppy) => <PuppyCard puppy={puppy} variant="available" key={puppy.slug || puppy.name} />)
        ) : (
          <article className="note-panel puppy-overview-note">
            <h2>Want priority when a puppy opens?</h2>
            <p>Join the waitlist for the breed you are interested in, or follow our current litters to see which puppies are growing now.</p>
            <div className="actions">
              <Link href="/apply" className="button primary">Apply for a Puppy</Link>
              <Link href="/puppies/current-litters" className="button secondary">View Current Litters</Link>
            </div>
          </article>
        )}
      </section>
      <section className="card-list listing-content-section">
        <SectionHeader
          eyebrow="Current Litters"
          title="Litters growing now"
          copy="Current litter cards show parent pairings, go-home timing, weekly puppy photos, and availability notes without crowding the Available Puppies page."
        />
        {previewCurrentLitters.length ? (
          previewCurrentLitters.map((litter) => <LitterCard litter={litter} key={litter.slug || litter.name} />)
        ) : (
          <p className="small-note">Current litters will appear here as soon as they are ready to share.</p>
        )}
      </section>
    </SectionIndexPage>
  );
}

function ParentsDirectoryPage({ role }) {
  const filteredParents = publicParentProfiles.filter((parent) => {
    const roleMatch = role ? parent.role === role : true;
    return roleMatch;
  });
  const title = role === "mama" ? "Mamas" : role === "stud" ? "Studs" : "Parent Dogs";
  const heroCopy = role === "mama"
    ? "Meet the mamas behind the Red Ranch Dogs program, organized by breed, size, coat, photos, and related litters."
    : role === "stud"
      ? "Meet the studs behind the Red Ranch Dogs program, organized by breed, size, coat, photos, and related litters."
      : "Meet the mamas and studs behind the Red Ranch Dogs program, including breed, size, traits, photos, and related litters.";

  return (
    <Layout>
      <PageHero eyebrow="Parents" title={title} copy={heroCopy} />
      <ParentDirectoryNav />
      <section className="tile-grid three parent-directory-grid">
        {filteredParents.length ? filteredParents.map((parent) => <ParentCard parent={parent} key={parent.slug} />) : <p className="small-note">Ask us which parent dogs are connected to current and planned Red Ranch Dogs litters.</p>}
      </section>
    </Layout>
  );
}

function BreedParentDirectoryPage({ breedSlug }) {
  const breed = breedProfiles.find((item) => item.slug === breedSlug);
  const filteredParents = publicParentProfiles.filter((parent) => parent.breedSlug === breedSlug);

  return (
    <Layout>
      <PageHero eyebrow="Parents" title={`${breed?.name || "Breed"} Parents`} copy="Meet the parent dogs in this part of the Red Ranch Dogs program, with profile details, traits, photos, and related litters." />
      <ParentDirectoryNav />
      <section className="tile-grid three parent-directory-grid">
        {filteredParents.length ? filteredParents.map((parent) => <ParentCard parent={parent} key={parent.slug} />) : <p className="small-note">Ask us which parent dogs are connected to this breed program.</p>}
      </section>
    </Layout>
  );
}

function ProcessOverviewPage() {
  const processLinks = primaryNav.find((item) => item.label === "Process").links;

  return (
    <ProcessPageTemplate
      title="How the Red Ranch Dogs process fits together"
      copy="Pricing, applications, waitlist details, FAQs, pickup, and delivery guidance are organized in one clear place."
      stats={processOverviewStats}
    >
      <section className="tile-grid three process-card-grid process-link-grid">
        {processLinks.map((link) => (
          <article className="text-card compact-card" key={link.href}>
            <h2>{link.label}</h2>
            {link.copy && <p>{link.copy}</p>}
            <Link href={link.href} className="inline-link">View page</Link>
          </article>
        ))}
      </section>
    </ProcessPageTemplate>
  );
}

function PickupDeliveryPage() {
  return (
    <ProcessPageTemplate
      title="Puppy Pickup and Delivery"
      copy="Go-home day, local pickup, travel coordination, and delivery options are organized clearly for each litter."
      stats={pickupDeliveryStats}
    >
      <CompactTextCardGrid items={pickupDeliveryCards} />
      <section className="content-section pickup-day-basics-section">
        <SectionHeader eyebrow="Pickup Day" title="Go-home basics" copy="The exact appointment details are confirmed by litter, but families can expect these same practical pickup reminders." />
        <CompactTextCardGrid columns="four" className="go-home-guidance-grid" items={goHomeDayGuidanceCards} />
      </section>
    </ProcessPageTemplate>
  );
}

function GuardianOpportunitiesPage() {
  return (
    <Layout>
      <PageHero eyebrow="Guardian Program" title="Current Guardian Opportunities" copy="Openings are shared when Red Ranch Dogs is looking for the right local guardian family fit." />
      <ListingStatusStrip items={guardianOpportunityStats} className="process-status-strip" />
      <CompactTextCardGrid items={guardianOpportunityCards} />
      <CTASection
        title="Interested in future guardian opportunities?"
        copy="Submit the guardian application now so we can learn about your family and follow up when the right fit opens."
        primaryHref="/guardian-program/application"
        primaryLabel="Guardian Application"
        secondaryHref="/guardian-program/faq"
        secondaryLabel="Guardian FAQ"
      />
    </Layout>
  );
}

function ReproductiveServicesPage() {
  return (
    <Layout>
      <PageHero eyebrow="Stud Services" title="Reproductive Services" copy="Stud service details, timing, paperwork, and communication are organized here for breeder inquiries." />
      <CompactTextCardGrid items={reproductiveServiceCards} className="stud-service-steps" />
      <CTASection
        title="Ready to ask about stud services?"
        copy="Send a short breeder inquiry and we will help with stud fit, timing, records, AI, or service coordination."
        primaryHref="/stud-services#stud-inquiry"
        primaryLabel="Start Stud Inquiry"
        secondaryHref="/stud-services/our-studs"
        secondaryLabel="View Studs"
      />
    </Layout>
  );
}

function GuardianFaqPage() {
  return (
    <Layout>
      <PageHero eyebrow="Guardian Program" title="Guardian Program FAQ" copy="Common questions about guardian families, distance from Salado, timing, communication, and ownership transfer." />
      <section className="faq-list">
        {guardianProgram.faqs.map(([question, answer], index) => (
          <details key={question} open={index === 0}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
    </Layout>
  );
}

function AboutOverviewPage() {
  return (
    <SectionIndexPage
      eyebrow="About"
      title="About Red Ranch Dogs"
      copy="Learn more about the family, team, reviews, and ways to contact Red Ranch Dogs."
      links={primaryNav.find((item) => item.label === "About").links}
    />
  );
}

function AvailablePuppiesPage() {
  const [breedFilter, setBreedFilter] = useState("All");
  const availableNow = puppyData.filter(isAvailablePuppy);
  const breedOptions = ["All", ...new Set(availableNow.map((puppy) => puppy.breed).filter(Boolean))];
  const nextGoHomeDates = [...new Set(availableNow.map((puppy) => puppy.goHomeDate || puppy.goHome).filter(Boolean))];
  const filteredPuppies = availableNow
    .map((puppy, index) => ({ puppy, index }))
    .filter(({ puppy }) => {
      const breedMatch = breedFilter === "All" || puppy.breed === breedFilter;
      return breedMatch;
    })
    .sort((first, second) => first.index - second.index)
    .map(({ puppy }) => puppy);

  return (
    <BuyerPageTemplate
      eyebrow="Puppies"
      title="Available Puppies"
      copy={availableNow.length ? "Meet the puppies currently available from Red Ranch Dogs, then apply or ask about the fit when one catches your eye." : "When a puppy is open beyond the waitlist, it will appear here. Current litters may still be growing and matching families first."}
    >
      {availableNow.length > 0 ? (
        <>
          <ListingStatusStrip
            items={[
              { value: availableNow.length, label: `available ${availableNow.length === 1 ? "puppy" : "puppies"} now` },
              { value: nextGoHomeDates[0] || "Ask", label: "next go-home timing" },
              { value: "First", label: "waitlist families receive priority picking" }
            ]}
          />
          {breedOptions.length > 2 && (
            <section className="content-section puppy-filter-panel compact-panel compact-filter-strip">
              <div className="filter-group" aria-label="Filter puppies by breed">
                {breedOptions.map((breed) => (
                  <button className={breedFilter === breed ? "filter-pill active" : "filter-pill"} type="button" key={breed} onClick={() => setBreedFilter(breed)}>
                    {breed}
                  </button>
                ))}
              </div>
            </section>
          )}
          <section className="card-list available-puppy-list listing-content-section">
            <SectionHeader eyebrow="Current Availability" title="Available now" copy="This page only shows puppies that are truly open for an approved family. Reserved puppies and waitlist-matching litters stay on their litter pages." />
            {filteredPuppies.length ? filteredPuppies.map((puppy) => <PuppyCard puppy={puppy} variant="available" key={puppy.slug || puppy.name} />) : <p className="small-note">No puppies match those filters yet.</p>}
          </section>
          <section className="content-section">
            <SectionHeader eyebrow="Next Steps" title="How families move forward" copy="The process is meant to be clear and personal, not a guessing game." />
            <ProcessStepCards steps={puppyNextSteps} className="buyer-next-step-cards" />
          </section>
          <CTASection title="Ready to ask about a puppy?" copy="Apply now and we will help you understand availability, timing, and whether a current puppy or future litter is the right fit." primaryLabel="Apply for a Puppy" secondaryHref="/puppies/current-litters" secondaryLabel="View Current Litters" />
        </>
      ) : (
        <>
          <ListingStatusStrip
            items={[
              { value: "0", label: "available puppies now" },
              { value: "First", label: "waitlist families pick first" },
              { value: "Here", label: "public openings post here" }
            ]}
          />
          <SmartEmptyState
            eyebrow="Availability Update"
            title="No public puppies open right now"
            copy="Some current litters may still have puppies being matched, but waitlist families get first pick. After that process, any puppy open for a new family will be posted here."
            steps={[
              "Apply for the breed waitlist that fits your family.",
              "Follow current litters for photos, timing, and waitlist-matching notes.",
              "Check this page for public openings after waitlist picks are complete."
            ]}
            primaryLabel="Apply for a Puppy"
            secondaryHref="/puppies/current-litters"
            secondaryLabel="View Current Litters"
          />
        </>
      )}
    </BuyerPageTemplate>
  );
}

function CurrentLittersPage() {
  const currentLitterCount = currentLitterProfiles.length;
  const currentAvailablePuppies = currentLitterProfiles.flatMap((litter) => availablePuppiesForLitter(litter));
  const currentWaitlistMatchingPuppies = currentLitterProfiles.flatMap((litter) => puppiesForLitter(litter).filter(isWaitlistMatchingPuppy));
  const currentAvailableLitter = currentLitterProfiles.find((litter) => availablePuppiesForLitter(litter).length);
  const nextAvailableGoHome = currentAvailableLitter?.goHomeDate || currentAvailableLitter?.goHome || "By litter";
  const nextCurrentGoHome = currentLitterProfiles[0]?.goHomeDate || currentLitterProfiles[0]?.goHome || "By litter";
  const availabilityValue = currentAvailablePuppies.length
    || (currentWaitlistMatchingPuppies.length ? "Waitlist" : "Reserved");
  const availabilityLabel = currentAvailablePuppies.length
    ? "puppies open now"
    : currentWaitlistMatchingPuppies.length
      ? "picks first"
      : "future waitlist best";

  return (
    <BuyerPageTemplate
      eyebrow="Puppies"
      title="Current Litters"
      copy="Current Red Ranch Dogs litters with parent pairings, puppy photos, go-home timing, and availability notes."
    >
      <ListingStatusStrip
        items={[
          { value: currentLitterCount, label: `${currentLitterCount === 1 ? "current litter" : "current litters"} growing now` },
          { value: availabilityValue, label: availabilityLabel },
          { value: currentAvailablePuppies.length ? nextAvailableGoHome : nextCurrentGoHome, label: currentAvailablePuppies.length ? "next available go-home" : "next current go-home" }
        ]}
      />
      {currentLitterProfiles.length ? (
        <>
          <section className="card-list listing-content-section current-litter-list">
            <SectionHeader
              title="Growing now"
              copy="Litters are ordered by go-home timing. Each card opens the full litter page with parent details, puppy photos, compact status notes, and availability."
            />
            {currentLitterProfiles.map((litter) => <LitterCard litter={litter} key={litter.slug || litter.name} />)}
          </section>
          <CTASection
            title="Want help choosing a path?"
            copy="Apply and we will help you understand current litters, waitlist timing, and whether an available puppy or future pairing is the right fit."
            primaryLabel="Apply for a Puppy"
            secondaryHref="/puppies/upcoming-litters"
            secondaryLabel="View Upcoming Litters"
          />
        </>
      ) : (
        <SmartEmptyState
          eyebrow="Current Litter Update"
          title="No current litters posted"
          copy="When puppies are growing now, this page will show parent pairings, weekly photos, go-home timing, and availability notes."
          steps={[
            "View upcoming litters to see planned pairings.",
            "Apply for the breed waitlist that fits your family.",
            "Watch this page for current litter updates."
          ]}
          primaryLabel="Apply for a Puppy"
          secondaryHref="/puppies/upcoming-litters"
          secondaryLabel="View Upcoming Litters"
        />
      )}
    </BuyerPageTemplate>
  );
}

function UpcomingLittersPage() {
  const plannedLitterCount = plannedLitterProfiles.length;
  const nextPlannedTiming = plannedLitterProfiles.find((litter) => litter.expectedTiming || litter.delivery)?.expectedTiming || "To be announced";
  const nextPlannedTimingDisplay = nextPlannedTiming.replace(/^Expected\s+/i, "");
  const groupedPlannedLitters = plannedLitterBreedGroups
    .map((group) => ({
      ...group,
      litters: plannedLitterProfiles.filter((litter) => litter.breedSlug === group.slug)
    }))
    .filter((group) => group.litters.length);
  const ungroupedPlannedLitters = plannedLitterProfiles.filter((litter) => !plannedLitterBreedGroups.some((group) => group.slug === litter.breedSlug));

  return (
    <BuyerPageTemplate
      eyebrow={`Updated ${upcomingLitters.updated}`}
      title="Upcoming Litters"
      copy="Planned and expected pairings from our Goldendoodle, Cavapoo, and Bernedoodle program."
    >
      <ListingStatusStrip
        items={[
          { value: plannedLitterCount, label: `${plannedLitterCount === 1 ? "planned pairing" : "planned pairings"}` },
          { value: nextPlannedTimingDisplay, label: "next expected timing" },
          { value: "Waitlist", label: "families contacted in order" }
        ]}
      />
      {plannedLitterCount > 0 ? (
        <>
          <section className="upcoming-litter-groups listing-content-section">
            <SectionHeader eyebrow="Planned Litters" title="Pairing previews" copy="Pairings are grouped by breed and ordered by expected timing, with availability updated as plans are confirmed." />
            {groupedPlannedLitters.map((group) => (
              <section className="upcoming-litter-group" key={group.slug} aria-labelledby={`${group.slug}-upcoming-heading`}>
                <div className="compact-section-heading">
                  <p className="eyebrow">{group.eyebrow}</p>
                  <h2 id={`${group.slug}-upcoming-heading`}>{group.title}</h2>
                  <p>{group.copy}</p>
                </div>
                <div className="upcoming-litter-card-list">
                  {group.litters.map((litter) => <LitterCard litter={litter} key={litter.slug || litter.name} />)}
                </div>
              </section>
            ))}
            {ungroupedPlannedLitters.length > 0 && (
              <section className="upcoming-litter-group" aria-labelledby="other-upcoming-litters-heading">
                <div className="compact-section-heading">
                  <p className="eyebrow">More Pairings</p>
                  <h2 id="other-upcoming-litters-heading">Additional planned litters</h2>
                  <p>Additional pairings will be updated as program plans are confirmed.</p>
                </div>
                <div className="upcoming-litter-card-list">
                  {ungroupedPlannedLitters.map((litter) => <LitterCard litter={litter} key={litter.slug || litter.name} />)}
                </div>
              </section>
            )}
          </section>
          <CTASection
            title="Want to be contacted when a litter fits?"
            copy="Apply for the breed waitlist and we will help you understand timing, puppy picks, and which pairings may be a good fit."
            primaryLabel="Apply for a Puppy"
            secondaryHref="/puppies/current-litters"
            secondaryLabel="View Current Litters"
          />
        </>
      ) : (
        <SmartEmptyState
          eyebrow="Litter Planning"
          title="No upcoming litters posted"
          copy="When planned pairings are ready to share, this page will show expected timing, parent dogs, size range, coat notes, and availability updates."
          steps={[
            "Apply for the breed waitlist that fits your family.",
            "Watch Current Litters for puppies already growing.",
            "Check back as pairings and timing are confirmed."
          ]}
          primaryLabel="Apply for a Puppy"
          secondaryHref="/puppies/current-litters"
          secondaryLabel="View Current Litters"
        />
      )}
    </BuyerPageTemplate>
  );
}

function PreviousLittersPage() {
  const publicArchives = publicPreviousLitterArchivePaths
    .map((href) => ({ href, ...previousLitterArchiveGroups[href] }))
    .filter((archive) => archive.title);

  return (
    <Layout>
      <PageHero
        eyebrow="Previous Litters"
        title="Past puppy pairings"
        copy="Browse previous Red Ranch Dogs Goldendoodle, Cavapoo, and Bernedoodle litters by breed and pairing. These pages are here to show the parents and the puppies they produced."
        className="previous-litters-hero"
      />
      <section className="previous-litter-breed-groups listing-content-section">
        {publicArchives.map((archive) => {
          const litters = archive.litters
            .map((href) => ({ href, litter: previousLitterDetails[href] }))
            .filter(({ litter }) => Boolean(litter));
          const archiveBreed = archive.title.replace("Previous Litters ", "");
          const pairingBreed = archiveBreed.replace(/s$/, "");

          return (
            <section className="upcoming-litter-group previous-litter-group" key={archive.href} id={`previous-${archiveBreed.toLowerCase()}`}>
              <div className="compact-section-heading">
                <p className="eyebrow">{archiveBreed}</p>
                <h2>{pairingBreed} pairings</h2>
                <p>{archive.copy}</p>
              </div>
              <div className="upcoming-litter-card-list">
                {litters.map(({ href, litter }) => <PreviousLitterCard litter={litter} href={href} key={href} />)}
              </div>
            </section>
          );
        })}
      </section>
      <CTASection
        title="Interested in a similar future litter?"
        copy="If you like a previous pairing, apply for the breed waitlist and we can help you understand current timing, parent dogs, and upcoming options."
        primaryLabel="Apply for a Puppy"
        secondaryHref="/puppies/upcoming-litters"
        secondaryLabel="View Upcoming Litters"
      />
    </Layout>
  );
}

function PreviousLitterArchivePage({ archive }) {
  const litters = archive.litters
    .map((href) => ({ href, litter: previousLitterDetails[href] }))
    .filter(({ litter }) => Boolean(litter));
  const archiveBreed = archive.title.replace("Previous Litters ", "");
  const pairingBreed = archiveBreed.replace(/s$/, "");

  return (
    <Layout>
      <PageHero
        eyebrow="Previous Litters"
        title={`${pairingBreed} pairings`}
        copy={archive.copy}
        className="previous-litters-hero"
      />
      <section className="card-list listing-content-section previous-litter-archive-list">
        <SectionHeader
          eyebrow="Pairings"
          title={`Past ${pairingBreed.toLowerCase()} litters`}
          copy="Each card opens a past litter page with the parent pairing and puppy names from that litter."
        />
        {litters.map(({ href, litter }) => <PreviousLitterCard litter={litter} href={href} key={href} />)}
      </section>
      <CTASection
        title="Want a puppy from a similar pairing?"
        copy="Past litters are a helpful reference, but current and upcoming timing changes by season. Apply and we can help you find the closest fit."
        primaryLabel="Apply for a Puppy"
        secondaryHref="/puppies/upcoming-litters"
        secondaryLabel="View Upcoming Litters"
      />
    </Layout>
  );
}

function PreviousLitterDetailPage({ litter, href }) {
  const currentLitterHref = currentLitterHrefForPastLitter(href);
  const archiveHref = archiveHrefForPreviousLitter(href);
  const puppyPhotos = litter.puppyPhotos || [];
  const hasPuppyPhotos = puppyPhotos.length > 0;

  return (
    <Layout>
      <PageHero eyebrow="Previous Litter" title={litter.name} copy={litter.breed} />
      <section className="previous-litter-detail-shell">
        <article className="previous-litter-feature-card group-panel">
          <PreviousLitterPairingMedia litter={litter} large />
          <div className="previous-litter-feature-caption">
            <span className="status-badge">Past litter</span>
            <strong>{litter.parents}</strong>
          </div>
        </article>
        <article className="group-panel previous-litter-overview-panel">
          <p className="eyebrow">Pairing Reference</p>
          <h2>{litter.name} at a glance</h2>
          <p>
            This past litter shows the parent pairing and puppies from a previous Red Ranch Dogs litter.
            It is meant as a visual reference for families, not a current availability or pricing page.
          </p>
          <dl className="details facts-wide">
            {publicPreviousLitterFacts(litter).map(([label, value]) => (
              <div key={`${label}-${value}`}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
            <div>
              <dt>Pairing</dt>
              <dd>{litter.parents}</dd>
            </div>
          </dl>
        </article>
      </section>
      <section className="content-section previous-puppy-section">
        <SectionHeader
          eyebrow="Puppies"
          title={litter.theme || "Puppies from this litter"}
          copy={
            hasPuppyPhotos
              ? "These photos show the puppies from this previous litter so families can see the look and style this pairing produced."
              : "These names show the puppy theme from this pairing so families can understand the look and style of previous Red Ranch Dogs litters."
          }
        />
        {hasPuppyPhotos ? (
          <div className="previous-puppy-photo-grid">
            {puppyPhotos.map((puppy) => (
              <article className="previous-puppy-photo-card" key={puppy.name}>
                <img src={puppy.image} alt={`${puppy.name} from ${litter.name}`} loading="lazy" />
                <div>
                  <h3>{puppy.name}</h3>
                  {puppy.note && <p>{puppy.note}</p>}
                </div>
              </article>
            ))}
          </div>
        ) : litter.puppies.length > 0 ? (
          <div className="previous-puppy-grid">
            {litter.puppies.map((name) => (
              <article className="previous-puppy-chip" key={name}>
                <h3>{name}</h3>
              </article>
            ))}
          </div>
        ) : (
          <p className="small-note">Individual puppy names are not shown for this past litter.</p>
        )}
      </section>
      <CTASection
        title="Looking for this kind of puppy?"
        copy="Use this past litter as a reference point, then apply or review upcoming litters to see what is currently planned."
        primaryLabel="Apply for a Puppy"
        secondaryHref={currentLitterHref || archiveHref}
        secondaryLabel={currentLitterHref ? "View Current Pairing" : "Back to Previous Litters"}
      />
    </Layout>
  );
}

function LitterDetailPage({ litter }) {
  return (
    <Layout>
      <PageHero eyebrow="Litter Detail" title={litter.name} copy={litter.breed} image={litter.image} />
      <section className="content-section">
        <article className="group-panel">
          <h2>Overview</h2>
          <dl className="details facts-wide">
            {litter.facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p><strong>Parents:</strong> {litter.parents}</p>
          {litter.genetics.length > 0 && (
            <ul className="check-list">
              {litter.genetics.map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
        </article>
      </section>
      <section className="content-section narrow">
        <h2>About This Litter</h2>
        {litter.copy.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </section>
      {litter.puppies.length > 0 && (
        <section className="content-section">
          <h2>{litter.theme || "Puppies"}</h2>
          <div className="tile-grid">
            {litter.puppies.map(([name, sex, collar]) => (
              <article className="text-card" key={name}>
                <h3>{name}</h3>
                <p>{sex}</p>
                <p>{collar}</p>
              </article>
            ))}
          </div>
        </section>
      )}
      {litter.milestones.length > 0 && (
        <section className="content-section narrow">
          <h2>Photo Milestones</h2>
          <ul className="check-list">
            {litter.milestones.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
      )}
    </Layout>
  );
}

function StudDetailPage({ stud }) {
  const facts = [
    ["Breed group", stud.group],
    ["Type", stud.type],
    ["Weight", stud.weight],
    ["Stud fee", stud.fee]
  ];

  return (
    <Layout>
      <PageHero eyebrow="Stud Profile" title={stud.name} copy={stud.type} image={stud.image} className="animal-profile-hero" />
      <section className="content-section stud-profile">
        <article className="group-panel">
          <h2>Profile</h2>
          <dl className="details facts-wide">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p><strong>Genetics:</strong> {stud.genetics}</p>
          <div className="actions">
            <Link href="/stud-services/our-studs" className="button secondary">All Studs</Link>
            <Link href="/stud-services#stud-inquiry" className="button primary">Stud Inquiry</Link>
          </div>
        </article>
        <article className="flyer-panel">
          <img src={stud.image} alt={`${stud.name} stud flyer`} />
        </article>
      </section>
      <section className="tile-grid three">
        <article className="text-card">
          <ShieldCheck size={24} />
          <h2>Health Testing</h2>
          <ul className="check-list">
            {stud.testing.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
        <article className="text-card">
          <Sparkles size={24} />
          <h2>Semen Evals</h2>
          {stud.semenEvals.length > 0 ? (
            <ul className="check-list">
              {stud.semenEvals.map((item) => <li key={item}>{item}</li>)}
            </ul>
          ) : (
            <p>Semen evaluation details are shared with approved breeder inquiries when available.</p>
          )}
        </article>
        <article className="text-card">
          <Heart size={24} />
          <h2>Notes</h2>
          {stud.notes.length > 0 ? (
            <ul className="check-list">
              {stud.notes.map((item) => <li key={item}>{item}</li>)}
            </ul>
          ) : (
            <p>Additional litter history, gallery notes, and breeder details are shared as records are updated.</p>
          )}
        </article>
      </section>
    </Layout>
  );
}

function PricingPage() {
  return (
    <ProcessPageTemplate
      eyebrow="Pricing"
      title="Puppy Prices & Deposits"
      copy="Clear pricing helps families understand what affects cost, what is included, and when payments are due."
      stats={pricingStats}
      cta={{
        title: "Ready to talk through pricing and availability?",
        copy: "Apply now and we will help you understand current puppies, upcoming litters, and the right fit for your family.",
        primaryLabel: "Apply for a Puppy",
        secondaryHref: "/puppies/current-litters",
        secondaryLabel: "View Current Litters"
      }}
    >
      <PricingSection items={pricingProfiles.length ? pricingProfiles : priceGroups} />
      <CompactTextCardGrid
        columns="four"
        className="pricing-factor-grid"
        items={pricingFactors.map(([title, copy]) => ({ title, copy, icon: Sparkles }))}
      />
      <ChecklistCardGrid
        columns="one"
        className="pricing-included-grid"
        items={[{
          title: "What is included with each puppy?",
          copy: "Every puppy goes home with the essentials families need for a clear transition.",
          items: includedWithPuppy,
          icon: ShieldCheck
        }]}
      />
      <CompactTextCardGrid
        className="pricing-timing-grid"
        items={pricingTimingCards.map(([title, copy]) => ({
          title,
          copy: title === "Final Payment" ? `${copy} Zelle recipient: Red Ranch Dogs, ${brand.paymentEmail}.` : copy,
          icon: title === "Deposit" ? CheckCircle2 : MessageCircle
        }))}
      />
    </ProcessPageTemplate>
  );
}

function FaqPage() {
  return (
    <ProcessPageTemplate
      eyebrow="FAQ"
      title="Puppy FAQ"
      copy="Clear answers about the waitlist, puppy selection, pricing, pickup, coat traits, health, and transition home."
      stats={faqStats}
      cta={{
        title: "Still have questions?",
        copy: "Send an application or contact us and we will help you understand the next best step.",
        primaryLabel: "Apply for a Puppy",
        secondaryHref: "/contact",
        secondaryLabel: "Contact Us"
      }}
    >
      <FAQSection items={faqProfiles.length ? faqProfiles : faqs} grouped />
    </ProcessPageTemplate>
  );
}

function ContactPage() {
  return (
    <Layout>
      <PageHero
        eyebrow="Contact"
        title="Contact Us"
        copy="Questions are always welcome. Call, text, email, or send a quick message and we will point you toward the right next step."
        image={contactPuppyImage}
        className="contact-page-hero"
      />
      <section className="contact-grid contact-page-grid">
        <article className="text-card contact-method-card">
          <Phone size={24} />
          <h2>Call or text</h2>
          <p>{brand.phone}</p>
          <div className="contact-method-actions">
            <a className="button primary small" href={brand.sms}>Text Us</a>
            <a className="button secondary small" href={`tel:+1${brand.phone.replace(/\D/g, "")}`}>Call</a>
          </div>
        </article>
        <article className="text-card contact-method-card">
          <Mail size={24} />
          <h2>Email</h2>
          <p>{brand.email}</p>
          <a className="button small" href={`mailto:${brand.email}`}>Email</a>
        </article>
        <LeadForm formType="contact" title="Send a Message" compact />
      </section>
    </Layout>
  );
}

function PrivacyPage() {
  const privacySections = [
    {
      title: "What we collect",
      copy: "When you submit a puppy application, guardian application, stud inquiry, puppy alert signup, or contact form, we collect the details you choose to share, such as your name, email, phone number, location, household notes, puppy preferences, timing, and questions."
    },
    {
      title: "How we use it",
      copy: "We use this information to respond to your inquiry, understand fit and timing, manage puppy waitlist conversations, coordinate guardian or stud-service requests, and keep our internal lead workflow organized."
    },
    {
      title: "Where it goes",
      copy: "Website form submissions may be sent to Red Ranch Dogs email notifications and stored in internal Google Sheets used by the Red Ranch Dogs team for follow-up and recordkeeping."
    },
    {
      title: "What we do not do",
      copy: "We do not sell personal information. We do not publish private application details, phone numbers, email addresses, or internal waitlist notes on the public website."
    }
  ];

  return (
    <Layout>
      <PageHero
        eyebrow="Privacy"
        title="Privacy Policy"
        copy="This page explains how Red Ranch Dogs handles information submitted through our website forms and everyday communication."
        className="compact-page-hero"
      />
      <section className="content-section narrow privacy-intro-panel">
        <p>Last updated: May 16, 2026</p>
        <p>
          Red Ranch Dogs is a family-run puppy program in Salado, Texas. We collect only the information needed to respond thoughtfully,
          manage our puppy and program workflows, and keep communication clear with families and approved breeder inquiries.
        </p>
      </section>
      <section className="tile-grid two privacy-policy-grid">
        {privacySections.map((section) => (
          <article className="text-card compact-card" key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.copy}</p>
          </article>
        ))}
      </section>
      <section className="content-section narrow privacy-detail-panel">
        <h2>Website analytics</h2>
        <p>
          We use Vercel Web Analytics to understand general website traffic, such as page visits and device trends. This helps us see what
          families are using most and improve the site over time.
        </p>
        <h2>Updates or deletion requests</h2>
        <p>
          If you want to update information you submitted, ask a question about this policy, or request that we remove your information from
          our active follow-up workflow, contact us at <a href={`mailto:${brand.email}`}>{brand.email}</a>.
        </p>
      </section>
      <CTASection
        title="Questions about your information?"
        copy="Send us a note and we will help update, correct, or clarify the information connected to your inquiry."
        primaryHref="/contact"
        primaryLabel="Contact Red Ranch Dogs"
        secondaryHref="/apply"
        secondaryLabel="Puppy Application"
      />
    </Layout>
  );
}

function TeamPage() {
  const cards = teamProfiles.length ? teamProfiles : teamMembers;

  return (
    <Layout>
      <PageHero
        title="Meet the Team"
        copy="Meet the people helping keep puppy care, parent dog care, communication, and weekly updates moving at Red Ranch Dogs."
        className="team-page-hero"
      />
      <section className="tile-grid three team-card-grid">
        {cards.map((member) => (
          <article className="text-card person-card team-profile-card" key={member.name}>
            <img src={member.photo || member.image} alt={member.name} />
            <span>{member.role || "Red Ranch Dogs team"}</span>
            <h2>{member.name}</h2>
            {member.bio && <p>{member.bio}</p>}
          </article>
        ))}
      </section>
      <section className="content-section team-details-section">
        <article className="team-details-card">
          <p className="eyebrow">Daily care</p>
          <h2>Care is in the daily details</h2>
          <p>From cleaning and feeding to monitoring weights, enrichment, potty training, bathing, grooming, and family communication, the team handles the daily work that helps each puppy thrive.</p>
        </article>
      </section>
    </Layout>
  );
}

function FamilyPage() {
  return (
    <Layout>
      <PageHero
        eyebrow="Our Story"
        title="Callie & Adam"
        copy="Our family, our mentors, and our love of dogs shaped Red Ranch Dogs into a responsible breeding program focused on health, temperament, and a smooth transition into family life."
        className="family-page-hero"
      />
      <section className="content-section family-story-photo-section">
        <figure className="family-story-photo-card">
          <img src={aboutStoryImage} alt="Callie and Adam with their family at Red Ranch Dogs" />
        </figure>
      </section>
      <section className="content-section family-story-section">
        <article className="story-panel">
          <div>
            <p className="eyebrow">Red Ranch Dogs</p>
            <h2>A family-run program in Salado, Texas</h2>
            {familyStory.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <div className="story-actions">
            <Link href="/puppies/current-litters" className="button primary">View Current Litters</Link>
            <Link href="/apply" className="button secondary">Join Our Waitlist</Link>
          </div>
        </article>
      </section>
    </Layout>
  );
}

function ReviewsPage() {
  const reviewItems = reviews.map((review) => ({ ...review, name: review.name || "Red Ranch family" }));

  return (
    <Layout>
      <PageHero
        eyebrow="Google Reviews"
        title="Kind Words from Puppy Families"
        copy="Families often mention the communication, care, and confidence they felt throughout the Red Ranch Dogs process."
        image="/images/home/red-ranch-dogs-mobile-testimony-banner.jpg"
        className="reviews-page-hero"
      />
      <ListingStatusStrip items={reviewHeroStats} className="reviews-status-strip" />
      <section className="content-section reviews-intro-panel">
        <article className="group-panel">
          <p className="eyebrow">Five-star feedback</p>
          <h2>Trusted by puppy families</h2>
          <p>We are grateful to be nearing 100 five-star Google reviews from puppy families who trusted Red Ranch Dogs with one of the sweetest decisions they will make.</p>
          <div className="actions">
            <a className="button primary" href={brand.googleReviews} target="_blank" rel="noreferrer">Read Google Reviews</a>
            <Link className="button secondary" href="/apply">Apply for a Puppy</Link>
          </div>
        </article>
      </section>
      <section className="feature-grid review-theme-grid" aria-label="Common review themes">
        {reviewThemes.map(({ title, copy, icon: Icon }) => (
          <article className="feature-card review-theme-card" key={title}>
            <Icon size={22} aria-hidden="true" />
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>
      <TestimonialSection items={reviewItems} />
      <CTASection
        title="Ready to talk through your puppy fit?"
        copy="Start with the application and we will help you understand timing, availability, and the best next step."
        primaryHref="/apply"
        primaryLabel="Apply for a Puppy"
        secondaryHref="/puppies/current-litters"
        secondaryLabel="Current Litters"
      />
    </Layout>
  );
}

function WhatsIncludedPage() {
  return (
    <Layout>
      <PageHero eyebrow="Puppy Care" title="What Comes With Your Puppy?" copy="Every puppy is prepared for home with health care, early socialization, confidence-building, and transition support." />
      <ChecklistCardGrid items={puppyIncludedSections} />
      <CTASection
        title="Ready to understand the full puppy process?"
        copy="Start with the application or browse current litters when you are comparing timing, breed fit, and availability."
        primaryHref="/apply"
        primaryLabel="Apply for a Puppy"
        secondaryHref="/process/faq"
        secondaryLabel="Puppy FAQ"
      />
    </Layout>
  );
}

function ParentsPage({ type = "all" }) {
  const cards = type === "studs" ? parentDogs.studs : type === "dams" ? parentDogs.dams : [...parentDogs.dams, ...parentDogs.studs];
  return (
    <Layout>
      <PageHero eyebrow="Parents" title={type === "studs" ? "Studs" : type === "dams" ? "Dams" : "Parent Dogs"} copy="Meet the parent dogs behind the program, including health testing, photos, traits, and litter history." />
      <section className="tile-grid">
        {cards.map((dog) => (
          <article className="text-card parent-card" key={dog.name}>
            <img src={dog.image} alt={dog.name} />
            <h2>{dog.name}</h2>
            <p>{dog.type}</p>
            <Link href={dog.href} className="inline-link">View profile</Link>
          </article>
        ))}
      </section>
    </Layout>
  );
}

function DamGroupPage({ group }) {
  const profiles = group.profiles.map((href) => damDetails[href]).filter(Boolean);

  return (
    <Layout>
      <PageHero eyebrow="Dams" title={group.name} copy={group.copy} image={group.image} />
      <section className="tile-grid">
        {profiles.map((profile) => (
          <article className="text-card parent-card" key={profile.href}>
            <img src={profile.image} alt={profile.name} />
            <h2>{profile.name}</h2>
            <p>{profile.type}</p>
            <p>{profile.weight}</p>
            <Link href={profile.href} className="inline-link">View profile</Link>
          </article>
        ))}
      </section>
    </Layout>
  );
}

function DamDetailPage({ dam }) {
  const facts = [
    ["Breed group", dam.group],
    ["Type", dam.type],
    ["Weight", dam.weight]
  ];

  return (
    <Layout>
      <PageHero eyebrow="Dam Profile" title={dam.name} copy={dam.type} image={dam.image} className="animal-profile-hero" />
      <section className="content-section stud-profile">
        <article className="group-panel">
          <h2>Profile</h2>
          <dl className="details facts-wide">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          {dam.genetics && <p><strong>Genetics:</strong> {dam.genetics}</p>}
          <p>{dam.copy}</p>
          <div className="actions">
            <Link href="/parents/mamas" className="button secondary">All Dams</Link>
            <Link href={Object.keys(damGroups).find((href) => damGroups[href].name === dam.group) || "/dams"} className="button secondary">Breed Group</Link>
          </div>
        </article>
        <article className="flyer-panel">
          <img src={dam.image} alt={dam.name} />
        </article>
      </section>
      <section className="tile-grid three">
        <article className="text-card">
          <ShieldCheck size={24} />
          <h2>Health Testing</h2>
          <ul className="check-list">
            {dam.testing.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
        <article className="text-card">
          <Heart size={24} />
          <h2>Previous Litters</h2>
          {dam.previousLitters.length > 0 ? (
            <ul className="check-list">
              {dam.previousLitters.map((item) => <li key={item}>{item}</li>)}
            </ul>
          ) : (
            <p>Ask us about current or planned pairings connected to this parent dog.</p>
          )}
        </article>
        <article className="text-card">
          <Sparkles size={24} />
          <h2>Photos</h2>
          <p>See more of this parent dog in the profile photos above.</p>
        </article>
      </section>
    </Layout>
  );
}

function ApplicationProcessPage() {
  const steps = [
    ["Apply", "Tell us which breed you are interested in, your size range, gender preference, and timing."],
    ["Join the right list", "A $500 non-refundable deposit secures your place on that breed's waitlist and applies toward your puppy."],
    ["Get updates", "We notify the matching breed waitlist when litters are planned or born and share updates as puppies grow."],
    ["Pick or pass", "You can move forward with a litter or pass and remain on that breed's waitlist for a future opportunity."],
    ["Go home", "Puppies go home at 7-8 weeks old with vet records, vaccines, and starter guidance."]
  ];

  return (
    <ProcessPageTemplate
      eyebrow={brand.location}
      title="Puppy Application Process"
      copy="A clear, fair, and stress-free path from application to go-home day."
      stats={processOverviewStats}
    >
      <section className="content-section process-compact-section">
        <SectionHeader eyebrow="How It Works" title="The path families follow" copy="Families choose the breed they are interested in, then we keep the process clear from waitlist to puppy pick to go-home day." />
        <ProcessStepCards steps={steps} />
      </section>
      <section className="content-section narrow process-note-panel">
        <h2>Ready to apply?</h2>
        <p>Questions are always welcome. Call or text {brand.phone} or email {brand.email}.</p>
        <Link href="/apply" className="button primary">Start Application</Link>
      </section>
    </ProcessPageTemplate>
  );
}

const applicationPathCards = [
  {
    title: "Watching a current litter",
    copy: "Mention the litter or puppy by name. We will reply with the current status, whether that litter is still matching, and what the realistic next step is.",
    icon: PawPrint
  },
  {
    title: "Planning for a future puppy",
    copy: "Share your breed, size, and timing preferences. We will help you understand which waitlist or future pairing makes the most sense.",
    icon: CalendarDays
  },
  {
    title: "Not sure yet",
    copy: "That is completely fine. Use the application to start the conversation and we can help narrow breed fit, size, timing, and next steps.",
    icon: MessageCircle
  }
];

const applicationAfterApplySteps = [
  ["Review", "We read through your family details, breed interest, timing, and any puppy or litter you mentioned."],
  ["Reply", "We follow up with current availability, waitlist guidance, and questions that help us understand fit."],
  ["Decide", "A deposit only comes after the fit and timing make sense, whether that is a current litter or a future waitlist spot."]
];

function ApplicationPage() {
  return (
    <Layout>
      <PageHero eyebrow="Application & Waitlist" title="Puppy Application" copy="Start here even if you are not sure which litter, breed, or timeline is the right fit yet." />
      <ListingStatusStrip
        className="application-status-strip"
        items={[
          { value: "Start", label: "with one application" },
          { value: "Fit", label: "breed, timing, and litter reviewed" },
          { value: "Then", label: "deposit only if the path makes sense" }
        ]}
      />
      <BuyerGuidancePanel
        eyebrow="Before You Apply"
        title="A simple first step"
        copy="The application starts the conversation. It does not lock you into a puppy, litter, or deposit before we talk through fit."
        steps={["Share your breed, size, timing, and any puppy or litter you are watching.", "We follow up with availability, waitlist guidance, and next-step details.", "If timing lines up, we explain the deposit and waitlist path clearly before anyone moves forward."]}
        primaryHref="/process/faq"
        primaryLabel="Read FAQ"
        secondaryHref="/process/waitlist"
        secondaryLabel="View Waitlist"
      />
      <section className="content-section application-path-section">
        <SectionHeader eyebrow="Choose Your Path" title="Use the application for any starting point" copy="The same application can support current litter interest, future waitlist planning, or early breed-fit questions." />
        <CompactTextCardGrid items={applicationPathCards} className="application-path-grid" />
      </section>
      <section className="content-section narrow application-after-apply-section">
        <SectionHeader eyebrow="After You Apply" title="What happens next" copy="Your submission goes into the website lead workflow now, and it is structured so the future CRM can continue from the same information later." />
        <ProcessStepCards steps={applicationAfterApplySteps} className="application-after-apply-cards" />
      </section>
      <section className="form-shell">
        <LeadForm formType="application" title="Application details" />
      </section>
    </Layout>
  );
}

function WaitlistPage() {
  const liveWaitlistData = usePublicWaitlistData(waitlistData);
  const publicWaitlists = groupPublicWaitlistRows(liveWaitlistData.publicRows);
  const lastUpdated = formatWaitlistDate(liveWaitlistData.updatedAt);
  const waitlistStats = waitlistBreedOrder.map((breed) => {
    const list = publicWaitlists.find((item) => item.breed === breed);
    return { value: list?.rows.length || 0, label: `${breed} active spots` };
  });

  return (
    <ProcessPageTemplate
      eyebrow="Current Waitlist"
      title="Public Waitlist"
      copy="A transparent look at current Red Ranch Dogs waitlist positions for Goldendoodles, Cavapoos, and Bernedoodles."
      stats={waitlistStats}
      cta={{
        title: "Ready to join a waitlist?",
        copy: "Apply now and we will help you understand breed fit, current availability, and what the next step looks like.",
        primaryLabel: "Apply for a Puppy",
        secondaryHref: "/puppies/current-litters",
        secondaryLabel: "View Current Litters"
      }}
    >
      <section className="waitlist-board">
        <SectionHeader eyebrow="Current Positions" title="Breed waitlists" copy="Families are contacted in order of deposit placed. When a family chooses a puppy, their public waitlist spot is removed." />
        <div className="waitlist-board-grid">
          {publicWaitlists.map((list) => (
            <article className="text-card waitlist-card public-waitlist-card" key={list.breed}>
              <div className="waitlist-card-header">
                <p className="eyebrow">{list.breed}</p>
                <span>{list.rows.length} spots</span>
              </div>
              <ol>
                {list.rows.map((row) => (
                  <li key={`${list.breed}-${row.position}-${row.display_name}`}>
                    <span>{row.position}</span>
                    <strong>{row.display_name}</strong>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
        {lastUpdated && <p className="waitlist-updated small-note">Last updated {lastUpdated}.</p>}
      </section>
      <section className="tile-grid four priority-grid waitlist-policy-grid process-card-grid process-note-grid">
        {waitlistPolicies.map(([title, copy]) => (
          <article className="text-card icon-card compact-card" key={title}>
            <CheckCircle2 size={24} />
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>
    </ProcessPageTemplate>
  );
}

function JoinWaitlistPage() {
  return (
    <ProcessPageTemplate
      eyebrow="Application & Waitlist"
      title="Application and Waitlist"
      copy="A clear, fair process for moving from application to puppy selection and go-home day."
      stats={processOverviewStats}
    >
      <section className="content-section process-compact-section">
        <SectionHeader eyebrow="Simple Overview" title="Your place on the list" copy="Families are contacted in order of deposit placed. When a litter is announced, you can move forward or pass and remain on your breed waitlist for a future opportunity." />
        <ProcessStepCards steps={waitlistProcessSteps} />
      </section>
      <section className="tile-grid three priority-grid process-card-grid process-note-grid">
        <article className="text-card icon-card compact-card">
          <ShieldCheck size={24} />
          <h2>Deposit</h2>
          <p>The deposit reserves your place and helps us keep communication clear as litters are planned and born.</p>
        </article>
        <article className="text-card icon-card compact-card">
          <CheckCircle2 size={24} />
          <h2>Pick or Pass</h2>
          <p>Families can pass on a litter and remain on their breed waitlist without starting over.</p>
        </article>
        <article className="text-card icon-card compact-card">
          <Heart size={24} />
          <h2>Litter Born</h2>
          <p>When a litter is born, families receive updates and puppy picks happen in waitlist order using photos, videos, personality notes, and video calls.</p>
        </article>
      </section>
      <CTASection
        title="Ready to join a waitlist?"
        copy="Joining a Red Ranch Dogs waitlist starts with the puppy application. We will use it to understand breed fit, timing, current availability, and the best next step for your family."
        primaryHref="/apply"
        primaryLabel="Start Puppy Application"
        secondaryHref="/process/waitlist"
        secondaryLabel="View Current Waitlist"
      />
      <section className="content-section narrow process-faq-preview">
        <SectionHeader eyebrow="FAQ Preview" title="Common questions" copy="These answers keep the process understandable before a family reaches out." />
        <FAQSection items={(faqProfiles.length ? faqProfiles : faqs).filter((item) => Array.isArray(item) || item.category === "Getting on the waitlist" || item.category === "Puppy selection")} />
      </section>
    </ProcessPageTemplate>
  );
}

function StudServicesPage() {
  return (
    <Layout>
      <PageHero eyebrow="Stud Services" title="Health-Tested Stud Services" copy="Health-tested stud options, reproductive education, and breeder inquiry details for approved programs." image={images.studGoldendoodle} />
      <ListingStatusStrip items={studServiceStats} className="process-status-strip" />
      <section className="content-section process-compact-section">
        <SectionHeader
          eyebrow="Breeder Inquiry"
          title="A simple first step for stud service questions"
          copy="If you have a stud in mind, tell us who you are considering. If you are still matching traits, describe what you are hoping for and we can point you toward the best fit."
        />
      </section>
      <CompactTextCardGrid items={studServiceStepCards} className="stud-service-steps" />
      <StudCatalogSection />
      <section className="form-shell stud-inquiry-shell" id="stud-inquiry">
        <LeadForm formType="stud" title="Stud Inquiry" />
      </section>
    </Layout>
  );
}

function ReproEducationPage() {
  return (
    <Layout>
      <PageHero eyebrow="Education" title="Breeding Timing and Progesterone Testing" copy="Educational guidance for breeders who want clearer timing, fewer missed windows, and better conversations around stud availability." />
      <ChecklistCardGrid items={reproductiveSections} className="repro-education-grid" />
      <CTASection
        title="Interested in using one of our studs?"
        copy="Reach out early in the heat cycle. If you have progesterone results, include dates, values, and the machine used."
        primaryHref="/stud-services#stud-inquiry"
        primaryLabel="Start Stud Inquiry"
        secondaryHref="/contact"
        secondaryLabel="Contact Us"
      />
    </Layout>
  );
}

function GuardianProgramPage() {
  return (
    <Layout>
      <PageHero
        eyebrow="Guardian Program"
        title="Guardian Family Program"
        copy="A local partnership for families near Salado who want to love and care for an exceptional Red Ranch dog while supporting our responsible breeding program."
      />
      <section className="tile-grid compact-grid guardian-fit-strip">
        {guardianProgram.fitHighlights.map(([title, copy]) => (
          <article className="text-card compact-card" key={title}>
            <CheckCircle2 size={22} />
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>
      <CompactTextCardGrid items={guardianProgram.benefits} />
      <section className="content-section process-compact-section">
        <SectionHeader
          eyebrow="Guardian Fit"
          title="What's expected of guardian families?"
          copy="A practical snapshot of the home setup, distance, communication, and daily care we look for before a phone conversation."
        />
      </section>
      <CompactTextCardGrid items={guardianProgram.expectations} />
      <section className="content-section">
        <article className="group-panel">
          <p className="eyebrow">How It Starts</p>
          <h2>The Fit Conversation</h2>
          <ProcessStepCards steps={guardianProgram.process} />
        </article>
      </section>
      <section className="faq-list">
        {guardianProgram.faqs.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
      <CTASection
        title="Have more questions?"
        copy={`Reach out at ${brand.email} or ${brand.phone}, or start the guardian application when you are ready.`}
        primaryHref="/guardian-program/application"
        primaryLabel="Guardian Application"
        secondaryHref="/contact"
        secondaryLabel="Contact Us"
      />
    </Layout>
  );
}

function GuardianApplicationPage() {
  return (
    <Layout>
      <PageHero
        eyebrow="Guardian Program"
        title="Guardian Application"
        copy="Start here if you live near Salado and are interested in partnering with Red Ranch Dogs as a guardian family."
        image={guardianApplicationImage}
        className="guardian-application-hero"
      />
      <section className="content-section narrow">
        <article className="group-panel guardian-before-apply">
          <p className="eyebrow">Before You Apply</p>
          <h2>Guardian family fit</h2>
          <p>Guardian families should be close enough to Salado for breeding-related visits, comfortable with clear communication, and ready to keep the dog as a loved indoor family pet.</p>
          <dl className="compact-details">
            <div>
              <dt>Female Guardians</dt>
              <dd>Usually 30-60 minutes from Salado</dd>
            </div>
            <div>
              <dt>Stud Guardians</dt>
              <dd>Salado or very close by</dd>
            </div>
            <div>
              <dt>Home Setup</dt>
              <dd>Secure fenced yard required</dd>
            </div>
            <div>
              <dt>Next Step</dt>
              <dd>30-45 minute phone call</dd>
            </div>
          </dl>
        </article>
      </section>
      <section className="form-shell">
        <LeadForm formType="guardian" title="Guardian Application" guardianFields />
      </section>
    </Layout>
  );
}

function StopMarkingPage() {
  return (
    <Layout>
      <PageHero eyebrow="Marking Reset Guide" title="Stop Indoor Marking" copy="A practical 2 to 4 week reset for preventing indoor marks and rebuilding a strong outside routine." image={images.doodles} />
      <ChecklistCardGrid
        items={stopMarkingGuide.map((section) => ({
          ...section,
          icon: CheckCircle2
        }))}
        className="stop-marking-grid"
      />
      <ChecklistCardGrid
        columns="two"
        className="stop-marking-quick-grid"
        items={[
          {
            title: "Quick Checklist",
            copy: "Keep the reset simple and consistent for the first clean stretch.",
            items: [
              "No free roaming for 10 to 14 days.",
              "Potty breaks every 1 to 2 hours at first.",
              "Reward outdoor pees immediately.",
              "Interrupt leg-lift behavior and go outside.",
              "Use enzymatic cleaner for any accident spots.",
              "Expand to new rooms only after 3 to 5 clean days."
            ]
          }
        ]}
      />
    </Layout>
  );
}

const coatColorTraits = [
  {
    name: "Red Abstract",
    image: "/images/coat-traits/red-abstract-doodle.jpg",
    alt: "Red abstract doodle puppy with white markings",
    copy: "Rich red coloring with white accents like a blaze, chest, boots, or tuxedo markings."
  },
  {
    name: "Chocolate",
    image: "/images/coat-traits/chocolate-doodle.jpg",
    alt: "Chocolate doodle puppy",
    copy: "Chocolate comes from the B locus and is harder to achieve, making it one of the most desirable coat colors."
  },
  {
    name: "Red Chocolate",
    image: "/images/coat-traits/red-chocolate-doodle.jpg",
    alt: "Red chocolate doodle puppy with copper red coat and chocolate pigment",
    copy: "Warm red tones with chocolate pigment and soft cocoa undertones from harder-to-achieve B locus genetics."
  },
  {
    name: "Red Parti",
    image: "/images/coat-traits/parti-doodle.jpg",
    alt: "Red and white parti doodle puppy",
    copy: "A mostly white coat with warm red patches. Parti coloring is eye-catching, joyful, and highly requested."
  },
  {
    name: "Tricolor",
    image: "/images/coat-traits/tricolor-bernedoodle.jpg",
    alt: "Tricolor Bernedoodle puppy",
    copy: "Classic Bernedoodle coloring with dark pigment, tan points, and white markings."
  },
  {
    name: "Tricolor Merle",
    image: "/images/coat-traits/tricolor-merle-bernedoodle.jpg",
    alt: "Tricolor merle Bernedoodle puppy",
    copy: "Striking and high demand when bred responsibly. We do not do unsafe merle-to-merle pairings."
  }
];

const coatTextureTraits = [
  {
    name: "Curly Coat",
    image: "/images/coat-traits/curly-coat-doodle.jpg",
    alt: "Curly coat doodle puppy",
    copy: "Curly coats have the most Poodle-like texture and are commonly associated with lower shedding."
  },
  {
    name: "Wavy Coat",
    image: "/images/coat-traits/wavy-coat-doodle.jpg",
    alt: "Wavy coat doodle puppy",
    copy: "Wavy coats are soft, classic, and one of the most requested doodle coat types."
  },
  {
    name: "Straight Teddy Coat",
    image: "/images/coat-traits/straight-teddy-doodle.jpg",
    alt: "Straight teddy coat doodle puppy",
    copy: "Straight coats create that plush teddy-bear look and are harder to produce while still maintaining minimal shedding."
  }
];

const coatMarkings = [
  { name: "Angel Kiss", image: "/images/coat-traits/angel-kiss-marking.jpg", alt: "Angel kiss white marking on doodle puppy forehead" },
  { name: "Blaze", image: "/images/coat-traits/blaze-marking.jpg", alt: "White blaze marking on doodle puppy face" },
  { name: "Boots", image: "/images/coat-traits/boots-marking.jpg", alt: "White boots markings on doodle puppy paws" },
  { name: "Tuxedo", image: "/images/coat-traits/tuxedo-marking.jpg", alt: "Tuxedo white chest marking on doodle puppy" }
];

function CoatTraitCard({ trait }) {
  return (
    <article className="coat-card">
      <img src={trait.image} alt={trait.alt} loading="lazy" />
      <div>
        <h3>{trait.name}</h3>
        <p>{trait.copy}</p>
      </div>
    </article>
  );
}

function CoatTraitsPage() {
  return (
    <Layout>
      <PageHero eyebrow="Coat Traits" title="Understanding Coat Traits" copy="Beautiful coats are not accidental. Red Ranch Dogs uses genetics, experience, and thoughtful pairings to produce the coat traits families ask about most." />
      <section className="content-section narrow">
        <h2>Our Most Requested Coat Traits</h2>
        <p>Across Goldendoodles, Bernedoodles, and Cavapoos, families often ask for low shedding, soft texture, rich color, and standout markings. Some traits are common, while others take generations of planning and careful pairing.</p>
      </section>
      <section className="content-section">
        <div className="section-heading">
          <p className="eyebrow">Color & Markings</p>
          <h2>Traits Families Notice First</h2>
        </div>
        <div className="coat-grid">
          {coatColorTraits.map((trait) => <CoatTraitCard trait={trait} key={trait.name} />)}
        </div>
      </section>
      <section className="content-section">
        <div className="section-heading">
          <p className="eyebrow">Texture & Shedding</p>
          <h2>How a Coat Feels and Lives at Home</h2>
        </div>
        <div className="coat-grid texture">
          {coatTextureTraits.map((trait) => <CoatTraitCard trait={trait} key={trait.name} />)}
        </div>
        <article className="feature-band coat-feature">
          <img src="/images/coat-traits/tt-low-shed-wavy-doodle.jpg" alt="Low shedding silky soft doodle puppy" loading="lazy" />
          <div>
            <p className="eyebrow">Low Shed Genetics</p>
            <h2>TT Low Shed</h2>
            <p>TT shedding status is highly desirable because it supports low-to-non shedding coats with the soft feel families love. A straight coat does not automatically mean high shedding; coat texture and shedding status are separate pieces of the genetic picture.</p>
          </div>
        </article>
      </section>
      <section className="content-section">
        <div className="section-heading">
          <p className="eyebrow">Details</p>
          <h2>Markings Families Ask About</h2>
        </div>
        <div className="marking-grid">
          {coatMarkings.map((marking) => (
            <article className="marking-card" key={marking.name}>
              <img src={marking.image} alt={marking.alt} loading="lazy" />
              <strong>{marking.name}</strong>
            </article>
          ))}
        </div>
      </section>
      <section className="content-section narrow">
        <article className="text-card">
          <CheckCircle2 size={24} />
          <h2>Why Some Traits Carry More Value</h2>
          <p>Some combinations are harder to achieve. TT shedding status, straight coats with minimal shedding, chocolate, red chocolate, red abstract, red parti, tricolor, and tricolor merle can require generations of planning and careful pairing. When several of these traits come together, demand is naturally higher and those puppies can command a higher price.</p>
        </article>
      </section>
    </Layout>
  );
}

function CategoryPage({ title, copy, links }) {
  return (
    <Layout>
      <PageHero eyebrow="Red Ranch Dogs" title={title} copy={copy} />
      <section className="tile-grid">
        {links.map((link) => (
          <article className="text-card" key={link.href}>
            <h2>{link.label}</h2>
            <Link href={link.href} className="inline-link">View page</Link>
          </article>
        ))}
      </section>
    </Layout>
  );
}

function PuppyAlertSignup() {
  return (
    <section className="footer-alert" aria-labelledby="puppy-alert-title">
      <div>
        <p className="premium-kicker">Puppy Alerts</p>
        <h2 id="puppy-alert-title">Get Red Ranch puppy updates.</h2>
        <p>Be first to know about available puppies, upcoming litters, and Red Ranch Dogs news.</p>
      </div>
      <LeadForm formType="newsletter" title="Puppy Alert Email" compact newsletterOnly />
    </section>
  );
}

function collectFormPayload(formData) {
  const payload = {};

  for (const [key, value] of formData.entries()) {
    const cleanValue = typeof value === "string" ? value.trim() : value;
    if (!cleanValue) continue;
    payload[key] = payload[key] ? `${payload[key]}, ${cleanValue}` : cleanValue;
  }

  return payload;
}

const formSuccessMessages = {
  application: "Thank you. Your puppy application was received, and we will follow up soon.",
  contact: "Thank you. Your message was received, and we will follow up soon.",
  guardian: "Thank you. Your guardian application was received, and we will follow up soon.",
  newsletter: "You are on the Puppy Alerts list. We will keep you posted on litters and availability.",
  stud: "Thank you. Your stud inquiry was received, and we will follow up about timing and next steps.",
  waitlist: "Thank you. Your waitlist note was received, and we will follow up soon."
};

const formSubmitLabels = {
  application: "Submit Application",
  contact: "Send Message",
  guardian: "Submit Guardian Application",
  newsletter: "Submit",
  stud: "Send Stud Inquiry",
  waitlist: "Send Waitlist Note"
};

const formNextStepNotes = {
  application: "After you submit, we will reply with availability, waitlist timing, and the cleanest next step for your family.",
  contact: "Your note will be routed to the right follow-up, whether it is puppy availability, waitlist timing, guardians, or stud services.",
  guardian: "We will review location, home setup, fenced yard, and timing before scheduling a fit conversation.",
  stud: "We will review stud fit, cycle timing, service type, and brucellosis status before coordinating the next step.",
  waitlist: "We will reply with breed-specific waitlist guidance, deposit details, and current litter timing."
};

const requiredFieldsByForm = {
  application: [
    ["name", "full name"],
    ["email", "email"],
    ["phone", "phone"],
    ["preferredBreed", "breed interest"],
    ["processAgreement", "process agreement"],
    ["signature", "electronic signature"]
  ],
  contact: [
    ["name", "name"],
    ["email", "email"],
    ["message", "message"]
  ],
  guardian: [
    ["name", "full name"],
    ["email", "email"],
    ["phone", "phone"],
    ["location", "city or area"],
    ["guardianType", "guardian interest"],
    ["guardianDistance", "distance from Salado"],
    ["housing", "housing"],
    ["fencedYard", "secure fenced yard"],
    ["guardianAgreement", "guardian agreement"]
  ],
  newsletter: [["email", "email"]],
  stud: [
    ["name", "full name"],
    ["email", "email"],
    ["phone", "phone"],
    ["femaleDogName", "female dog name"],
    ["femaleDogBreed", "female dog breed"],
    ["brucellosisStatus", "brucellosis status"],
    ["studGoals", "stud goals"],
    ["studPolicyAgreement", "stud policy agreement"]
  ],
  waitlist: [
    ["name", "name"],
    ["email", "email"],
    ["preferredBreed", "preferred breed"]
  ]
};

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");
}

function validateLeadPayload(formType, payload) {
  const requiredFields = requiredFieldsByForm[formType] || [];
  const missingFields = requiredFields.filter(([key]) => !payload[key]);

  if (missingFields.length) {
    const missingLabels = missingFields.map(([, label]) => label);
    return {
      fieldName: missingFields[0][0],
      message: `Please add ${formatList(missingLabels)} before submitting.`
    };
  }

  if (payload.email && !isValidEmail(payload.email)) {
    return {
      fieldName: "email",
      message: "Please enter a valid email address before submitting."
    };
  }

  return null;
}

function formatList(items) {
  if (items.length <= 1) return items[0] || "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

const trackingParamKeys = {
  utm_source: "utmSource",
  utm_medium: "utmMedium",
  utm_campaign: "utmCampaign",
  utm_content: "utmContent",
  utm_term: "utmTerm"
};

function collectTrackingPayload() {
  if (typeof window === "undefined") return {};

  const search = new window.URLSearchParams(window.location.search);
  let landingPage = window.location.href;

  try {
    landingPage = window.sessionStorage.getItem("rrdLandingPage") || window.location.href;

    if (!window.sessionStorage.getItem("rrdLandingPage")) {
      window.sessionStorage.setItem("rrdLandingPage", window.location.href);
    }
  } catch {
    landingPage = window.location.href;
  }

  const tracking = { landingPage };

  Object.entries(trackingParamKeys).forEach(([queryKey, payloadKey]) => {
    const value = search.get(queryKey);
    if (value) tracking[payloadKey] = value.trim();
  });

  return tracking;
}

const studInquiryOptions = Array.from(
  new Set(Object.values(studDetails).map((stud) => stud.name).filter(Boolean))
);

function ChoiceGroup({ legend, name, options, required = false }) {
  return (
    <fieldset className="choice-group" aria-required={required ? "true" : undefined}>
      <legend>
        {legend}
        {required && <span className="required-mark">Required</span>}
      </legend>
      <div className="option-grid">
        {options.map((option) => (
          <label className="checkbox-line" key={option}>
            <input name={name} type="checkbox" value={option} />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ApplicationFields() {
  return (
    <div className="application-form-sections">
      <div className="application-form-note">
        <p>Before applying, you can review our pricing, waitlist process, and FAQs.</p>
        <div className="application-form-links" aria-label="Helpful application links">
          <Link href="/process/pricing">Pricing</Link>
          <Link href="/process/how-it-works">How it works</Link>
          <Link href="/process/faq">FAQ</Link>
        </div>
      </div>

      <section className="form-section">
        <div className="form-section-heading">
          <p className="eyebrow">Step 1</p>
          <h3>Contact Info</h3>
          <p>Tell us who to follow up with and where your family is located.</p>
        </div>
        <div className="field-grid">
          <label>
            Full name
            <input name="name" required autoComplete="name" />
          </label>
          <label>
            Email
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            Phone
            <input name="phone" required autoComplete="tel" inputMode="tel" />
          </label>
          <label>
            City / state
            <input name="location" autoComplete="address-level2" placeholder="Austin, Texas" />
          </label>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-heading">
          <p className="eyebrow">Step 2</p>
          <h3>Puppy Interest</h3>
          <p>Share what you are hoping for so we can guide you toward the right puppy or waitlist.</p>
        </div>
        <div className="field-grid">
          <ChoiceGroup
            legend="Breed interest"
            name="preferredBreed"
            options={["Goldendoodle", "Cavapoo", "Bernedoodle", "Not sure yet"]}
            required
          />
          <label>
            Gender preference
            <select name="genderPreference" defaultValue="">
              <option value="" disabled>Select one</option>
              <option>Male</option>
              <option>Female</option>
              <option>No preference</option>
            </select>
          </label>
          <ChoiceGroup
            legend="Size preference"
            name="sizePreference"
            options={["Micro mini (10-15 lbs)", "Mini (15-35 lbs)", "Not sure yet"]}
          />
          <label>
            Timing
            <select name="timing" defaultValue="">
              <option value="" disabled>Select one</option>
              <option>Ready now</option>
              <option>Within 1-3 months</option>
              <option>Within 3-6 months</option>
              <option>6+ months from now</option>
              <option>Flexible</option>
            </select>
          </label>
          <label className="full">
            Specific puppy, litter, or parent pairing
            <input name="specificInterest" placeholder="Example: Ranger, Birdie + Waylon, Honey + Bram, or not sure yet" />
          </label>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-heading">
          <p className="eyebrow">Step 3</p>
          <h3>Family Fit</h3>
          <p>A couple of practical details help us understand the kind of puppy that may fit best.</p>
        </div>
        <div className="field-grid">
          <label>
            What best describes your home?
            <select name="homeDescription" defaultValue="">
              <option value="" disabled>Select one</option>
              <option>Family with children</option>
              <option>Adult household</option>
              <option>Single adult</option>
              <option>Couple</option>
              <option>Other</option>
            </select>
          </label>
          <label className="full">
            What are you looking for in a puppy?
            <textarea name="puppyFitNotes" rows="3" placeholder="Personality, energy level, timing, family needs, or anything that would help us guide you." />
          </label>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-heading">
          <p className="eyebrow">Step 4</p>
          <h3>Process Readiness</h3>
          <p>These help make sure expectations are clear before anyone moves forward.</p>
        </div>
        <div className="field-grid">
          <label>
            Pickup or delivery needs
            <select name="pickupOrDelivery" defaultValue="">
              <option value="" disabled>Select one</option>
              <option>We can pick up in Salado, Texas</option>
              <option>We may need delivery help</option>
              <option>Not sure yet</option>
            </select>
          </label>
          <label className="checkbox-line full">
            <input name="processAgreement" type="checkbox" value="Understands process, pricing, deposit policy, and spay/neuter agreement" required />
            <span>I understand the Red Ranch Dogs process, pricing, deposit policy, and spay/neuter agreement.</span>
          </label>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-heading">
          <p className="eyebrow">Step 5</p>
          <h3>Final Notes</h3>
          <p>Add anything else you want us to know before we follow up.</p>
        </div>
        <div className="field-grid">
          <label className="full">
            Anything else you want us to know?
            <textarea name="message" rows="3" placeholder="Questions, personality preferences, timing notes, or anything helpful." />
          </label>
          <label>
            How did you hear about Red Ranch Dogs?
            <select name="hearAbout" defaultValue="">
              <option value="">Optional</option>
              <option>Google search</option>
              <option>Instagram</option>
              <option>Facebook</option>
              <option>Referral / friend</option>
              <option>Previous Red Ranch Dogs family</option>
              <option>Website / online search</option>
              <option>Other</option>
            </select>
          </label>
          <label className="full">
            Electronic signature
            <input name="signature" required placeholder="Type your full name" />
          </label>
        </div>
      </section>
    </div>
  );
}

function ContactFields() {
  return (
    <div className="application-form-sections">
      <section className="form-section">
        <div className="form-section-heading">
          <p className="eyebrow">Contact</p>
          <h3>Send Us a Note</h3>
          <p>Ask about puppy availability, upcoming litters, waitlist timing, or anything else you need help with.</p>
        </div>
        <div className="field-grid">
          <label>
            Name
            <input name="name" required autoComplete="name" />
          </label>
          <label>
            Email
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            Phone
            <input name="phone" autoComplete="tel" inputMode="tel" />
          </label>
          <label>
            Preferred reply
            <select name="preferredContactMethod" defaultValue="">
              <option value="">Optional</option>
              <option>Text</option>
              <option>Call</option>
              <option>Email</option>
              <option>No preference</option>
            </select>
          </label>
          <label>
            What can we help with?
            <select name="inquiryType" defaultValue="">
              <option value="" disabled>Select one</option>
              <option>Available puppy</option>
              <option>Upcoming litter</option>
              <option>Application or waitlist</option>
              <option>Guardian program</option>
              <option>Stud services</option>
              <option>General question</option>
            </select>
          </label>
          <label>
            Preferred breed
            <select name="preferredBreed" defaultValue="">
              <option value="">Optional</option>
              <option>Goldendoodle</option>
              <option>Cavapoo</option>
              <option>Bernedoodle</option>
              <option>Not sure yet</option>
            </select>
          </label>
          <label className="full">
            Message
            <textarea name="message" rows="4" required placeholder="A short note is perfect. Tell us what you are wondering about." />
          </label>
        </div>
      </section>
    </div>
  );
}

function StudInquiryFields() {
  return (
    <div className="application-form-sections">
      <div className="application-form-note">
        <p>Stud inquiries are for breeding programs. A short note is enough to start the conversation.</p>
        <div className="application-form-links" aria-label="Helpful stud service links">
          <Link href="/stud-services/our-studs">View studs</Link>
          <Link href="/stud-services/reproductive-services">Service details</Link>
        </div>
      </div>

      <section className="form-section">
        <div className="form-section-heading">
          <p className="eyebrow">Step 1</p>
          <h3>Breeder Contact</h3>
          <p>Tell us who to follow up with and the best way to coordinate timing.</p>
        </div>
        <div className="field-grid">
          <label>
            Full name
            <input name="name" required autoComplete="name" />
          </label>
          <label>
            Program / kennel name
            <input name="programName" placeholder="Optional" />
          </label>
          <label>
            Email
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            Phone
            <input name="phone" required autoComplete="tel" inputMode="tel" />
          </label>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-heading">
          <p className="eyebrow">Step 2</p>
          <h3>Stud Interest</h3>
          <p>Let us know if you already have a stud in mind or what traits you are hoping to pair for.</p>
        </div>
        <div className="field-grid">
          <label>
            Preferred stud
            <select name="preferredStud" defaultValue="">
              <option value="">Not sure yet</option>
              {studInquiryOptions.map((studName) => <option key={studName}>{studName}</option>)}
            </select>
          </label>
          <label>
            Service type
            <select name="serviceType" defaultValue="">
              <option value="" disabled>Select one</option>
              <option>Artificial insemination at Red Ranch Dogs</option>
              <option>Shipped semen</option>
              <option>Not sure yet</option>
            </select>
          </label>
          <label>
            Cycle timing
            <select name="cycleTiming" defaultValue="">
              <option value="" disabled>Select one</option>
              <option>Planning ahead</option>
              <option>Currently in heat</option>
              <option>Next cycle soon</option>
              <option>Progesterone testing has started</option>
              <option>Not sure yet</option>
            </select>
          </label>
          <label className="full">
            What are you looking for?
            <textarea name="studGoals" rows="3" required placeholder="Stud preference, size, coat, color, structure, temperament, timing, or questions." />
          </label>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-heading">
          <p className="eyebrow">Step 3</p>
          <h3>Your Female</h3>
          <p>Just the basics are enough for the first inquiry. We can request records once timing is closer.</p>
        </div>
        <div className="field-grid">
          <label>
            Female dog name
            <input name="femaleDogName" required placeholder="Dam name" />
          </label>
          <label>
            Female dog breed
            <input name="femaleDogBreed" required placeholder="Goldendoodle, Cavapoo, Bernedoodle..." />
          </label>
          <label className="full">
            Brucellosis status
            <select name="brucellosisStatus" required defaultValue="">
              <option value="" disabled>Select one</option>
              <option>Negative test completed</option>
              <option>Test is scheduled</option>
              <option>Will complete before service</option>
              <option>I have questions about the requirement</option>
            </select>
          </label>
          <label className="checkbox-line full">
            <input name="studPolicyAgreement" type="checkbox" value="Understands negative brucellosis and payment timing requirements" required />
            <span>I understand a current negative brucellosis test is required before service, and payment is due before breeding or shipment.</span>
          </label>
          <label className="full">
            Anything else we should know?
            <textarea name="message" rows="3" placeholder="Progesterone notes, vet clinic details, shipping questions, or anything helpful." />
          </label>
        </div>
      </section>
    </div>
  );
}

function GuardianFields() {
  return (
    <div className="application-form-sections">
      <section className="form-section">
        <div className="form-section-heading">
          <p className="eyebrow">Step 1</p>
          <h3>Contact Info</h3>
          <p>Tell us who to follow up with and where your family is located.</p>
        </div>
        <div className="field-grid">
          <label>
            Full name
            <input name="name" required autoComplete="name" />
          </label>
          <label>
            Email
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            Phone
            <input name="phone" required autoComplete="tel" inputMode="tel" />
          </label>
          <label>
            City / area
            <input name="location" required autoComplete="address-level2" placeholder="Salado, Belton, Georgetown..." />
          </label>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-heading">
          <p className="eyebrow">Step 2</p>
          <h3>Home Fit</h3>
          <p>Guardian families need a stable home setup and clear communication with Red Ranch Dogs.</p>
        </div>
        <div className="field-grid">
          <label>
            Guardian interest
            <select name="guardianType" defaultValue="" required>
              <option value="" disabled>Select one</option>
              <option>Female guardian</option>
              <option>Stud guardian</option>
              <option>Either / not sure yet</option>
            </select>
          </label>
          <label>
            Distance from Salado
            <select name="guardianDistance" defaultValue="" required>
              <option value="" disabled>Select one</option>
              <option>In Salado or very close</option>
              <option>Within 30 minutes</option>
              <option>30-60 minutes away</option>
              <option>More than 1 hour away</option>
            </select>
          </label>
          <label>
            Housing
            <select name="housing" defaultValue="" required>
              <option value="" disabled>Select one</option>
              <option>Own home</option>
              <option>Long-term renter</option>
              <option>Other</option>
            </select>
          </label>
          <label>
            Secure fenced yard
            <select name="fencedYard" defaultValue="" required>
              <option value="" disabled>Select one</option>
              <option>Yes</option>
              <option>No</option>
              <option>Planning to add one</option>
            </select>
          </label>
          <label>
            Children in the home
            <select name="childrenInHome" defaultValue="">
              <option value="">Optional</option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </label>
          <label>
            Other pets
            <select name="otherPets" defaultValue="">
              <option value="">Optional</option>
              <option>No other pets</option>
              <option>Yes - all spayed/neutered</option>
              <option>Yes - one or more intact pets</option>
              <option>Other / needs explanation</option>
            </select>
          </label>
          <label>
            Preferred breed
            <select name="preferredBreed" defaultValue="">
              <option value="">Optional</option>
              <option>Goldendoodle</option>
              <option>Cavapoo</option>
              <option>Bernedoodle</option>
              <option>Not sure yet</option>
            </select>
          </label>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-heading">
          <p className="eyebrow">Step 3</p>
          <h3>Guardian Interest</h3>
          <p>A short note helps us understand whether the program may be a good fit.</p>
        </div>
        <div className="field-grid">
          <label className="full">
            Schedule and dog experience
            <textarea name="dogExperience" rows="3" placeholder="Tell us about your daily schedule, dog experience, and household rhythm." />
          </label>
          <label className="full">
            Why are you interested in the guardian program?
            <textarea name="guardianReason" rows="3" placeholder="What interests you about being a guardian family?" />
          </label>
          <label>
            Best time for a phone call
            <select name="phoneCallTiming" defaultValue="">
              <option value="">Optional</option>
              <option>Weekdays</option>
              <option>Evenings</option>
              <option>Weekends</option>
              <option>Flexible</option>
            </select>
          </label>
          <label className="checkbox-line full">
            <input name="guardianAgreement" type="checkbox" value="Understands guardian requirements and phone conversation before placement" required />
            <span>I understand guardian families need a secure fenced yard, clear communication, local availability for breeding-related visits, and a phone conversation before moving forward.</span>
          </label>
        </div>
      </section>
    </div>
  );
}

function LeadForm({ formType, title, compact = false, newsletterOnly = false, guardianFields = false }) {
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("");
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const applicationFields = formType === "application" && !newsletterOnly;
  const contactFields = formType === "contact" && !newsletterOnly;
  const guardianApplicationFields = formType === "guardian" && guardianFields && !newsletterOnly;
  const studInquiryFields = formType === "stud" && !newsletterOnly;
  const submitLabel = formSubmitLabels[formType] || "Submit";
  const nextStepNote = newsletterOnly ? "" : formNextStepNotes[formType];

  function updateStatus(message, type) {
    setStatus(message);
    setStatusType(type);
  }

  function focusField(formElement, fieldName) {
    if (!fieldName) return;
    const field = formElement.elements[fieldName];
    const target = field?.length ? field[0] : field;
    target?.focus?.();
  }

  function onFormFocusCapture() {
    if (started) return;
    setStarted(true);
    trackSiteEvent("form_start", {
      formType,
      path: compactPath(window.location.pathname)
    });
  }

  async function onSubmit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true);
    updateStatus("", "");
    const form = new FormData(formElement);
    if (form.get("companyWebsite")?.trim()) {
      formElement.reset();
      setBusy(false);
      updateStatus(formSuccessMessages[formType] || "Thank you. We received your submission.", "success");
      return;
    }

    const payload = collectFormPayload(form);
    trackSiteEvent("form_submit_attempt", {
      formType,
      path: compactPath(window.location.pathname)
    });
    const validationError = validateLeadPayload(formType, payload);
    if (validationError) {
      trackSiteEvent("form_validation_error", {
        formType,
        path: compactPath(window.location.pathname)
      });
      focusField(formElement, validationError.fieldName);
      setBusy(false);
      updateStatus(validationError.message, "error");
      return;
    }

    payload.formType = formType;
    payload.formTitle = title;
    payload.page = window.location.pathname;
    payload.currentUrl = window.location.href;
    payload.referrer = document.referrer;
    payload.userAgent = window.navigator.userAgent;
    payload.submittedAt = new Date().toISOString();
    Object.assign(payload, collectTrackingPayload());

    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Submission failed.");
      }
      trackSiteEvent("form_submit_success", {
        formType,
        path: compactPath(window.location.pathname),
        submissionId: result.submissionId || ""
      });
      formElement.reset();
      const serverMessage = result.message || "";
      updateStatus(
        serverMessage && !serverMessage.startsWith("Thank you. We received")
          ? serverMessage
          : formSuccessMessages[formType] || "Thank you. We received your submission.",
        "success"
      );
    } catch (error) {
      trackSiteEvent("form_submit_error", {
        formType,
        path: compactPath(window.location.pathname)
      });
      updateStatus(error.message || "Unable to submit right now. Please call or text us.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className={`lead-form ${compact ? "compact" : ""}`}
      data-form-type={formType}
      aria-busy={busy}
      onFocusCapture={onFormFocusCapture}
      onSubmit={onSubmit}
    >
      <h2>{title}</h2>
      <input type="hidden" name="source" value="red-ranch-dogs-site" />
      <label className="form-honeypot" aria-hidden="true">
        Company website
        <input name="companyWebsite" tabIndex="-1" autoComplete="off" />
      </label>
      {!newsletterOnly && applicationFields && <ApplicationFields />}
      {!newsletterOnly && contactFields && <ContactFields />}
      {!newsletterOnly && studInquiryFields && <StudInquiryFields />}
      {!newsletterOnly && guardianApplicationFields && <GuardianFields />}
      {!newsletterOnly && !applicationFields && !contactFields && !studInquiryFields && !guardianApplicationFields && (
        <div className="field-grid">
          <label>
            Name
            <input name="name" required autoComplete="name" />
          </label>
          <label>
            Email
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            Phone
            <input name="phone" autoComplete="tel" inputMode="tel" />
          </label>
          <label>
            Preferred breed
            <select name="preferredBreed" defaultValue="" required>
              <option value="" disabled>Select one</option>
              <option>Goldendoodle</option>
              <option>Cavapoo</option>
              <option>Bernedoodle</option>
              <option>Not sure yet</option>
            </select>
          </label>
          <label className="full">
            Message
            <textarea name="message" rows="4" placeholder="Tell us about your timing, size preference, and questions." />
          </label>
        </div>
      )}
      {newsletterOnly && (
        <label className="newsletter-email-field">
          <span>Email Address</span>
          <input name="email" type="email" required autoComplete="email" placeholder="Email Address" />
        </label>
      )}
      {nextStepNote && (
        <p className="form-next-step">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>{nextStepNote}</span>
        </p>
      )}
      <button className="button primary" disabled={busy} type="submit">
        {busy ? "Sending..." : submitLabel} <Send size={16} />
      </button>
      {status && (
        <p className={`form-status ${statusType}`} role={statusType === "error" ? "alert" : "status"} aria-live="polite">
          {status}
        </p>
      )}
    </form>
  );
}

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="premium-footer">
      <PuppyAlertSignup />
      <div className="footer-main">
        <div className="footer-brand">
          <img src={brand.logo} alt="Red Ranch Dogs" />
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          <div className="footer-link-row">
            <Link href="/puppies/available">Available Puppies</Link>
            <Link href="/puppies/current-litters">Current Litters</Link>
            <Link href="/puppies/upcoming-litters">Upcoming Litters</Link>
          </div>
          <div className="footer-link-row">
            <Link href="/apply">Apply</Link>
            <Link href="/process/pricing">Pricing</Link>
            <Link href="/process/faq">FAQ</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
          <div className="footer-link-row">
            <a href={brand.sms}>Text Us</a>
            <a href={`mailto:${brand.email}`}>Email</a>
            <a href={brand.instagram} target="_blank" rel="noreferrer">Instagram</a>
            <a href={brand.googleReviews} target="_blank" rel="noreferrer">Google Reviews</a>
          </div>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {year} Red Ranch Dogs.</span>
        <span>Family-run in Salado, Texas.</span>
      </div>
    </footer>
  );
}

function NotFoundPage() {
  const recoveryLinks = [
    { href: "/puppies/current-litters", label: "Current Litters", copy: "See the litters growing now, weekly photos, and availability notes." },
    { href: "/puppies/upcoming-litters", label: "Upcoming Litters", copy: "Preview planned pairings and expected timing for future Red Ranch Dogs litters." },
    { href: "/apply", label: "Apply", copy: "Start the puppy application when you are ready to talk through fit and timing." },
    { href: "/contact", label: "Contact", copy: "Send us a quick note if you are looking for a specific puppy, litter, or parent dog." }
  ];

  return (
    <Layout>
      <PageHero
        eyebrow="Page moved"
        title="Let's get you back on track"
        copy="This page may have moved during the Red Ranch Dogs site update. Use one of these quick paths to get back to puppies, litters, or the application."
        className="compact-page-hero"
      />
      <section className="tile-grid four page-directory-grid not-found-link-grid">
        {recoveryLinks.map((link) => (
          <article className="text-card compact-card" key={link.href}>
            <h2>{link.label}</h2>
            <p>{link.copy}</p>
            <Link href={link.href} className="inline-link">View page</Link>
          </article>
        ))}
      </section>
      <CTASection
        title="Still looking for something?"
        copy="Tell us what you were trying to find and we will point you toward the right puppy, litter, process, or parent dog page."
        primaryHref="/contact"
        primaryLabel="Contact Us"
        secondaryHref="/"
        secondaryLabel="Back to Home"
      />
    </Layout>
  );
}

const categories = {
  "/about": {
    title: "About Red Ranch Dogs",
    copy: "Learn about pricing, FAQs, contact information, our team, our story, and reviews.",
    links: navGroups.find((group) => group.label === "About").links
  },
  "/puppies-1": {
    title: "Puppies",
    copy: "Browse available puppies, current litters, upcoming litters, breed pages, and puppy care information.",
    links: navGroups.find((group) => group.label === "Puppies").links
  },
  "/parents-1": {
    title: "Parents",
    copy: "Meet the mamas and studs behind the Red Ranch Dogs program.",
    links: navGroups.find((group) => group.label === "Parents").links
  },
  "/application-1": {
    title: "Process",
    copy: "Start an application, review the waitlist process, check pricing, or read the FAQ.",
    links: navGroups.find((group) => group.label === "Process").links
  },
  "/studservices": {
    title: "Stud Services",
    copy: "Review stud services and reproductive education resources.",
    links: navGroups.find((group) => group.label === "Stud Services").links
  }
};

export default function App() {
  const [path, setPath] = useState(pathNow());

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    const onTrackedClick = (event) => {
      const anchor = event.target?.closest?.("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";
      const isExternalAction =
        href.startsWith("sms:") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("http");

      if (isExternalAction) {
        trackNavigationIntent(href);
      }
    };

    document.addEventListener("click", onTrackedClick, true);
    return () => document.removeEventListener("click", onTrackedClick, true);
  }, []);

  useEffect(() => {
    const onRoute = () => setPath(pathNow());
    window.addEventListener("popstate", onRoute);
    return () => window.removeEventListener("popstate", onRoute);
  }, []);

  useEffect(() => {
    const destination = clientRedirects[path];
    if (!destination) return;
    window.history.replaceState({}, "", destination);
    setPath(pathNow());
  }, [path]);

  useLayoutEffect(() => {
    if (clientRedirects[path]) return undefined;
    const hash = hashNow();
    scheduleRouteScroll(hash, hash ? "smooth" : "auto");
    const routeScrollTimers = [150, 500].map((delay) =>
      window.setTimeout(() => scrollToRouteTarget(hash, "auto"), delay)
    );
    return () => {
      routeScrollTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [path]);

  useEffect(() => {
    if (clientRedirects[path]) return;
    applySeo(path);
  }, [path]);

  const page = useMemo(() => {
    const routes = {
      "/": <HomePage />,
      "/home-maple": <HomePage />,
      "/puppies": <PuppiesOverviewPage />,
      "/puppies/available": <AvailablePuppiesPage />,
      "/puppies/current-litters": <CurrentLittersPage />,
      "/puppies/upcoming-litters": <UpcomingLittersPage />,
      "/puppies/previous-litters": <PreviousLittersPage />,
      "/puppies/goldendoodle-puppies": <BreedPageTemplate breed={breedProfiles.find((breed) => breed.slug === "goldendoodle-puppies")} />,
      "/puppies/cavapoo-puppies": <BreedPageTemplate breed={breedProfiles.find((breed) => breed.slug === "cavapoo-puppies")} />,
      "/puppies/bernedoodle-puppies": <BreedPageTemplate breed={breedProfiles.find((breed) => breed.slug === "bernedoodle-puppies")} />,
      "/puppies/what-comes-with-your-puppy": <WhatsIncludedPage />,
      "/puppies/coat-traits": <CoatTraitsPage />,
      "/parents": <ParentsDirectoryPage />,
      "/parents/mamas": <ParentsDirectoryPage role="mama" />,
      "/parents/studs": <ParentsDirectoryPage role="stud" />,
      "/parents/goldendoodle-parents": <BreedParentDirectoryPage breedSlug="goldendoodle-puppies" />,
      "/parents/cavapoo-parents": <BreedParentDirectoryPage breedSlug="cavapoo-puppies" />,
      "/parents/bernedoodle-parents": <BreedParentDirectoryPage breedSlug="bernedoodle-puppies" />,
      "/process": <ProcessOverviewPage />,
      "/process/how-it-works": <ApplicationProcessPage />,
      "/process/pricing": <PricingPage />,
      "/process/application-and-waitlist": <JoinWaitlistPage />,
      "/process/waitlist": <WaitlistPage />,
      "/process/faq": <FaqPage />,
      "/process/pickup-and-delivery": <PickupDeliveryPage />,
      "/stud-services": <StudServicesPage />,
      "/stud-services/our-studs": <StudServicesPage />,
      "/stud-services/reproductive-services": <ReproductiveServicesPage />,
      "/stud-services/reproductive-education": <ReproEducationPage />,
      "/stud-services/shipping-and-collection-info": <StudServicesPage />,
      "/guardian-program": <GuardianProgramPage />,
      "/guardian-program/application": <GuardianApplicationPage />,
      "/guardian-program/current-guardian-opportunities": <GuardianOpportunitiesPage />,
      "/guardian-program/faq": <GuardianFaqPage />,
      "/about": <AboutOverviewPage />,
      "/about/our-family": <FamilyPage />,
      "/about/meet-the-team": <TeamPage />,
      "/about/reviews": <ReviewsPage />,
      "/apply": <ApplicationPage />,
      "/prices": <PricingPage />,
      "/faq": <FaqPage />,
      "/contact": <ContactPage />,
      "/privacy": <PrivacyPage />,
      "/contact-1": <ContactPage />,
      "/meet-our-team": <TeamPage />,
      "/our-family": <FamilyPage />,
      "/reviews-1": <ReviewsPage />,
      "/what-come-with-your-puppy": <WhatsIncludedPage />,
      "/available-puppies": <AvailablePuppiesPage />,
      "/current-litters": <CurrentLittersPage />,
      "/upcoming-litters": <UpcomingLittersPage />,
      "/previous-litters": <PreviousLittersPage />,
      "/coat-traits": <CoatTraitsPage />,
      "/dams": <ParentsPage type="dams" />,
      "/evie-nicks": <ParentsPage type="dams" />,
      "/studs": <ParentsPage type="studs" />,
      "/our-studs": <StudServicesPage />,
      "/reproductive-education": <ReproEducationPage />,
      "/guardianprogram": <GuardianProgramPage />,
      "/guardian-application": <GuardianApplicationPage />,
      "/stop-the-marking": <StopMarkingPage />,
      "/join-our-waitlist": <JoinWaitlistPage />,
      "/application-process": <ApplicationProcessPage />,
      "/waitlist": <WaitlistPage />,
      "/puppy-application": <ApplicationPage />
    };

    if (routes[path]) return routes[path];
    const puppy = publicPuppyProfiles.find((item) => `/puppies/${item.slug}` === path);
    if (puppy) return <PuppyDetailPage puppy={puppy} />;
    const litter = publicLitterProfiles.find((item) => `/litters/${item.slug}` === path);
    if (litter) return <LitterPage litter={litter} />;
    const parent = publicParentProfiles.find((item) => `/parents/${item.slug}` === path);
    if (parent) return <ParentDetailPage parent={parent} />;
    if (previousLitterArchiveGroups[path]) return <PreviousLitterArchivePage archive={previousLitterArchiveGroups[path]} />;
    if (previousLitterDetails[path]) return <PreviousLitterDetailPage litter={previousLitterDetails[path]} href={path} />;
    if (litterDetails[path]) return <LitterDetailPage litter={litterDetails[path]} />;
    if (studDetails[path]) return <StudDetailPage stud={studDetails[path]} />;
    if (damGroups[path]) return <DamGroupPage group={damGroups[path]} />;
    if (damDetails[path]) return <DamDetailPage dam={damDetails[path]} />;
    if (categories[path]) return <CategoryPage {...categories[path]} />;
    return <NotFoundPage />;
  }, [path]);

  return page;
}

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
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
  availablePuppies,
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
  previousLitterGroups,
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

function goTo(href) {
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function Link({ href, children, className, onClick, ...props }) {
  const handleClick = (event) => {
    if (href?.startsWith("http") || href?.startsWith("sms:") || href?.startsWith("mailto:")) {
      return;
    }
    event.preventDefault();
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
const defaultSeo = {
  title: "Red Ranch Dogs | Country Raised Doodles",
  description: "Red Ranch Dogs raises Goldendoodle, Cavapoo, Bernedoodle, and Poodle puppies in Salado, Texas."
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
    description: "Browse Red Ranch Dogs stud services, reproductive education, and shipping or collection information."
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
  "/stud-services/shipping-and-collection-info": {
    title: "Shipping and Collection Info | Red Ranch Dogs",
    description: "Review Red Ranch Dogs stud service collection, timing, and shipping information for breeder inquiries."
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
  }
};

const staticSeo = {
  "/": {
    title: "Red Ranch Dogs | Goldendoodle, Cavapoo & Bernedoodle Puppies in Texas",
    description: "Country-raised Goldendoodle, Cavapoo, Bernedoodle, and Poodle puppies from Red Ranch Dogs in Salado, Texas."
  },
  "/prices": {
    title: "Puppy Prices & Deposits | Red Ranch Dogs",
    description: "Review Red Ranch Dogs puppy prices, deposit details, and payment expectations for Goldendoodles, Cavapoos, Bernedoodles, and Poodles."
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
    description: "Start the Red Ranch Dogs waitlist process for Goldendoodle, Cavapoo, Bernedoodle, and Poodle puppies."
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
  if (litterDetails[path]) {
    const litter = litterDetails[path];
    return {
      title: `${litter.name} | ${litter.breed} | Red Ranch Dogs`,
      description: `Details for the ${litter.name} ${litter.breed} litter, including timing, size, coat, color, and puppy milestones.`
    };
  }
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
  return defaultSeo;
}

function upsertMeta(selector, createTag, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement(createTag);
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
}

function applySeo(path) {
  const meta = seoFor(path);
  const canonical = `${siteOrigin}${path === "/" ? "/" : path}`;
  document.title = meta.title;
  upsertMeta('meta[name="description"]', "meta", { name: "description", content: meta.description });
  upsertMeta('link[rel="canonical"]', "link", { rel: "canonical", href: canonical });
  upsertMeta('meta[property="og:title"]', "meta", { property: "og:title", content: meta.title });
  upsertMeta('meta[property="og:description"]', "meta", { property: "og:description", content: meta.description });
  upsertMeta('meta[property="og:url"]', "meta", { property: "og:url", content: canonical });
  upsertMeta('meta[property="og:type"]', "meta", { property: "og:type", content: "website" });
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
      { label: "Goldendoodle Puppies", href: "/puppies/goldendoodle-puppies" },
      { label: "Cavapoo Puppies", href: "/puppies/cavapoo-puppies" },
      { label: "Bernedoodle Puppies", href: "/puppies/bernedoodle-puppies" },
      { label: "What Comes With Your Puppy", href: "/puppies/what-comes-with-your-puppy" },
      { label: "Coat Traits", href: "/puppies/coat-traits" }
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
      { label: "Reproductive Education", href: "/stud-services/reproductive-education" },
      { label: "Shipping and Collection Info", href: "/stud-services/shipping-and-collection-info" }
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
  const [hidden, setHidden] = useState(false);
  const currentPath = pathNow();

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 18);
      setHidden(!open && currentY > 180 && currentY > lastY);
      lastY = currentY;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  useEffect(() => {
    document.body.classList.toggle("menu-locked", open);
    return () => document.body.classList.remove("menu-locked");
  }, [open]);

  const closeMenu = () => setOpen(false);
  const isActive = (item) => currentPath === item.href || (item.href !== "/" && currentPath.startsWith(`${item.href}/`));

  return (
    <header className={`premium-header ${scrolled ? "scrolled" : ""} ${hidden ? "hide-on-mobile" : ""}`}>
      <button
        className={`premium-menu-button ${open ? "open" : ""}`}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Toggle menu"
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
      <div className={`premium-mobile-menu ${open ? "open" : ""}`} aria-hidden={!open} inert={open ? undefined : ""}>
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

function PageHero({ eyebrow, title, copy, image = null, actions, className = "" }) {
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
          <img src={image} alt="" />
        </div>
      )}
    </section>
  );
}

function StatBand() {
  return (
    <section className="stat-band">
      {[
        ["Breeds", "Goldendoodle, Bernedoodle, Cavapoo"],
        ["Deposit", "$500 per waitlist"],
        ["Pick Order", "By deposit date"],
        ["Go-Home", "7-8 weeks old"]
      ].map(([label, value]) => (
        <article key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </article>
      ))}
    </section>
  );
}

function FadeInSection({ as: Element = "section", className = "", children, ...props }) {
  const [visible, setVisible] = useState(false);
  const [node, setNode] = useState(null);

  useEffect(() => {
    if (!node) return undefined;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
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

function PageIntroPanel({ eyebrow, title, copy, className = "" }) {
  return (
    <section className={`content-section narrow intro-panel compact-panel page-intro-panel ${className}`.trim()}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </section>
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

function SectionIntro({ eyebrow, title, copy }) {
  return (
    <div className="premium-section-intro">
      <p className="premium-kicker">{eyebrow}</p>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
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
          <CTAButton href="/puppies/available" variant="primary">View Available Puppies</CTAButton>
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

function PuppyCard({ puppy, variant = "default" }) {
  const breed = puppy.breed || "Breed to be announced";
  const gender = puppy.gender || puppy.sex || "To be announced";
  const status = puppy.status || "Status to be announced";
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
  const cardClasses = ["puppy-card", "animal-card", isLitterVariant ? "litter-puppy-card" : "", isAvailableVariant ? "available-puppy-card" : ""].filter(Boolean).join(" ");
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
          <span className={`status-badge status-${status.toLowerCase().replace(/\W+/g, "-")}`}>{status}</span>
        </div>
        <h2>{puppy.name}</h2>
        <p className="puppy-card-note">{puppy.personalityNote || puppy.description || "Personality notes are updated as puppies grow and we learn more about their temperament."}</p>
        <dl className="details compact-details">
          {puppyFacts.map(([label, value]) => (
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>
        {puppy.availabilityNote && <p className="small-note">{puppy.availabilityNote}</p>}
        {isAvailableVariant ? (
          <div className="puppy-card-actions">
            <Link href="/apply" className="button small">Ask About {puppy.name}</Link>
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

function ProcessStepCards({ steps }) {
  return (
    <div className="process-step-cards">
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

function LitterCard({ litter }) {
  const route = litter.slug ? `/litters/${litter.slug}` : litter.href;
  const delivery = litter.birthDate || litter.delivery || "Timing to be announced";
  const goHome = litter.goHomeDate || litter.goHome || "Go-home timing to be announced";
  const size = litter.expectedSize || litter.size || "Estimate to be announced";
  const price = litter.priceRange || litter.price;
  const image = litter.parentPairingImage || litter.image || litter.weeklyUpdateGallery?.[0];
  const mama = parentProfiles.find((parent) => parent.slug === litter.mamaSlug);
  const stud = parentProfiles.find((parent) => parent.slug === litter.studSlug);
  const hasPairingPhotos = mama?.mainPhoto && stud?.mainPhoto;
  const litterPuppies = puppyData.filter((puppy) => puppy.litterSlug === litter.slug);
  const availableCount = litterPuppies.filter((puppy) => puppy.status === "Available").length;
  const puppyCountLabel = litterPuppies.length
    ? availableCount
      ? `${availableCount} available`
      : `${litterPuppies.length} puppy profile${litterPuppies.length === 1 ? "" : "s"}`
    : "Planning stage";

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
        {litter.availabilityNote && <p className="small-note">{litter.availabilityNote}</p>}
        {route && (
          <div className="litter-card-actions">
            <Link href={route} className="button small">View Litter</Link>
            <Link href="/apply" className="button small secondary">Join Waitlist</Link>
          </div>
        )}
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
    <section className="tile-grid three">
      {items.map((group) => (
        <article className="text-card" key={group.breed || group[0]}>
          <h2>{group.breed || group[0]}</h2>
          {group.summary && <p>{group.summary}</p>}
          <ul className="clean-list">
            {(group.items || group[1]).map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
      ))}
    </section>
  );
}

function TestimonialSection({ items = testimonialProfiles }) {
  return (
    <section className="reviews-row">
      {items.map((review) => (
        <article className="review-card" key={`${review.name}-${review.quote}`}>
          {review.photo && <img src={review.photo} alt={review.name} />}
          <p>&quot;{review.quote}&quot;</p>
          <strong>{review.name}</strong>
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
          <Link href={secondaryHref} className="button secondary">{secondaryLabel}</Link>
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

function BuyerPageTemplate({ eyebrow, title, copy, actions, image, children, cta }) {
  return (
    <Layout>
      <PageHero eyebrow={eyebrow} title={title} copy={copy} image={image} actions={actions} />
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
    parent.weight,
    parent.coat,
    parent.status
  ].filter(Boolean);

  return (
    <article className="text-card parent-card parent-profile-card">
      <figure className="parent-card-media">
        {parent.mainPhoto ? <img src={parent.mainPhoto} alt={parent.name} loading="lazy" /> : <ImagePlaceholder label="Parent dog photo" />}
        <span className="parent-role-badge">{roleLabel}</span>
      </figure>
      <div className="parent-card-body">
        <div className="parent-card-heading">
          <p className="eyebrow">{program?.name || parent.breed}</p>
          <h2>{parent.name}</h2>
          <p>{parent.description}</p>
        </div>
        <div className="parent-card-meta" aria-label={`${parent.name} quick profile details`}>
          {previewFacts.map((fact) => <span key={fact}>{fact}</span>)}
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

function ParentDirectorySummary({ parents, title = "Program snapshot", copy }) {
  const mamaCount = parents.filter((parent) => parent.role === "mama").length;
  const studCount = parents.filter((parent) => parent.role === "stud").length;
  const programCount = new Set(parents.map((parent) => parent.breedSlug)).size;
  const litterCount = new Set(parents.flatMap((parent) => parent.relatedLitters || [])).size;
  const activeCount = parents.filter((parent) => parent.status === "Active").length;
  const photoCount = parents.filter((parent) => parent.mainPhoto).length;
  const roles = new Set(parents.map((parent) => parent.role));
  const roleSpecific = roles.size === 1;
  const roleLabel = parents[0]?.role === "stud" ? "studs" : "mamas";
  const stats = roleSpecific
    ? [
        { value: parents.length, label: roleLabel },
        { value: activeCount, label: "active" },
        { value: programCount, label: "programs" },
        { value: litterCount, label: "related litters" },
        { value: photoCount, label: "with photos" }
      ]
    : [
        { value: parents.length, label: "public profiles" },
        { value: mamaCount, label: "mamas" },
        { value: studCount, label: "studs" },
        { value: programCount, label: "programs" },
        { value: litterCount, label: "related litters" }
      ];

  return (
    <section className="content-section parent-directory-summary">
      <div>
        <p className="eyebrow">Parent Dogs</p>
        <h2>{title}</h2>
        <p>{copy || "Each parent profile is built from structured data so photos, testing links, related litters, and program notes can be updated cleanly over time."}</p>
      </div>
      <dl className="parent-summary-stats">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt>{stat.value}</dt>
            <dd>{stat.label}</dd>
          </div>
        ))}
      </dl>
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

function publicRecords(records = []) {
  return records.filter((record) => record?.visibility !== "private");
}

const publicPuppyProfiles = publicRecords(puppyProfiles);
const publicLitterProfiles = publicRecords(litterProfiles);
const publicParentProfiles = publicRecords(parentProfiles);
const puppyData = publicPuppyProfiles.length ? publicPuppyProfiles : availablePuppies;
const isCurrentLitter = (litter) => String(litter?.status || "").toLowerCase().includes("current");
const currentLitterProfiles = publicLitterProfiles.filter(isCurrentLitter);
const plannedLitterProfiles = publicLitterProfiles.filter((litter) => !isCurrentLitter(litter));

const puppyNextSteps = [
  ["Apply or Ask", "Start with a quick application or ask about a specific puppy so we understand your family, timing, and preferences."],
  ["Talk Through Fit", "We confirm availability, personality notes, size expectations, and whether this puppy or a future litter is the best path."],
  ["Reserve With Deposit", "When everything lines up, a $500 deposit reserves your puppy or your place on the breed waitlist and applies toward the final price."]
];

const waitlistProcessSteps = [
  ["Submit application", "Tell us about your home, timing, breed preference, and what kind of puppy would fit your family."],
  ["Place deposit", "A deposit reserves your place on the waitlist and helps us communicate clearly about timing."],
  ["Join the general waitlist", "Families are organized by deposit date so the process stays fair and easy to follow."],
  ["Receive litter announcements", "When litters are born or planned, waitlist families receive updates in order."],
  ["Pick or pass", "You can move forward with a litter or pass and remain on the general waitlist."],
  ["Choose your puppy", "Puppy picks happen in waitlist order once personalities, coats, and family fit are clearer."],
  ["Prepare for go-home", "We help with timing, supplies, records, and transition details before pickup."]
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
            <Link href={link.href} className="inline-link">Open page</Link>
          </article>
        ))}
      </section>
      {children}
    </Layout>
  );
}

function BreedPageTemplate({ breed }) {
  const puppies = puppyData.filter((puppy) => puppy.breedSlug === breed.slug);
  const availableBreedPuppies = puppies.filter((puppy) => puppy.status === "Available");
  const litters = publicLitterProfiles.filter((litter) => litter.breedSlug === breed.slug);
  const parents = publicParentProfiles.filter((parent) => parent.breedSlug === breed.slug);
  const breedHighlights = [
    ["Best Fit", breed.bestFit || breed.idealFamilyFit, Heart],
    ["Size Expectations", breed.expectedSizeRange, PawPrint],
    ["Temperament", breed.temperament, Sparkles],
    ["Coat and Shedding", `${breed.coatExpectations} ${breed.sheddingAllergyNotes}`, ShieldCheck]
  ];

  return (
    <BuyerPageTemplate
      eyebrow="Breed Program"
      title={breed.heroTitle}
      copy={breed.intro}
      cta={{
        title: `Interested in a ${breed.name}?`,
        copy: "Apply now and we will help you understand current availability, upcoming litters, and the best next step for your family.",
        primaryLabel: "Apply for a Puppy",
        secondaryLabel: "View Available Puppies"
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
      <section className="card-list">
        <SectionHeader eyebrow="Available Puppies" title={`Available ${breed.name} puppies`} copy="Only puppies truly open for an approved family appear here. Reserved puppies stay on their litter pages." />
        {availableBreedPuppies.length ? availableBreedPuppies.map((puppy) => <PuppyCard puppy={puppy} key={puppy.slug || puppy.name} />) : <p className="small-note">We do not have publicly available puppies for this breed right now. Join the waitlist or follow current litters for the newest updates.</p>}
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
  const litter = publicLitterProfiles.find((item) => item.slug === puppy.litterSlug);

  return (
    <Layout>
      <PageHero eyebrow={puppy.breed} title={puppy.name} copy={puppy.description} image={puppy.mainPhoto || images.hero} />
      <section className="content-section stud-profile">
        <article className="group-panel">
          <h2>Puppy Details</h2>
          <dl className="details facts-wide">
            <div><dt>Breed</dt><dd>{puppy.breed}</dd></div>
            <div><dt>Litter</dt><dd>{puppy.litter}</dd></div>
            <div><dt>Gender</dt><dd>{puppy.gender}</dd></div>
            <div><dt>Status</dt><dd>{puppy.status}</dd></div>
            {puppy.birthDate && <div><dt>Birth date</dt><dd>{puppy.birthDate}</dd></div>}
            <div><dt>Estimated adult weight</dt><dd>{puppy.estimatedAdultWeight}</dd></div>
            <div><dt>Go-home date</dt><dd>{puppy.goHomeDate}</dd></div>
            {puppy.price && <div><dt>Price</dt><dd>{puppy.price}</dd></div>}
          </dl>
          <div className="actions">
            <Link href="/apply" className="button primary">Apply</Link>
            {litter && <Link href={`/litters/${litter.slug}`} className="button secondary">View Litter</Link>}
          </div>
        </article>
        <article className="group-panel">
          <h2>Photos</h2>
          <ImageGallery images={puppy.photos} label={`${puppy.name} puppy photo`} />
        </article>
      </section>
    </Layout>
  );
}

function LitterPage({ litter }) {
  const puppies = puppyData.filter((puppy) => puppy.litterSlug === litter.slug);
  const parents = parentProfiles.filter((parent) => parent.slug === litter.mamaSlug || parent.slug === litter.studSlug);
  const mama = parentProfiles.find((parent) => parent.slug === litter.mamaSlug);
  const stud = parentProfiles.find((parent) => parent.slug === litter.studSlug);
  const availablePuppies = puppies.filter((puppy) => puppy.status === "Available");
  const gallery = litter.weeklyUpdateGallery || [];
  const fallbackLitterImage = litter.parentPairingImage || litter.image || gallery[0];
  const hasParentPairing = mama?.mainPhoto && stud?.mainPhoto;
  const hasAboutSection = litter.aboutThisLitter?.length || litter.geneticMakeup?.length || litter.aboutHighlights?.length;
  const aboutParagraphs = litter.aboutThisLitter || [];
  const visibleAboutParagraphs = aboutParagraphs.slice(0, 2);
  const extraAboutParagraphs = aboutParagraphs.slice(2);
  const currentWeek = litter.weeklyUpdateStatus?.match(/Week\s+\d+/i)?.[0];
  const statusLabel = availablePuppies.length
    ? `${availablePuppies.length} available`
    : puppies.length
      ? `${puppies.length} puppy profile${puppies.length === 1 ? "" : "s"}`
      : "Profiles coming soon";

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
          <p>{litter.availabilityNote || "Approved families are contacted in waitlist order as availability is confirmed."}</p>
          <dl className="details litter-facts">
            <div><dt>Mama</dt><dd>{litter.mama}</dd></div>
            <div><dt>Stud</dt><dd>{litter.stud}</dd></div>
            <div><dt>Birth date</dt><dd>{litter.birthDate}</dd></div>
            <div><dt>Go-home</dt><dd>{litter.goHomeDate}</dd></div>
            <div><dt>Expected size</dt><dd>{litter.expectedSize}</dd></div>
            <div><dt>Price</dt><dd>{litter.priceRange}</dd></div>
          </dl>
          <div className="litter-availability-callout">
            <span>{availablePuppies.length || puppies.length || 0}</span>
            <p>{availablePuppies.length ? "available puppies from this litter" : puppies.length ? "puppy profiles listed from this litter" : "puppy profiles will appear here when ready"}</p>
          </div>
          {(currentWeek || litter.photoFolderHint) && (
            <div className="litter-update-note">
              {currentWeek && <strong>{currentWeek}</strong>}
              <span>{litter.weeklyUpdateStatus || "Weekly photos will be added here as this litter grows."}</span>
            </div>
          )}
          <div className="actions">
            <Link href="/apply" className="button primary">Apply for a Puppy</Link>
            <Link href="/contact" className="button secondary">Ask a Question</Link>
          </div>
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
        <SectionHeader eyebrow={currentWeek || "Puppies"} title="Puppies from this litter" copy="Each puppy card uses clean photos, website-rendered names, status labels, and compact details that can be updated weekly." />
        {puppies.length ? puppies.map((puppy) => <PuppyCard puppy={puppy} variant="litter" key={puppy.slug || puppy.name} />) : <p className="small-note">Puppy profiles for this litter will appear here when they are ready to share.</p>}
      </section>
      <section className="tile-grid three litter-parent-grid">
        <SectionHeader eyebrow="Parents" title={`${litter.mama} + ${litter.stud}`} copy="Meet the parent dogs behind this pairing." />
        {parents.map((parent) => <ParentCard parent={parent} key={parent.slug} />)}
      </section>
      <section className="content-section litter-gallery-section">
        <SectionHeader eyebrow="Updates" title="Weekly photo gallery" copy="New puppy photos can be added here as the litter grows." />
        <ImageGallery images={gallery} label={`${litter.name} weekly update`} />
      </section>
      <CTASection title="Interested in this litter?" copy="Apply now or ask about availability, timing, and whether this pairing is the right fit for your family." primaryLabel="Apply for a Puppy" secondaryHref="/contact" secondaryLabel="Ask a Question" />
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
            {parent.name} is part of the Red Ranch Dogs {breed?.name || parent.breed} program. This profile is designed to collect the details families ask about most: size, coat, color, personality notes, health testing, photos, and related litters.
          </p>
          <ul className="clean-list parent-profile-list">
            <li>{parent.name} is listed as a {familyRole} in the structured parent dog data.</li>
            <li>Related litters connect automatically as litter records are added.</li>
            <li>Additional photos and testing links can be added later without changing this page layout.</li>
          </ul>
        </article>
      </section>
      <section className="content-section parent-testing-section">
        <SectionHeader eyebrow="Health & Testing" title={`${parent.name}'s records`} copy="Testing and records are organized here so each parent profile can become more complete as links and documents are added." />
        <div className="parent-testing-grid">
          <ParentTestingPanel title="Health testing" links={parent.healthTestingLinks} emptyCopy="Health testing links will appear here once the final records are attached to this parent profile." />
          <ParentTestingPanel title="Genetic testing" links={parent.geneticTestingLinks} emptyCopy="Genetic testing links will appear here once the final records are attached to this parent profile." />
        </div>
      </section>
      <section className="content-section parent-gallery-section">
        <SectionHeader eyebrow="Photos" title={`${parent.name} photos`} copy="Profile photos can be expanded over time from the Website Hub photo folders." />
        <ImageGallery images={gallery} label={`${parent.name} photo`} />
      </section>
      <section className="card-list parent-related-list">
        <SectionHeader eyebrow="Related Litters" title={`${parent.name}'s related litters`} />
        {relatedLitters.length ? relatedLitters.map((litter) => <LitterCard litter={litter} key={litter.slug} />) : <p className="small-note">Related litter history will appear here as records are organized.</p>}
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
  return (
    <SectionIndexPage
      eyebrow="Puppies"
      title="Puppies"
      copy="Browse current availability, upcoming litters, breed information, and what comes home with each puppy."
      links={primaryNav.find((item) => item.label === "Puppies").links}
    >
      <section className="card-list">
        <SectionHeader eyebrow="Current Availability" title="Puppy preview" />
        {puppyData.slice(0, 3).map((puppy) => <PuppyCard puppy={puppy} key={puppy.slug || puppy.name} />)}
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
  const summaryTitle = role === "mama" ? "Mamas in the program" : role === "stud" ? "Studs in the program" : "Parent dog overview";
  const summaryCopy = role === "mama"
    ? "Browse the mama profiles currently organized in the Red Ranch Dogs program, including size, coat, photos, and related litter history."
    : role === "stud"
      ? "Browse the stud profiles currently organized in the Red Ranch Dogs program, including size, coat, photos, and related litter history."
      : "Browse the parent dogs behind the Red Ranch Dogs program. These cards are designed to grow as parent photos, health records, and litter history are added.";

  return (
    <Layout>
      <PageHero eyebrow="Parents" title={title} copy="Meet the mamas and studs behind the Red Ranch Dogs program, including breed, size, traits, photos, and related litters." />
      <ParentDirectorySummary parents={filteredParents} title={summaryTitle} copy={summaryCopy} />
      <section className="tile-grid three parent-directory-grid">
        {filteredParents.length ? filteredParents.map((parent) => <ParentCard parent={parent} key={parent.slug} />) : <p className="small-note">Parent profiles will appear here as structured records are added.</p>}
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
      <ParentDirectorySummary
        parents={filteredParents}
        title={`${breed?.name || "Breed"} parent snapshot`}
        copy={`These are the parent profiles currently connected to the ${breed?.name || "breed"} program. More photos, records, and litter history can be added from the parent dog sheet over time.`}
      />
      <section className="tile-grid three parent-directory-grid">
        {filteredParents.length ? filteredParents.map((parent) => <ParentCard parent={parent} key={parent.slug} />) : <p className="small-note">Parent profiles will appear here as structured records are added.</p>}
      </section>
    </Layout>
  );
}

function ProcessOverviewPage() {
  return (
    <SectionIndexPage
      eyebrow="Process"
      title="How the Red Ranch Dogs process fits together"
      copy="Pricing, applications, waitlist details, FAQs, pickup, and delivery guidance are organized in one clear place."
      links={primaryNav.find((item) => item.label === "Process").links}
    />
  );
}

function PickupDeliveryPage() {
  return (
    <Layout>
      <PageHero eyebrow="Process" title="Puppy Pickup and Delivery" copy="Go-home day, local pickup, travel coordination, and delivery options will be organized clearly for each litter." />
      <section className="tile-grid three">
        {["Pickup in Central Texas", "Flight nanny coordination", "Go-home preparation"].map((title) => (
          <article className="text-card" key={title}>
            <h2>{title}</h2>
            <p>Details will be confirmed with each family based on puppy timing, travel needs, and go-home preparation.</p>
          </article>
        ))}
      </section>
    </Layout>
  );
}

function GuardianOpportunitiesPage() {
  return (
    <Layout>
      <PageHero eyebrow="Guardian Program" title="Current Guardian Opportunities" copy="Openings are shared when Red Ranch Dogs is looking for the right local guardian family fit." />
      <section className="content-section narrow">
        <h2>No guardian openings right now</h2>
        <p>Check back for future opportunities or submit a guardian application so we can learn more about your family.</p>
        <Link href="/guardian-program/application" className="button primary">Guardian Application</Link>
      </section>
    </Layout>
  );
}

function ReproductiveServicesPage() {
  return (
    <Layout>
      <PageHero eyebrow="Stud Services" title="Reproductive Services" copy="Stud service details, timing, paperwork, and communication are organized here for breeder inquiries." />
      <section className="tile-grid three">
        {["Stud inquiries", "Timing support", "Breeder communication"].map((title) => (
          <article className="text-card" key={title}>
            <Sparkles size={24} />
            <h2>{title}</h2>
            <p>Share your breeding goals, timing, and questions so we can guide you through the next step.</p>
          </article>
        ))}
      </section>
    </Layout>
  );
}

function ShippingCollectionPage() {
  return (
    <Layout>
      <PageHero eyebrow="Stud Services" title="Shipping and Collection Info" copy="Chilled semen shipping, collection timing, and breeder coordination details will be confirmed before each collection." />
      <section className="content-section narrow">
        <h2>Information to collect</h2>
        <p>Collection timing, shipping windows, progesterone testing expectations, and breeder coordination are confirmed directly before each collection.</p>
      </section>
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
  const availableNow = puppyData.filter((puppy) => puppy.status === "Available");
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
      copy="Meet the puppies currently available from Red Ranch Dogs, then apply or ask about the fit when one catches your eye."
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
            <SectionHeader eyebrow="Current Availability" title="Available now" copy="This page only shows puppies that are currently open for an approved family. Reserved puppies live on their litter pages." />
            {filteredPuppies.length ? filteredPuppies.map((puppy) => <PuppyCard puppy={puppy} variant="available" key={puppy.slug || puppy.name} />) : <p className="small-note">No puppies match those filters yet.</p>}
          </section>
          <section className="content-section">
            <SectionHeader eyebrow="Next Steps" title="How families move forward" copy="The process is meant to be clear and personal, not a guessing game." />
            <ProcessStepCards steps={puppyNextSteps} />
          </section>
          <CTASection title="Ready to ask about a puppy?" copy="Apply now and we will help you understand availability, timing, and whether a current puppy or future litter is the right fit." primaryLabel="Apply for a Puppy" secondaryHref="/puppies/current-litters" secondaryLabel="View Current Litters" />
        </>
      ) : (
        <>
          <ListingStatusStrip
            items={[
              { value: "0", label: "available puppies now" },
              { value: "First", label: "waitlist families receive priority picking" },
              { value: "Soon", label: "new updates posted as openings happen" }
            ]}
          />
          <section className="content-section narrow">
            <h2>No available puppies right now</h2>
            <p>We are currently working through breed-specific waitlists, where families with deposits receive priority picking. When a puppy opens publicly, it will appear here first.</p>
            <div className="actions">
              <Link href="/apply" className="button primary">Apply</Link>
              <Link href="/puppies/current-litters" className="button secondary">View Current Litters</Link>
            </div>
          </section>
        </>
      )}
    </BuyerPageTemplate>
  );
}

function CurrentLittersPage() {
  const currentLitterCount = currentLitterProfiles.length;

  return (
    <BuyerPageTemplate
      eyebrow="Puppies"
      title="Current Litters"
      copy="Follow the Red Ranch Dogs litters that are born now, including weekly puppy photos, go-home timing, and availability notes."
      cta={{
        title: "Interested in a current or future litter?",
        copy: "Apply now and we will help you understand availability, waitlist timing, and whether a puppy from a current litter may be the right fit.",
        primaryLabel: "Apply for a Puppy",
        secondaryHref: "/puppies/upcoming-litters",
        secondaryLabel: "View Upcoming Litters"
      }}
    >
      <ListingStatusStrip
        items={[
          { value: currentLitterCount, label: `${currentLitterCount === 1 ? "current litter" : "current litters"} growing now` },
          { value: "Weekly", label: "puppy photos and notes live here" },
          { value: "First", label: "waitlist families pick in order" }
        ]}
      />
      <section className="card-list listing-content-section">
        <SectionHeader eyebrow="Growing Now" title="Current litters" copy="Each litter card leads to parent details, puppy cards, weekly photos, and go-home information." />
        {currentLitterProfiles.length ? (
          currentLitterProfiles.map((litter) => <LitterCard litter={litter} key={litter.slug || litter.name} />)
        ) : (
          <p className="small-note">No current litters are posted right now. View upcoming litters or join the waitlist to hear what is planned next.</p>
        )}
      </section>
    </BuyerPageTemplate>
  );
}

function UpcomingLittersPage() {
  const plannedLitterCount = plannedLitterProfiles.length;

  return (
    <BuyerPageTemplate
      eyebrow={`Updated ${upcomingLitters.updated}`}
      title="Upcoming Litters"
      copy="Planned and expected litters from our Goldendoodle, Cavapoo, and Bernedoodle program."
      cta={{
        title: "Want to be notified about upcoming litters?",
        copy: "Join the waitlist so we can help you understand breed fit, expected timing, and what to expect when litters are announced.",
        primaryLabel: "Join the Waitlist",
        secondaryLabel: "View Available Puppies"
      }}
    >
      <ListingStatusStrip
        items={[
          { value: plannedLitterCount, label: `${plannedLitterCount === 1 ? "planned pairing" : "planned pairings"}` },
          { value: "First", label: "waitlist families are contacted in order" },
          { value: "Updated", label: "timing shifts as plans are confirmed" }
        ]}
      />
      <section className="card-list listing-content-section">
        <SectionHeader eyebrow="Planned Litters" title="Pairing preview" copy="Pairings, timing, and availability are updated as plans are confirmed." />
        {plannedLitterProfiles.map((litter) => <LitterCard litter={litter} key={litter.slug || litter.name} />)}
      </section>
      <section className="content-section legacy-planning-notes">
        <article className="note-panel">
          <h2>Planning notes</h2>
          <p>{upcomingLitters.pairingNote}</p>
          <p>Red Ranch Dogs prioritizes the well-being of each breeding dog. Guardian-family mamas live normal family lives and come to Red Ranch Dogs only during breeding and whelping windows.</p>
        </article>
      </section>
    </BuyerPageTemplate>
  );
}

function PreviousLittersPage() {
  return (
    <Layout>
      <PageHero eyebrow="Archive" title="Previous Litters" copy="A clean archive keeps past pairings easy to find and gives future puppy families a sense of size, color, and coat history." />
      <section className="tile-grid">
        {previousLitterGroups.map((group) => (
          <article className="text-card parent-card" key={group.href}>
            <img src={group.image} alt={group.name} />
            <h2>{group.name}</h2>
            <p>{group.copy}</p>
            <Link href={group.href} className="inline-link">View archive</Link>
          </article>
        ))}
      </section>
    </Layout>
  );
}

function PreviousLitterArchivePage({ archive }) {
  const litters = archive.litters.map((href) => previousLitterDetails[href]).filter(Boolean);

  return (
    <Layout>
      <PageHero eyebrow="Previous Litters" title={archive.title} copy={archive.copy} image={litters[0]?.image || images.doodles} />
      <section className="tile-grid">
        {litters.map((litter) => (
          <article className="text-card parent-card" key={litter.name}>
            <img src={litter.image} alt={litter.name} />
            <h2>{litter.name}</h2>
            <p>{litter.breed}</p>
            <p>{litter.facts.find(([label]) => label === "Born" || label === "Delivery" || label === "Expected")?.[1]}</p>
            <Link href={Object.keys(previousLitterDetails).find((href) => previousLitterDetails[href] === litter)} className="inline-link">View litter</Link>
          </article>
        ))}
      </section>
    </Layout>
  );
}

function PreviousLitterDetailPage({ litter }) {
  return (
    <Layout>
      <PageHero eyebrow="Previous Litter" title={litter.name} copy={litter.breed} image={litter.image} />
      <section className="content-section">
        <article className="group-panel">
          <h2>Overview</h2>
          <dl className="details facts-wide">
            {litter.facts.map(([label, value]) => (
              <div key={`${label}-${value}`}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p><strong>Parents:</strong> {litter.parents}</p>
        </article>
      </section>
      <section className="content-section">
        <h2>{litter.theme}</h2>
        {litter.puppies.length > 0 ? (
          <div className="tile-grid">
            {litter.puppies.map((name) => (
              <article className="text-card" key={name}>
                <h3>{name}</h3>
              </article>
            ))}
          </div>
        ) : (
          <p className="small-note">Individual puppy names are not shown for this archived litter.</p>
        )}
      </section>
      {litter.milestones.length > 0 && (
        <section className="content-section narrow">
          <h2>Photo Milestones</h2>
          <ul className="check-list">
            {litter.milestones.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <p className="small-note">Additional gallery photos may be added over time.</p>
        </section>
      )}
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
      <PageHero eyebrow="Stud Profile" title={stud.name} copy={stud.type} image={stud.image} />
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
            <Link href="/contact" className="button primary">Stud Inquiry</Link>
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
    <BuyerPageTemplate
      eyebrow="Pricing"
      title="Puppy Prices & Deposits"
      copy="Clear pricing helps families understand what affects cost, what is included, and when payments are due."
      actions={<Link href="/apply" className="button primary">Apply for a Puppy</Link>}
      cta={{
        title: "Ready to talk through pricing and availability?",
        copy: "Apply now and we will help you understand current puppies, upcoming litters, and the right fit for your family.",
        primaryLabel: "Apply for a Puppy",
        secondaryLabel: "View Available Puppies"
      }}
    >
      <PageIntroPanel
        eyebrow="Pricing Overview"
        title="How pricing is organized"
        copy="Exact puppy pricing is confirmed before a family reserves a puppy. Current guidance is organized by breed and size so updates can stay clear and consistent."
      />
      <PricingSection items={pricingProfiles.length ? pricingProfiles : priceGroups} />
      <section className="tile-grid four priority-grid">
        {pricingFactors.map(([title, copy]) => (
          <article className="text-card icon-card" key={title}>
            <Sparkles size={24} />
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>
      <section className="content-section">
        <article className="group-panel">
          <h2>What is included with each puppy?</h2>
          <ul className="check-list included-list">
            {includedWithPuppy.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
      </section>
      <section className="content-section narrow">
        <h2>Deposit and final payment</h2>
        <p>A $500 non-refundable deposit is required to join a waitlist or reserve a puppy. Final payment timing is confirmed before pickup so every family knows what is due and when.</p>
        <p><strong>Zelle recipient:</strong> Red Ranch Dogs, {brand.paymentEmail}</p>
      </section>
      <section className="content-section narrow">
        <h2>Transportation note</h2>
        <p>Pickup and transportation details are coordinated by litter and family needs. If flight nanny or delivery options are used, those costs are handled separately from puppy pricing.</p>
      </section>
    </BuyerPageTemplate>
  );
}

function FaqPage() {
  return (
    <BuyerPageTemplate
      eyebrow="FAQ"
      title="Puppy FAQ"
      copy="Clear answers about the waitlist, puppy selection, pricing, pickup, coat traits, health, and transition home."
      actions={<Link href="/apply" className="button primary">Apply for a Puppy</Link>}
      cta={{
        title: "Still have questions?",
        copy: "Send an application or contact us and we will help you understand the next best step.",
        primaryLabel: "Apply for a Puppy",
        secondaryHref: "/contact",
        secondaryLabel: "Contact Us"
      }}
    >
      <FAQSection items={faqProfiles.length ? faqProfiles : faqs} grouped />
    </BuyerPageTemplate>
  );
}

function ContactPage() {
  return (
    <Layout>
      <PageHero eyebrow="Contact" title="Contact Us" copy="Questions are always welcome. Call, text, email, or send a quick message through the form." image={images.cta} />
      <section className="contact-grid contact-page-grid">
        <article className="text-card">
          <Phone size={24} />
          <h2>Call or text</h2>
          <p>{brand.phone}</p>
          <a className="button small" href={`tel:+1${brand.phone.replace(/\D/g, "")}`}>Call</a>
        </article>
        <article className="text-card">
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

function TeamPage() {
  const cards = teamProfiles.length ? teamProfiles : teamMembers;

  return (
    <Layout>
      <PageHero eyebrow="Our Team" title="Meet Our Team" copy="Raising healthy, happy puppies is a team effort built on daily care, monitoring, socialization, cleaning, feeding, grooming, and communication." image={images.family} />
      <section className="tile-grid three">
        {cards.map((member) => (
          <article className="text-card person-card" key={member.name}>
            <img src={member.photo || member.image} alt={member.name} />
            <h2>{member.name}</h2>
            <p>{member.role || "Part of the hands-on Red Ranch Dogs care team."}</p>
            {member.bio && <p>{member.bio}</p>}
          </article>
        ))}
      </section>
      <section className="content-section narrow">
        <h2>A full-time team effort</h2>
        <p>From cleaning and feeding to monitoring weights, providing ENS and ESI, potty training, bathing, and grooming, the team handles the day-to-day work that helps each puppy thrive.</p>
      </section>
    </Layout>
  );
}

function FamilyPage() {
  return (
    <Layout>
      <PageHero eyebrow="Our Story" title="Callie & Adam | Red Ranch Dogs" copy="Our family, our mentors, and our love of dogs shaped Red Ranch Dogs into a responsible breeding program focused on health, temperament, and a smooth transition into family life." image={images.family} />
      <section className="content-section narrow">
        <h2>A lifelong passion for dogs</h2>
        {familyStory.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <div className="actions">
          <Link href="/puppies/available" className="button primary">View Available Puppies</Link>
          <Link href="/apply" className="button secondary">Join Our Waitlist</Link>
        </div>
      </section>
    </Layout>
  );
}

function ReviewsPage() {
  return (
    <Layout>
      <PageHero eyebrow="Reviews" title="Testimonials & Customer Reviews" copy="Read kind words from puppy families about communication, care, and the Red Ranch Dogs process." />
      <TestimonialSection items={testimonialProfiles.length ? testimonialProfiles : reviews.map((review) => ({ ...review, name: review.name || "Red Ranch family" }))} />
    </Layout>
  );
}

function WhatsIncludedPage() {
  return (
    <Layout>
      <PageHero eyebrow="Puppy Care" title="What Comes With Your Puppy?" copy="Every puppy is prepared for home with health care, early socialization, confidence-building, and transition support." />
      <section className="tile-grid">
        {puppyIncludedSections.map(([title, items]) => (
          <article className="text-card" key={title}>
            <h2>{title}</h2>
            <ul className="check-list">{items.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        ))}
      </section>
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
      <PageHero eyebrow="Dam Profile" title={dam.name} copy={dam.type} image={dam.image} />
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
            <p>Previous litter history will appear here as records are organized.</p>
          )}
        </article>
        <article className="text-card">
          <Sparkles size={24} />
          <h2>Gallery Status</h2>
          <p>Additional profile photos may be added over time.</p>
        </article>
      </section>
    </Layout>
  );
}

function ParentCardGrid({ cards }) {
  return (
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
  );
}

function ApplicationProcessPage() {
  const steps = [
    ["Submit Your Application", "Tell us your preferred breed, size range, gender preference, and timeline."],
    ["Join the Waitlist", "A $500 non-refundable deposit secures your place on a waitlist."],
    ["Litter Updates & Selection", "We notify waitlists when litters are born and share photos and videos as puppies grow."],
    ["Final Payment", "Final payment is due one week before pickup. Zelle is preferred."],
    ["Go-Home Day", "Puppies go home at 7-8 weeks old with vet records, vaccines, and starter supplies."]
  ];
  return (
    <Layout>
      <PageHero eyebrow={brand.location} title="Puppy Application Process" copy="A clear, fair, and stress-free path from application to go-home day." />
      <StatBand />
      <section className="timeline">
        {steps.map(([title, copy], index) => (
          <article key={title}>
            <span>{index + 1}</span>
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>
      <section className="content-section narrow">
        <h2>Ready to apply?</h2>
        <p>Questions are always welcome. Call or text {brand.phone} or email {brand.email}.</p>
        <Link href="/apply" className="button primary">Start Application</Link>
      </section>
    </Layout>
  );
}

function ApplicationPage() {
  return (
    <Layout>
      <PageHero eyebrow="Application & Waitlist" title="Puppy Application" copy="Tell us about your family, puppy preferences, timing, and any questions so we can help you understand the best next step." />
      <section className="form-shell">
        <LeadForm formType="application" title="Application details" />
      </section>
    </Layout>
  );
}

function WaitlistPage() {
  const publicWaitlists = groupPublicWaitlistRows(waitlistData.publicRows);
  const lastUpdated = formatWaitlistDate(waitlistData.updatedAt);

  return (
    <BuyerPageTemplate
      eyebrow="Current Waitlist"
      title="Public Waitlist"
      copy="A transparent look at current Red Ranch Dogs waitlist positions for Goldendoodles, Cavapoos, and Bernedoodles."
      actions={(
        <>
          <Link href="/apply" className="button primary">Apply for a Puppy</Link>
          <Link href="/process/application-and-waitlist" className="button secondary">How It Works</Link>
        </>
      )}
      cta={{
        title: "Ready to join a waitlist?",
        copy: "Apply now and we will help you understand breed fit, current availability, and what the next step looks like.",
        primaryLabel: "Apply for a Puppy",
        secondaryHref: "/puppies/available",
        secondaryLabel: "View Available Puppies"
      }}
    >
      <PageIntroPanel
        eyebrow="How to read this list"
        title="One position per deposit."
        copy="This page is meant to help families understand current demand and waitlist order. Names are shown as first name and last initial only."
      />
      <section className="tile-grid four priority-grid waitlist-policy-grid">
        {waitlistPolicies.map(([title, copy]) => (
          <article className="text-card icon-card compact-card" key={title}>
            <CheckCircle2 size={24} />
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>
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
        {lastUpdated && <p className="waitlist-updated small-note">Last updated {lastUpdated} from the Website Hub waitlist data.</p>}
      </section>
      <section className="content-section narrow waitlist-note-panel">
        <article className="group-panel">
          <h2>Waitlist updates</h2>
          <p>This public list mirrors the Waitlist Sheet structure in the Website Hub. Each public row represents one active waitlist spot and can be updated without changing the page template.</p>
          <p className="small-note">The public page should never show emails, phone numbers, deposit dates, application notes, or full last names.</p>
        </article>
      </section>
    </BuyerPageTemplate>
  );
}

function JoinWaitlistPage() {
  return (
    <BuyerPageTemplate
      eyebrow="Application & Waitlist"
      title="Application and Waitlist"
      copy="A clear, fair process for moving from application to puppy selection and go-home day."
      actions={<Link href="/apply" className="button primary">Apply for a Puppy</Link>}
    >
      <PageIntroPanel
        eyebrow="Simple Overview"
        title="Your place on the list"
        copy="Families are contacted in order of deposit placed. When a litter is announced, you can move forward or pass and remain on the general waitlist for a future opportunity."
      />
      <section className="timeline process-timeline">
        {waitlistProcessSteps.map(([title, copy], index) => (
          <article key={title}>
            <span>{index + 1}</span>
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>
      <section className="tile-grid three priority-grid">
        <article className="text-card icon-card">
          <ShieldCheck size={24} />
          <h2>Deposit</h2>
          <p>The deposit reserves your place and helps us keep communication clear as litters are planned and born.</p>
        </article>
        <article className="text-card icon-card">
          <CheckCircle2 size={24} />
          <h2>Pick or Pass</h2>
          <p>Families can pass on a litter and remain on the general waitlist without starting over.</p>
        </article>
        <article className="text-card icon-card">
          <Heart size={24} />
          <h2>Litter Born</h2>
          <p>When a litter is born, families receive updates and puppy picks happen in waitlist order using photos, videos, personality notes, and video calls.</p>
        </article>
      </section>
      <section className="form-shell">
        <LeadForm formType="waitlist" title="Join Our Waitlist" />
      </section>
      <section className="content-section narrow">
        <SectionHeader eyebrow="FAQ Preview" title="Common questions" copy="These answers keep the process understandable before a family reaches out." />
        <FAQSection items={(faqProfiles.length ? faqProfiles : faqs).filter((item) => Array.isArray(item) || item.category === "Getting on the waitlist" || item.category === "Puppy selection")} />
      </section>
    </BuyerPageTemplate>
  );
}

function StudServicesPage() {
  return (
    <Layout>
      <PageHero eyebrow="Stud Services" title="Health-Tested Stud Services" copy="Health-tested stud options, reproductive education, and breeder inquiry details for approved programs." image={images.studGoldendoodle} />
      <section className="content-section">
        {studCatalog.map((group) => (
          <article className="group-panel" key={group.breed}>
            <h2>{group.breed}</h2>
            <div className="mini-grid">
              {group.dogs.map(([name, type, weight, genetics, href]) => (
                <div className="text-card" key={name}>
                  <Sparkles size={22} />
                  <h3>{name}</h3>
                  <p>{type}</p>
                  <p>{weight}</p>
                  <p>{genetics}</p>
                  <Link href={href} className="inline-link">View profile</Link>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
      <ParentCardGrid cards={parentDogs.studs} />
    </Layout>
  );
}

function ReproEducationPage() {
  return (
    <Layout>
      <PageHero eyebrow="Education" title="Breeding Timing and Progesterone Testing" copy="Educational guidance for breeders who want clearer timing, fewer missed windows, and better conversations around stud availability." />
      <section className="tile-grid">
        {reproductiveSections.map(([topic, items]) => (
          <article className="text-card" key={topic}>
            <h2>{topic}</h2>
            <ul className="check-list">{items.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        ))}
      </section>
      <section className="content-section narrow">
        <h2>Interested in using one of our studs?</h2>
        <p>Reach out early in the heat cycle. If you have progesterone results, include dates, values, and the machine used.</p>
        <p><strong>Text:</strong> {brand.phone}</p>
        <p><strong>Email:</strong> studs@redranchdogs.com</p>
        <p className="small-note">Educational information only. For diagnosis or medical decisions, consult your veterinarian.</p>
      </section>
    </Layout>
  );
}

function GuardianProgramPage() {
  return (
    <Layout>
      <PageHero eyebrow="Guardian Program" title="Guardian Family Program" copy="A unique opportunity to care for an exceptional dog while supporting responsible breeding practices." />
      <section className="tile-grid">
        {guardianProgram.benefits.map(([title, copy]) => (
          <article className="text-card" key={title}>
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>
      <section className="content-section">
        <article className="group-panel">
          <h2>What&apos;s Expected of Guardian Families?</h2>
          <div className="mini-grid">
            {guardianProgram.expectations.map(([title, copy]) => (
              <div className="text-card" key={title}>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            ))}
          </div>
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
      <section className="content-section narrow">
        <h2>Have more questions?</h2>
        <p>Reach out at adam@redranchdogs.com or {brand.phone}.</p>
        <Link href="/guardian-program/application" className="button primary">Guardian Application</Link>
      </section>
    </Layout>
  );
}

function GuardianApplicationPage() {
  return (
    <Layout>
      <PageHero eyebrow="Guardian Program" title="Guardian Application" copy="Please fill out an application and we will be in touch." image={images.family} />
      <section className="content-section narrow">
        <h2>Guardian family fit</h2>
        <p>Guardian families should be close enough to Salado for breeding-related visits, comfortable with clear communication, and ready to keep the dog as a loved indoor family pet.</p>
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
      <section className="tile-grid">
        {stopMarkingGuide.map((section) => (
          <article className="text-card" key={section.title}>
            <CheckCircle2 size={24} />
            <h2>{section.title}</h2>
            <p>{section.copy}</p>
            <ul className="check-list">
              {section.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        ))}
      </section>
      <section className="content-section narrow">
        <h2>Quick Checklist</h2>
        <ul className="check-list">
          <li>No free roaming for 10 to 14 days.</li>
          <li>Potty breaks every 1 to 2 hours at first.</li>
          <li>Reward outdoor pees immediately.</li>
          <li>Interrupt leg-lift behavior and go outside.</li>
          <li>Use enzymatic cleaner for any accident spots.</li>
          <li>Expand to new rooms only after 3 to 5 clean days.</li>
        </ul>
      </section>
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
            <Link href={link.href} className="inline-link">Open page</Link>
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
    payload[key] = payload[key] ? `${payload[key]}, ${value}` : value;
  }

  return payload;
}

function ChoiceGroup({ legend, name, options, required = false }) {
  return (
    <fieldset className="choice-group">
      <legend>{legend}</legend>
      <div className="option-grid">
        {options.map((option, index) => (
          <label className="checkbox-line" key={option}>
            <input name={name} type="checkbox" value={option} required={required && index === 0} />
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
            <input name="phone" required autoComplete="tel" />
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
            <textarea name="puppyFitNotes" rows="4" placeholder="Personality, energy level, timing, family needs, or anything that would help us guide you." />
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
            <textarea name="message" rows="4" placeholder="Questions, personality preferences, timing notes, or anything helpful." />
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
            <input name="phone" autoComplete="tel" />
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
            <input name="phone" required autoComplete="tel" />
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
            Housing
            <select name="housing" defaultValue="">
              <option value="" disabled>Select one</option>
              <option>Own home</option>
              <option>Long-term renter</option>
              <option>Other</option>
            </select>
          </label>
          <label>
            Secure fenced yard
            <select name="fencedYard" defaultValue="">
              <option value="" disabled>Select one</option>
              <option>Yes</option>
              <option>No</option>
              <option>Planning to add one</option>
            </select>
          </label>
          <label>
            Other pets
            <input name="otherPets" placeholder="Current pets at home" />
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
            <textarea name="dogExperience" rows="4" placeholder="Tell us about your daily schedule, dog experience, and household rhythm." />
          </label>
          <label className="full">
            Why are you interested in the guardian program?
            <textarea name="guardianReason" rows="4" placeholder="What interests you about being a guardian family?" />
          </label>
          <label className="checkbox-line full">
            <input name="guardianAgreement" type="checkbox" value="Understands guardian families need clear communication and breeding-related availability" required />
            <span>I understand guardian families need to be available for clear communication and breeding-related visits when needed.</span>
          </label>
        </div>
      </section>
    </div>
  );
}

function LeadForm({ formType, title, compact = false, newsletterOnly = false, guardianFields = false }) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const applicationFields = formType === "application" && !newsletterOnly;
  const contactFields = formType === "contact" && !newsletterOnly;
  const guardianApplicationFields = formType === "guardian" && guardianFields && !newsletterOnly;

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    const form = new FormData(event.currentTarget);
    const payload = collectFormPayload(form);
    payload.formType = formType;
    payload.page = window.location.pathname;

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
      event.currentTarget.reset();
      setStatus(result.message || "Thank you. We received your submission.");
    } catch (error) {
      setStatus(error.message || "Unable to submit right now. Please call or text us.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={`lead-form ${compact ? "compact" : ""}`} onSubmit={onSubmit}>
      <h2>{title}</h2>
      <input type="hidden" name="source" value="red-ranch-dogs-site" />
      <label className="form-honeypot" aria-hidden="true">
        Company website
        <input name="companyWebsite" tabIndex="-1" autoComplete="off" />
      </label>
      {!newsletterOnly && applicationFields && <ApplicationFields />}
      {!newsletterOnly && contactFields && <ContactFields />}
      {!newsletterOnly && guardianApplicationFields && <GuardianFields />}
      {!newsletterOnly && !applicationFields && !contactFields && !guardianApplicationFields && (
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
            <input name="phone" autoComplete="tel" />
          </label>
          <label>
            Preferred breed
            <select name="preferredBreed" defaultValue="">
              <option value="" disabled>Select one</option>
              <option>Goldendoodle</option>
              <option>Cavapoo</option>
              <option>Bernedoodle</option>
              <option>Poodle</option>
              <option>Not sure yet</option>
            </select>
          </label>
          <label className="full">
            Message
            <textarea name="message" rows="5" placeholder="Tell us about your timing, size preference, and questions." />
          </label>
        </div>
      )}
      {newsletterOnly && (
        <label className="newsletter-email-field">
          <span>Email Address</span>
          <input name="email" type="email" required autoComplete="email" placeholder="Email Address" />
        </label>
      )}
      <button className="button primary" disabled={busy} type="submit">
        {busy ? "Sending..." : "Submit"} <Send size={16} />
      </button>
      {status && <p className="form-status" role="status" aria-live="polite">{status}</p>}
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
          <p>{brand.tagline}</p>
          <span>{brand.location}</span>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          <Link href="/puppies/available">Available Puppies</Link>
          <Link href="/puppies/current-litters">Current Litters</Link>
          <Link href="/puppies/upcoming-litters">Upcoming Litters</Link>
          <Link href="/apply">Apply</Link>
          <Link href="/process/pricing">Pricing</Link>
          <Link href="/process/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="footer-contact">
          <p className="footer-column-title">Connect</p>
          <a href={brand.sms}>Text Us</a>
          <a href={`mailto:${brand.email}`}>Email</a>
          <a href={brand.instagram} target="_blank" rel="noreferrer">Instagram</a>
          <a href={brand.googleReviews} target="_blank" rel="noreferrer">Google Reviews</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {year} Red Ranch Dogs.</span>
        <span>Family-run in Salado, Texas.</span>
      </div>
    </footer>
  );
}

function NotFoundPage() {
  return (
    <Layout>
      <PageHero eyebrow="404" title="Page Not Found" copy="The page you are looking for may have moved. Use the navigation or contact us if you need help finding something." />
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
    copy: "Browse available puppies, current litters, upcoming litters, previous litters, and puppy care information.",
    links: navGroups.find((group) => group.label === "Puppies").links
  },
  "/parents-1": {
    title: "Parents",
    copy: "Meet the dams and studs behind the Red Ranch Dogs program.",
    links: navGroups.find((group) => group.label === "Parents").links
  },
  "/application-1": {
    title: "Application & Waitlist",
    copy: "Start an application, review the process, or check the current waitlist.",
    links: navGroups.find((group) => group.label === "Application & Waitlist").links
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
    const onRoute = () => setPath(pathNow());
    window.addEventListener("popstate", onRoute);
    return () => window.removeEventListener("popstate", onRoute);
  }, []);

  useEffect(() => {
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
      "/stud-services/shipping-and-collection-info": <ShippingCollectionPage />,
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
    if (litterDetails[path]) return <LitterDetailPage litter={litterDetails[path]} />;
    if (previousLitterArchiveGroups[path]) return <PreviousLitterArchivePage archive={previousLitterArchiveGroups[path]} />;
    if (previousLitterDetails[path]) return <PreviousLitterDetailPage litter={previousLitterDetails[path]} />;
    if (studDetails[path]) return <StudDetailPage stud={studDetails[path]} />;
    if (damGroups[path]) return <DamGroupPage group={damGroups[path]} />;
    if (damDetails[path]) return <DamDetailPage dam={damDetails[path]} />;
    if (categories[path]) return <CategoryPage {...categories[path]} />;
    return <NotFoundPage />;
  }, [path]);

  return page;
}

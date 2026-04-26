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
  currentLitters,
  damDetails,
  damGroups,
  faqs,
  familyStory,
  guardianProgram,
  images,
  litterDetails,
  migrationChecklist,
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
  upcomingLitters,
  updateChecklist,
  waitlists
} from "./data/siteData.js";
import breedProfiles from "./data/breeds.json";
import puppyProfiles from "./data/puppies.json";
import litterProfiles from "./data/litters.json";
import parentProfiles from "./data/parents.json";
import testimonialProfiles from "./data/testimonials.json";
import faqProfiles from "./data/faqs.json";
import pricingProfiles from "./data/pricing.json";
import teamProfiles from "./data/team.json";

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
    description: "Review placeholder-ready Red Ranch Dogs pricing sections by breed and size."
  },
  "/process/application-and-waitlist": {
    title: "Application & Waitlist | Red Ranch Dogs",
    description: "Start the Red Ranch Dogs application and waitlist process for Goldendoodles, Cavapoos, and Bernedoodles."
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
    description: "Placeholder-ready reproductive service information for Red Ranch Dogs stud service inquiries."
  },
  "/stud-services/reproductive-education": {
    title: "Reproductive Education | Red Ranch Dogs",
    description: "Educational breeding timing and progesterone resources from Red Ranch Dogs."
  },
  "/stud-services/shipping-and-collection-info": {
    title: "Shipping and Collection Info | Red Ranch Dogs",
    description: "Placeholder-ready stud service collection, timing, and shipping information for breeder inquiries."
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
    description: "Placeholder-ready current guardian opportunities for Red Ranch Dogs."
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
    description: "Read Red Ranch Dogs family testimonials and review placeholders."
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
    const puppy = puppyProfiles.find((item) => `/puppies/${item.slug}` === path);
    if (puppy) {
      return {
        title: `${puppy.name} | ${puppy.breed} Puppy | Red Ranch Dogs`,
        description: `${puppy.name} is a ${puppy.gender} ${puppy.breed} puppy from the ${puppy.litter} litter.`
      };
    }
  }
  if (path.startsWith("/litters/")) {
    const litter = litterProfiles.find((item) => `/litters/${item.slug}` === path);
    if (litter) {
      return {
        title: `${litter.name} | ${litter.breed} Litter | Red Ranch Dogs`,
        description: litter.availabilitySummary
      };
    }
  }
  if (path.startsWith("/parents/")) {
    const parent = parentProfiles.find((item) => `/parents/${item.slug}` === path);
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
      <main>{children}</main>
      <Newsletter />
      <Footer />
    </>
  );
}

function PageHero({ eyebrow, title, copy, image = images.hero, actions }) {
  return (
    <section className="page-hero">
      <div className="hero-copy">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {copy && <p className="lead">{copy}</p>}
        {actions && <div className="actions">{actions}</div>}
      </div>
      <div className="hero-image">
        <img src={image} alt="" />
      </div>
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

function PageSection({ children, className = "", variant = "default", reveal = true }) {
  const sectionClass = `page-section ${variant !== "default" ? `page-section-${variant}` : ""} ${className}`.trim();

  if (reveal) {
    return (
      <FadeInSection className={sectionClass}>
        {children}
      </FadeInSection>
    );
  }

  return <section className={sectionClass}>{children}</section>;
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
  href,
  ctaLabel = "Learn More",
  className = "",
  variant = "standard"
}) {
  const content = (
    <>
      {image ? (
        <img className="image-card-media" src={image} alt={imageLabel || title} loading="lazy" />
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
      imageLabel={breedPlaceholders[breed.name] || `${breed.name} photo`}
      href="/puppies/available"
      ctaLabel="View puppies"
      variant="compact"
    />
  );
}

function HomeDoodles() {
  return (
    <PageSection className="home-doodles-section" variant="compact">
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
      <Icon size={22} />
      <h3>{title}</h3>
      <p>{copy}</p>
    </article>
  );
}

function WhyRedRanch() {
  const items = [
    ["Health Tested Parents", "Pairings are guided by health, structure, temperament, and genetic fit.", ShieldCheck],
    ["Ethical Breeding", "Puppies are raised with daily care, age-appropriate exposure, and clear family communication.", Heart],
    ["Ongoing Support", "Guidance continues after go-home day with practical help for the transition.", MessageCircle]
  ];

  return (
    <FadeInSection className="premium-section trust-section">
      <SectionIntro
        eyebrow="Why Red Ranch Dogs"
        title="A steady, transparent process from application to go-home."
      />
      <div className="premium-card-grid trust-grid">
        {items.map(([title, copy, Icon]) => <TrustCard title={title} copy={copy} Icon={Icon} key={title} />)}
      </div>
    </FadeInSection>
  );
}

function PuppyTemplateCard({ label, status }) {
  return (
    <article className="premium-puppy-card">
      <ImagePlaceholder label="Available puppy photo" />
      <div>
        <span className="status-pill">{status}</span>
        <h3>{label}</h3>
        <dl>
          <div><dt>Breed</dt><dd>To be added</dd></div>
          <div><dt>Gender</dt><dd>To be added</dd></div>
          <div><dt>Adult Weight</dt><dd>Estimate pending</dd></div>
        </dl>
        <Link href="/puppies/available" className="button small">View Availability</Link>
      </div>
    </article>
  );
}

function AvailablePuppiesPreview() {
  return (
    <FadeInSection className="premium-section puppies-preview">
      <SectionIntro
        eyebrow="Available Puppies"
        title="A clean card system ready for each puppy profile."
        copy="When you send real photos and details, these placeholders become live puppy cards."
      />
      <div className="puppy-scroll" aria-label="Available puppy card templates">
        <PuppyTemplateCard label="Puppy profile" status="Available" />
        <PuppyTemplateCard label="Puppy profile" status="Pending" />
        <PuppyTemplateCard label="Puppy profile" status="Reserved" />
      </div>
    </FadeInSection>
  );
}

function WaitlistSteps() {
  const steps = [
    ["01", "Apply", "Tell us about your family, timing, breed preference, and questions."],
    ["02", "Place Deposit", "Join the right waitlist with a deposit and a clear place in line."],
    ["03", "Pick or Pass", "Review litter updates and choose when the right puppy is ready."]
  ];

  return (
    <FadeInSection className="premium-section waitlist-section">
      <SectionIntro
        eyebrow="How the Waitlist Works"
        title="Simple, fair, and easy to understand."
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
    </FadeInSection>
  );
}

function HomeTestimonials() {
  return (
    <FadeInSection className="premium-section testimonials-section">
      <SectionIntro
        eyebrow="Testimonials"
        title="Families remember the care before the puppy comes home."
      />
      <div className="testimonial-row">
        {reviews.slice(0, 3).map((review) => (
          <article className="premium-testimonial-card" key={review.name}>
            <ImagePlaceholder label="Family testimonial photo" />
            <p>&quot;{review.quote}&quot;</p>
            <strong>{review.name}</strong>
          </article>
        ))}
      </div>
    </FadeInSection>
  );
}

function FinalCta() {
  return (
    <FadeInSection className="premium-section final-cta-section">
      <div className="final-cta-panel">
        <ImagePlaceholder label="Ranch lifestyle photo" />
        <div>
          <p className="premium-kicker">Ready to find your puppy?</p>
          <h2>Our puppies go fast.</h2>
          <p>Join the Red Ranch Dogs waitlist to secure your spot and be first to know when new puppies are available.</p>
          <div className="actions">
            <Link href="/apply" className="button primary">Join the Waitlist</Link>
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
      <AvailablePuppiesPreview />
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

function PuppyCard({ puppy }) {
  const breed = puppy.breed || "Breed pending";
  const gender = puppy.gender || puppy.sex || "Gender pending";
  const status = puppy.status || "Status pending";
  const route = puppy.slug ? `/puppies/${puppy.slug}` : puppy.litterHref;
  const photo = puppy.mainPhoto || puppy.image;
  const litterName = puppy.litter || puppy.litterName || "Litter pending";
  const goHome = puppy.goHomeDate || puppy.goHome || "Go-home pending";
  const weight = puppy.estimatedAdultWeight || puppy.size || "Estimate pending";

  return (
    <article className="puppy-card animal-card">
      <figure className="puppy-photo-frame">
        {photo ? (
          <img src={photo} alt={`${puppy.name} - ${breed}`} loading="lazy" />
        ) : (
          <ImagePlaceholder label="Available puppy photo" />
        )}
        <figcaption>{puppy.name}</figcaption>
      </figure>
      <div>
        <p className="eyebrow">{breed}</p>
        <h2>{puppy.name}</h2>
        <p>{puppy.description || "Placeholder puppy notes can be replaced with weekly details."}</p>
        <dl className="details">
          <div><dt>Litter</dt><dd>{litterName}</dd></div>
          <div><dt>Gender</dt><dd>{gender}</dd></div>
          <div><dt>Status</dt><dd>{status}</dd></div>
          <div><dt>Go Home</dt><dd>{goHome}</dd></div>
          <div><dt>Adult Weight</dt><dd>{weight}</dd></div>
        </dl>
        {route && <Link href={route} className="button small">View Puppy</Link>}
      </div>
    </article>
  );
}

function LitterCard({ litter }) {
  const route = litter.slug ? `/litters/${litter.slug}` : litter.href;
  const delivery = litter.birthDate || litter.delivery || "Timing pending";
  const goHome = litter.goHomeDate || litter.goHome || "Go-home pending";
  const size = litter.expectedSize || litter.size || "Estimate pending";
  const price = litter.priceRange || litter.price;
  const image = litter.weeklyUpdateGallery?.[0] || litter.image;

  return (
    <article className="litter-card animal-card">
      {image ? <img src={image} alt={litter.name} loading="lazy" /> : <ImagePlaceholder label="Litter photo" />}
      <div>
        <p className="eyebrow">{litter.status || "Litter"}</p>
        <h2>{litter.name}</h2>
        <h3>{litter.breed}</h3>
        {litter.availabilitySummary && <p>{litter.availabilitySummary}</p>}
        <dl className="details">
          <div><dt>Birth Date</dt><dd>{delivery}</dd></div>
          <div><dt>Go Home</dt><dd>{goHome}</dd></div>
          <div><dt>Expected Size</dt><dd>{size}</dd></div>
          {litter.coloring && <div><dt>Coloring</dt><dd>{litter.coloring}</dd></div>}
          {litter.coat && <div><dt>Coat</dt><dd>{litter.coat}</dd></div>}
          {price && <div><dt>Price</dt><dd>{price}</dd></div>}
        </dl>
        {route && <Link href={route} className="button small">View Litter</Link>}
      </div>
    </article>
  );
}

function FAQSection({ items = faqProfiles, category }) {
  const scopedItems = category ? items.filter((item) => item.category === category || item.category === "process") : items;

  return (
    <section className="faq-list">
      {scopedItems.map((item, index) => {
        const question = Array.isArray(item) ? item[0] : item.question;
        const answer = Array.isArray(item) ? item[1] : item.answer;
        return (
          <details key={question} open={index === 0}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        );
      })}
    </section>
  );
}

function PricingSection({ items = pricingProfiles }) {
  return (
    <section className="tile-grid three">
      {items.map((group) => (
        <article className="text-card" key={group.breed || group[0]}>
          <h2>{group.breed || group[0]}</h2>
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

function ParentCard({ parent }) {
  return (
    <article className="text-card parent-card parent-profile-card">
      {parent.mainPhoto ? <img src={parent.mainPhoto} alt={parent.name} loading="lazy" /> : <ImagePlaceholder label="Parent dog photo" />}
      <p className="eyebrow">{parent.role === "stud" ? "Stud" : "Mama"}</p>
      <h2>{parent.name}</h2>
      <p>{parent.breed} · {parent.weight}</p>
      <p>{parent.description}</p>
      {(parent.healthTestingLinks?.length > 0 || parent.geneticTestingLinks?.length > 0) && (
        <ul className="clean-list">
          {(parent.healthTestingLinks || []).map((href) => <li key={href}><a href={href}>Health testing</a></li>)}
          {(parent.geneticTestingLinks || []).map((href) => <li key={href}><a href={href}>Genetic testing</a></li>)}
        </ul>
      )}
      <Link href={`/parents/${parent.slug}`} className="inline-link">View profile</Link>
    </article>
  );
}

const puppyData = puppyProfiles.length ? puppyProfiles : availablePuppies;

function SectionIndexPage({ eyebrow, title, copy, links, children }) {
  return (
    <Layout>
      <PageHero eyebrow={eyebrow} title={title} copy={copy} />
      <section className="tile-grid architecture-grid">
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
  const litters = litterProfiles.filter((litter) => litter.breedSlug === breed.slug);
  const parents = parentProfiles.filter((parent) => parent.breedSlug === breed.slug);

  return (
    <Layout>
      <PageHero eyebrow="Breed Program" title={breed.heroTitle} copy={breed.intro} />
      <section className="content-section breed-template-grid">
        <article className="group-panel">
          <h2>Breed Snapshot</h2>
          <dl className="details facts-wide">
            <div><dt>Ideal family fit</dt><dd>{breed.idealFamilyFit}</dd></div>
            <div><dt>Expected size range</dt><dd>{breed.expectedSizeRange}</dd></div>
            <div><dt>Temperament</dt><dd>{breed.temperament}</dd></div>
            <div><dt>Coat expectations</dt><dd>{breed.coatExpectations}</dd></div>
            <div><dt>Shedding and allergies</dt><dd>{breed.sheddingAllergyNotes}</dd></div>
          </dl>
        </article>
      </section>
      <section className="card-list">
        <SectionHeader eyebrow="Available Puppies" title={`Current ${breed.name} puppies`} copy="Placeholder puppy cards are ready for clean photos, names, status, and weekly details." />
        {puppies.length ? puppies.map((puppy) => <PuppyCard puppy={puppy} key={puppy.slug || puppy.name} />) : <p className="small-note">No current placeholder puppies for this breed yet.</p>}
      </section>
      <section className="card-list">
        <SectionHeader eyebrow="Upcoming Litters" title={`${breed.name} litter planning`} />
        {litters.length ? litters.map((litter) => <LitterCard litter={litter} key={litter.slug || litter.name} />) : <p className="small-note">Upcoming litter placeholders can be added in src/data/litters.json.</p>}
      </section>
      <section className="tile-grid three">
        {parents.map((parent) => <ParentCard parent={parent} key={parent.slug} />)}
      </section>
      <FAQSection category={breed.faqCategory} />
      <CTASection title={`Interested in a ${breed.name}?`} />
    </Layout>
  );
}

function PuppyDetailPage({ puppy }) {
  const litter = litterProfiles.find((item) => item.slug === puppy.litterSlug);

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
            <div><dt>Estimated adult weight</dt><dd>{puppy.estimatedAdultWeight}</dd></div>
            <div><dt>Go-home date</dt><dd>{puppy.goHomeDate}</dd></div>
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

  return (
    <Layout>
      <PageHero eyebrow="Litter" title={litter.name} copy={litter.availabilitySummary} image={litter.weeklyUpdateGallery?.[0] || images.doodles} />
      <section className="content-section">
        <article className="group-panel">
          <h2>Litter Details</h2>
          <dl className="details facts-wide">
            <div><dt>Mama</dt><dd>{litter.mama}</dd></div>
            <div><dt>Stud</dt><dd>{litter.stud}</dd></div>
            <div><dt>Breed</dt><dd>{litter.breed}</dd></div>
            <div><dt>Birth date</dt><dd>{litter.birthDate}</dd></div>
            <div><dt>Go-home date</dt><dd>{litter.goHomeDate}</dd></div>
            <div><dt>Expected size</dt><dd>{litter.expectedSize}</dd></div>
            <div><dt>Price range</dt><dd>{litter.priceRange}</dd></div>
          </dl>
        </article>
      </section>
      <section className="card-list">
        <SectionHeader eyebrow="Puppies" title="Puppy cards" copy="Names and labels are rendered by the website, so clean original photos can be uploaded without Canva text." />
        {puppies.length ? puppies.map((puppy) => <PuppyCard puppy={puppy} key={puppy.slug || puppy.name} />) : <p className="small-note">Puppy cards can be added in src/data/puppies.json.</p>}
      </section>
      <section className="tile-grid three">
        {parents.map((parent) => <ParentCard parent={parent} key={parent.slug} />)}
      </section>
      <section className="content-section">
        <h2>Weekly update gallery</h2>
        <ImageGallery images={litter.weeklyUpdateGallery} label={`${litter.name} weekly update`} />
      </section>
      <CTASection title="Ask about this litter" copy="Join the waitlist or ask about availability for this pairing." />
    </Layout>
  );
}

function ParentDetailPage({ parent }) {
  const relatedLitters = litterProfiles.filter((litter) => parent.relatedLitters.includes(litter.slug));

  return (
    <Layout>
      <PageHero eyebrow={parent.role === "stud" ? "Stud Profile" : "Mama Profile"} title={parent.name} copy={parent.description} image={parent.mainPhoto || images.doodles} />
      <section className="content-section stud-profile">
        <article className="group-panel">
          <h2>Profile</h2>
          <dl className="details facts-wide">
            <div><dt>Role</dt><dd>{parent.role === "stud" ? "Stud" : "Mama"}</dd></div>
            <div><dt>Breed</dt><dd>{parent.breed}</dd></div>
            <div><dt>Weight</dt><dd>{parent.weight}</dd></div>
            <div><dt>Color</dt><dd>{parent.color}</dd></div>
            <div><dt>Coat</dt><dd>{parent.coat}</dd></div>
            <div><dt>Status</dt><dd>{parent.status}</dd></div>
          </dl>
        </article>
        <article className="group-panel">
          <h2>Photos</h2>
          <ImageGallery images={parent.photos} label={`${parent.name} photo`} />
        </article>
      </section>
      <section className="card-list">
        <SectionHeader eyebrow="Related Litters" title={`${parent.name}'s related litters`} />
        {relatedLitters.length ? relatedLitters.map((litter) => <LitterCard litter={litter} key={litter.slug} />) : <p className="small-note">Related litters can be connected in src/data/parents.json.</p>}
      </section>
    </Layout>
  );
}

function PuppiesOverviewPage() {
  return (
    <SectionIndexPage
      eyebrow="Puppies"
      title="Puppies"
      copy="The main sales section for available puppies, upcoming litters, breed education, and puppy preparation."
      links={primaryNav.find((item) => item.label === "Puppies").links}
    >
      <section className="card-list">
        <SectionHeader eyebrow="Current Cards" title="Sample puppy cards" />
        {puppyData.slice(0, 3).map((puppy) => <PuppyCard puppy={puppy} key={puppy.slug || puppy.name} />)}
      </section>
    </SectionIndexPage>
  );
}

function ParentsDirectoryPage({ role }) {
  const filteredParents = parentProfiles.filter((parent) => {
    const roleMatch = role ? parent.role === role : true;
    return roleMatch;
  });
  const title = role === "mama" ? "Mamas" : role === "stud" ? "Studs" : "Parent Dogs";

  return (
    <Layout>
      <PageHero eyebrow="Parents" title={title} copy="Reusable parent cards are powered by structured data for photos, testing links, traits, and related litters." />
      <section className="tile-grid three">
        {filteredParents.map((parent) => <ParentCard parent={parent} key={parent.slug} />)}
      </section>
    </Layout>
  );
}

function BreedParentDirectoryPage({ breedSlug }) {
  const breed = breedProfiles.find((item) => item.slug === breedSlug);
  const filteredParents = parentProfiles.filter((parent) => parent.breedSlug === breedSlug);

  return (
    <Layout>
      <PageHero eyebrow="Parents" title={`${breed?.name || "Breed"} Parents`} copy="Parent cards are powered by structured data so testing notes, traits, photos, and related litters can stay organized." />
      <section className="tile-grid three">
        {filteredParents.map((parent) => <ParentCard parent={parent} key={parent.slug} />)}
      </section>
    </Layout>
  );
}

function ProcessOverviewPage() {
  return (
    <SectionIndexPage
      eyebrow="Process"
      title="How the Red Ranch Dogs process fits together"
      copy="Pricing, application, waitlist, FAQ, pickup, and delivery now live under Process instead of being scattered through About."
      links={primaryNav.find((item) => item.label === "Process").links}
    />
  );
}

function PickupDeliveryPage() {
  return (
    <Layout>
      <PageHero eyebrow="Process" title="Puppy Pickup and Delivery" copy="Placeholder structure for go-home day, local pickup, travel coordination, and delivery options." />
      <section className="tile-grid three">
        {["Pickup in Central Texas", "Flight nanny coordination", "Go-home preparation"].map((title) => (
          <article className="text-card" key={title}>
            <h2>{title}</h2>
            <p>Placeholder copy for Phase 2 refinement.</p>
          </article>
        ))}
      </section>
    </Layout>
  );
}

function GuardianOpportunitiesPage() {
  return (
    <Layout>
      <PageHero eyebrow="Guardian Program" title="Current Guardian Opportunities" copy="Placeholder-ready page for future guardian openings." />
      <section className="content-section narrow">
        <h2>No public guardian openings listed yet</h2>
        <p>When an opportunity is ready, it can be added here with the dog profile, timing, household fit, and application CTA.</p>
        <Link href="/guardian-program/application" className="button primary">Guardian Application</Link>
      </section>
    </Layout>
  );
}

function ReproductiveServicesPage() {
  return (
    <Layout>
      <PageHero eyebrow="Stud Services" title="Reproductive Services" copy="Placeholder-ready structure for stud service details, timing, paperwork, and communication." />
      <section className="tile-grid three">
        {["Stud inquiries", "Timing support", "Breeder communication"].map((title) => (
          <article className="text-card" key={title}>
            <Sparkles size={24} />
            <h2>{title}</h2>
            <p>Phase 2 copy can expand this with exact service details, requirements, and next steps.</p>
          </article>
        ))}
      </section>
    </Layout>
  );
}

function ShippingCollectionPage() {
  return (
    <Layout>
      <PageHero eyebrow="Stud Services" title="Shipping and Collection Info" copy="Placeholder-ready page for chilled semen shipping, collection timing, and required breeder coordination." />
      <section className="content-section narrow">
        <h2>Information to collect</h2>
        <p>Add collection clinic details, shipping windows, progesterone timing expectations, and contact requirements here when finalized.</p>
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
      copy="About is now focused on the family, team, reviews, and contact information."
      links={primaryNav.find((item) => item.label === "About").links}
    />
  );
}

function AvailablePuppiesPage() {
  return (
    <Layout>
      <PageHero
        eyebrow="Puppies"
        title="Available Puppies"
        copy="Current puppy availability is powered by structured data so new photos and updates can be added quickly."
      />
      {puppyData.length > 0 ? (
        <section className="card-list">
          {puppyData.map((puppy) => <PuppyCard puppy={puppy} key={puppy.slug || puppy.name} />)}
        </section>
      ) : (
        <section className="content-section narrow">
          <h2>No publicly listed puppies right now</h2>
          <p>The current Squarespace page does not show individual available puppy cards. The new site is ready for them as soon as the next availability list is confirmed.</p>
          <div className="actions">
            <Link href="/apply" className="button primary">Apply</Link>
            <Link href="/puppies/upcoming-litters" className="button secondary">View Upcoming Litters</Link>
          </div>
        </section>
      )}
    </Layout>
  );
}

function CurrentLittersPage() {
  return (
    <Layout>
      <PageHero eyebrow="Updated 4/21/26" title="Current Litters" copy="Current litter cards can be updated by changing one data file and adding new photos." />
      <section className="card-list">
        {currentLitters.map((litter) => <LitterCard litter={litter} key={litter.name} />)}
      </section>
    </Layout>
  );
}

function UpcomingLittersPage() {
  return (
    <Layout>
      <PageHero eyebrow={`Updated ${upcomingLitters.updated}`} title="Upcoming Litters" copy="Planned pairings are based on timing, genetics, colors, and availability. Pairings may change as breeding plans develop." />
      <section className="card-list">
        <SectionHeader eyebrow="Structured Litters" title="Data-driven litter cards" copy="These cards come from src/data/litters.json and are ready for weekly updates, puppy cards, and photo galleries." />
        {litterProfiles.map((litter) => <LitterCard litter={litter} key={litter.slug || litter.name} />)}
      </section>
      <section className="content-section">
        {upcomingLitters.groups.map((group) => (
          <article className="group-panel" key={group.breed}>
            <h2>{group.breed}</h2>
            <div className="mini-grid">
              {group.litters.map(([name, breed, color, timing, extra]) => {
                const href = extra?.startsWith("/") ? extra : null;
                const goHome = href ? "" : extra;
                return (
                <div className="text-card" key={name}>
                  <h3>{name}</h3>
                  <p>{breed}</p>
                  <p>{color}</p>
                  <p>{timing}</p>
                  {goHome && <p>{goHome}</p>}
                  {href && <Link href={href} className="inline-link">View pairing</Link>}
                </div>
                );
              })}
            </div>
          </article>
        ))}
        <article className="note-panel">
          <h2>The planned stud on my litter changed?</h2>
          <p>{upcomingLitters.pairingNote}</p>
          <p>Red Ranch Dogs prioritizes the well-being of each breeding dog. Guardian-family mamas live normal family lives and come to Red Ranch Dogs only during breeding and whelping windows.</p>
        </article>
      </section>
    </Layout>
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
          <p className="small-note">Puppy names were not exposed in the public text for this archived litter.</p>
        )}
      </section>
      {litter.milestones.length > 0 && (
        <section className="content-section narrow">
          <h2>Photo Milestones</h2>
          <ul className="check-list">
            {litter.milestones.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <p className="small-note">One representative image is migrated now. Full age-by-age gallery migration is queued for a later media pass.</p>
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
            <p>Evaluation details can be added here when confirmed from the live records.</p>
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
            <p>Additional litter history, gallery notes, and breeder details can be expanded during the next admin pass.</p>
          )}
        </article>
      </section>
    </Layout>
  );
}

function PricingPage() {
  return (
    <Layout>
      <PageHero eyebrow="Pricing" title="Puppy Prices & Deposits" copy="Pricing varies by breed, size, and individual traits. A $500 non-refundable deposit is required to join a waitlist or reserve a puppy." />
      <PricingSection items={pricingProfiles.length ? pricingProfiles : priceGroups} />
      <section className="content-section narrow">
        <h2>Payments</h2>
        <p>Our preferred payment method is Zelle. No puppy will be reserved without payment. All payments toward puppies are considered retainers and are non-refundable.</p>
        <p><strong>Zelle recipient:</strong> Red Ranch Dogs, {brand.paymentEmail}</p>
      </section>
    </Layout>
  );
}

function FaqPage() {
  return (
    <Layout>
      <PageHero eyebrow="FAQ" title="Puppy FAQ" copy="Quick answers about pricing, waitlists, health testing, puppy visits, and what comes home with your puppy." />
      <FAQSection items={faqProfiles.length ? faqProfiles : faqs} />
    </Layout>
  );
}

function ContactPage() {
  return (
    <Layout>
      <PageHero eyebrow="Contact" title="Contact Us" copy="Questions are always welcome. Call, text, email, or send a quick message through the form." image={images.cta} />
      <section className="contact-grid">
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
      <PageHero eyebrow="Reviews" title="Testimonials & Customer Reviews" copy="Visible public reviews have been migrated into the new site. The final migration can import more Google reviews once access is connected." />
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
      <PageHero eyebrow="Parents" title={type === "studs" ? "Studs" : type === "dams" ? "Dams" : "Parent Dogs"} copy="Parent profiles are structured so health testing, photos, traits, and previous litters can be expanded over time." />
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
            <p>No public previous-litter list was visible for this profile yet.</p>
          )}
        </article>
        <article className="text-card">
          <Sparkles size={24} />
          <h2>Gallery Status</h2>
          <p>Main profile photo is migrated. Full photo gallery migration is queued for the next media pass.</p>
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
      <PageHero eyebrow="Application & Waitlist" title="Puppy Application" copy="Submit your family details, puppy preferences, timing, and any questions. The submission endpoint is ready for email plus spreadsheet logging once production credentials are configured." />
      <section className="form-shell">
        <LeadForm formType="application" title="Puppy Application" />
      </section>
    </Layout>
  );
}

function WaitlistPage() {
  return (
    <Layout>
      <PageHero eyebrow="Updated 4/10/26" title="Waitlist" copy="Deposits are non-refundable but transferable to a different waitlist. Joining multiple waitlists requires one $500 deposit per list." />
      <section className="tile-grid">
        {waitlists.map((list) => (
          <article className="text-card waitlist-card" key={list.breed}>
            <h2>{list.breed}</h2>
            <p>{list.size}</p>
            <ol>{list.names.map((name) => <li key={name}>{name}</li>)}</ol>
          </article>
        ))}
      </section>
    </Layout>
  );
}

function JoinWaitlistPage() {
  return (
    <Layout>
      <PageHero eyebrow="Join the Waitlist" title="Application & Waitlist" copy="Start with the application and we will follow up about timing, deposit, and the best waitlist for your family." />
      <section className="form-shell">
        <LeadForm formType="waitlist" title="Join Our Waitlist" />
      </section>
    </Layout>
  );
}

function StudServicesPage() {
  return (
    <Layout>
      <PageHero eyebrow="Stud Services" title="Health-Tested Stud Services" copy="A rebuilt services page for stud profiles, reproductive education, and breeder inquiries." image={images.studGoldendoodle} />
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

function Newsletter() {
  return (
    <section className="premium-newsletter">
      <div>
        <p className="premium-kicker">Puppy Alert Email</p>
        <h2>Stay in the loop about upcoming litters.</h2>
      </div>
      <LeadForm formType="newsletter" title="Puppy Alert Email" compact newsletterOnly />
    </section>
  );
}

function LeadForm({ formType, title, compact = false, newsletterOnly = false, guardianFields = false }) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
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
      {!newsletterOnly && (
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
          {guardianFields && (
            <>
              <label>
                City / area
                <input name="location" autoComplete="address-level2" />
              </label>
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
              <label className="full">
                Schedule and dog experience
                <textarea name="dogExperience" rows="4" placeholder="Tell us about your daily schedule, dog experience, and why the guardian program interests you." />
              </label>
            </>
          )}
          <label className="full">
            Message
            <textarea name="message" rows="5" placeholder="Tell us about your timing, size preference, and questions." />
          </label>
        </div>
      )}
      {newsletterOnly && (
        <label>
          Email Address
          <input name="email" type="email" required autoComplete="email" />
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
  return (
    <footer className="premium-footer">
      <div className="footer-brand">
        <img src={brand.logo} alt="Red Ranch Dogs" />
        <p>{brand.tagline}</p>
        <span>{brand.location}</span>
      </div>
      <div className="footer-links">
        <Link href="/">Home</Link>
        <Link href="/puppies">Puppies</Link>
        <Link href="/process">Process</Link>
        <Link href="/parents">Parents</Link>
        <Link href="/apply">Apply</Link>
        <Link href="/contact">Contact</Link>
        <a href={brand.instagram} target="_blank" rel="noreferrer">Instagram</a>
      </div>
    </footer>
  );
}

function NotFoundPage() {
  return (
    <Layout>
      <PageHero eyebrow="404" title="Page Not Found" copy="This route is ready for a redirect once the final Squarespace URL map is exported." />
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

function UpdatesGuidePage() {
  return (
    <Layout>
      <PageHero eyebrow="Internal Workflow" title="Codex Update Workflow" copy="Use this checklist when new puppy photos, litter changes, or page updates need to be published." />
      <section className="content-section narrow">
        <h2>Routine update checklist</h2>
        <ul className="check-list">
          {updateChecklist.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="content-section narrow">
        <h2>Migration status</h2>
        <div className="stack">
          {migrationChecklist.map(([area, status]) => (
            <article className="text-card" key={area}>
              <h3>{area}</h3>
              <p>{status}</p>
            </article>
          ))}
        </div>
      </section>
    </Layout>
  );
}

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
      "/puppy-application": <ApplicationPage />,
      "/updates": <UpdatesGuidePage />
    };

    if (routes[path]) return routes[path];
    const puppy = puppyProfiles.find((item) => `/puppies/${item.slug}` === path);
    if (puppy) return <PuppyDetailPage puppy={puppy} />;
    const litter = litterProfiles.find((item) => `/litters/${item.slug}` === path);
    if (litter) return <LitterPage litter={litter} />;
    const parent = parentProfiles.find((item) => `/parents/${item.slug}` === path);
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

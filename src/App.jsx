import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Heart,
  Instagram,
  Mail,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import {
  availablePuppies,
  brand,
  breeds,
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

const desktopNav = [
  { label: "Home", href: "/" },
  { label: "Puppies", href: "/available-puppies" },
  { label: "Parents", href: "/parents-1" },
  { label: "Application", href: "/application-process" },
  { label: "Stud Services", href: "/studservices" },
  { label: "Guardian Program", href: "/guardianprogram" }
];

const mobileNav = [
  { label: "Home", href: "/" },
  { label: "Available Puppies", href: "/available-puppies" },
  {
    label: "Puppies",
    links: [
      { label: "Available Puppies", href: "/available-puppies" },
      { label: "Upcoming Litters", href: "/upcoming-litters" },
      { label: "Goldendoodles", href: "/previous-litters-goldendoodles" },
      { label: "Cavapoos", href: "/previous-litters-cavapoos" },
      { label: "Bernedoodles", href: "/previous-litters-bernedoodles" }
    ]
  },
  {
    label: "About",
    links: [
      { label: "Our Story", href: "/our-family" },
      { label: "Parents", href: "/parents-1" },
      { label: "Health Testing", href: "/what-come-with-your-puppy" },
      { label: "Puppy Curriculum", href: "/what-come-with-your-puppy" }
    ]
  },
  {
    label: "Application and Waitlist",
    links: [
      { label: "How the Waitlist Works", href: "/application-process" },
      { label: "Puppy Application", href: "/puppy-application" },
      { label: "Pricing", href: "/prices" },
      { label: "FAQ", href: "/faq" }
    ]
  },
  { label: "Parents", href: "/parents-1" },
  { label: "Stud Services", href: "/studservices" },
  { label: "Guardian Program", href: "/guardianprogram" },
  { label: "Contact", href: "/contact" }
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
        {desktopNav.map((item) => (
          <Link
            href={item.href}
            className={currentPath === item.href ? "active" : undefined}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <a className="premium-icon-link" href={brand.instagram} aria-label="Instagram" target="_blank" rel="noreferrer">
        <Instagram size={18} />
      </a>
      <div className={`premium-mobile-menu ${open ? "open" : ""}`} aria-hidden={!open} inert={open ? undefined : ""}>
        <nav aria-label="Mobile navigation">
          {mobileNav.map((item, index) => (
            <AccordionNav item={item} currentPath={currentPath} key={item.label} index={index} onNavigate={closeMenu} />
          ))}
        </nav>
        <div className="mobile-menu-ctas">
          <Link href="/join-our-waitlist" className="button primary" onClick={closeMenu}>Join the Waitlist</Link>
          <Link href="/available-puppies" className="button secondary" onClick={closeMenu}>Available Puppies</Link>
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

function HomeHero() {
  return (
    <section className="premium-hero" id="home-hero">
      <div className="premium-hero-copy">
        <p className="premium-kicker">{brand.tagline}</p>
        <h1>Welcome to Red Ranch Dogs</h1>
        <p>
          Family-run Goldendoodle, Cavapoo, and Bernedoodle puppies raised with hands-on care in Salado,
          Texas.
        </p>
        <div className="actions">
          <Link href="/join-our-waitlist" className="button primary">
            Join the Waitlist
          </Link>
          <Link href="/available-puppies" className="button secondary">
            Available Puppies
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
    <Link href="/available-puppies" className="premium-breed-card">
      <ImagePlaceholder label={breedPlaceholders[breed.name] || `${breed.name} photo`} />
      <div>
        <h3>{breed.name}</h3>
        <p>{breed.copy}</p>
        <span>
          Learn More <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}

function HomeDoodles() {
  return (
    <FadeInSection className="premium-section">
      <SectionIntro
        eyebrow="Our Doodles"
        title="Thoughtful pairings for family-ready companions."
        copy="Three breed programs, one standard for temperament, health, and communication."
      />
      <div className="premium-card-grid breed-grid">
        {breeds.map((breed) => <BreedCard breed={breed} key={breed.name} />)}
      </div>
    </FadeInSection>
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
        <Link href="/available-puppies" className="button small">View Availability</Link>
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
            <Link href="/join-our-waitlist" className="button primary">Join the Waitlist</Link>
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
      <Link href="/join-our-waitlist" className="button primary">Join Waitlist</Link>
      <a href={brand.sms} className="button secondary">Text Us</a>
    </div>
  );
}

function HomePage() {
  return (
    <Layout>
      <HomeHero />
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

function PuppyCard({ puppy }) {
  return (
    <article className="animal-card">
      <img src={puppy.image} alt={`${puppy.name} - ${puppy.sex}`} />
      <div>
        <p className="eyebrow">{puppy.breed}</p>
        <h2>{puppy.name} - {puppy.sex}</h2>
        <dl className="details">
          <div><dt>Born</dt><dd>{puppy.born}</dd></div>
          <div><dt>Go Home</dt><dd>{puppy.goHome}</dd></div>
          <div><dt>Coloring</dt><dd>{puppy.coloring}</dd></div>
          <div><dt>Size</dt><dd>{puppy.size}</dd></div>
          <div><dt>Coat</dt><dd>{puppy.coat}</dd></div>
          <div><dt>Price</dt><dd>{puppy.price}</dd></div>
        </dl>
        <Link href={puppy.litterHref} className="button small">View Litter</Link>
      </div>
    </article>
  );
}

function LitterCard({ litter }) {
  return (
    <article className="animal-card">
      <img src={litter.image} alt={litter.name} />
      <div>
        <p className="eyebrow">{litter.status}</p>
        <h2>{litter.name}</h2>
        <h3>{litter.breed}</h3>
        <dl className="details">
          <div><dt>Delivery Date</dt><dd>{litter.delivery}</dd></div>
          <div><dt>Go Home</dt><dd>{litter.goHome}</dd></div>
          <div><dt>Coloring</dt><dd>{litter.coloring}</dd></div>
          <div><dt>Size</dt><dd>{litter.size}</dd></div>
          <div><dt>Coat</dt><dd>{litter.coat}</dd></div>
          {litter.price && <div><dt>Price</dt><dd>{litter.price}</dd></div>}
        </dl>
        <Link href={litter.href} className="button small">View Litter</Link>
      </div>
    </article>
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
      {availablePuppies.length > 0 ? (
        <section className="card-list">
          {availablePuppies.map((puppy) => <PuppyCard puppy={puppy} key={puppy.name} />)}
        </section>
      ) : (
        <section className="content-section narrow">
          <h2>No publicly listed puppies right now</h2>
          <p>The current Squarespace page does not show individual available puppy cards. The new site is ready for them as soon as the next availability list is confirmed.</p>
          <div className="actions">
            <Link href="/join-our-waitlist" className="button primary">Join the Waitlist</Link>
            <Link href="/current-litters" className="button secondary">View Current Litters</Link>
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
            <Link href="/studservices" className="button secondary">All Studs</Link>
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
      <section className="tile-grid">
        {priceGroups.map(([title, prices]) => (
          <article className="text-card" key={title}>
            <h2>{title}</h2>
            <ul className="clean-list">
              {prices.map((price) => <li key={price}>{price}</li>)}
            </ul>
          </article>
        ))}
      </section>
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
      <section className="faq-list">
        {faqs.map(([question, answer]) => (
          <details key={question} open={question === "Where are you located?"}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
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
  return (
    <Layout>
      <PageHero eyebrow="Our Team" title="Meet Our Team" copy="Raising healthy, happy puppies is a team effort built on daily care, monitoring, socialization, cleaning, feeding, grooming, and communication." image={images.family} />
      <section className="tile-grid three">
        {teamMembers.map((member) => (
          <article className="text-card person-card" key={member.name}>
            <img src={member.image} alt={member.name} />
            <h2>{member.name}</h2>
            <p>Part of the hands-on Red Ranch Dogs care team.</p>
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
          <Link href="/available-puppies" className="button primary">View Available Puppies</Link>
          <Link href="/join-our-waitlist" className="button secondary">Join Our Waitlist</Link>
        </div>
      </section>
    </Layout>
  );
}

function ReviewsInline() {
  return (
    <section className="reviews-row">
      {reviews.map((review) => (
        <article className="review-card" key={review.quote}>
          <p>&quot;{review.quote}&quot;</p>
          <strong>{review.name}</strong>
        </article>
      ))}
    </section>
  );
}

function ReviewsPage() {
  return (
    <Layout>
      <PageHero eyebrow="Reviews" title="Testimonials & Customer Reviews" copy="Visible public reviews have been migrated into the new site. The final migration can import more Google reviews once access is connected." />
      <ReviewsInline />
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
            <Link href="/dams" className="button secondary">All Dams</Link>
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
        <Link href="/puppy-application" className="button primary">Start Application</Link>
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
        <Link href="/guardian-application" className="button primary">Guardian Application</Link>
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
        <Link href="/available-puppies">Puppies</Link>
        <Link href="/application-process">Application</Link>
        <Link href="/parents-1">Parents</Link>
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

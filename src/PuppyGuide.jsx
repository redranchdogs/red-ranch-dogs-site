import { ArrowRight, Check, BookOpen, Heart, Home, PawPrint } from "lucide-react";
import { guideArticles, articlePath, guidePath } from "./data/puppyGuide.js";
import "./puppyGuide.css";

const topics = [
  { title: "Choosing Your Puppy", copy: "Breeds, sizes, coats and the questions worth asking.", icon: PawPrint, href: articlePath(guideArticles[0]) },
  { title: "Bringing Puppy Home", copy: "A little preparation for a much-loved new arrival.", icon: Home, href: articlePath(guideArticles[2]) },
  { title: "Care & Training", copy: "Kind routines and small steps for your first days together.", icon: Heart, href: `${articlePath(guideArticles[2])}#care-and-training` }
];

function GuideCard({ article, Link }) {
  return <article className="guide-card">
    <Link href={articlePath(article)} className="guide-card-image" tabIndex={-1} aria-hidden="true"><img src={article.image} alt="" loading="lazy" width="640" height="480" /></Link>
    <div className="guide-card-copy"><span className="guide-kicker">{article.category}</span><h3><Link href={articlePath(article)}>{article.title}</Link></h3><p>{article.subtitle}</p><Link className="guide-read-link" href={articlePath(article)}><span>Read the guide <span className="sr-only">: {article.title}</span></span><ArrowRight size={18} /></Link><span className="guide-read-time">{article.readTime}</span></div>
  </article>;
}

export function PuppyGuideHome({ Link }) {
  return <div className="puppy-guide">
    <section className="guide-hero">
      <div className="guide-hero-copy"><span className="guide-kicker"><BookOpen size={16} /> The Red Ranch Dogs Puppy Guide</span><h1>A good start.<br /><span>A life together.</span></h1><p className="guide-intro">Welcome to the Puppy Guide. Practical answers for choosing your puppy, getting ready for home and finding your rhythm together.</p><a className="button primary" href="#start-reading">Explore the guides <ArrowRight size={17} /></a><p className="guide-signoff">From our family in Salado, Texas, to yours.</p></div>
      <div className="guide-hero-photo"><img src="/images/home/red-ranch-dogs-goldendoodle-home-card.jpg" alt="A Goldendoodle puppy from Red Ranch Dogs" width="720" height="800" /><span className="guide-photo-note">Small beginnings. Big love.</span></div>
    </section>
    <section className="guide-topics" aria-label="Explore puppy guide topics">{topics.map(({ title, copy, icon: Icon, href }, index) => <Link href={href} className="guide-topic" key={title}><span className="guide-topic-number">0{index + 1}</span><Icon size={24} strokeWidth={1.5} /><h2>{title}</h2><p>{copy}</p><ArrowRight size={18} /></Link>)}</section>
    <section className="guide-reading" id="start-reading"><div className="guide-section-heading"><div><span className="guide-kicker">A little knowledge, a lot of love</span><h2>Start here</h2></div><p>Three useful reads for the road ahead.</p></div><div className="guide-card-grid">{guideArticles.map((article) => <GuideCard key={article.slug} article={article} Link={Link} />)}</div></section>
    <section className="guide-more"><div><span className="guide-kicker">Keep exploring</span><h2>More answers from Red Ranch</h2><p>Get to know our dogs and the details behind bringing a puppy home.</p></div><div className="guide-more-links">{[{ label: "Coat traits & colors", href: "/puppies/coat-traits" }, { label: "Doodle generations", href: "/puppies/doodle-generations" }, { label: "Frequently asked questions", href: "/process/faq" }, { label: "Guardian Family Program", href: "/guardian-program" }].map((link) => <Link key={link.href} href={link.href}>{link.label}<ArrowRight size={16} /></Link>)}</div></section>
    <GuideCTA Link={Link} />
  </div>;
}

function GuideCTA({ Link }) {
  return <section className="guide-cta"><PawPrint size={28} strokeWidth={1.5} /><h2>Let’s find your next chapter.</h2><p>Explore the puppies and litters, or tell us what life with your family looks like.</p><div><Link href="/puppies/available" className="button primary">Meet Available Puppies</Link><Link href="/puppies/upcoming-litters" className="button secondary">Upcoming Litters</Link></div><Link href="/contact" className="guide-contact">Have a question? Get in touch <ArrowRight size={16} /></Link></section>;
}

export function PuppyGuideArticle({ article, Link }) {
  return <div className="puppy-guide guide-article-page">
    <header className="guide-article-header"><nav className="guide-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href={guidePath}>Puppy Guide</Link><span>/</span><span aria-current="page">{article.category}</span></nav><span className="guide-kicker">{article.category}</span><h1>{article.title}</h1><p className="guide-subtitle">{article.subtitle}</p><div className="guide-byline">By Red Ranch Dogs <span>·</span> {article.readTime}</div><p className="guide-intro">{article.intro}</p></header>
    <div className="guide-article-layout"><aside className="guide-contents"><span className="guide-kicker">In this guide</span><nav aria-label="Article contents">{article.sections.map((section) => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}</nav><Link href={guidePath} className="guide-all-link">← All puppy guides</Link></aside><article className="guide-article-body"><img className="guide-article-photo" src={article.image} alt={article.imageAlt} width="900" height="600" />{article.sections.map((section) => <section id={section.id} key={section.id}><h2>{section.title}</h2>{section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.items && <ul className={section.checklist ? "guide-checklist" : "guide-bullet-list"}>{section.items.map((item) => <li key={item}>{section.checklist && <Check aria-hidden="true" size={18} />}<span>{item}</span></li>)}</ul>}{section.links && <div className="guide-related-links">{section.links.map((link) => <Link key={link.href} href={link.href}>{link.label}<ArrowRight size={15} /></Link>)}</div>}</section>)}<div className="guide-takeaway"><span className="guide-kicker">Take this with you</span><p>{article.takeaway}</p></div><section className="guide-sources"><h2>Sources & further reading</h2><ul>{article.sources.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noreferrer">{source.label}<span className="sr-only"> (opens in a new tab)</span></a></li>)}</ul><p>General education, not individualized veterinary advice. Ask your veterinarian about your puppy’s health, nutrition and care. Current puppy details and written agreements govern individual estimates and program terms.</p></section></article></div>
    <section className="guide-reading"><div className="guide-section-heading"><div><span className="guide-kicker">A little more to explore</span><h2>Keep reading</h2></div><Link href={guidePath}>All puppy guides <ArrowRight size={16} /></Link></div><div className="guide-card-grid guide-card-grid-two">{guideArticles.filter((item) => item.slug !== article.slug).map((item) => <GuideCard key={item.slug} article={item} Link={Link} />)}</div></section><GuideCTA Link={Link} />
  </div>;
}

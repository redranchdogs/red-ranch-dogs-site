import { ArrowRight, CirclePlay } from "lucide-react";
import { litterPuppyStatus } from "./litterPuppyStatus.js";
import PuppyStatusBar from "./PuppyStatusBar.jsx";

// Presentation only. All photos, facts, destinations, and video validation
// remain with the existing PuppyCard source-of-truth flow.
export default function PuppyListingCard({
  puppy, breed, gender, photo, goHome, weight, price,
  variant = "litter", primaryHref, primaryLabel, inquiryHref, videoHref, videoLabel,
  litterName, litterRoute, birthDate, puppyNote, availabilityNote, Link
}) {
  const { tone } = litterPuppyStatus(puppy.status);
  const showLitterFacts = variant !== "litter";
  const variantClass = variant === "available" ? "available-puppy-card" : variant === "litter" ? "litter-puppy-card" : "breed-puppy-card";
  return (
    <article className={`puppy-listing-card ${variantClass} litter-puppy-profile is-${tone}`}>
      <PuppyStatusBar status={puppy.status} />
      <figure className="litter-puppy-portrait">
        {photo ? <img src={photo} alt={`${puppy.name} - ${breed}`} loading="lazy" /> : (
          <div className="litter-puppy-photo-placeholder" role="img" aria-label={`${puppy.name} puppy photo coming soon`}>Photo coming soon</div>
        )}
      </figure>
      <div className="litter-puppy-body">
        <header>
          <div className="litter-puppy-title-row">
            <h2>{puppy.name}</h2>
            {price && <p className="litter-puppy-price"><span className="sr-only">Price: </span>{price}</p>}
          </div>
          <p className="litter-puppy-breed">{breed}</p>
          <p className="litter-puppy-summary">
            <span>{gender}</span><span aria-hidden="true"> · </span>
            <span><span className="sr-only">Estimated adult weight: </span>{weight}</span>
            {(puppy.estimatedAdultWeight || puppy.size) && <span> as an adult</span>}
          </p>
          {puppy.collarColor && <p className="litter-puppy-collar">{puppy.collarColor} collar</p>}
        </header>
        <dl className={`litter-puppy-timing${showLitterFacts ? " puppy-listing-facts" : ""}`}>
          {showLitterFacts && <div><dt>Litter</dt><dd>{litterName}</dd></div>}
          {birthDate && <div><dt>Born</dt><dd>{birthDate}</dd></div>}
          <div><dt>Go home</dt><dd>{goHome}</dd></div>
        </dl>
        {(puppyNote || availabilityNote) && <div className="puppy-listing-notes">
          {puppyNote && <p>{puppyNote}</p>}
          {availabilityNote && <p>{availabilityNote}</p>}
        </div>}
        <div className="litter-puppy-actions">
          {primaryHref && <Link href={primaryHref} className={`button litter-puppy-primary${tone === "available" ? " primary" : " secondary"}`}>{primaryLabel}<ArrowRight size={20} aria-hidden="true" /></Link>}
          {inquiryHref && <Link href={inquiryHref} className="litter-puppy-inquiry">Ask about {puppy.name}<ArrowRight size={18} aria-hidden="true" /></Link>}
          {(litterRoute || videoHref) && <div className="puppy-listing-secondary">
            {litterRoute && <Link href={litterRoute} className="puppy-listing-litter-link">View Litter<ArrowRight size={18} aria-hidden="true" /></Link>}
            {videoHref && <a href={videoHref} className="puppy-video-link" target="_blank" rel="noreferrer"><CirclePlay size={19} aria-hidden="true" />{videoLabel}</a>}
          </div>}
        </div>
      </div>
    </article>
  );
}

import { ArrowRight, CirclePlay } from "lucide-react";
import { litterPuppyStatus } from "./litterPuppyStatus.js";

// Presentation only. All photos, facts, destinations, and video validation
// remain with the existing PuppyCard source-of-truth flow.
export default function LitterPuppyCard({
  puppy, breed, gender, photo, goHome, weight, price,
  route, inquiryHref, videoHref, videoLabel, Link
}) {
  const { label, tone } = litterPuppyStatus(puppy.status);
  return (
    <article className={`litter-puppy-card litter-puppy-profile is-${tone}`}>
      <div className={`litter-puppy-status is-${tone}`}>{label}</div>
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
        <dl className="litter-puppy-timing"><div><dt>Go home</dt><dd>{goHome}</dd></div></dl>
        <div className="litter-puppy-actions">
          {route && <Link href={route} className={`button litter-puppy-primary${tone === "available" ? " primary" : " secondary"}`}>View {puppy.name}<ArrowRight size={20} aria-hidden="true" /></Link>}
          {inquiryHref && <Link href={inquiryHref} className="litter-puppy-inquiry">Ask about {puppy.name}<ArrowRight size={18} aria-hidden="true" /></Link>}
          {videoHref && <a href={videoHref} className="puppy-video-link" target="_blank" rel="noreferrer"><CirclePlay size={19} aria-hidden="true" />{videoLabel}</a>}
        </div>
      </div>
    </article>
  );
}

import { ArrowRight, CirclePlay } from "lucide-react";

// Presentation only: availability, destinations, notes, and photos are resolved
// by PuppyCard so the profile keeps the same source-of-truth and buyer flow.
export default function PuppyDetailCard({
  puppy, breed, gender, status, displayStatus, photo, litterName,
  goHome, weight, birthDate, price, puppyNote, availabilityNote,
  primaryHref, primaryLabel, inquiryHref, litterRoute, videoHref,
  videoLabel, Link
}) {
  return (
    <article className="detail-puppy-card puppy-profile-card">
      <figure className="puppy-profile-photo">
        {photo ? (
          <img src={photo} alt={`${puppy.name} - ${breed}`} />
        ) : (
          <div className="puppy-profile-photo-placeholder" role="img" aria-label={`${puppy.name} puppy photo coming soon`}>
            Photo coming soon
          </div>
        )}
        <figcaption className={`puppy-profile-status status-${status.toLowerCase().replace(/\W+/g, "-")}`}>
          <span aria-hidden="true" />{displayStatus}
        </figcaption>
      </figure>
      <div className="puppy-profile-body">
        <header className="puppy-profile-heading">
          <div className="puppy-profile-title-row">
            <h1>{puppy.name}</h1>
            {price && <p className="puppy-profile-price"><span className="sr-only">Price: </span>{price}</p>}
          </div>
          <p className="puppy-profile-breed">{breed}</p>
          <p className="puppy-profile-summary">
            <span>{gender}</span><span aria-hidden="true"> · </span>
            <span><span className="sr-only">Estimated adult weight: </span>{weight}</span>
            {(puppy.estimatedAdultWeight || puppy.size) && <span> as an adult</span>}
          </p>
        </header>
        <dl className="puppy-profile-facts">
          <div className="puppy-profile-timing"><dt>Go-home timing</dt><dd>{goHome}</dd></div>
          <div><dt>{litterName === "Litter to be announced" ? "Litter" : "Parents"}</dt><dd>{litterName}</dd></div>
          {birthDate && <div><dt>Born</dt><dd>{birthDate}</dd></div>}
          {puppy.collarColor && <div className="puppy-profile-collar"><dt className="sr-only">Collar</dt><dd>{puppy.collarColor} collar</dd></div>}
        </dl>
        {(puppyNote || availabilityNote) && (
          <div className="puppy-profile-notes">
            {puppyNote && <p>{puppyNote}</p>}
            {availabilityNote && <p>{availabilityNote}</p>}
          </div>
        )}
        <div className="puppy-profile-actions">
          <Link href={primaryHref} className="button primary puppy-profile-primary">
            {primaryLabel}<ArrowRight size={22} aria-hidden="true" />
          </Link>
          {inquiryHref && <Link href={inquiryHref} className="puppy-profile-inquiry">Ask about {puppy.name}<ArrowRight size={18} aria-hidden="true" /></Link>}
          {(videoHref || litterRoute) && (
            <div className="puppy-profile-secondary">
              {videoHref && <a href={videoHref} target="_blank" rel="noreferrer"><CirclePlay size={20} aria-hidden="true" />{videoLabel}</a>}
              {litterRoute && <Link href={litterRoute}>View Litter<ArrowRight size={20} aria-hidden="true" /></Link>}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

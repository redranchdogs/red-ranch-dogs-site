import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { containTabFocus } from "./focus.js";

export default function PhotoLightbox({ items = [], activeIndex = 0, onClose, onIndexChange, title = "Photo gallery" }) {
  const closeButtonRef = useRef(null);
  const dialogRef = useRef(null);
  const touchStartRef = useRef(null);
  const activeItem = items[activeIndex];
  const hasPrevious = activeIndex > 0;
  const hasNext = activeIndex < items.length - 1;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  useEffect(() => {
    if (!activeItem) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "ArrowLeft" && hasPrevious) {
        event.preventDefault();
        onIndexChange(activeIndex - 1);
      } else if (event.key === "ArrowRight" && hasNext) {
        event.preventDefault();
        onIndexChange(activeIndex + 1);
      }
      containTabFocus(event, [...dialogRef.current.querySelectorAll("button:not([disabled]):not([tabindex='-1'])")]);
    };

    if (document.activeElement?.disabled) closeButtonRef.current?.focus();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, activeItem, hasNext, hasPrevious, onClose, onIndexChange]);

  useEffect(() => {
    if (!activeItem || typeof window === "undefined") return undefined;

    [items[activeIndex - 1], items[activeIndex + 1]].filter(Boolean).forEach((item) => {
      const preload = new window.Image();
      preload.src = item.src;
    });

    return undefined;
  }, [activeIndex, activeItem, items]);

  if (!activeItem) return null;

  const goToPrevious = () => {
    if (hasPrevious) onIndexChange(activeIndex - 1);
  };

  const goToNext = () => {
    if (hasNext) onIndexChange(activeIndex + 1);
  };

  const onTouchStart = (event) => {
    if (event.touches.length !== 1) {
      touchStartRef.current = null;
      return;
    }

    touchStartRef.current = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
  };

  const onTouchEnd = (event) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || event.changedTouches.length !== 1) return;

    const end = event.changedTouches[0];
    const deltaX = end.clientX - start.x;
    const deltaY = end.clientY - start.y;
    if (Math.abs(deltaX) < 44 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;

    if (deltaX > 0) {
      goToPrevious();
    } else {
      goToNext();
    }
  };

  return (
    <div ref={dialogRef} className="photo-lightbox" role="dialog" aria-modal="true" aria-label={title}>
      <button className="photo-lightbox-backdrop" type="button" tabIndex={-1} aria-hidden="true" aria-label="Close photo gallery" onClick={onClose} />
      <div className="photo-lightbox-panel">
        <div className="photo-lightbox-toolbar">
          <p>{activeItem.caption || title}</p>
          <button className="icon-button photo-lightbox-close" type="button" aria-label="Close photo gallery" onClick={onClose} ref={closeButtonRef}>
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <div className="photo-lightbox-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <button className="icon-button photo-lightbox-nav previous" type="button" aria-label="Previous photo" onClick={goToPrevious} disabled={!hasPrevious}>
            <ChevronLeft size={26} aria-hidden="true" />
          </button>
          <img src={activeItem.src} alt={activeItem.alt || activeItem.caption || title} />
          <button className="icon-button photo-lightbox-nav next" type="button" aria-label="Next photo" onClick={goToNext} disabled={!hasNext}>
            <ChevronRight size={26} aria-hidden="true" />
          </button>
        </div>
        <p className="photo-lightbox-count" role="status" aria-live="polite" aria-atomic="true">{activeIndex + 1} / {items.length}</p>
      </div>
    </div>
  );
}

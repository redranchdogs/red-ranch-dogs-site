let activeGallery = null;
const scrollLocks = new Set();
let previousOverflow;

export function claimGallery(owner) {
  const previous = activeGallery;
  activeGallery = owner;
  if (previous && previous !== owner) previous.cancel();
  return () => {
    if (activeGallery === owner) activeGallery = null;
  };
}

export function ownsGallery(owner) {
  return activeGallery === owner;
}

export function hasActiveGallery() {
  return activeGallery !== null;
}

export function lockGalleryScroll() {
  const token = {};
  if (scrollLocks.size === 0) previousOverflow = document.body.style.overflow;
  scrollLocks.add(token);
  document.body.style.overflow = "hidden";
  return () => {
    if (!scrollLocks.delete(token)) return;
    if (scrollLocks.size === 0) {
      document.body.style.overflow = previousOverflow;
      previousOverflow = undefined;
    }
  };
}

import assert from "node:assert/strict";
import { claimGallery, ownsGallery, hasActiveGallery, lockGalleryScroll } from "../src/gallerySession.js";

let canceled = 0;
const first = { cancel: () => { canceled += 1; } };
const second = { cancel: () => { throw new Error("Newest owner must not cancel itself"); } };
const releaseFirst = claimGallery(first);
const releaseSecond = claimGallery(second);
assert.equal(canceled, 1);
assert(ownsGallery(second));
releaseFirst();
assert(ownsGallery(second), "Old cleanup must not clear the newer owner");
releaseSecond();
assert(!hasActiveGallery());

const originalDocument = globalThis.document;
try {
  for (const initial of ["", "auto", "hidden"]) {
    for (const order of [[0, 1], [1, 0]]) {
      globalThis.document = { body: { style: { overflow: initial } } };
      const releases = [lockGalleryScroll(), lockGalleryScroll()];
      assert.equal(document.body.style.overflow, "hidden");
      releases[order[0]]();
      releases[order[0]]();
      assert.equal(document.body.style.overflow, "hidden", "Partial or repeated cleanup must retain the other lock");
      releases[order[1]]();
      assert.equal(document.body.style.overflow, initial, "Final cleanup must restore the original value in either order");
    }
  }
} finally {
  if (originalDocument === undefined) delete globalThis.document;
  else globalThis.document = originalDocument;
}
console.log("Gallery session PASS: one owner; old cleanup cannot clear successor; overlapping scroll locks release idempotently in either order and preserve original overflow.");

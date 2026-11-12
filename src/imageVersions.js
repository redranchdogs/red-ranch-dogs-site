// Logical image paths remain stable for source sheets; these aliases avoid stale browser caches.
export const imageVersions = Object.freeze({
  "/images/puppies/2026-11-10/daisy/betty-lou-week-2-img-8804.webp": "/images/puppies/2026-11-10/daisy/betty-lou-week-2-img-8804-v7275460802a8.webp",
  "/images/puppies/2026-11-10/daisy/betty-lou-week-2-img-8805.webp": "/images/puppies/2026-11-10/daisy/betty-lou-week-2-img-8805-vea135463a706.webp",
  "/images/puppies/2026-11-10/evie/columbo-week-4-img-8688.webp": "/images/puppies/2026-11-10/evie/columbo-week-4-img-8688-va89daf9a89de.webp",
  "/images/puppies/2026-11-10/evie/columbo-week-4-img-8691.webp": "/images/puppies/2026-11-10/evie/columbo-week-4-img-8691-v548c7ddb1f5e.webp",
  "/images/puppies/2026-11-10/evie/columbo-week-4-img-8693.webp": "/images/puppies/2026-11-10/evie/columbo-week-4-img-8693-vf0e98505ed44.webp",
  "/images/puppies/2026-11-10/daisy/grinch-week-2-img-8789.webp": "/images/puppies/2026-11-10/daisy/grinch-week-2-img-8789-vf4d87a3c6510.webp",
  "/images/puppies/2026-11-10/daisy/grinch-week-2-img-8790.webp": "/images/puppies/2026-11-10/daisy/grinch-week-2-img-8790-v286fbf3f1513.webp",
  "/images/puppies/2026-11-10/daisy/grinch-week-2-img-8793.webp": "/images/puppies/2026-11-10/daisy/grinch-week-2-img-8793-v742b5c91b2d3.webp",
  "/images/puppies/2026-11-10/birdie/laurie-week-2-img-8696.webp": "/images/puppies/2026-11-10/birdie/laurie-week-2-img-8696-v8574cdbb7a9c.webp",
  "/images/puppies/2026-11-10/birdie/laurie-week-2-img-8698.webp": "/images/puppies/2026-11-10/birdie/laurie-week-2-img-8698-vd5e0237bd76d.webp",
  "/images/puppies/2026-11-10/birdie/marmee-week-2-img-8747.webp": "/images/puppies/2026-11-10/birdie/marmee-week-2-img-8747-v56722a0df3a4.webp",
  "/images/puppies/2026-11-10/birdie/marmee-week-2-img-8749.webp": "/images/puppies/2026-11-10/birdie/marmee-week-2-img-8749-v2881b452a0fe.webp",
  "/images/puppies/2026-11-10/lulu/merryweather-week-4-img-8620.webp": "/images/puppies/2026-11-10/lulu/merryweather-week-4-img-8620-v22bc5cfc539c.webp",
  "/images/puppies/2026-11-10/evie/evie-orange-collar-boy-week-4-img-8667.webp": "/images/puppies/2026-11-10/evie/evie-orange-collar-boy-week-4-img-8667-vb21127a129bf.webp",
  "/images/puppies/2026-11-10/evie/evie-orange-collar-boy-week-4-img-8669.webp": "/images/puppies/2026-11-10/evie/evie-orange-collar-boy-week-4-img-8669-v40f5237d9349.webp"
});

export function resolveImageUrl(value) {
  return typeof value === "string" && Object.hasOwn(imageVersions, value) ? imageVersions[value] : value;
}

export function resolveImageReferences(value) {
  if (Array.isArray(value)) return value.map(resolveImageReferences);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolveImageReferences(item)]));
  return resolveImageUrl(value);
}

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, URL } from "node:url";

const audit = fileURLToPath(new URL("./audit-current-litter-media.mjs", import.meta.url));
const root = fs.mkdtempSync(path.join(os.tmpdir(), "rrd-media-stage-test-"));
const base = { slug: "litter", name: "Litter", status: "Current Litter", birthConfirmed: true,
  publicListingStage: "awaiting-puppy-profiles", puppySlugs: [], weeklyUpdateGallery: [], mamaSlug: "mama", studSlug: "stud" };
const parents = [{ slug: "mama", mainPhoto: "/images/mama.webp" }, { slug: "stud", mainPhoto: "/images/stud.webp" }];
try {
  fs.mkdirSync(path.join(root, "src/data"), { recursive: true });
  fs.mkdirSync(path.join(root, "public/images"), { recursive: true });
  for (const image of ["mama.webp", "stud.webp", "week-1.webp"]) fs.writeFileSync(path.join(root, "public/images", image), "fixture");
  const run = (litter, puppies = [], parentData = parents) => {
    for (const [name, data] of Object.entries({ litters: [litter], puppies, parents: parentData })) {
      fs.writeFileSync(path.join(root, "src/data", `${name}.json`), JSON.stringify(data));
    }
    return spawnSync(process.execPath, [audit], { cwd: root, encoding: "utf8" });
  };
  let result = run(base);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /awaiting individual profiles and media/);
  for (const litter of [
    { ...base, birthConfirmed: false },
    { ...base, publicListingStage: "puppy-profiles-live" },
    { ...base, puppySlugs: undefined },
    { ...base, mamaSlug: "missing" },
  ]) assert.equal(run(litter).status, 1);
  assert.equal(run(base, [{ slug: "orphan", litterSlug: "litter" }]).status, 1);
  assert.equal(run({ ...base, puppySlugs: ["missing"] }).status, 1);
  assert.equal(run({ ...base, weeklyUpdateGallery: ["/images/missing.webp"] }).status, 1);
  const puppy = { slug: "pup", litterSlug: "litter", mainPhoto: "/images/missing.webp", weeklyPhotos: [{ week: "Week 1", photos: ["/images/missing.webp"] }] };
  const live = { ...base, publicListingStage: "puppy-profiles-live", puppySlugs: ["pup"], weeklyUpdateStatus: "Week 1" };
  assert.equal(run(live, [puppy]).status, 1, "A live profile without media must fail.");
  assert.equal(run({ ...live, weeklyUpdateGallery: ["/images/week-1.webp"] }, [puppy]).status, 1, "Missing referenced puppy photos must fail.");
  assert.equal(run({ ...live, weeklyUpdateGallery: ["/images/week-1.webp"] }, [{ ...puppy, mainPhoto: "/images/week-1.webp", weeklyPhotos: [{ week: "Week 1", photos: ["/images/week-1.webp"] }] }]).status, 0);
  console.log("Current litter media stage regression passed: intentional pending stage and protected failure cases.");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

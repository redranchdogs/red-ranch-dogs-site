import assert from "node:assert/strict";
import { upcomingBirthTime, compareUpcomingLitters } from "../src/upcomingLitterOrder.js";

assert.equal(upcomingBirthTime({ birthDate: "October 9, 2026", birthConfirmed: true }), Date.UTC(2026, 9, 9));
assert.equal(upcomingBirthTime({ birthDate: "Estimated October 11-16, 2026" }), Date.UTC(2026, 9, 11));
assert.equal(upcomingBirthTime({ expectedTiming: "Due any day; estimated October 11–16, 2026" }), Date.UTC(2026, 9, 11));
assert.equal(upcomingBirthTime({ birthDate: "Expected early October 2026" }), Date.UTC(2026, 9, 1));
assert.equal(upcomingBirthTime({ birthDate: "2026-10-20" }), Date.UTC(2026, 9, 20));
assert.equal(upcomingBirthTime({ birthDate: "2026-13-01" }), Infinity);
assert.equal(upcomingBirthTime({ birthDate: "April 31, 2026" }), Infinity);
assert.equal(upcomingBirthTime({ birthDate: "Date to be confirmed", goHomeDate: "January 1, 2026" }), Infinity);
assert.equal(upcomingBirthTime({ birthDate: "October 20, 2026", expectedTiming: "October 19, 2026", birthConfirmed: true }), Date.UTC(2026, 9, 20));
const records = [
  { slug: "birdie", birthDate: "Date to be confirmed", birthConfirmed: true },
  { slug: "late", birthDate: "Expected November 2026" },
  { slug: "evie", birthDate: "Estimated October 11-16, 2026" },
  { slug: "lulu", birthDate: "October 9, 2026" },
  { slug: "tie", birthDate: "October 11, 2026" },
  { slug: "unknown", birthDate: "Timing to be announced" }
];
assert.deepEqual(records.slice().sort(compareUpcomingLitters).map((r) => r.slug), ["lulu", "evie", "tie", "late", "birdie", "unknown"]);
assert.equal(compareUpcomingLitters(records[0], records[5]), 0);
console.log("Upcoming order passed: actual births, prefixed ranges, month estimates, stable ties, unknowns last, later Birdie after Evie, and no go-home fallback.");

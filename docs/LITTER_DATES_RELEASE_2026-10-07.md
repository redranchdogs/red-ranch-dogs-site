# Confirmed litter birth dates, October 7, 2026

Adam explicitly requested Website updates and deployment: Beatrix born September 28, 2026 with go-home November 19-21; Kylie actual birth date from Barn Ops with go-home November 14-15. Both retain their existing Upcoming classification in this date release. Subsequent Kylie Week 2 media/current-litter publication is a separate authorized step after photo matching.

Birth evidence: Barn owner's verified original-source capture October 7 at 16:18:57 UTC contains September 22 for all six Kylie puppies and September 28 for Beatrix puppies, consistent with the earlier accepted Kylie source and Adam's explicit Beatrix date. No Barn or CRM data was written.

Website changes are confined to these two litter records, actual-versus-estimated birth labeling and born badges, and the corresponding source guard and smoke expectations. An explicit `birthConfirmed` and `publicListingStage: awaiting-puppy-profiles` allow a born litter to stay in Upcoming while public puppy profiles are pending. The guard still rejects unconfirmed/missing-stage/future births, premature availability and puppy listings. All six guard scenarios passed in a disposable fixture directory.

Website Hub Litters Sheet targeted sync: spreadsheet `1oS382V4YJ9hMMYB78ixEDilJz2iETfIxwUuXMIxjK2U`, Litters rows 8 Kylie and 12 Beatrix, cells M/N/P/T/U/X only (12 cells). Full-row values/format/validation saved before the write; live pre-write equality checked, one atomic cell-value batch applied, and entire rows matched the backup plus exactly the intended changes afterward. Status, parent identities, prices, theme, images, links and internal notes were preserved. No full-sheet replacement. Backup/readback under the task's `website-ui-audits/2026-10-07/litter-dates` folder.

Checks: content, source, buyer flow, lint, freshness/media/image-budget, form/GA4 contracts, public safety, analytics/CRM intake, mocked form/security tests, routes, build, bundle budget and public route smoke passed. SEO and deploy-package passed. In-app browser verified both actual Birth Date labels and requested go-home windows, retained Upcoming links and no individual puppies published.

Sheet review has only the previously documented unrelated Kylie theme mismatch: Website blank versus Sheet Moonlit Manor. The aggregate publish gate therefore remains failed at this existing drift; all changed date/copy cells match. The scope does not authorize erasing or changing that theme. Production follows the approved candidate-to-main Git release path.

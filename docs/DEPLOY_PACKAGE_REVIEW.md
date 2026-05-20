# Deploy Package Review

Generated: 5/20/2026, 1:22:17 PM Central

Status: **PASS**

Referenced images checked: 155

## Blockers

- None flagged.

## Warnings

- None flagged.

## What This Checks

- The production `dist/` folder exists and has built JS/CSS assets.
- Required public files are present: `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, manifest, app icons, and logo.
- Website image references are present in the deploy package.
- Private bridge/form config names and Apps Script URLs are not leaking into the public build.
- Production crawler files point to `www.redranchdogs.com`.

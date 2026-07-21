# Agent Guide

This repository powers Marca Tatem's personal site and music release landing pages. It has
two deploy surfaces:

- Static site at `https://marca.fyi`, built from `main.ts` and deployed to GitHub Pages
  from `dist`.
- Dynamic CAPI/stats endpoint at `https://fyi.marcatatem.deno.net`, served by `capi.ts` on
  Deno Deploy.

Read these resources before changing behavior:

- [Architecture](docs/agent/architecture.md)
- [Data And Contracts](docs/agent/data-and-contracts.md)
- [Change Playbooks](docs/agent/change-playbooks.md)
- [Verification](docs/agent/verification.md)

## Working Style

- Keep the code direct and small. This project favors readable Deno scripts, typed Preact
  render functions, JSON-backed content, and thin utilities over framework ceremony.
- Use the import map aliases (`html/`, `data/`, `utils/`) instead of long relative paths
  when the code already does.
- Preserve the hand-coded feel of the static site. `capi.ts` and analytics dashboard are
  more pragmatic and can tolerate rougher edges, but keep new work typed and easy to
  inspect.
- Generated output belongs in `dist`; do not hand-edit it.
- Static image URLs rendered by the site should continue to use `/img/...` paths in
  HTML/CSS, with Imgix-facing URLs created through `imgixAsset` where responsive image
  helpers are used.

## Safety Rules

- Do not break Meta Ads tracking on release pages. Changes touching
  `src/html/release.tsx`, `src/static/js/release.ts`, `src/data/music.json`, or `capi.ts`
  need an explicit check of Pixel + CAPI event names, event IDs, and link navigation.
- Do not commit production secrets. Deno Deploy supplies `ENV`, `PIXEL_ID`,
  `ACCESS_TOKEN`, optional `TEST_EVENT_CODE`, `TIKTOK_PIXEL_ID`, `TIKTOK_ACCESS_TOKEN`,
  optional `TIKTOK_TEST_EVENT_CODE`, and `STATS_PASSWORD`.
- Keep GitHub Pages static. Anything requiring request-time logic belongs in `capi.ts` or
  another separately deployed endpoint.
- When adding a music service, update the release link data and add any needed icon
  styling/assets for `storeId`.
- Run `deno fmt`, `deno lint`, `deno test -A`, and `deno task build -r` before considering
  work complete when code changes are made.

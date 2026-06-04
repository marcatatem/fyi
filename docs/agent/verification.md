# Verification

## Standard Checks

Run these after code changes:

```sh
deno fmt
deno lint
deno test -A
deno task build -r
```

GitHub Actions runs lint, tests, production build, Pages upload, Pages deploy, and a
Cloudflare cache purge for the homepage.

## Local Development

Build once:

```sh
deno task build
```

Watch rebuilds:

```sh
deno task dev
```

`deno task dev` depends on `nodemon` being available locally. If it is not present, use
repeated `deno task build` runs.

Serve the static output for visual checks:

```sh
deno task build
deno run --allow-net --allow-read https://deno.land/std@0.198.0/http/file_server.ts dist
```

Then open:

- Homepage: `http://localhost:4507/`
- Release page example: `http://localhost:4507/r/mouth-of-madness/`
- Grid overlay: add `?grid`
- Release localization debug: add `?debug-lang=fr`

The file server's default port may vary if 4507 is in use.

## CAPI Local Checks

Local development mode does not send CAPI events. You can still check routing:

```sh
deno run -A capi.ts
```

Expected behavior in development:

- `OPTIONS /` returns CORS headers.
- `POST /` returns `503` with `Not Authorized in development mode`.
- `GET /stats` renders the dashboard with local KV data if any exists.

Production behavior depends on Deno Deploy environment variables. Do not use real Meta
tokens in local logs or committed files.

## Release Page Manual QA

When changing release pages, verify:

- Cover art renders.
- Platform icons align in left-to-right and right-to-left modes.
- `More` scroll indicator disappears after scrolling on mobile.
- Platform links navigate even if CAPI is slow or blocked.
- `fbq` receives a `ViewContent` event with `eventID`.
- CAPI payload includes matching `eventId`, `trackName`, `storeName`, `campaign`, `_fbp`,
  `_fbc`, user agent, and source URL when available.

## Useful Commands

List generated release pages:

```sh
find dist/r -maxdepth 2 -name index.html -print
```

Search for tracking touchpoints:

```sh
rg "fbq|plausible|fyi.marcatatem.deno.net|eventId|ViewContent"
```

Inspect build-info:

```sh
cat dist/build-info.json
```

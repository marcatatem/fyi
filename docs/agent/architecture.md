# Architecture

## Deploy Surfaces

### Static site: `https://marca.fyi`

GitHub Actions runs the Deno build on pushes and PRs to `main`. The build renders HTML and
copies/bundles assets into `dist`, then GitHub Pages deploys that folder.

Main files:

- `main.ts`: build recipe. Copies static assets, bundles CSS/JS, renders the homepage,
  renders release pages from `src/data/music.json`, and writes `dist/build-info.json`.
- `src/html/app.tsx`: homepage shell.
- `src/html/release.tsx`: music release landing page shell.
- `src/static/js/app.ts`: homepage browser behavior.
- `src/static/js/release.ts`: release page localization, tracking, CAPI call, and outbound
  navigation.
- `src/static/css/styles.css`: homepage CSS entry point.
- `src/static/css/release.css`: release page CSS entry point.

### Dynamic endpoint: `https://fyi.marcatatem.deno.net`

`capi.ts` runs on Deno Deploy. It is separate from GitHub Pages because it receives POST
requests, forwards events to Meta Conversions API, writes Deno KV stats, and optionally
renders `/stats`.

Main files:

- `capi.ts`: request handling, CORS, Meta CAPI forwarding, KV writes, `/stats` auth.
- `src/utils/analytics.ts`: reads release metadata and hydrates KV counters for the
  dashboard.
- `src/html/dashboard.tsx`: simple server-rendered stats page.

## Build Flow

`deno task build` runs `deno run -A main.ts`.

`main.ts` does this in order:

1. Reads `-r` to choose `release` or `development` mode.
2. Gets the short git revision through `utils/git.ts`.
3. Copies static images, fonts, CSS, and music into `dist`.
4. Bundles homepage CSS and JS.
5. Renders `dist/index.html`.
6. Writes `dist/build-info.json`.
7. Renders one release page per entry in `src/data/music.json` under
   `dist/r/<parameterized-title>/index.html`.
8. Bundles release CSS and JS.

`utils/bundlers.ts` owns render and bundle details:

- Preact HTML is rendered with `preact-render-to-string`.
- HTML is formatted with Prettier.
- CSS is bundled with Lightning CSS.
- JS is bundled and minified with esbuild.

## Content Model

- Homepage content lives in `src/data/content.json`.
- Site metadata and Imgix host settings live in `src/data/meta.json`.
- Music release landing pages live in `src/data/music.json`.
- Structured data for the homepage lives in `src/data/schema.ts`.

The project currently relies on TypeScript types close to the rendering code rather than a
runtime validator. If the data model grows, prefer adding a small validation step to the
build over scattering defensive checks through templates.

## Asset Model

Source assets live under `src/static`. Build output mirrors those folders in `dist`.

- Images: `src/static/img`
- Fonts: `src/static/fonts`
- CSS: `src/static/css`
- Browser scripts: `src/static/js`
- Audio files: `src/static/music`

Use `pathForAsset` from `src/html/helpers.ts` when templates need revisioned script or
stylesheet paths. Use `imgixAsset` and `srcsetBuilder` for Imgix-backed responsive image
URLs.

## Coding Style Notes

- Modules are small, named exports are common, and functions usually sit close to the
  behavior they support.
- Comments are sparse and often file/function oriented. Add comments only when they
  clarify a non-obvious constraint.
- CSS is hand-authored, with entry files importing smaller pieces where helpful.
- Tests use Deno's built-in test runner and `std/assert`.

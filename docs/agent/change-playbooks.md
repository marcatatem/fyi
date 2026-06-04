# Change Playbooks

## Add A Music Release Landing Page

1. Add cover art under `src/static/img/releases/`.
2. Add a release object to `src/data/music.json`.
3. Confirm each `storeId` already has an icon rule in `src/static/css/release.css`.
4. If adding a new platform, add its SVG under `src/static/img/releases/` and a CSS rule
   for `a.<storeId>`.
5. Run `deno task build -r`.
6. Inspect `dist/r/<release-slug>/index.html`.
7. Run lint and tests before finishing.

Tracking checks:

- The release page should include the configured Pixel ID.
- Each platform link should include `data-store-id` and `data-store-name`.
- The page should have `data-track-name` on `#release`.

## Add Or Change Homepage Content

1. Edit `src/data/content.json` for copy/content changes.
2. Edit `src/data/meta.json` for page description, icons, Imgix host, or preload settings.
3. Edit TSX components only if the content shape changes.
4. Run `deno task build -r` and inspect `dist/index.html`.

Keep homepage changes static. If a feature requires live server logic, do not put it in
GitHub Pages output.

## Change Release Page Behavior

Files to review together:

- `src/html/release.tsx`
- `src/static/js/release.ts`
- `src/static/css/release.css`
- `capi.ts` if payload shape or CAPI behavior changes

Preserve the click flow: Pixel, Plausible, CAPI, then navigation. If navigation timing
changes, test slow/failing network behavior so platform links still work.

## Change CAPI Or Stats

Files to review together:

- `capi.ts`
- `src/static/js/release.ts`
- `src/utils/analytics.ts`
- `src/html/dashboard.tsx`

Keep `capi.ts` deployable to Deno Deploy with no Node-only APIs. Avoid adding build steps
for the dynamic endpoint unless the deploy setup is updated too.

For stats changes, maintain backwards compatibility with existing KV keys or add a clear
migration/fallback path.

## Add A Utility

Prefer a small module under `utils/` for build-time helpers and under `src/utils/` for
site/runtime data helpers. Add focused Deno tests when the behavior is reusable or easy to
regress.

## Add A Dependency

Dependencies are managed through `import_map.json` and locked in `deno.lock`. Prefer
Deno/npm dependencies that work under Deno. After changing dependencies, run:

```sh
deno cache --reload main.ts capi.ts
deno test -A
deno task build -r
```

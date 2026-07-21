# Data And Contracts

## Music Release Data

Release pages are generated from `src/data/music.json`. Each item is treated as a
`Release`:

```ts
{
  title: string;
  artist: string;
  releaseDate: string;
  cover: string;
  pixel: string;
  links: Array<{
    store: string;
    storeId: string;
    url: string;
  }>;
}
```

Important contracts:

- `title` is displayed and used to generate the URL slug with `parameterize`.
- `cover` is a path relative to `/img`, usually `releases/name.jpg`.
- `pixel` is injected into Meta Pixel initialization on the release page.
- `storeId` becomes a CSS class on the platform link. It must match release CSS icon
  styles such as `.spotify`, `.apple_music`, or `.youtube_music`.
- `store` is sent to Plausible and CAPI and appears in stats.

Release URL pattern:

```txt
https://marca.fyi/r/<parameterized-title>/
```

## Release Tracking Contract

`src/html/release.tsx` renders:

- Meta Pixel bootstrap script.
- `fbq('init', release.pixel)`.
- `fbq('track', 'PageView')`.
- Link metadata attributes:
  - `data-store-id`
  - `data-store-name`
  - `data-track-name` on `#release`

`src/static/js/release.ts` handles clicks:

1. Prevents default navigation.
2. Reads store and track metadata.
3. Generates one `eventId`.
4. Sends browser Pixel `ViewContent` with `{ eventID: eventId }`.
5. Sends Plausible event `Platform Click <store>`.
6. POSTs the same event ID and metadata to `https://fyi.marcatatem.deno.net/`.
7. Waits for the CAPI request or a short timeout, then navigates.

Do not rename the event or remove deduplication without checking Meta Events Manager.
Pixel and CAPI dedupe relies on the browser event ID matching the CAPI `event_id`.

## CAPI Endpoint Contract

`capi.ts` accepts release page POST bodies shaped like:

```json
{
  "eventId": "string",
  "eventName": "ViewContent",
  "trackName": "Mouth of Madness",
  "storeName": "Spotify",
  "campaign": "default",
  "fbp": "optional cookie",
  "fbc": "optional cookie",
  "userAgent": "browser UA",
  "url": "source URL"
}
```

Production CORS allows `https://marca.fyi`. Development currently allows `*` but returns
`503` for POST requests so real CAPI events are not sent locally.

Production environment variables:

- `ENV=production`
- `PIXEL_ID`
- `ACCESS_TOKEN`
- `TIKTOK_PIXEL_ID` for TikTok Pixel and Events API routes
- `TIKTOK_ACCESS_TOKEN` for TikTok Events API
- `TIKTOK_TEST_EVENT_CODE` optionally routes TikTok server events to Test Events. TikTok
  routes can also pass a temporary `TIKTOK_T_E=TEST...` query parameter for one-off
  server-side Test Events.
- `STATS_PASSWORD` for `/stats` Basic auth
- `TEST_EVENT_CODE` optionally routes events to Meta test events

## KV Stats Contract

When Meta reports `events_received`, `capi.ts` increments Deno KV counters:

```txt
["stats", songSlug, "total"]
["stats", songSlug, "campaign", campaignName, "total"]
["stats", songSlug, "campaign", campaignName, "store", storeName]
["stats", songSlug, "geo", countryCode]
```

`src/utils/analytics.ts` reads those keys and joins them with `src/data/music.json`. If a
slug exists in KV but not in `music.json`, the dashboard falls back to partial metadata.

## Homepage Data

Homepage content is JSON-driven from `src/data/content.json`. The renderer expects:

- `about` content and image metadata.
- `sections` with names, dates, optional `hidden`, and content/media data consumed by
  section components.

Use `markdown` from `src/html/helpers.ts` for trusted author-controlled Markdown. Do not
feed user-submitted content into `dangerouslySetInnerHTML`.

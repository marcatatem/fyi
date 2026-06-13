import music from "data/music.json" with { type: "json" };
import platforms from "data/platforms.json" with { type: "json" };

import type { Release } from "main.ts";
import type { RenderingMode } from "html/app.tsx";
import { parameterize, pathForAsset } from "html/helpers.ts";

type MusicPlatform = {
  name: string;
  storeId: string;
  url: string;
};

export type MusicPageProps = {
  mode: RenderingMode;
  revision: string;
};

const datedReleases = [...(music as Release[])].sort((a, b) =>
  Date.parse(b.releaseDate) - Date.parse(a.releaseDate)
);
const trackReleases = datedReleases.filter((release) => release.artist === "Marca");
const latestTrack = datedReleases.find((release) => release.artist === "Marca");
const releaseHref = (release: Release) => `/r/${parameterize(release.title)}/`;
const pageTitle = "Marca Makes Music";
const pageDescription = "French Touch and Soft Machines.";
const canonicalUrl = "https://marca.fyi/music/";
const previewImageUrl = "https://marca.fyi/img/music-og.png";
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "name": pageTitle,
  "url": canonicalUrl,
  "description": pageDescription,
  "image": previewImageUrl,
  "sameAs": (platforms as MusicPlatform[]).map((platform) => platform.url).concat([
    "https://thoughts-and-things.ghost.io/",
    "https://www.instagram.com/marcamakesmusic/",
  ]),
  "track": trackReleases.map((release) => ({
    "@type": "MusicRecording",
    "name": release.title,
    "url": `https://marca.fyi${releaseHref(release)}`,
    "datePublished": release.releaseDate,
    "image": `https://marca.fyi${pathForAsset("img", release.cover)}`,
    "byArtist": {
      "@type": "MusicGroup",
      "name": "Marca",
    },
  })),
};
const formatDate = (releaseDate: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(releaseDate));

export const MusicPage = (props: MusicPageProps) => (
  <html lang="en-US">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:type" content="music.musician" />
      <meta property="og:site_name" content="marca.fyi" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={previewImageUrl} />
      <meta property="og:image:secure_url" content={previewImageUrl} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="1200" />
      <meta property="og:image:alt" content="Marca Makes Music logo" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={previewImageUrl} />
      <meta name="twitter:image:alt" content="Marca Makes Music logo" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        type="text/css"
        href={pathForAsset("css", "music.css", {
          mode: props.mode,
          revision: props.revision,
        })}
      />
      <script defer data-domain="marca.fyi" src="https://plausible.io/js/script.js">
      </script>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
    </head>
    <body>
      <main class="music-page">
        <header class="music-header">
          <p class="eyebrow">Marca Makes Music</p>
          <img
            class="music-logo"
            src={pathForAsset("img", "golden_ratio_logo.svg")}
            alt="Marca Makes Music"
          />
          <h1>Marca Makes Music</h1>
          <p>French Touch and Soft Machines.</p>
        </header>

        {latestTrack && (
          <section class="latest" aria-labelledby="latest-title">
            <div>
              <p class="eyebrow">Latest Track</p>
              <h2 id="latest-title">{latestTrack.title}</h2>
              <p>{formatDate(latestTrack.releaseDate)}</p>
              <a class="button-link" href={releaseHref(latestTrack)}>
                Pick your platform
              </a>
            </div>
            <a class="latest-cover" href={releaseHref(latestTrack)}>
              <img
                src={pathForAsset("img", latestTrack.cover)}
                alt={`${latestTrack.title} cover art`}
              />
            </a>
          </section>
        )}

        <section aria-labelledby="platforms-title">
          <div class="section-heading">
            <p class="eyebrow">Listen</p>
            <h2 id="platforms-title">Music Platforms</h2>
          </div>
          <ul class="platform-list">
            {(platforms as MusicPlatform[]).map((platform) => (
              <li key={platform.storeId}>
                <a
                  class={`platform-link ${platform.storeId}`}
                  href={platform.url}
                >
                  <span>{platform.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="releases-title">
          <div class="section-heading">
            <p class="eyebrow">Catalog</p>
            <h2 id="releases-title">Releases</h2>
          </div>
          <ol class="release-grid">
            {trackReleases.map((release) => (
              <li key={release.title}>
                <a class="release-card" href={releaseHref(release)}>
                  <img
                    src={pathForAsset("img", release.cover)}
                    alt={`${release.title} cover art`}
                  />
                  <span class="release-meta">
                    <span>{formatDate(release.releaseDate)}</span>
                  </span>
                  <strong>{release.title}</strong>
                </a>
              </li>
            ))}
          </ol>
        </section>

        <section class="notes" aria-label="Notes and social links">
          <div class="notes-links">
            <a href="https://thoughts-and-things.ghost.io/">
              Notes & Process <span>Read the blog</span>
            </a>
            <a href="https://www.instagram.com/marcatatem/">
              Personal Instagram <span>@marcatatem</span>
            </a>
          </div>
        </section>
      </main>
    </body>
  </html>
);

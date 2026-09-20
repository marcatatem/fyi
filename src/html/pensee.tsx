import meta from "data/meta.json" with { type: "json" };

import type { RenderingMode } from "html/app.tsx";
import { pathForAsset } from "html/helpers.ts";

export type PenseePageProps = {
  mode: RenderingMode;
  revision: string;
};

const pageTitle = "Pensée — Marca Tatem";
const pageDescription = "Pensée, a film presented by Marca Tatem.";
const canonicalUrl = "https://marca.fyi/pensee/";
const posterUrl = "https://marca.fyi/img/pensee/intro.png";
const videoUrl =
  "https://audio.stay-away.cc/marca-fyi/pensee/demo-pensee-final-cropped-v1.mp4";
const downloadUrl =
  "https://audio.stay-away.cc/marca-fyi/pensee/download/demo-pensee-final-cropped-v1.mp4";

export const PenseePage = (props: PenseePageProps) => (
  <html lang="en-US">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="robots" content="noindex, nofollow, noarchive" />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content="video.other" />
      <meta property="og:site_name" content="marca.fyi" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={posterUrl} />
      <meta property="og:image:secure_url" content={posterUrl} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="2468" />
      <meta property="og:image:height" content="2396" />
      <meta property="og:image:alt" content="Pensée, presented by Marca Tatem" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={posterUrl} />
      <meta name="twitter:image:alt" content="Pensée, presented by Marca Tatem" />

      {meta.head.preload.fonts?.map((font) => (
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href={pathForAsset("font", font)}
          crossorigin="anonymous"
        />
      ))}
      <link
        rel="stylesheet"
        type="text/css"
        href={pathForAsset("css", "styles.css", {
          mode: props.mode,
          revision: props.revision,
        })}
      />
      <link
        rel="stylesheet"
        type="text/css"
        href={pathForAsset("css", "pensee.css", {
          mode: props.mode,
          revision: props.revision,
        })}
      />
      {meta.head.icons?.map((version) => (
        <link
          rel={version.rel}
          type={version.type}
          sizes={version.sizes}
          href={pathForAsset("img", version.href)}
        />
      ))}
      <script defer data-domain="marca.fyi" src="https://plausible.io/js/script.js">
      </script>
    </head>
    <body>
      <main class="pensee-page">
        <div class="pensee-player">
          <video
            controls
            playsinline
            preload="metadata"
            poster={pathForAsset("img", "pensee/intro.png")}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser cannot play this video.{" "}
            <a href={downloadUrl}>Download Pensée</a>.
          </video>
        </div>

        <aside class="pensee-details">
          <div>
            <p class="pensee-site">
              <a href="/">Marca Tatem</a>
            </p>
            <h1>Pensée</h1>
            <p class="pensee-duration">9 min</p>
          </div>
          <a class="pensee-download" href={downloadUrl}>
            <span>Download</span>
            <small>MP4 · 192 MB</small>
          </a>
        </aside>
      </main>
    </body>
  </html>
);

import { getShortRevision } from "utils/git.ts";
import { AppProps } from "html/app.tsx";
import { rsync } from "utils/fs.ts";
import { log } from "utils/log.ts";
import {
  bundleScripts,
  bundleStylesheets,
  renderHTML,
  renderMusicPage,
  renderReleasePage,
} from "utils/bundlers.ts";
import music from "data/music.json" with { type: "json" };
import { ReleaseProps } from "html/release.tsx";
import { legacyParameterize, parameterize } from "html/helpers.ts";

/**
 *  FYI
 *
 *  Created by Marca Tatem <marca@me.com> on 2023-10-15.
 *  Copyright 2023 Marca Tatem. All rights reserved.
 */

// flags, we don't need to use a library for this simple flag
const release = Deno.args.includes("-r");

// get current code revision
const revision = getShortRevision();

// build context
const props: AppProps = {
  mode: release ? "release" : "development",
  revision: revision,
};

const googleTagId = Deno.env.get("GOOGLE_TAG_ID") || "AW-18187451330";
const googleConversionLabel = Deno.env.get("GOOGLE_CONVERSION_LABEL") ||
  "UGtHCIDomrkcEML3ueBD";
const tiktokPixelId = Deno.env.get("TIKTOK_PIXEL_ID") || "D9FCLNRC77UBS5FSISG0";

// start building
const t = performance.now();
// rsync static assets
await rsync("src/static/img", "dist/img");
await rsync("src/static/fonts", "dist/fonts");
await rsync("src/static/css", "dist/css");
await rsync("src/static/music", "dist/music");
// bundle and minify css and js
await bundleStylesheets(revision, "styles");
await bundleStylesheets(revision, "music");
await bundleScripts("app", revision);
// render tsx to html
await renderHTML(props);
await renderMusicPage(props);
// write revision and build time
const took = (performance.now() - t).toFixed();
Deno.writeTextFile(
  "dist/build-info.json",
  JSON.stringify({
    revision: revision,
    took: took,
  }),
);

// build releases
log("building", `release pages`);
try {
  await Deno.remove("dist/r", { recursive: true });
} catch (err) {
  if (!(err instanceof Deno.errors.NotFound)) throw err;
}

export interface Release {
  title: string;
  artist: string;
  releaseDate: string;
  cover: string;
  pixel: string;
  links: {
    store: string;
    storeId: string;
    url: string;
  }[];
}

for (const release of music) {
  console.log(release.title);
  const primarySlug = parameterize(release.title);
  const legacySlug = legacyParameterize(release.title);
  const releaseProps: ReleaseProps = {
    mode: props.mode,
    revision: props.revision,
    release: release as Release,
    adProvider: "meta",
  };
  await renderReleasePage(release.title, releaseProps);
  if (legacySlug !== primarySlug) {
    await renderReleasePage(release.title, releaseProps, undefined, legacySlug);
  }

  const googleReleaseProps: ReleaseProps = {
    mode: props.mode,
    revision: props.revision,
    release: release as Release,
    adProvider: "google",
    google: googleTagId
      ? {
        tagId: googleTagId,
        conversionLabel: googleConversionLabel,
      }
      : undefined,
  };
  await renderReleasePage(release.title, googleReleaseProps, "google");
  if (legacySlug !== primarySlug) {
    await renderReleasePage(release.title, googleReleaseProps, "google", legacySlug);
  }

  const tiktokReleaseProps: ReleaseProps = {
    mode: props.mode,
    revision: props.revision,
    release: release as Release,
    adProvider: "tiktok",
    tiktok: tiktokPixelId
      ? {
        pixelId: tiktokPixelId,
      }
      : undefined,
  };
  await renderReleasePage(release.title, tiktokReleaseProps, "tt");
  if (legacySlug !== primarySlug) {
    await renderReleasePage(release.title, tiktokReleaseProps, "tt", legacySlug);
  }
}

await bundleScripts("release", revision);
await bundleStylesheets(revision, "release");

// done
log("done", `build took ${took}ms`, "blue");
Deno.exit();

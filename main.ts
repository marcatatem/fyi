import { getShortRevision } from "utils/git.ts";
import { AppProps } from "html/app.tsx";
import { rsync } from "utils/fs.ts";
import { log } from "utils/log.ts";
import {
  bundleScripts,
  bundleStylesheets,
  renderHTML,
  renderReleasePage,
} from "utils/bundlers.ts";
import music from "data/music.json" with { type: "json" };
import { ReleaseProps } from "html/release.tsx";

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

// start building
const t = performance.now();
// rsync static assets
await rsync("src/static/img", "dist/img");
await rsync("src/static/fonts", "dist/fonts");
await rsync("src/static/css", "dist/css");
await rsync("src/static/music", "dist/music");
// bundle and minify css and js
await bundleStylesheets(revision, "styles");
await bundleScripts("app", revision);
// render tsx to html
await renderHTML(props);
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
  const releaseProps: ReleaseProps = {
    mode: props.mode,
    revision: props.revision,
    release: release as Release,
  };
  await renderReleasePage(release.title, releaseProps);
}

await bundleScripts("release", revision);
await bundleStylesheets(revision, "release");

// done
log("done", `build took ${took}ms`, "blue");
Deno.exit();

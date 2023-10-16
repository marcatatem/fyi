import { getShortRevision } from "utils/git.ts";
import { AppProps } from "html/app.tsx";
import { rsync } from "utils/fs.ts";
import { log } from "utils/log.ts";
import { bundleScripts, bundleStylesheets, renderHTML } from "utils/bundlers.ts";

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
// bundle and minify css and js
await bundleStylesheets(revision);
await bundleScripts(revision);
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
// done
log("done", `build took ${took}ms`, "blue");
Deno.exit();

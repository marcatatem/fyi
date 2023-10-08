import { bundle, Features } from "lightningcss";
import { format } from "prettier";
import { debounce } from "std/async/debounce.ts";
import { existsSync } from "std/fs/mod.ts";
import { extname, relative, resolve } from "std/path/mod.ts";
import { rsync } from "utils/rsync.ts";
import { log } from "utils/log.ts";
import {
  distCounterpart,
  fileType,
  mkdirUnlessExist,
  prepareDirectoryStructure,
} from "utils/fs.ts";
import { Handlebars, HandlebarsConfig } from "utils/vendor/handlebars.ts";
import { schema } from "./src/html/schema.ts";
import { short } from "utils/git.ts";

// flags, we don't need to use a library for these simple flags
const watch = Deno.args.includes("-w");
const release = Deno.args.includes("-r");

// creating a debounced handler
const debouncedHandler = debounce(handler, 200);

// handlebars config
const handlebars = new Handlebars(
  <HandlebarsConfig> {
    baseDir: "src/html",
    partialsDir: "components/",
    defaultLayout: "application",
    helpers: (await import("./src/html/helpers.ts")).default,
    cachePartials: false,
  },
);

// initial build
(async () => {
  const t = performance.now();
  // rsync static assets
  rsync("src/static", "dist");
  // bundle and minify stylesheets and scripts
  bundleStylesheets();
  buildScripts();
  // build HTML from handlebars templates and json data
  await buildHTML();
  log("done", `build took ${(performance.now() - t).toFixed(3)}ms`);
})();

// if watch flag is passed, watch for changes and update the dist folder
if (watch) {
  const watcher = Deno.watchFs("src", { recursive: true });
  log("watching", relative(".", "src"), "blue");
  for await (const event of watcher) {
    debouncedHandler(event.paths.at(0));
  }
}

/** handles any change in the src directory */
async function handler(file?: string) {
  if (!file) return;
  if (!existsSync(file)) {
    Deno.removeSync(distCounterpart(file));
    return;
  }
  const t = performance.now();
  const ext = extname(file).toLowerCase().slice(1);
  switch (fileType(ext)) {
    case "image":
      prepareDirectoryStructure(distCounterpart(file));
      rsync("src/static/images", "dist/static");
      break;
    case "font":
      prepareDirectoryStructure(distCounterpart(file));
      rsync("src/static/fonts", "dist/static");
      break;
    case "script":
      buildScripts();
      break;
    case "css":
      prepareDirectoryStructure(distCounterpart(file));
      rsync("src/static/styles.css", "dist/static");
      rsync("src/static/styles", "dist/static");
      bundleStylesheets();
      break;
    case "html" || "data":
      await buildHTML();
      break;
    case "icon":
    default:
      log("ignoring", `${file}`);
  }
  log("done", `build took ${(performance.now() - t).toFixed(3)}ms`);
  log("watching", relative(".", "src"), "blue");
}

/** bundles and minifies the stylesheets */
function bundleStylesheets() {
  log("bundle", "src/static/styles.css", "green");
  const { code } = bundle({
    filename: "src/static/styles.css",
    include: Features.MediaQueries,
  });
  Deno.writeTextFileSync(
    "dist/static/styles.bundled.css",
    new TextDecoder().decode(code).replaceAll("/static/", ""),
  );
}

/** bundles and minifies the scripts */
function buildScripts() {
  mkdirUnlessExist("dist/static/scripts");
  log("building", "src/static/scripts", "green");
  const cmd = new Deno.Command("npx", {
    args: [
      "esbuild",
      "src/scripts/main.ts",
      "--bundle",
      "--outdir=dist/static/scripts",
      "--minify",
      "--sourcemap",
    ],
  });
  const { code } = cmd.outputSync();
  if (code !== 0) {
    throw new Error(
      `Couldn't build src/scripts/main.ts, please install esbuild (npm i esbuild -g)`,
    );
  }
}

/** builds the HTML from handlebars templates and json data */
async function buildHTML() {
  log("building", "html", "green");
  const data = await import("data/data.json", {
    with: { type: "json" },
  });
  const html = await handlebars.renderView("routes/index", {
    data: data.default,
    meta: {
      release: release,
      schema: schema,
      rev: short(),
    },
  });
  const formatted = await format(html, {
    parser: "html",
    embeddedLanguageFormatting: "off",
  });
  Deno.writeTextFileSync(resolve("dist", "index.html"), formatted);
}

import { renderToString } from "preact-render-to-string";
import { format } from "prettier";
import { resolve } from "std/path/mod.ts";
import { bundle, Features } from "lightningcss";
import * as esbuild from "esbuild";
import { log } from "utils/log.ts";
import { mkDirSync } from "utils/fs.ts";
import { App, AppProps } from "html/app.tsx";

/**
 * Bundles and minifies stylesheets
 * @param revision - current code revision
 */
export async function bundleStylesheets(revision: string) {
  log("bundle", "src/static/css/styles.css", "green");
  const { code } = bundle({
    filename: "src/static/css/styles.css",
    include: Features.MediaQueries,
  });
  await Deno.writeTextFile(
    `dist/css/styles.bundled.${revision}.css`,
    new TextDecoder().decode(code),
  );
}

/**
 * Bundles and minifies scripts
 * @param revision - current code revision
 */
export async function bundleScripts(revision: string) {
  log("bundle", "src/static/js/app.ts", "green");
  mkDirSync("dist/js");
  await esbuild.build({
    bundle: true,
    minify: true,
    sourcemap: true,
    entryPoints: ["src/static/js/app.ts"],
    outfile: `dist/js/app.bundled.${revision}.js`,
  });
}

/**
 * Renders TSX templates and formats resulting HTML
 * @param release - whether the build is a release build
 * @param revision - current code revision
 */
export async function renderHTML(props: AppProps) {
  log("render", "html/app.tsx", "green");
  const html = renderToString(App(props));
  const formatted = await format("<!DOCTYPE html>" + html, {
    parser: "html",
    embeddedLanguageFormatting: "off",
  });
  await Deno.writeTextFile(resolve("dist", "index.html"), formatted);
}

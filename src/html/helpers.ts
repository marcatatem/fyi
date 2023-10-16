import meta from "data/meta.json" with { type: "json" };

import { paramCase } from "case";
import { RenderingMode } from "html/app.tsx";
import { basename, dirname, extname, relative, resolve } from "std/path/mod.ts";
import { Marked } from "markdown";
import smartypants from "smartypants";

/**
 * Wraps the passed string in a span for styling
 * @param str The string to wrap
 * @returns The wrapped string
 */
export function caesura(str: string): string {
  return str.replaceAll(/(-|–|—)/g, "<span>$1</span>");
}

export function esperluette(str: string, connector = " and "): string {
  return str.replaceAll(
    connector,
    `<span class="and">${connector}</span><span class=\"esperluette\"> & </span>`,
  );
}

/**
 * Parse a string of Markdown and smarten punctuation
 * @param str The string to parse
 * @returns The parsed string
 */
export function markdown(str: string): string {
  return Marked.parse(smartypants(str), { isNoP: true });
}

/**
 * Parameterize the passed string
 * @param str The string to parameterize
 * @returns The parameterized string (e.g. `hello world` -> `hello-world`)
 */
export function parameterize(str: string): string {
  return paramCase(str);
}

/**
 * Remove hyphens from the passed string
 * @param str The string to remove hyphens from
 * @returns The string without hyphens
 */
export function removeHyphens(str: string): string {
  return str.replaceAll(/(-|–|—)/g, "");
}

/**
 * Returns a media query string
 * @param dir The direction of the media query (e.g. min or max)
 * @param width The width of the media query
 * @param hidpi Whether the media query should be for a HiDPI display
 * @returns The media query string
 */
export function mediaQuery(dir: "min" | "max", width: number, hidpi = false): string {
  const query = [`screen and (${dir}-width: ${width}px)`];
  if (hidpi) {
    query.push("(-webkit-min-device-pixel-ratio: 2)");
    query.push("(min-resolution: 192dpi)");
  }
  return query.join(" and ");
}

/** Imgix URL options */
interface ImgixOptions {
  w?: number;
  h?: number;
  dpr?: number;
  fm?: string;
  lossless?: boolean;
  auto?: "format";
}

/**
 * Returns the Imgix URL for the passed image
 * @param path The path to the image
 * @param options The Imgix options
 * @returns The Imgix URL
 */
export function imgixAsset(path: string, options?: ImgixOptions) {
  const url = new URL(relative("/img", path), meta.settings.imgixHost);
  if (options) {
    for (const [k, v] of Object.entries(options)) {
      url.searchParams.append(k, String(v));
    }
  }
  return url.toString();
}

/**
 * Returns a srcset attribute for the passed image
 * @param src The path to the image
 * @param dprs The device pixel ratios
 * @param size The size of the image
 * @returns The srcset attribute
 */
export function srcsetBuilder(
  src: string,
  dprs: number[],
  size: string,
): string {
  const srcset: string[] = [];
  const [w, h] = size.split("x").map(Number);
  for (const dpr of dprs) {
    srcset.push(imgixAsset(src, { w, h, dpr, fm: "webp" }) + ` ${dpr}x`);
  }
  return srcset.join(", ");
}

export type AssetType = "js" | "css" | "img" | "font";

/**
 * Returns the path for the passed asset
 * @param assetType The type of asset
 * @param name The name of the asset
 * @param options The options for the asset (e.g. revision, mode)
 */
export function pathForAsset(
  assetType: AssetType,
  name: string,
  options?: { mode: RenderingMode; revision: string },
): string {
  const [filePath, fileName, extension] = [
    dirname(name),
    basename(name).replace(new RegExp(`${extname(name)}$`), ""),
    extname(name),
  ];
  switch (assetType) {
    case "js":
      return resolve(
        "/js",
        filePath,
        `${fileName}.bundled.${options?.revision}${extension}`,
      );
    case "css":
      return (options?.mode === "release")
        ? resolve(
          "/css",
          filePath,
          `${fileName}.bundled.${options?.revision}${extension}`,
        )
        : resolve("/css", filePath, `${fileName}${extension}`);
    case "img":
      return resolve("/img", filePath, `${fileName}${extension}`);
    case "font":
      return resolve("/fonts", filePath, `${fileName}${extension}`);
    default:
      throw new Error(`Unknown asset type: ${assetType}`);
  }
}

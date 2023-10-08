import { paramCase } from "case";
import { relative } from "std/path/mod.ts";
import { Marked } from "npm:@ts-stack/markdown";
import smartypants from "smartypants";
import data from "data/data.json" with { type: "json" };

export default {
  /**
   * Parameterize the passed string
   * @param str The string to parameterize
   * @returns The parameterized string (e.g. `hello world` -> `hello-world`)
   */
  parameterize(str: string): string {
    return paramCase(str);
  },
  /**
   * Parse a string of Markdown and smarten punctuation
   * @param str The string to parse
   * @returns The parsed string
   */
  markdown(str: string): string {
    return Marked.parse(smartypants(str));
  },
  /**
   * Serialize an object to JSON
   * @param obj The object to serialize
   * @returns The serialized object
   */
  stringify(obj: unknown): string {
    return JSON.stringify(obj);
  },
  /**
   * Get the path to the Imgix image
   * @param src The source image
   * @param {size} size of the image
   * @returns The new URL as string
   */
  imgix(src: string, size?: string): string {
    // baseImgixURL
    const url = new URL(
      relative("static/images", src),
      data.baseImgixURL,
    );
    if (typeof size === "string") {
      const [w, h] = size.split("x").map(Number);
      url.searchParams.set("w", String(w * 2));
      if (h) url.searchParams.set("h", String(h * 2));
    }
    // url.searchParams.set("auto", "format");
    return url.toString();
  },
};

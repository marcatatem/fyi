import { paramCase } from "case";
import { Marked } from "npm:@ts-stack/markdown";
import smartypants from "smartypants";

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
};

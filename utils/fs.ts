import fileTypes from "data/file_types.json" with { type: "json" };
import { dirname } from "std/path/mod.ts";

/**
 * Creates a directory if it doesn't exist.
 * @param path The path of the directory to create.
 * @param options The options to use when creating the directory.
 */
export function mkdirUnlessExist(path: string, options?: Deno.MkdirOptions) {
  try {
    Deno.mkdirSync(path, options ?? {});
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
}

/**
 * Returns the path to the dist counterpart of a file.
 * @param file The file to get the dist counterpart of.
 */
export function distCounterpart(file: string): string {
  return file.replace("src/", "dist/").replace(/\.ts$/, ".js");
}

/**
 * Returns the type of a file.
 * @param extension The extension of the file.
 * @returns The type of the file.
 */
export function fileType(
  extension: string,
): keyof typeof fileTypes | undefined {
  for (const [k, v] of Object.entries(fileTypes)) {
    if (v.includes(extension)) {
      return k as keyof typeof fileTypes;
    }
  }
}

/**
 * Creates the directory structure for a file.
 * @param file The file to create the directory structure for.
 */
export function prepareDirectoryStructure(file: string) {
  try {
    Deno.mkdirSync(dirname(file), { recursive: true });
  } catch (err) {
    console.log(err.code);
  }
}

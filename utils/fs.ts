// @ts-expect-error: improper type definitions
import { async as syncDirectory } from "rsyncjs";
import { resolve } from "std/path/mod.ts";
import { log } from "utils/log.ts";

/**
 * Synchronizes two directories using rsyncjs.
 * @param src Source directory
 * @param dest Destination directory
 * @throws {Error} If an error occurs during the sync
 */
export async function rsync(src: string, dest: string) {
  log("sync", src, "green");
  await syncDirectory(resolve(src), resolve(dest), {
    deleteOrphaned: true,
    onError(err: Error) {
      throw err;
    },
  });
}

/**
 * Creates a directory
 * @param path - Path to directory
 * @remark doesn't throw if directory already exists, might throw otherwise
 */
export function mkDirSync(path: string): string | never {
  try {
    Deno.mkdirSync(path);
  } catch (err) {
    if ((err as Error).cause !== "EEXIST") throw err;
  }
  return path;
}

import { log } from "utils/log.ts";

/**
 * Rsync a directory.
 * @param path The path of the directory to rsync.
 * @param dest The destination to rsync to.
 * @example
 * rsync("src/static", "dist");
 */
export function rsync(path: string, dest: string) {
  log("rsync", path, "green");
  const cmd = new Deno.Command("rsync", {
    args: ["-r", path, dest],
  });
  const { code } = cmd.outputSync();
  if (code !== 0) throw new Error(`Couldn't rsync ${path}`);
}

import { log } from "utils/log.ts";

/**
 * Get the current git commit hash
 * @returns {string} the current git commit hash
 */
export function short(): string | never {
  const cmd = new Deno.Command("git", {
    args: ["rev-parse", "--short", "HEAD"],
  });
  const { stdout, code, stderr } = cmd.outputSync();
  if (code !== 0) {
    throw new Error(
      `Couldn't get git revision (${new TextDecoder().decode(stderr).trim()})`,
    );
  }
  const rev = new TextDecoder().decode(stdout).trim();
  log("git revision", rev, "green");
  return rev;
}

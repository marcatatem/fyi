/**
 * Get the current git revision.
 * @returns {string} The current git revision.
 */
export function getShortRevision(): string {
  const cmd = new Deno.Command("git", {
    args: ["rev-parse", "--short", "HEAD"],
  });
  const { stdout, code } = cmd.outputSync();
  if (code !== 0) {
    return "unknown";
  }
  const rev = new TextDecoder().decode(stdout).trim();
  return rev;
}

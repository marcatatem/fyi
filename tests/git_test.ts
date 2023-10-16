import { getShortRevision } from "utils/git.ts";
import { assertMatch } from "std/assert/mod.ts";

Deno.test("getShortRevision", () => {
  const revision = getShortRevision();
  assertMatch(revision, /(unknown|[A-Fa-f0-9]+)/);
});

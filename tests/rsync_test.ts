import { assertEquals } from "std/assert/mod.ts";
import { rsync } from "utils/rsync.ts";

Deno.test("rsync", () => {
  rsync("src/data", "dist");
  assertEquals(Deno.statSync("dist/data/file_types.json").isFile, true);
  Deno.removeSync("dist/data", { recursive: true });
});

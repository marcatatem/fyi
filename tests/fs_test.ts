import * as fs from "utils/fs.ts";
import { assertEquals } from "std/assert/mod.ts";

Deno.test("fs", async (t) => {
  try {
    Deno.mkdirSync("dist/tests", { recursive: true });
    await t.step("rsync", async () => {
      await fs.rsync("src/data", "dist/tests");
      assertEquals(Deno.statSync("dist/tests/content.json").isFile, true);
    });
    await t.step("mkDirSync", () => {
      fs.mkDirSync("dist/tests/test");
      assertEquals(Deno.statSync("dist/tests/test").isDirectory, true);
    });
  } finally {
    Deno.removeSync("dist/tests", { recursive: true });
  }
});

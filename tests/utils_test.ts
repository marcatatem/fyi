import { assertEquals } from "std/assert/mod.ts";
import {
  distCounterpart,
  fileType,
  prepareDirectoryStructure,
} from "utils/fs.ts";

Deno.test("distCounterpart", () => {
  assertEquals(
    distCounterpart("src/static/style.css"),
    "dist/static/style.css",
  );
});

Deno.test("fileType", () => {
  assertEquals(fileType("css"), "css");
  assertEquals(fileType("js"), "script");
  assertEquals(fileType("doc"), undefined);
});

Deno.test("prepareDirectoryStructure", () => {
  prepareDirectoryStructure("dist/a/b/style.css");
  assertEquals(Deno.statSync("dist/a/b").isDirectory, true);
  Deno.removeSync("dist/a", { recursive: true });
});

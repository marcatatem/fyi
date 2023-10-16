import * as helpers from "html/helpers.ts";
import { assertEquals, assertThrows } from "std/assert/mod.ts";

import meta from "data/meta.json" with { type: "json" };

Deno.test("parameterize", () => {
  assertEquals(helpers.parameterize("hello world"), "hello-world");
});

Deno.test("markdown", () => {
  assertEquals(
    helpers.markdown("**hello** world, we're online!"),
    "<strong>hello</strong> world, we&#8217;re online!",
  );
});

Deno.test("caesura", () => {
  assertEquals(helpers.caesura("hello-world"), "hello<span>-</span>world");
});

Deno.test("removeHyphens", () => {
  assertEquals(helpers.removeHyphens("hello-world"), "helloworld");
});

Deno.test("mediaQuery", () => {
  assertEquals(helpers.mediaQuery("min", 1024), "screen and (min-width: 1024px)");
  assertEquals(
    helpers.mediaQuery("min", 1024, true),
    "screen and (min-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) and (min-resolution: 192dpi)",
  );
});

Deno.test("imgixAsset", () => {
  assertEquals(
    helpers.imgixAsset(helpers.pathForAsset("img", "foo.jpg")),
    `${meta.settings.imgixHost}foo.jpg`,
  );
  assertEquals(
    helpers.imgixAsset(helpers.pathForAsset("img", "foo.jpg"), { w: 100 }),
    `${meta.settings.imgixHost}foo.jpg?w=100`,
  );
  assertEquals(
    helpers.imgixAsset(helpers.pathForAsset("img", "foo.jpg"), {
      w: 100,
      auto: "format",
    }),
    `${meta.settings.imgixHost}foo.jpg?w=100&auto=format`,
  );
  assertThrows(() => {
    helpers.imgixAsset(helpers.pathForAsset("vids" as helpers.AssetType, "foo.mov"));
  });
});

Deno.test("srcsetBuilder", () => {
  assertEquals(
    helpers.srcsetBuilder(helpers.pathForAsset("img", "/img/foo.jpg"), [1, 2], "100x100"),
    `${meta.settings.imgixHost}foo.jpg?w=100&h=100&dpr=1&fm=webp 1x, ${meta.settings.imgixHost}foo.jpg?w=100&h=100&dpr=2&fm=webp 2x`,
  );
});

Deno.test("pathForAsset", () => {
  assertEquals(helpers.pathForAsset("img", "foo.jpg"), "/img/foo.jpg");
  assertEquals(
    helpers.pathForAsset("js", "foo.js", { mode: "development", revision: "123" }),
    "/js/foo.bundled.123.js",
  );
  assertEquals(
    helpers.pathForAsset("js", "foo.js", { mode: "release", revision: "123" }),
    "/js/foo.bundled.123.js",
  );
  assertEquals(helpers.pathForAsset("css", "foo.css"), "/css/foo.css");
  assertEquals(
    helpers.pathForAsset("css", "foo.css", { mode: "release", revision: "123" }),
    "/css/foo.bundled.123.css",
  );
  assertEquals(helpers.pathForAsset("font", "foo.woff2"), "/fonts/foo.woff2");
});

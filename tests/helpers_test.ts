import { assertEquals } from "std/assert/mod.ts";
import helpers from "../src/html/helpers.ts";

Deno.test("parameterize", () => {
  assertEquals(helpers.parameterize("hello world"), "hello-world");
});

Deno.test("markdown", () => {
  assertEquals(
    helpers.markdown("**hello** world, we're online!"),
    "<p><strong>hello</strong> world, we&#8217;re online!</p>\n",
  );
});

Deno.test("stringify", () => {
  assertEquals(helpers.stringify({ hello: "world" }), `{"hello":"world"}`);
});

Deno.test("imgix", () => {
  assertEquals(
    helpers.imgix("static/images/hello.jpg", "100x300"),
    "https://fyi.imgix.net/hello.jpg?w=200&h=600",
  );
  assertEquals(
    helpers.imgix("static/images/hello.jpg", "100x"),
    "https://fyi.imgix.net/hello.jpg?w=200",
  );
});

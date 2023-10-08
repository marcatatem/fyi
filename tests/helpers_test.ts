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

Deno.test("small", () => {
  assertEquals(helpers.small("hello.jpg"), "hello@small.jpg");
});

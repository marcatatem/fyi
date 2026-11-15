import { assertEquals, assertStringIncludes } from "std/assert/mod.ts";
import { renderToString } from "preact-render-to-string";
import { ReleaseApp, type ReleaseProps } from "html/release.tsx";

const releaseProps = (
  releaseDate: string,
  adProvider: ReleaseProps["adProvider"] = "meta",
) => ({
  mode: "release" as const,
  revision: "test",
  adProvider,
  release: {
    title: "Test Track",
    artist: "Marca",
    releaseDate,
    cover: "releases/test.jpg",
    pixel: "123",
    links: [{ store: "Spotify", storeId: "spotify", url: "https://example.com" }],
  },
});

Deno.test("future releases are noindex and render the availability state", () => {
  const html = renderToString(ReleaseApp(releaseProps("2999-11-26T08:00:00.000Z")));

  assertStringIncludes(html, '<meta name="robots" content="noindex, follow"/>');
  assertStringIncludes(html, 'data-release-date="2999-11-26T08:00:00.000Z"');
  assertStringIncludes(html, 'id="release-availability"');
  assertStringIncludes(html, 'id="links-list" hidden');
});

Deno.test("released Meta pages remain indexable and show their links", () => {
  const html = renderToString(ReleaseApp(releaseProps("2000-01-01T00:00:00.000Z")));

  assertEquals(html.includes('name="robots"'), false);
  assertEquals(html.includes('id="consent-banner"'), false);
  assertEquals(html.includes('id="links-list" hidden'), false);
  assertStringIncludes(html, 'id="release-availability" hidden');
});

Deno.test("the consent banner remains exclusive to Google pages", () => {
  const props = releaseProps("2000-01-01T00:00:00.000Z", "google");
  const html = renderToString(ReleaseApp({
    ...props,
    google: { tagId: "AW-123", conversionLabel: "label" },
  }));

  assertStringIncludes(html, 'id="consent-banner" hidden');
});

Deno.test("TikTok pages remain noindex after release", () => {
  const html = renderToString(
    ReleaseApp(releaseProps("2000-01-01T00:00:00.000Z", "tiktok")),
  );

  assertStringIncludes(html, '<meta name="robots" content="noindex, follow"/>');
});

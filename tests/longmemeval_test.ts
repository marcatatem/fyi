import { assertEquals, assertRejects } from "std/assert/mod.ts";
import { dirname, resolve } from "std/path/mod.ts";
import { pullLongMemEval } from "../scripts/pull-longmemeval.ts";

const page = `<!DOCTYPE html>
<html lang="en"><head><title>LongMemEval questions · Pensée</title></head>
<body><h2>231 of 250 questions pass (92.4%)</h2>
<h3>Expected response</h3><p>Expected answer</p>
<h3>Kit’s response</h3><p>Actual answer</p>
<script>addEventListener("hashchange", () => {});</script></body></html>`;
const plausibleScript =
  '<script defer data-domain="marca.fyi" src="https://plausible.io/js/script.js"></script>';
const robotsMeta = '<meta name="robots" content="noindex, nofollow, noarchive">';
const trackedPage = page.replace("</head>", `${robotsMeta}\n${plausibleScript}\n</head>`);

async function withFixture(
  test: (source: string, input: string, output: string) => Promise<void>,
): Promise<void> {
  const directory = await Deno.makeTempDir({ prefix: "fyi longmemeval " });
  try {
    const source = resolve(directory, "pensee checkout");
    const input = resolve(
      source,
      "evals/private-mem0-benchmark/question-site/index.html",
    );
    const output = resolve(directory, "snapshot/index.html");
    await Deno.mkdir(dirname(input), { recursive: true });
    await test(source, input, output);
  } finally {
    await Deno.remove(directory, { recursive: true });
  }
}

Deno.test("LongMemEval pull adds site analytics and noindex while preserving its source", async () => {
  await withFixture(async (source, input, output) => {
    await Deno.writeTextFile(input, page);
    await Deno.writeTextFile(resolve(dirname(input), "receipt.json"), "private receipt");
    await Deno.writeTextFile(
      resolve(dirname(dirname(input)), "ledger.json"),
      "private ledger",
    );
    assertEquals(await pullLongMemEval(source, output), {
      sourceFile: input,
      outputFile: output,
    });
    assertEquals(await Deno.readTextFile(output), trackedPage);
    assertEquals(await Deno.readTextFile(input), page);
    const files = [];
    for await (const file of Deno.readDir(dirname(output))) files.push(file.name);
    assertEquals(files, ["index.html"]);
  });
});

Deno.test("LongMemEval pull replaces the prior snapshot on repeated updates", async () => {
  await withFixture(async (source, input, output) => {
    await Deno.writeTextFile(input, page);
    await pullLongMemEval(source, output);
    const updated = page.replace("Actual answer", "Updated answer");
    await Deno.writeTextFile(input, updated);
    await pullLongMemEval(source, output);
    const html = await Deno.readTextFile(output);
    assertEquals(html, trackedPage.replace("Actual answer", "Updated answer"));
    assertEquals(html.split(plausibleScript).length - 1, 1);
    assertEquals(html.split(robotsMeta).length - 1, 1);
  });
});

Deno.test("LongMemEval pull refuses internal metadata and live pages before writing", async () => {
  await withFixture(async (source, input, output) => {
    await Deno.writeTextFile(input, page);
    await pullLongMemEval(source, output);
    for (
      const forbidden of [
        '<div class="note k-failed">Assessment note</div>',
        "<dl><dt>Source files</dt><dd>/private/receipt.json</dd></dl>",
        '<script>const assessmentNote = "private";</script>',
        '<script>new EventSource("/__events");</script>',
        '<script>fetch("ledger.json");</script>',
        '<script src="http://localhost:8787/app.js"></script>',
        plausibleScript,
      ]
    ) {
      await Deno.writeTextFile(input, page.replace("</body>", forbidden + "</body>"));
      await assertRejects(() => pullLongMemEval(source, output), Error, "Refusing");
      assertEquals(await Deno.readTextFile(output), trackedPage);
    }
  });
});

Deno.test("LongMemEval pull preserves the snapshot when the source is missing or invalid", async () => {
  await withFixture(async (source, input, output) => {
    await Deno.writeTextFile(input, page);
    await pullLongMemEval(source, output);
    await Deno.remove(input);
    await assertRejects(() => pullLongMemEval(source, output), Deno.errors.NotFound);
    await Deno.writeTextFile(input, "not an HTML export");
    await assertRejects(() => pullLongMemEval(source, output), Error, "Expected");
    assertEquals(await Deno.readTextFile(output), trackedPage);
  });
});

Deno.test("LongMemEval pull requires a head boundary for site metadata", async () => {
  await withFixture(async (source, input, output) => {
    await Deno.writeTextFile(input, page);
    await pullLongMemEval(source, output);
    await Deno.writeTextFile(input, page.replace("</head>", ""));
    await assertRejects(() => pullLongMemEval(source, output), Error, "Expected");
    assertEquals(await Deno.readTextFile(output), trackedPage);
  });
});

Deno.test("LongMemEval pull enforces one parent-matching robots tag on every refresh", async () => {
  await withFixture(async (source, input, output) => {
    for (
      const tag of [
        robotsMeta,
        '<meta name="robots" content="index, follow">',
        "<meta content='index, follow' NAME = 'ROBOTS' />",
      ]
    ) {
      const original = page.replace("</head>", `${tag}</head>`);
      await Deno.writeTextFile(input, original);
      await pullLongMemEval(source, output);
      assertEquals(await Deno.readTextFile(output), trackedPage);
      assertEquals(await Deno.readTextFile(input), original);
    }
  });
});

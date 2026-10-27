import { dirname, fromFileUrl, resolve } from "std/path/mod.ts";

const snapshotFile = fromFileUrl(
  new URL("../src/static/pensee/longmemeval/index.html", import.meta.url),
);
const plausibleScript =
  '<script defer data-domain="marca.fyi" src="https://plausible.io/js/script.js"></script>';

/** Copies only Pensée's generated shareable HTML, never its private ledger or receipts. */
export async function pullLongMemEval(
  penseeDirectory: string,
  outputFile = snapshotFile,
): Promise<{ sourceFile: string; outputFile: string }> {
  const sourceFile = resolve(
    penseeDirectory,
    "evals/private-mem0-benchmark/question-site/index.html",
  );
  const html = await Deno.readTextFile(sourceFile);
  validateSnapshot(html);
  const siteHtml = html.replace(/<\/head\s*>/i, `${plausibleScript}\n</head>`);
  await Deno.mkdir(dirname(outputFile), { recursive: true });
  await Deno.writeTextFile(outputFile, siteHtml);
  return { sourceFile, outputFile };
}

function validateSnapshot(html: string): void {
  if (
    !/^<!doctype html>/i.test(html.trimStart()) ||
    !html.includes("<title>LongMemEval questions · Pensée</title>") ||
    !/<\/head\s*>/i.test(html) ||
    !html.includes("<h3>Expected response</h3>") ||
    !html.includes("<h3>Kit’s response</h3>")
  ) {
    throw new Error("Expected the generated, shareable LongMemEval HTML export.");
  }
  // Catch an old internal viewer or a live development page before replacing the snapshot.
  if (
    /class="note(?:\s|")|<(?:dt|h3)>\s*(?:Source files|Response basis|Saved question attempts|Prep only|Original benchmark reference)\s*</i
      .test(
        html,
      ) ||
    /\b(?:assessmentNote|failureReason|interruptionReason|sourceFiles|evaluationHistory)\b/
      .test(
        html,
      ) ||
    /\bfetch\s*\(|\bEventSource\s*\(|\/__events|<script\b[^>]*\bsrc\s*=/i.test(
      html,
    )
  ) {
    throw new Error(
      "Refusing an internal or live page. Rebuild Pensée's shareable static question site first.",
    );
  }
}

if (import.meta.main) {
  if (Deno.args.length !== 1 || Deno.args[0].startsWith("-")) {
    console.error("Usage: deno task pensee:longmemeval /path/to/pensee");
    Deno.exit(1);
  }
  const result = await pullLongMemEval(Deno.args[0]);
  console.log(`Updated ${result.outputFile}`);
  console.log("Run deno task build -r to include the snapshot at /pensee/longmemeval/.");
}

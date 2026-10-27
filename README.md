# marca.fyi

Visit the website here: [marca.fyi](https://marca.fyi)

This is an automated builder for my personal [website](https://marca.fyi). While it might
appear a bit extravagant for crafting a single HTML page, this project is all about
showcasing some best practices that can scale to larger endeavors. It includes features
such as CI/CD integration, comprehensive documentation, testing capabilities, dynamic page
generation from JSON data, assets bundling, and more.

## Requirements

- **Deno**: The project runs on Deno. You need to have it installed on your system.

### Installation

Follow the steps below to set up the environment:

```bash
curl -fsSL https://deno.land/x/install/install.sh | sh
```

## Building the Website

To build the website, use the command:

```bash
deno task build
```

### Flags

- **Release Mode** (-r): Use this to build the website for release or production. This
  will bundle JavaScript and CSS assets.

```bash
deno task build -r
```

## Pensée LongMemEval Snapshot

The static results page is served at `/pensee/longmemeval/`, alongside the existing
`/pensee/` video page. Its checked-in source is
`src/static/pensee/longmemeval/index.html`; normal builds copy it into `dist` without
needing the Pensée checkout or any benchmark data.

To refresh it, first regenerate the shareable static page in the Pensée repository:

```bash
cd /path/to/pensee
deno task eval:mem0:site
```

Then, from this repository, pass the Pensée checkout path to the pull task:

```bash
deno task pensee:longmemeval /path/to/pensee
deno task build -r
```

The pull task copies only the generated `question-site/index.html`. It does not copy
private JSON, transcripts, logs, or receipts, and it rejects known internal-viewer or
live-development exports. It does not sanitize arbitrary HTML: use Pensée's shareable
exporter. After validation, the importer adds the same `marca.fyi` Plausible pageview
script used by the Pensée video page, so tracking survives each refresh. It does not send
question text or answers as analytics properties. Refreshing and building do not deploy
the site.

## Conclusion

Happy building! Remember, the essence of this project isn't just about generating a
webpage but showcasing the robust practices that can be applied to more substantial
projects.

import content from "data/content.json" with { type: "json" };
import meta from "data/meta.json" with { type: "json" };

import { AppProps } from "html/app.tsx";
import { pathForAsset } from "html/helpers.ts";
import { schema } from "data/schema.ts";

export const Head = ({ mode, revision }: AppProps) => {
  return (
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Marca Tatem — FYI</title>
      <meta name="description" content={meta.head.description} />
      <meta property="og:title" content="Marca Tatem" />
      <meta property="og:image" content={pathForAsset("img", content.about.image.src)} />
      <meta property="og:description" content={meta.head.description} />
      {meta.head.preload.fonts?.map((font) => (
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href={pathForAsset("font", font)}
        />
      ))}
      <link
        rel="stylesheet"
        type="text/css"
        href={pathForAsset("css", "styles.css", { mode, revision })}
      />
      <script src={pathForAsset("js", "app.js", { mode, revision })} defer>
      </script>
      {meta.head.icons?.map((version) => (
        <link
          rel={version.rel}
          type={version.type}
          sizes={version.sizes}
          href={pathForAsset("img", version.href)}
        />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      >
      </script>
    </head>
  );
};

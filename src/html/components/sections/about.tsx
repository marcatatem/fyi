import content from "data/content.json" with { type: "json" };

import { AppProps } from "html/app.tsx";
import { imgixAsset, markdown, pathForAsset, srcsetBuilder } from "html/helpers.ts";

export const About = ({ mode }: AppProps) => {
  return (
    <section id="about">
      <div class="columns">
        <div class="span-4 heading" id="trigger">
          {(mode === "development")
            ? (
              <img
                alt={content.about.image.alt}
                src={pathForAsset("img", content.about.image.src)}
                width="128"
                height="128"
              />
            )
            : (
              <img
                alt={content.about.image.alt}
                src={imgixAsset(
                  pathForAsset("img", content.about.image.src),
                  { fm: "jpg" },
                )}
                width="128"
                height="128"
                srcset={srcsetBuilder(pathForAsset("img", content.about.image.src), [
                  1,
                  2,
                  3,
                ], "128x128")}
              />
            )}
        </div>
        <div class="span-7 content">
          <p class="source">
            The source code for this website is available on{" "}
            <a href="https://github.com/marcatatem/fyi">GitHub</a>.
          </p>
          <p class="contact">
            <a href="mailto:marca@me.com">marca@me.com</a>
            <br />
            <a
              href="https://www.linkedin.com/in/marca-tatem/"
              class="linked-in"
            >
              LinkedIn
            </a>
            <br />
            <a href="https://thoughts-and-things.ghost.io" class="linked-in">
              Thoughts and Things
            </a>&nbsp;(Blog)
          </p>
        </div>
      </div>
    </section>
  );
};

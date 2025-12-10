import content from "data/content.json" with { type: "json" };

import { Head } from "html/components/head.tsx";
import { Header } from "html/components/header.tsx";
import { Footer } from "html/components/footer.tsx";
import { About } from "html/components/sections/about.tsx";
import { Section } from "html/components/sections/section.tsx";
import { markdown, parameterize, removeHyphens } from "./helpers.ts";

export type RenderingMode = "development" | "release";

export type AppProps = {
  mode: RenderingMode;
  revision: string;
};

export const App = (props: AppProps) => {
  return (
    <html lang="en-US">
      <Head {...props} />
      <body>
        <header>
          <div class="columns" id="trigger">
            <hgroup>
              <h1>Marca Tatem</h1>
              <h2>Resume and Portfolio</h2>
              <p dangerouslySetInnerHTML={{ __html: markdown(content.about.content) }} />
              <nav>
                <ul>
                  {content.sections?.map((section) => {
                    if (!section.hidden) {
                      return (
                        <li>
                          <a
                            href={`#${parameterize(removeHyphens(section.name))}`}
                            class="smooth"
                          >
                            <span class="at">{removeHyphens(section.name)}</span>
                            <span class="year">{section.date}</span>
                          </a>
                        </li>
                      );
                    }
                  })}
                </ul>
              </nav>
            </hgroup>
          </div>
        </header>
        {content.sections?.map((section) => (
          <Section mode={props.mode} section={section} />
        ))}
        <About mode={props.mode} revision={props.revision} />
        <Footer />
      </body>
    </html>
  );
};

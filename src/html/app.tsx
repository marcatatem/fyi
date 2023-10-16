import content from "data/content.json" with { type: "json" };

import { Head } from "html/components/head.tsx";
import { Header } from "html/components/header.tsx";
import { Footer } from "html/components/footer.tsx";
import { About } from "html/components/sections/about.tsx";
import { Section } from "html/components/sections/section.tsx";

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
        <Header />
        <article>
          <About {...props} />
          {content.sections?.map((section) => (
            <Section mode={props.mode} section={section} />
          ))}
        </article>
        <Footer />
      </body>
    </html>
  );
};

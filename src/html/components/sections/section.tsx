import content from "data/content.json" with { type: "json" };

import { RenderingMode } from "html/app.tsx";
import { Figure } from "html/components/figure.tsx";
import {
  caesura,
  esperluette,
  markdown,
  parameterize,
  removeHyphens,
} from "html/helpers.ts";

type SectionProps = {
  mode: RenderingMode;
  section: typeof content.sections[0];
};

export const Section = ({ mode, section }: SectionProps) => {
  return (
    <>
      <section id={parameterize(removeHyphens(section.name))}>
        <div class="columns">
          <div class="span-4 heading">
            <hgroup>
              <h2
                dangerouslySetInnerHTML={{ __html: caesura(section.name) }}
              />
              {section.role && (
                <p dangerouslySetInnerHTML={{ __html: esperluette(section.role) }} />
              )}
              <p>{section.displayDate}</p>
            </hgroup>
          </div>
          <div
            class="span-7 content"
            dangerouslySetInnerHTML={{ __html: markdown(section.content) }}
          >
          </div>
        </div>
      </section>
      {section.figure &&
        <Figure mode={mode} figure={section.figure} />}
    </>
  );
};

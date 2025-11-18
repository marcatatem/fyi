// deno-lint-ignore-file jsx-curly-braces
import content from "data/content.json" with { type: "json" };

import { parameterize, removeHyphens } from "html/helpers.ts";

export const Header = () => {
  return (
    <header>
      <div class="inner">
        <hgroup>
          <h1>
            <a href="#about" class="smooth">Marca Tatem</a>
          </h1>
          <p>Resume and Portfolio</p>
        </hgroup>
        <nav>
          <a href="#menu" class="close menu">Close</a>
          <ul class="primary">
            {content.sections?.map((section) => {
              if (!section.hidden) {
                return (
                  <li>
                    <a
                      href={`#${parameterize(removeHyphens(section.name))}`}
                      class="smooth"
                    >
                      <span class="at">{removeHyphens(section.name)}{" "}</span>
                      <span class="year">{section.date}</span>
                    </a>
                  </li>
                );
              }
            })}
          </ul>
          <ul class="secondary">
            <li>
              <a href="https://github.com/marcatatem/fyi" class="icon github">
                GitHub
              </a>
            </li>
          </ul>
        </nav>
        <a href="#menu" class="open menu">Menu</a>
      </div>
    </header>
  );
};

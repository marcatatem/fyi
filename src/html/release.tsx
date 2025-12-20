import { pathForAsset } from "./helpers.ts";
import { Release } from "main.ts";

export type RenderingMode = "development" | "release";

export type ReleaseProps = {
  mode: RenderingMode;
  revision: string;
  release: Release;
};

export const ReleaseApp = (props: ReleaseProps) => {
  return (
    <html lang="en-US">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Marca Tatem" />
        <meta property="og:image" content={pathForAsset("img", props.release.cover)} />
        <title>Stream {props.release.title}</title>
        <script
          src={pathForAsset("js", "app.js", {
            mode: props.mode,
            revision: props.revision,
          })}
          defer
        />
        <script>
          {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '1203822274417281');
        fbq('track', 'PageView');
        `}
        </script>
        <noscript>
          <img
            height="1"
            width="1"
            style="display:none"
            src="https://www.facebook.com/tr?id=1203822274417281&ev=PageView&noscript=1"
          />
        </noscript>
        <link
          rel="stylesheet"
          type="text/css"
          href={pathForAsset("css", "release.css", {
            mode: props.mode,
            revision: props.revision,
          })}
        />
        <script defer data-domain="marca.fyi" src="https://plausible.io/js/script.js">
        </script>
      </head>
      <body>
        <article>
          <div id="cover">
            <img
              src={pathForAsset("img", props.release.cover)}
              alt={props.release.title}
            />
          </div>
          <div id="content">
            <div className="content-inner">
              <h1>{props.release.title}</h1>
              <h2>{props.release.artist}</h2>
              <ul>
                {props.release.links?.map((link) => (
                  <li key={link.storeId}>
                    <a href={link.url} className={link.storeId}>
                      {link.store}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </body>
    </html>
  );
};

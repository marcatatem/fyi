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
          src={pathForAsset("js", "release.js", {
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
        fbq('init', '${props.release.pixel}');
        fbq('track', 'PageView');
        `}
        </script>
        <noscript>
          <img
            height="1"
            width="1"
            style="display:none"
            src={`https://www.facebook.com/tr?id=${props.release.pixel}&ev=PageView&noscript=1`}
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
        <script async src="https://plausible.io/js/pa-Z6i4g_NOUqBuY2d6WJJ4t.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
              plausible.init()
            `,
          }}
        />
      </head>
      <body>
        <article id="release" data-track-name={props.release.title}>
          <div id="cover">
            <img
              src={pathForAsset("img", props.release.cover)}
              alt={props.release.title}
            />
          </div>
          <div id="content">
            <div className="content-inner">
              <h1>{props.release.title}</h1>
              <h2 id="platform-heading">Pick your platform</h2>
              <ul id="links-list">
                {props.release.links?.map((link) => {
                  return (
                    <li key={link.storeId}>
                      <a
                        href={link.url}
                        data-store-id={link.storeId}
                        data-store-name={link.store}
                        className={link.storeId}
                      >
                        {link.store}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </article>

        {/* Changed to an anchor tag pointing to the list */}
        <a id="scroll-more" href="#links-list">More</a>
      </body>
    </html>
  );
};

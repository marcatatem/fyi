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
        <script defer data-domain="marca.fyi" src="https://plausible.io/js/script.js">
        </script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            document.addEventListener("DOMContentLoaded", function() {
              var translations = {
                pt: "Selecione sua plataforma",
                es: "Selecciona tu plataforma",
                de: "Wählen Sie Ihre Plattform aus",
                fr: "Sélectionnez votre plateforme",
                pl: "Wybierz platformę",
                it: "Seleziona la tua piattaforma",
                nl: "Selecteer uw platform",
                tr: "Platformunuzu seçin",
                cs: "Vyberte platformu",
                sv: "Välj din plattform",
                no: "Velg din plattform",
                he: "בחר את הפלטפורמה שלך",
                hu: "Válassza ki a platformját",
                da: "Vælg din platform",
                uk: "Оберіть платформу",
                ru: "Выберите платформу",
                ro: "Selectați platforma",
                ja: "プラットフォームを選択してください",
                ko: "플랫폼을 선택하세요",
                zh: "选择您的平台",
                bg: "Изберете platформа",
                vi: "Chọn nền tảng của bạn",
                ar: "اختر منصتك",
                fa: "پلتفرم خود را انتخاب کنید"
              };

              var translationsMore = {
                pt: "Mais",
                es: "Más",
                de: "Mehr",
                fr: "Plus",
                pl: "Więcej",
                it: "Altro",
                nl: "Meer",
                tr: "Daha fazla",
                cs: "Více",
                sv: "Mer",
                no: "Mer",
                he: "עוד",
                hu: "Tovább",
                da: "Mere",
                uk: "Ще",
                ru: "Ещё",
                ro: "Mai mult",
                ja: "もっと",
                ko: "더 보기",
                zh: "更多",
                bg: "Още",
                vi: "Xem thêm",
                ar: "المزيد",
                fa: "بیشتر"
              };

              var rtlLangs = ['he', 'ar', 'fa', 'ur'];
              var urlParams = new URLSearchParams(window.location.search);
              var debugLang = urlParams.get('debug-lang');
              var userLang = navigator.language || navigator.userLanguage;

              var langCode = debugLang ? debugLang : (userLang ? userLang.split('-')[0] : 'en');

              var text = translations[langCode];
              var textMore = translationsMore[langCode];

              var heading = document.getElementById("platform-heading");
              var scrollMore = document.getElementById("scroll-more");

              if (text && heading) {
                if (rtlLangs.indexOf(langCode) !== -1) {
                  document.documentElement.dir = "rtl";
                  document.documentElement.lang = langCode;
                }
                heading.innerText = text;
              }

              if (textMore && scrollMore) {
                scrollMore.innerText = textMore;
              }

              window.addEventListener('scroll', function() {
                if (window.scrollY > 5) {
                  document.body.classList.add('is-scrolled');
                } else {
                  document.body.classList.remove('is-scrolled');
                }
              });

              // --- Plausible platform click tracking (Direct Binding) ---
              // Select all anchor tags inside the list immediately
              var links = document.querySelectorAll("#links-list a");

              // Loop through each link and attach a specific listener
              links.forEach(function(link) {
                link.addEventListener("click", function(e) {
                  
                  // 1. Get data directly from the element ('link' is the <a> tag)
                  var href = link.getAttribute("href");
                  var storeName = link.getAttribute("data-store-name");

                  // Basic validation
                  if (!href || !storeName) return;

                  // Optional: Respect new tab clicks (cmd+click or target="_blank")
                  // We return early to let the browser handle these natively
                  if (link.target === "_blank" || e.metaKey || e.ctrlKey) {
                      return;
                  }

                  // 2. Prepare Tracking
                  storeName = storeName.trim();
                  var eventName = "Platform Click " + storeName;

                  // If Plausible isn't loaded/blocked, stop here (browser handles nav normally)
                  if (typeof window.plausible !== "function") return;

                  // 3. Intercept Navigation
                  e.preventDefault();

                  var isNavigating = false;
                  var navigate = function() {
                      if (isNavigating) return;
                      isNavigating = true;
                      window.location.href = href;
                  };

                  // 4. Send Event with Callback
                  window.plausible(eventName, {
                    callback: navigate,
                    props: { platform: storeName }
                  });

                  // 5. Safety Timeout (Fallback for iOS/WebView/AdBlockers)
                  setTimeout(navigate, 150);
                });
              });


            });
            `,
          }}
        />
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

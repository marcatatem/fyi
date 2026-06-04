// deno-lint-ignore-file

declare global {
  interface Window {
    plausible: (
      eventName: string,
      options?: { callback?: () => void; [key: string]: any },
    ) => void;
    fbq: (
      action: string,
      eventName: string,
      params: { [key: string]: any },
      options?: { [key: string]: any },
    ) => void;
    gtag: (
      command: string,
      eventName: string,
      params?: { [key: string]: any },
    ) => void;
  }
}

type Locale =
  | "pt"
  | "es"
  | "de"
  | "fr"
  | "pl"
  | "it"
  | "nl"
  | "tr"
  | "cs"
  | "sv"
  | "no"
  | "he"
  | "hu"
  | "da"
  | "uk"
  | "ru"
  | "ro"
  | "ja"
  | "ko"
  | "zh"
  | "bg"
  | "vi"
  | "ar"
  | "fa";

const rtlLangs: Locale[] = ["he", "ar", "fa"];

interface LocalizationTable {
  platform: Record<Locale, string>;
  more: Record<Locale, string>;
}

const localizationTable: LocalizationTable = {
  platform: {
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
    fa: "پلتفرم خود را انتخاب کنید",
  },
  more: {
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
    fa: "بیشتر",
  },
};

// CAPI helpers

const generateEventId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
};

interface GoogleClickContext {
  gclid?: string;
  wbraid?: string;
  gbraid?: string;
  campaign: string;
  source?: string;
  medium?: string;
  term?: string;
  content?: string;
  landingUrl: string;
  capturedAt: string;
}

const googleClickStorageKey = "marcaGoogleClickContext";

const getStoredGoogleClickContext = (): GoogleClickContext | undefined => {
  try {
    const stored = sessionStorage.getItem(googleClickStorageKey);
    return stored ? JSON.parse(stored) : undefined;
  } catch (_) {
    return undefined;
  }
};

const captureGoogleClickContext = (
  url: URL,
  campaign: string,
): GoogleClickContext | undefined => {
  const context: GoogleClickContext = {
    gclid: url.searchParams.get("gclid") ?? undefined,
    wbraid: url.searchParams.get("wbraid") ?? undefined,
    gbraid: url.searchParams.get("gbraid") ?? undefined,
    campaign: campaign,
    source: url.searchParams.get("utm_source") ?? undefined,
    medium: url.searchParams.get("utm_medium") ?? undefined,
    term: url.searchParams.get("utm_term") ?? undefined,
    content: url.searchParams.get("utm_content") ?? undefined,
    landingUrl: window.location.href,
    capturedAt: new Date().toISOString(),
  };

  if (!context.gclid && !context.wbraid && !context.gbraid) {
    return getStoredGoogleClickContext();
  }

  try {
    sessionStorage.setItem(googleClickStorageKey, JSON.stringify(context));
  } catch (_) {
    // Session storage is best effort. The click event still carries live URL data.
  }

  return context;
};

document.addEventListener("DOMContentLoaded", () => {
  const url = new URL(window.location.href);
  // get campaign if available
  const campaign = url.searchParams.get("utm_campaign") ||
    url.searchParams.get("campaign") || "default";
  const release = document.getElementById("release");
  const adProvider = release?.getAttribute("data-ad-provider") || "meta";
  const googleSendTo = release?.getAttribute("data-google-send-to") || undefined;
  const googleClickContext = adProvider === "google"
    ? captureGoogleClickContext(url, campaign)
    : undefined;
  // show grid if needed
  if (url.searchParams.has("grid")) {
    document.body.classList.add("grid");
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<div class="layout"><div class="canvas"><div class="columns"></div></div></div>',
    );
  }
  // add scroll event to make the indicator disapear
  window.addEventListener("scroll", () => {
    if (window.scrollY > 5) {
      document.body.classList.add("is-scrolled");
    } else {
      document.body.classList.remove("is-scrolled");
    }
  });
  // get debug language (if any)
  const debugLang = url.searchParams.get("debug-lang");
  // get user language
  const userLang = navigator.language || (navigator as any).userLanguage;
  const lang: Locale = debugLang
    ? debugLang
    : userLang
    ? userLang.split("-")[0]
    : undefined;
  if (lang) { // if lang is undefined, use default values that are burnt in the HTML
    // grab labels from localization table
    const platformLabel = localizationTable.platform[lang];
    const moreLabel = localizationTable.more[lang];
    // get elements
    const platformHeading = document.getElementById("platform-heading");
    const moreIndicator = document.getElementById("scroll-more");
    // localize
    if (platformLabel && moreLabel) {
      // set language and writing direction
      document.documentElement.lang = lang;
      if (rtlLangs.indexOf(lang) !== -1) {
        document.documentElement.dir = "rtl";
      }
      if (platformHeading) {
        platformHeading.innerText = platformLabel;
      }
      if (moreIndicator) {
        moreIndicator.innerText = moreLabel;
      }
    }
  }
  // attach events to platform links
  const platformLinks = document.querySelectorAll<HTMLAnchorElement>(
    "#links-list a[data-store-name]",
  );
  platformLinks.forEach((platformLink) => {
    platformLink.addEventListener("click", async (e) => {
      // Always prevent default first to control the navigation timing
      e.preventDefault();

      const anchor = e.currentTarget as HTMLAnchorElement;
      const href = anchor.href;

      // Define navigation fallback
      const navigate = () => {
        window.location.href = href;
      };

      // get store name and id, and track name
      const storeName = anchor.getAttribute("data-store-name");
      const storeId = anchor.getAttribute("data-store-id");
      const trackName = release?.getAttribute("data-track-name");

      if (!storeName || !storeId || !trackName) {
        console.error("Couldn't get store and track information");
        navigate(); // ensure we still navigate if data is missing
        return;
      }

      // generate eventID for deduplication
      const eventId = generateEventId();
      const eventName = "ViewContent";

      if (adProvider === "meta" && typeof window.fbq === "function") {
        window.fbq("track", eventName, {
          content_category: "Music",
          content_name: trackName,
          currency: "USD",
          service: storeName,
        }, { eventID: eventId });
      }

      // trigger plausible event (safely check if function exists)
      if (typeof window.plausible === "function") {
        const eventName = "Platform Click " + storeName.trim();
        window.plausible(eventName);
      }

      let conversionPromise: Promise<unknown> = Promise.resolve();

      if (adProvider === "google") {
        if (googleSendTo && typeof window.gtag === "function") {
          conversionPromise = new Promise((resolve) => {
            window.gtag("event", "conversion", {
              send_to: googleSendTo,
              event_callback: resolve,
              event_timeout: 500,
            });
          });
        }

        conversionPromise = Promise.all([
          conversionPromise,
          fetch("https://fyi.marcatatem.deno.net/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            keepalive: true,
            body: JSON.stringify({
              eventId: eventId,
              eventName: eventName,
              url: window.location.href,
              landingUrl: googleClickContext?.landingUrl,
              userAgent: navigator.userAgent,
              google: googleClickContext,
              trackName: trackName,
              storeName: storeName,
              storeId: storeId,
              campaign: campaign,
            }),
          }).catch((err) => console.error("Google event capture failed:", err)),
        ]);
      } else {
        // trigger Meta CAPI call (always fire, even if fbq is blocked)
        conversionPromise = fetch("https://fyi.marcatatem.deno.net/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify({
            eventId: eventId,
            eventName: eventName,
            url: window.location.href,
            userAgent: navigator.userAgent,
            fbp: getCookie("_fbp"),
            fbc: getCookie("_fbc"),
            // metadata
            trackName: trackName,
            storeName: storeName,
            campaign: campaign,
          }),
        }).catch((err) => console.error("CAPI failed:", err));
      }

      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 500));

      try {
        await Promise.race([conversionPromise, timeoutPromise]);
      } catch (e) {
        // Ignore errors, we must navigate
      }
      navigate();
    });
  });
});

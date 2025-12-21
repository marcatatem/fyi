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

document.addEventListener("DOMContentLoaded", () => {
  // show grid if needed
  const url = new URL(window.location.href);
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
    platformLink.addEventListener("click", (e) => {
      if (
        typeof window.plausible !== "function" ||
        typeof window.fbq !== "function"
      ) {
        console.error("Plausible or Meta Pixel not loaded");
        return; // avoid blocking in production, just get to the store
      }
      e.preventDefault();
      const anchor = e.currentTarget as HTMLAnchorElement;
      // get actual link to store
      const href = anchor.href;
      // get store name and id, and track name
      const storeName = anchor.getAttribute("data-store-name");
      const storeId = anchor.getAttribute("data-store-id");
      const trackName = document.getElementById("release")?.getAttribute(
        "data-track-name",
      );
      if (!storeName || !storeId || !trackName) {
        console.error("Couldn't get store and track information");
        return; // avoid blocking in production, just get to the store
      }
      // trigger meta event
      window.fbq("trackCustom", "StreamServiceClick", {
        service: storeName,
        content_name: trackName,
      });
      // trigger plausible event
      const eventName = "Platform Click " + storeName.trim();
      window.plausible(eventName);
      // wait until request leaves browser, not ideal, but can't wait forever in ad context
      setTimeout(() => {
        window.location.href = href;
      }, 150);
    });
  });
});

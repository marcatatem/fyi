import meta from "data/meta.json" with { type: "json" };

export const schema = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": "ProfilePage",
  "about": {
    "@type": "Person",
    "givenName": "Marca",
    "familyName": "Tatem",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "San Francisco",
      "addressRegion": "CA",
    },
    "knowsLanguage": [
      {
        "@type": "Language",
        "name": "English",
      },
      {
        "@type": "Language",
        "name": "French",
      },
    ],
  },
  "abstract": meta.head.description,
  "mainContentOfPage": {
    "cssSelector": "article",
  },
  "primaryImageOfPage": {
    "@type": "ImageObject",
    "url": "https://marca.fyi/img/marca.jpg",
    "caption": "Portrait of Marca",
  },
};

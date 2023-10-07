import data from "data/sections.json" with { type: "json" };

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
  "abstract": data.description,
  "mainContentOfPage": {
    "cssSelector": "article",
  },
  "primaryImageOfPage": {
    "@type": "ImageObject",
    "url": "https://marca.fyi/static/images/profile.jpg",
    "caption": "Portrait of Marca",
  },
};

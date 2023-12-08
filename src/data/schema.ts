import meta from "data/meta.json" with { type: "json" };

export const schema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "givenName": "Marca",
  "familyName": "Tatem",
  "homeAddress": {
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
  "description": meta.head.description,
  "image": {
    "@type": "ImageObject",
    "url": "https://marca.fyi/img/marca.jpg",
    "caption": "Portrait of Marca",
  },
};

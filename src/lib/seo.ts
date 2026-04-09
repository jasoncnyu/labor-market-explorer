import { Locale, translations } from "./i18n";

export const DEFAULT_LOCALE: Locale = "en";
export const SITE_ORIGIN = "https://labor.simlab.me";

export const SUPPORTED_LOCALES: Locale[] = ["en", "es", "ko"];

export const localePaths: Record<Locale, string> = {
  en: "/en/",
  es: "/es/",
  ko: "/ko/",
};

export const absoluteLocaleUrl = (locale: Locale) => `${SITE_ORIGIN}${localePaths[locale]}`;

export const seoByLocale = {
  en: {
    title: translations.en.title,
    description: translations.en.subtitle,
    ogLocale: "en_US",
  },
  es: {
    title: translations.es.title,
    description: translations.es.subtitle,
    ogLocale: "es_ES",
  },
  ko: {
    title: translations.ko.title,
    description: translations.ko.subtitle,
    ogLocale: "ko_KR",
  },
} as const;

export const isLocale = (value: string | undefined): value is Locale =>
  value === "en" || value === "es" || value === "ko";

const updateMeta = (
  selector: string,
  attrName: "name" | "property",
  attrValue: string,
  content: string,
) => {
  const existing = document.head.querySelector<HTMLMetaElement>(selector);

  if (existing) {
    existing.content = content;
    return;
  }

  const meta = document.createElement("meta");
  meta.setAttribute(attrName, attrValue);
  meta.content = content;
  document.head.appendChild(meta);
};

const appendMeta = (attrName: "name" | "property", attrValue: string, content: string) => {
  const meta = document.createElement("meta");
  meta.setAttribute(attrName, attrValue);
  meta.content = content;
  document.head.appendChild(meta);
};

const setLink = (rel: string, href: string, attrs: Record<string, string> = {}) => {
  let link = document.head.querySelector<HTMLLinkElement>(`link[data-seo-link="${rel}${attrs.hreflang ?? ""}"]`);

  if (!link) {
    link = document.createElement("link");
    link.dataset.seoLink = `${rel}${attrs.hreflang ?? ""}`;
    document.head.appendChild(link);
  }

  link.rel = rel;
  link.href = href;

  Object.entries(attrs).forEach(([key, value]) => {
    link.setAttribute(key, value);
  });
};

export const applySeo = (locale: Locale) => {
  const seo = seoByLocale[locale];

  document.documentElement.lang = locale;
  document.title = seo.title;

  updateMeta('meta[name="description"]', "name", "description", seo.description);
  updateMeta('meta[name="author"]', "name", "author", "Labor Market Explorer");
  updateMeta('meta[name="robots"]', "name", "robots", "index,follow");
  updateMeta('meta[name="theme-color"]', "name", "theme-color", "#0f172a");

  updateMeta('meta[property="og:title"]', "property", "og:title", seo.title);
  updateMeta('meta[property="og:description"]', "property", "og:description", seo.description);
  updateMeta('meta[property="og:type"]', "property", "og:type", "website");
  updateMeta('meta[property="og:site_name"]', "property", "og:site_name", "Labor Market Explorer");
  updateMeta('meta[property="og:locale"]', "property", "og:locale", seo.ogLocale);
  updateMeta('meta[property="og:url"]', "property", "og:url", absoluteLocaleUrl(locale));
  updateMeta('meta[property="og:image"]', "property", "og:image", `${SITE_ORIGIN}/og-image.svg`);

  updateMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
  updateMeta('meta[name="twitter:title"]', "name", "twitter:title", seo.title);
  updateMeta('meta[name="twitter:description"]', "name", "twitter:description", seo.description);
  updateMeta('meta[name="twitter:image"]', "name", "twitter:image", `${SITE_ORIGIN}/og-image.svg`);

  document.head.querySelectorAll('link[rel="canonical"], link[rel="alternate"]').forEach((node) => {
    node.remove();
  });

  setLink("canonical", absoluteLocaleUrl(locale));

  SUPPORTED_LOCALES.forEach((supportedLocale) => {
    setLink("alternate", absoluteLocaleUrl(supportedLocale), { hreflang: supportedLocale });
  });

  setLink("alternate", absoluteLocaleUrl(DEFAULT_LOCALE), { hreflang: "x-default" });

  document.head.querySelectorAll('meta[property="og:locale:alternate"]').forEach((node) => node.remove());
  SUPPORTED_LOCALES.filter((supportedLocale) => supportedLocale !== locale).forEach((supportedLocale) => {
    appendMeta("property", "og:locale:alternate", seoByLocale[supportedLocale].ogLocale);
  });
};
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve("dist");
const rootHtmlPath = path.join(distDir, "index.html");
const sitemapPath = path.join(distDir, "sitemap.xml");
const siteOrigin = "https://labor.simlab.me";

const locales = {
  en: {
    title: "Labor Market Explorer",
    description: "Interactive labor market dynamics simulator",
    ogLocale: "en_US",
  },
  es: {
    title: "Simulador de Dinámica del Mercado Laboral",
    description: "Simulación interactiva de modelos del mercado laboral",
    ogLocale: "es_ES",
  },
  ko: {
    title: "노동시장 다이내믹스 시뮬레이터",
    description: "Labor Market Dynamics Simulator",
    ogLocale: "ko_KR",
  },
};

const localeOrder = ["en", "es", "ko"];
const localePath = (locale) => `/${locale}/`;
const absoluteUrl = (pathname) => `${siteOrigin}${pathname}`;

const seoBlock = (locale) => {
  const localeData = locales[locale];
  const alternates = localeOrder
    .map((code) => `<link rel="alternate" hreflang="${code}" href="${absoluteUrl(localePath(code))}" />`)
    .join("\n    ");

  const otherLocales = localeOrder
    .filter((code) => code !== locale)
    .map((code) => `<meta property="og:locale:alternate" content="${locales[code].ogLocale}" />`)
    .join("\n    ");

  return `
    <title>${localeData.title}</title>
    <meta name="description" content="${localeData.description}" />
    <meta name="author" content="Labor Market Explorer" />
    <meta name="robots" content="index,follow" />
    <meta name="theme-color" content="#0f172a" />

    <link rel="canonical" href="${absoluteUrl(localePath(locale))}" />
    ${alternates}
    <link rel="alternate" hreflang="x-default" href="${absoluteUrl(localePath("en"))}" />

    <meta property="og:title" content="${localeData.title}" />
    <meta property="og:description" content="${localeData.description}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Labor Market Explorer" />
    <meta property="og:locale" content="${localeData.ogLocale}" />
    ${otherLocales}
    <meta property="og:url" content="${absoluteUrl(localePath(locale))}" />
    <meta property="og:image" content="${absoluteUrl("/og-image.svg")}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${localeData.title}" />
    <meta name="twitter:description" content="${localeData.description}" />
    <meta name="twitter:image" content="${absoluteUrl("/og-image.svg")}" />
  `;
};

const buildSitemap = () => {
  const urls = localeOrder
    .map((locale) => {
      const currentUrl = absoluteUrl(localePath(locale));
      const alternateLinks = localeOrder
        .map(
          (altLocale) =>
            `    <xhtml:link rel="alternate" hreflang="${altLocale}" href="${absoluteUrl(localePath(altLocale))}" />`,
        )
        .join("\n");

      return `  <url>
    <loc>${currentUrl}</loc>
${alternateLinks}
    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(localePath("en"))}" />
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
};

const injectSeo = (html, locale) => {
  const langReplaced = html.replace(/<html lang="[^"]*">/, `<html lang="${locale}">`);
  return langReplaced.replace("</head>", `${seoBlock(locale)}\n  </head>`);
};

const main = async () => {
  const rootHtml = await readFile(rootHtmlPath, "utf8");

  for (const locale of localeOrder) {
    const localeDir = path.join(distDir, locale);
    await mkdir(localeDir, { recursive: true });
    await writeFile(path.join(localeDir, "index.html"), injectSeo(rootHtml, locale));
  }

  await writeFile(rootHtmlPath, injectSeo(rootHtml, "en"));
  await writeFile(sitemapPath, buildSitemap());
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
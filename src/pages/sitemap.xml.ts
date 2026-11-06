import type { APIRoute } from "astro";
import legacy from "../content/legacyArchive.json";
import gmedia from "../content/legacyGmediaRoutes.json";
import taxonomy from "../content/legacyTaxonomyRoutes.json";
import extended from "../content/legacyExtendedRoutes.json";
import featured from "../content/legacyFeaturedAttachments.json";

const routes = [
  "/",
  "/bg/",
  "/en/",
  "/bg/archive/",
  "/en/archive/",
  "/bg/gallery/studio-5/",
  "/en/gallery/studio-5/",
  "/bg/gallery/bulgarian-composers/",
  "/en/gallery/bulgarian-composers/",
  "/bg/gallery/orchestra-concert/",
  "/en/gallery/orchestra-concert/",
  "/en/афиш-чайната-fw/",
  "/bg/recordings/",
  "/en/recordings/",
  "/bg/recordings/excerpts/",
  "/en/recordings/excerpts/",
  "/bg/donation-certificate/",
  "/en/donation-certificate/",
  "/bg/donation-policy/",
  "/en/donation-policy/",
  "/bg/first-sound/",
  "/en/first-sound/",
  "/bg/press/",
  "/en/press/",
  "/bg/privacy/",
  "/en/privacy/",
  "/bg/sponsor-brief/",
  "/en/sponsor-brief/",
  "/bg/thank-you/",
  "/en/thank-you/",
  ...legacy.items.map((item) => item.path),
  ...gmedia.items.map((item) => item.path),
  ...taxonomy.items.map((item) => item.path),
  ...extended.items.map((item) => item.path),
  ...featured.items.map((item) => item.path)
];

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL("https://432hz-orchestra.com/");
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...routes.map((route) => `  <url><loc>${new URL(route, base).toString()}</loc></url>`),
    "</urlset>"
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
};

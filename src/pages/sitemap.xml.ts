import type { APIRoute } from "astro";

const routes = [
  "/",
  "/bg/",
  "/en/",
  "/bg/archive/",
  "/en/archive/",
  "/bg/recordings/",
  "/en/recordings/",
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
  "/en/thank-you/"
];

export const GET: APIRoute = () => {
  const siteUrl = import.meta.env.PUBLIC_SITE_URL?.replace(/\/$/, "");
  const body = siteUrl
    ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
        .map((route) => `  <url><loc>${siteUrl}${route}</loc></url>`)
        .join("\n")}\n</urlset>`
    : `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><!-- Set PUBLIC_SITE_URL to emit absolute sitemap URLs. --></urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
};

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

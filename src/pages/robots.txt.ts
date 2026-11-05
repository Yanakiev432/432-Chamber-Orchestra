import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const siteUrl = (site ?? new URL("https://432hz-orchestra.com/")).toString().replace(/\/$/, "");
  const lines = ["User-agent: *", "Allow: /", `Sitemap: ${siteUrl}/sitemap.xml`];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
};

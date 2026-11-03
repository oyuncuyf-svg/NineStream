import { catalog } from "../lib/catalog";
import { absolute, href, animePath } from "../lib/paths";
export function GET() {
  const entries = [
    { url: absolute(href()), date: null },
    { url: absolute(href("katalog/")), date: null },
    ...catalog().map((a) => ({
      url: absolute(animePath(a.slug)),
      date: a.updated,
    })),
  ];
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      entries
        .map(
          (e) =>
            "<url><loc>" +
            e.url +
            "</loc>" +
            (e.date ? "<lastmod>" + e.date + "</lastmod>" : "") +
            "</url>",
        )
        .join("") +
      "</urlset>",
    { headers: { "Content-Type": "application/xml" } },
  );
}

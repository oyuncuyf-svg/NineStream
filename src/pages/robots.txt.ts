import { absolute, href } from "../lib/paths";
export function GET() {
  return new Response(
    "User-agent: *\nAllow: /\nSitemap: " + absolute(href("sitemap.xml")) + "\n",
  );
}

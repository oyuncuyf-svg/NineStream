import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { catalog } from "../src/lib/catalog.ts";
import { locationConfig } from "../scripts/location.mjs";
const { base, site } = locationConfig();
const root = path.resolve("dist"),
  rows = catalog();
const sitemap = fs.readFileSync("dist/sitemap.xml", "utf8");
assert.ok(
  !sitemap.includes("?bolum") && sitemap.includes(site + base + "katalog/"),
);
assert.ok(
  fs
    .readFileSync("dist/robots.txt", "utf8")
    .includes(site + base + "sitemap.xml"),
);
const htmls = fs
  .readdirSync(root, { recursive: true })
  .filter((f) => f.endsWith(".html"));
let count = 0;
for (const name of htmls) {
  const html = fs.readFileSync(path.join(root, name), "utf8");
  assert.match(html, /<html lang="tr"/);
  assert.match(html, /<title>/);
  const anime = rows.find((a) => name === "anime/" + a.slug + "/index.html");
  assert.equal((html.match(/id="graphcomment"/g) || []).length, anime ? 1 : 0);
  if (anime) {
    const url = site + base + "anime/" + anime.slug + "/";
    assert.ok(
      sitemap.includes("<loc>" + url + "</loc>") &&
        html.includes('rel="canonical" href="' + url + '"') &&
        html.includes('data-url="' + url + '"'),
    );
    assert.ok(html.includes('data-uid="ninestream-' + anime.id + '"'));
    const ld = JSON.parse(
      html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/)[1],
    );
    assert.deepEqual(ld["@graph"].map((v) => v["@type"]).slice(0, 2), [
      anime.format === "Film" ? "Movie" : "TVSeries",
      "BreadcrumbList",
    ]);
  }
  for (const match of html.matchAll(/\s(?:src|href|action)="([^"]+)"/g)) {
    const dest = new URL(match[1].replaceAll("&amp;", "&"), site + base + name);
    if (dest.origin !== site) continue;
    assert.ok(
      dest.pathname.startsWith(base),
      name + " taban dışı " + dest.pathname,
    );
    let local = path.join(
      root,
      decodeURIComponent(dest.pathname.slice(base.length)),
    );
    if (dest.pathname.endsWith("/")) local = path.join(local, "index.html");
    assert.ok(fs.existsSync(local), name + " → " + local);
    count++;
  }
}
for (const a of rows)
  assert.ok(htmls.includes("anime/" + a.slug + "/index.html"));
assert.equal(htmls.filter((n) => n.startsWith("anime/")).length, rows.length);
console.log(
  htmls.length +
    " statik HTML, " +
    rows.length +
    " anime, " +
    count +
    " yerel bağlantı/kaynak doğrulandı: " +
    site +
    base,
);

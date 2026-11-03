import fs from "node:fs";
import path from "node:path";
import type { Anime, Rule } from "./model.ts";
import { embedURL } from "../scripts/core.js";

export const config = JSON.parse(
  fs.readFileSync("site.config.json", "utf8"),
) as {
  graphcommentShortname: string;
  embedRules: Rule[];
};
export function validate(records: Anime[]) {
  const ids = new Set<string>(),
    slugs = new Set<string>();
  for (const a of records) {
    const fail = (field: string): never => {
      throw new Error(`${a.slug || "?"}: geçersiz veya yinelenen ${field}`);
    };
    for (const key of [
      "id",
      "slug",
      "title",
      "original",
      "description",
      "studio",
      "language",
      "status",
      "season",
    ] as const)
      if (typeof a[key] !== "string" || !a[key].trim()) fail(key);
    for (const [key, seen] of [
      ["id", ids],
      ["slug", slugs],
    ] as const) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(a[key]) || seen.has(a[key]))
        fail(key);
      seen.add(a[key]);
    }
    if (!["Dizi", "Film", "OVA", "ONA"].includes(a.format)) fail("format");
    if (!Number.isInteger(a.year) || a.year < 1800 || a.year > 9999)
      fail("year");
    if (
      !/^\d{4}-\d\d-\d\d$/.test(a.updated) ||
      !Number.isFinite(Date.parse(a.updated)) ||
      new Date(a.updated).toISOString().slice(0, 10) !== a.updated
    )
      fail("updated");
    if (
      a.nextRelease &&
      (!/(Z|[+-]\d\d:\d\d)$/.test(a.nextRelease) ||
        !Number.isFinite(Date.parse(a.nextRelease)))
    )
      fail("nextRelease");
    for (const list of [a.aliases, a.genres])
      if (
        !Array.isArray(list) ||
        list.some((v) => typeof v !== "string" || !v.trim())
      )
        fail("adlar/türler");
    if (typeof a.featured !== "boolean" || !a.genres.length)
      fail("featured/genres");
    for (const file of [a.cover, a.poster])
      if (
        !/^art\/[\w.-]+\.(webp|png|jpe?g)$/i.test(file) ||
        !fs.existsSync(path.join("public", file))
      )
        fail("görsel: " + file);
    const nums = new Set<number>();
    if (!Array.isArray(a.episodes)) fail("episodes");
    for (const ep of a.episodes) {
      if (
        !Number.isSafeInteger(ep.number) ||
        ep.number < 1 ||
        nums.has(ep.number) ||
        !ep.title?.trim()
      )
        fail("bölüm");
      nums.add(ep.number);
      if (!Array.isArray(ep.servers)) fail("servers");
      for (const server of ep.servers)
        if (
          !server.name?.trim() ||
          !embedURL(server.url, config.embedRules, "/")
        )
          fail("sunucu: " + server.url);
      if (
        ep.video &&
        (!ep.video.description?.trim() ||
          !/^\d{4}-\d{2}-\d{2}T/.test(ep.video.uploadDate) ||
          !/(Z|[+-]\d{2}:\d{2})$/.test(ep.video.uploadDate) ||
          !Number.isFinite(Date.parse(ep.video.uploadDate)) ||
          !ep.servers.some((s) => s.url.startsWith("https://")))
      )
        fail("video");
      for (const d of ep.downloads || [])
        if (
          !d.name?.trim() ||
          !/^https:\/\//.test(d.url) ||
          new URL(d.url).username ||
          new URL(d.url).password
        )
          fail("indirme");
    }
    a.episodes.sort((a, b) => a.number - b.number);
  }
  return records;
}
export function catalog(): Anime[] {
  const dir = "src/data/anime";
  return validate(
    fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .sort()
      .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))),
  ).sort(
    (a, b) =>
      b.updated.localeCompare(a.updated) ||
      a.title.localeCompare(b.title, "tr"),
  );
}

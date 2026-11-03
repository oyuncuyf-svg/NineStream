import { JSDOM } from "jsdom";
import assert from "node:assert/strict";
import fs from "node:fs";
import { catalog } from "../src/lib/catalog.ts";
import { locationConfig } from "../scripts/location.mjs";

// Use real built markup. Supply deterministic episodes so the check also runs on a one-film catalog.
const anime = catalog()[0];
if (anime) {
  const { site, base } = locationConfig();
  const url = site + base + "anime/" + anime.slug + "/";
  const dom = new JSDOM(
    fs.readFileSync("dist/anime/" + anime.slug + "/index.html", "utf8"),
    { url },
  );
  const { window } = dom;
  for (const key of ["document", "localStorage", "location", "history"])
    globalThis[key] = window[key];
  globalThis.window = window;
  const el = (id) => document.getElementById(id);
  const config = JSON.parse(el("oynat").dataset.config);
  config.episodes = [1, 2].map((number) => ({
    number,
    title: "Sınama " + number,
    servers: [
      { name: "Ana", url: "sample:" + number },
      { name: "Yedek", url: "sample:" + number + "-low" },
    ],
  }));
  el("oynat").dataset.config = JSON.stringify(config);
  const mount = el("graphcomment");
  mount.dataset.shortname = "yerel-test";
  let calls = 0,
    received;
  window.__semio__gc_graphlogin = (params) => {
    calls++;
    received = params;
    mount.textContent = "Deneme dizisi";
  };
  await import("../src/scripts/comments.js");
  const loader = document.querySelector(
    'script[src*="integration.graphcomment.com"]',
  );
  assert.ok(loader);
  loader.onload();
  await import("../src/scripts/player.js");
  el("next").click();
  el("servers").lastElementChild.click();
  assert.ok(el("screen").querySelector("iframe").src.endsWith("?klip=2-low"));
  assert.equal(location.search, "?bolum=2");
  el("favorite").click();
  el("watched").click();
  assert.equal(el("watched").getAttribute("aria-pressed"), "true");
  el("prev").click();
  el("next").click();
  assert.equal(el("watched").getAttribute("aria-pressed"), "true");
  await import("../src/scripts/comments.js?ikinci-calistirma");
  assert.equal(
    document.querySelectorAll('script[src*="integration.graphcomment.com"]')
      .length,
    1,
  );
  assert.equal(calls, 1);
  assert.equal(received.behaviour.uid, "ninestream-" + anime.id);
  assert.equal(received.behaviour.url, url);
  assert.equal(el("graphcomment"), mount);
  assert.equal(mount.textContent, "Deneme dizisi");
  const stored = JSON.parse(localStorage.getItem("ninestream:" + base + ":v1"));
  assert.ok(stored[anime.id].favorite && stored[anime.id].last === 2);
  dom.window.close();
  console.log(
    "DOM testi geçti: bölüm, sunucu, geçmiş, işaretler, tek yükleyici ve aynı yorum düğümü.",
  );
}

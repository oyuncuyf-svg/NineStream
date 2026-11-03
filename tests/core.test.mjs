import test from "node:test";
import assert from "node:assert/strict";
import { catalog, validate, config } from "../src/lib/catalog.ts";
import { readState, embedURL, matches } from "../src/scripts/core.js";
import { locationConfig } from "../scripts/location.mjs";
const sample = {
  title: "Kızıl Ufuk",
  original: "Crimson Horizon",
  aliases: ["Akai Sora"],
  genres: ["Macera"],
  year: 2026,
  status: "Devam ediyor",
  format: "Dizi",
};
test("Türkçe, alternatif ad ve birlikte uygulanan filtreler", () => {
  for (const q of ["kizil", "KIZIL", "AKAI", "crimson"])
    assert.ok(
      matches(sample, q, {
        genre: "Macera",
        year: "2026",
        format: "Dizi",
        letter: "K",
      }),
    );
  assert.equal(matches(sample, "", { status: "Tamamlandı" }), false);
});
test("Proje, kök ve özel alan adı", () => {
  assert.equal(locationConfig({}).base, "/");
  assert.equal(
    locationConfig({ SITE_URL: "https://dizi.test", BASE_PATH: "NineStream" })
      .base,
    "/NineStream/",
  );
  assert.throws(() => locationConfig({ BASE_PATH: "../a" }));
});
test("İzin listesi ve yerel klip kodları", () => {
  const rules = [{ host: "player.vimeo.com", path: "/video/" }];
  assert.equal(
    embedURL("sample:2-low", rules, "/d/"),
    "/d/oynatici/?klip=2-low",
  );
  assert.equal(
    embedURL("https://player.vimeo.com/video/123", rules, "/"),
    "https://player.vimeo.com/video/123",
  );
  for (const url of [
    "//player.vimeo.com/video/1",
    "javascript:alert(1)",
    "https://a@player.vimeo.com/video/x",
    "https://player.vimeo.com.evil.test/video/1",
    "https://player.vimeo.com/else",
    "sample:../bad",
    "https://player.vimeo.com:9000/video/1",
  ])
    assert.equal(embedURL(url, rules, "/"), null);
});
test("Hasarlı veya eski biçimli tarayıcı verisi", () => {
  assert.deepEqual(Object.keys(readState("!")), []);
  assert.deepEqual(
    readState('{"ns-1":{"watched":[1,1,"4"],"favorite":true}}')["ns-1"],
    { favorite: true, watched: [1], time: 0, last: 0 },
  );
});
test("Katalogdaki örnekler ve veri bütünlüğü", () => {
  const rows = catalog();
  assert.ok(Array.isArray(rows));
  if (!rows.length) return;
  const one = structuredClone(rows[0]);
  assert.throws(() => validate([one, one]));
  if (one.episodes.length) {
    one.episodes.push(one.episodes[0]);
    assert.throws(() => validate([one]));
  }
});

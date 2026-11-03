import { embedURL } from "./core.js";
import { row, update } from "./store.js";
const byId = (id) => document.getElementById(id);
const { id, episodes, rules } = JSON.parse(byId("oynat").dataset.config);
const base = document.body.dataset.base;
let index = -1,
  active = -1;
const entry = () => row(id);
function paintPersonal() {
  const saved = entry(),
    number = episodes[index]?.number;
  const watched = saved.watched.includes(number);
  byId("favorite").textContent = saved.favorite
    ? "✓ Favorilerde"
    : "＋ Favorilere ekle";
  byId("favorite").setAttribute("aria-pressed", String(saved.favorite));
  byId("watched").textContent = watched ? "✓ İzlendi" : "İzlendi işaretle";
  byId("watched").setAttribute("aria-pressed", String(watched));
  for (const button of byId("episodes").children) {
    const n = Number(button.dataset.number);
    button.dataset.seen = String(saved.watched.includes(n));
    button.setAttribute("aria-pressed", String(n === number));
  }
}
function showSource(position) {
  const ep = episodes[index],
    server = ep?.servers[position];
  active = position;
  const src = server && embedURL(server.url, rules, base);
  const screen = byId("screen"),
    link = byId("source");
  screen.replaceChildren();
  link.hidden = !src;
  link.removeAttribute("href");
  byId("sample-note").hidden = !server?.url.startsWith("sample:");
  [...byId("servers").children].forEach((b, i) =>
    b.setAttribute("aria-pressed", String(active === i)),
  );
  if (!src) {
    screen.textContent = "Bu bölüm için kullanılabilir video kaynağı yok.";
    return;
  }
  link.href = src;
  const frame = document.createElement("iframe");
  frame.title = ep.number + ". bölüm · " + ep.title + " · " + server.name;
  frame.allowFullscreen = true;
  frame.allow = "fullscreen; encrypted-media; picture-in-picture";
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  frame.setAttribute(
    "sandbox",
    "allow-scripts allow-same-origin allow-presentation",
  );
  frame.addEventListener("error", () => {
    screen.textContent =
      "Oynatıcı yüklenemedi. Başka bir sunucu deneyebilirsin.";
  });
  frame.src = src;
  screen.append(frame);
}
function select(number, mode) {
  let pos = episodes.findIndex((ep) => ep.number === number);
  if (pos < 0) pos = 0;
  const ep = episodes[pos];
  index = ep ? pos : -1;
  byId("prev").disabled = pos <= 0;
  byId("next").disabled = pos >= episodes.length - 1;
  byId("watched").disabled = !ep;
  if (!ep) {
    byId("ep-title").textContent = "Henüz bölüm eklenmedi";
    showSource(-1);
    paintPersonal();
    return;
  }
  const url = new URL(location.href);
  if (mode === "push" || url.searchParams.has("bolum"))
    url.searchParams.set("bolum", ep.number);
  history[mode === "push" ? "pushState" : "replaceState"](
    { bolum: ep.number },
    "",
    url,
  );
  update(id, (r) => {
    r.last = ep.number;
    r.time = Date.now();
  });
  byId("ep-title").textContent = ep.number + ". bölüm · " + ep.title;
  byId("servers").replaceChildren(
    ...ep.servers.map((s, i) => {
      const b = document.createElement("button");
      b.textContent = s.name;
      b.onclick = () => {
        if (i !== active) showSource(i);
      };
      return b;
    }),
  );
  const downloads = (ep.downloads || []).map((d) => {
    const a = document.createElement("a");
    a.href = d.url;
    a.rel = "noopener noreferrer";
    a.target = "_blank";
    a.textContent = d.name;
    return a;
  });
  byId("downloads").hidden = !downloads.length;
  byId("downloads").lastElementChild.replaceChildren(...downloads);
  showSource(0);
  paintPersonal();
}
function restore() {
  const query = new URLSearchParams(location.search).get("bolum");
  select(
    query === null ? (history.state?.bolum ?? entry().last) : Number(query),
    "replace",
  );
}
byId("episodes").onclick = (e) => {
  const b = e.target.closest("button");
  if (b && Number(b.dataset.number) !== episodes[index]?.number)
    select(Number(b.dataset.number), "push");
};
byId("next").onclick = () => select(episodes[index + 1].number, "push");
byId("prev").onclick = () => select(episodes[index - 1].number, "push");
byId("favorite").onclick = () => {
  update(id, (r) => (r.favorite = !r.favorite));
  paintPersonal();
};
byId("watched").onclick = () => {
  const n = episodes[index].number;
  update(
    id,
    (r) =>
      (r.watched = r.watched.includes(n)
        ? r.watched.filter((v) => v !== n)
        : [...r.watched, n]),
  );
  paintPersonal();
};
window.addEventListener("popstate", restore);
window.addEventListener("storage", paintPersonal);
restore();
const clock = byId("countdown");
if (clock) {
  const tick = () => {
    const mins = Math.ceil(
      (Date.parse(clock.dataset.date) - Date.now()) / 60000,
    );
    clock.textContent =
      mins > 0
        ? " · Kalan: " +
          Math.floor(mins / 1440) +
          " gün " +
          Math.floor((mins % 1440) / 60) +
          " saat " +
          (mins % 60) +
          " dk"
        : " · Planlanan zaman geçti.";
  };
  tick();
  setInterval(tick, 60000);
}

for (const [id, style] of [
  ["wide", "wide-player"],
  ["dim", "cinema-light"],
]) {
  const button = byId(id);
  button.onclick = () =>
    button.setAttribute(
      "aria-pressed",
      String(document.body.classList.toggle(style)),
    );
}
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.body.classList.remove("cinema-light", "wide-player");
    for (const id of ["wide", "dim"])
      byId(id).setAttribute("aria-pressed", "false");
  }
});

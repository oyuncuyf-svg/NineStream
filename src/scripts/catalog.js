import { matches } from "./core.js";
const form = document.querySelector("#filtre"),
  grid = document.querySelector("#sonuclar");
const data = JSON.parse(document.querySelector("#index-data").dataset.json);
const nodes = new Map([...grid.children].map((el) => [el.dataset.id, el]));
function render(save = false) {
  const params = new URLSearchParams(new FormData(form));
  const visible = data.filter((item) =>
    matches(item, params.get("q"), {
      genre: params.get("genre"),
      year: params.get("year"),
      status: params.get("status"),
      format: params.get("format"),
      letter: params.get("harf"),
    }),
  );
  if (params.get("sort") === "az")
    visible.sort((a, b) => a.title.localeCompare(b.title, "tr"));
  grid.replaceChildren(...visible.map((item) => nodes.get(item.id)));
  document.querySelector("#sayac").textContent = visible.length + " yapım";
  document.querySelector("#bos").hidden = visible.length > 0;
  if (save) {
    for (const k of [...params.keys()])
      if (!params.get(k) || (k === "sort" && params.get(k) === "updated"))
        params.delete(k);
    const url = new URL(location.href);
    url.search = params.toString();
    history.replaceState(null, "", url);
  }
}
function restore() {
  form.reset();
  for (const [k, v] of new URLSearchParams(location.search)) {
    const field = form.elements.namedItem(k);
    if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement)
      field.value = v;
  }
  render();
}
restore();
form.addEventListener("input", () => render(true));
form.addEventListener("submit", (e) => {
  e.preventDefault();
  render(true);
});
form.addEventListener("reset", () => queueMicrotask(() => render(true)));
window.addEventListener("popstate", restore);

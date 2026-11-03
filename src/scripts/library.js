import { state, update, clearAll } from "./store.js";
function render() {
  const records = state();
  for (const shelf of document.querySelectorAll("[data-shelf]")) {
    const fav = shelf.dataset.shelf === "favori";
    const rows = [...shelf.querySelectorAll("article")].sort(
      (a, b) =>
        (records[b.dataset.id]?.time || 0) - (records[a.dataset.id]?.time || 0),
    );
    let count = 0;
    for (const el of rows) {
      const id = el.dataset.id,
        r = records[id],
        valid = JSON.parse(el.dataset.episodes).includes(r?.last);
      el.hidden = !(fav ? r?.favorite : valid);
      if (el.hidden) continue;
      count++;
      el.parentElement.append(el);
      const link = el.querySelector("a"),
        url = new URL(link.href);
      url.search = valid ? "bolum=" + r.last : "";
      link.href = url.href;
      el.querySelector("small").textContent = valid ? r.last + ". bölüm" : "";
      if (fav)
        el.querySelector("button").onclick = () => {
          update(id, (row) => (row.favorite = false));
          render();
        };
    }
    shelf.querySelector(".empty").hidden = !!count;
  }
}
document.querySelector("#temizle").onclick = () => {
  if (confirm("Bu tarayıcıdaki tüm favoriler ve bölüm geçmişi silinsin mi?")) {
    clearAll();
    render();
  }
};
render();
window.addEventListener("pageshow", render);
window.addEventListener("storage", render);

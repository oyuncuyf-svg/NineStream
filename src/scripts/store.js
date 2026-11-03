import { readState } from "./core.js";
const key = "ninestream:" + document.body.dataset.base + ":v1";
let fallback = "{}",
  volatile = false;
export function state() {
  try {
    return readState(volatile ? fallback : localStorage.getItem(key));
  } catch {
    return readState(fallback);
  }
}
export function row(id) {
  return state()[id] || { favorite: false, last: 0, watched: [], time: 0 };
}
function save(value) {
  fallback = JSON.stringify(value);
  try {
    localStorage.setItem(key, fallback);
    volatile = false;
  } catch {
    volatile = true;
    document
      .querySelectorAll("[data-storage-note]")
      .forEach(
        (n) =>
          (n.textContent =
            "Tarayıcı kaydı kapalı. Değişiklikler yalnız bu sayfada tutulur."),
      );
  }
}
export function update(id, fn) {
  const s = state();
  const current = s[id] || { favorite: false, last: 0, watched: [], time: 0 };
  fn(current);
  s[id] = current;
  save(s);
}
export function clearAll() {
  save({});
}

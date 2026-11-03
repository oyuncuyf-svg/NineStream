export const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
export const href = (path = "") => base + path.replace(/^\/+/, "");
export const animePath = (slug: string) => href("anime/" + slug + "/");
export const absolute = (path: string) =>
  new URL(path, import.meta.env.SITE).href;
export const dateTR = (date: string) =>
  new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
export const letters = Array.from("ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ");

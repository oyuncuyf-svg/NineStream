export function fold(value) {
  return String(value)
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replaceAll("ı", "i")
    .trim();
}
export function matches(item, query, filters) {
  const names = [item.title, item.original, ...item.aliases].map(fold);
  return (
    names.some((name) => name.includes(fold(query))) &&
    (!filters.genre || item.genres.includes(filters.genre)) &&
    (!filters.year || String(item.year) === filters.year) &&
    (!filters.status || item.status === filters.status) &&
    (!filters.format || item.format === filters.format) &&
    (!filters.letter ||
      item.title
        .toLocaleUpperCase("tr")
        .startsWith(filters.letter.toLocaleUpperCase("tr")))
  );
}
export function embedURL(raw, rules, base) {
  if (/^sample:[1-3](-low)?$/.test(raw))
    return base + "oynatici/?klip=" + raw.slice(7);
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password || url.port)
      return null;
    return rules.some(
      (rule) =>
        rule.host === url.hostname &&
        url.pathname.startsWith(rule.path) &&
        url.pathname.length > rule.path.length,
    )
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function readState(raw) {
  let entries;
  try {
    entries = Object.entries(JSON.parse(raw));
  } catch {
    entries = [];
  }
  const state = Object.create(null);
  for (const [id, row] of entries) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(id) || !row || typeof row !== "object")
      continue;
    state[id] = {
      favorite: row.favorite === true,
      last: Number.isSafeInteger(row.last) ? row.last : 0,
      watched: Array.isArray(row.watched)
        ? [...new Set(row.watched.filter(Number.isSafeInteger))]
        : [],
      time: Number.isFinite(row.time) ? row.time : 0,
    };
  }
  return state;
}

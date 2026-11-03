export function locationConfig(env = process.env) {
  const site = new URL(env.SITE_URL || "http://localhost:4321");
  if (
    !["http:", "https:"].includes(site.protocol) ||
    site.pathname !== "/" ||
    site.search ||
    site.hash ||
    site.username ||
    site.password
  )
    throw Error("SITE_URL yalnız köken olmalı.");
  const part = (env.BASE_PATH || "").replace(/^\/+|\/+$/g, "");
  if (
    (part && !/^[\w.-]+(?:\/[\w.-]+)*$/.test(part)) ||
    part.split("/").some((p) => p === "." || p === "..")
  )
    throw Error("BASE_PATH geçersiz.");
  return { site: site.origin, base: part ? "/" + part + "/" : "/" };
}

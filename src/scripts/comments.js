const mount = document.getElementById("graphcomment");
if (mount?.dataset.shortname && !mount.dataset.started) {
  mount.dataset.started = "1";
  const status = document.getElementById("yorum-durumu");
  const params = {
    graphcommentId: mount.dataset.shortname,
    behaviour: { uid: mount.dataset.uid, url: mount.dataset.url },
  };
  window.__semio__params = params;
  const loader = document.createElement("script");
  loader.async = true;
  loader.defer = true;
  loader.src = "https://integration.graphcomment.com/gc_graphlogin.js";
  const failure = () => {
    status.textContent = "Yorum hizmetine şu anda ulaşılamıyor.";
  };
  loader.onerror = failure;
  loader.onload = () => {
    try {
      window.__semio__gc_graphlogin(params);
      status.textContent = "";
    } catch {
      failure();
    }
  };
  document.head.append(loader);
}

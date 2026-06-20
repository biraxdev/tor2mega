(function () {
  const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mkv", ".mov", ".m3u8"];

  function isVideoUrl(url) {
    if (!url) return false;
    const lower = url.toLowerCase().split("?")[0].split("#")[0];
    return VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext));
  }

  document.addEventListener("contextmenu", (e) => {
    const target = e.target;
    if (target && target.tagName === "VIDEO") {
      const src = target.src || target.currentSrc;
      if (src && isVideoUrl(src)) {
        target.setAttribute("data-tor2mega-url", src);
      }
    }
    if (target && target.tagName === "A") {
      const href = target.href;
      if (href && isVideoUrl(href)) {
        target.setAttribute("data-tor2mega-url", href);
      }
    }
  });
})();

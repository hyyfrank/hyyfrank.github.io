(() => {
  function buildLangHref(pathname, targetLang) {
    const isZh = pathname === "/zh" || pathname.startsWith("/zh/");
    if (targetLang === "zh") {
      if (isZh) return pathname === "/zh" ? "/zh/" : pathname;
      return pathname === "/" ? "/zh/" : `/zh${pathname}`;
    }
    if (!isZh) return pathname;
    const stripped = pathname.replace(/^\/zh(?=\/|$)/, "");
    return stripped || "/";
  }

  function applyLangPill() {
    const langMenu = document.querySelector(".lang-menu");
    if (!langMenu) return;

    const pathname = window.location.pathname || "/";
    const currentLang = pathname === "/zh" || pathname.startsWith("/zh/") ? "zh" : "en";
    const enHref = buildLangHref(pathname, "en");
    const zhHref = buildLangHref(pathname, "zh");

    langMenu.innerHTML = `
      <li class="${currentLang === "zh" ? "active-lang-item" : ""}">
        <a href="${zhHref}" class="${currentLang === "zh" ? "active-lang" : ""}">中文</a>
      </li>
      <li class="${currentLang === "en" ? "active-lang-item" : ""}">
        <a href="${enHref}" class="${currentLang === "en" ? "active-lang" : ""}">English</a>
      </li>
    `;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyLangPill);
  } else {
    applyLangPill();
  }
})();


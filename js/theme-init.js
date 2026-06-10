/* Runs synchronously in <head> so the correct theme paints first.
   Kept external (not inline) so the CSP can avoid 'unsafe-inline'. */
(function () {
  var root = document.documentElement;
  root.classList.add("js");

  var theme;
  try {
    theme = localStorage.getItem("wf-theme");
  } catch (e) {
    /* storage blocked — fall through to system preference */
  }
  if (theme !== "light" && theme !== "dark") {
    theme =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  }
  root.dataset.theme = theme;
})();

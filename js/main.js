(function () {
  "use strict";

  /* ----------------------------------------------------------
     Theme toggle (theme-init.js already set the initial theme)
     ---------------------------------------------------------- */
  var THEME_KEY = "wf-theme";
  var root = document.documentElement;
  var toggle = document.getElementById("themeToggle");

  function syncToggleLabel() {
    if (!toggle) return;
    var next = root.dataset.theme === "dark" ? "light" : "dark";
    toggle.setAttribute("aria-label", "Switch to " + next + " theme");
    toggle.title = "Switch to " + next + " theme";
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {
        /* storage blocked — theme still applies for this page view */
      }
      syncToggleLabel();
    });
    syncToggleLabel();
  }

  /* ----------------------------------------------------------
     Mobile menu
     ---------------------------------------------------------- */
  var burger = document.getElementById("navBurger");
  var mobileMenu = document.getElementById("mobileMenu");

  function setMenuOpen(open) {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu.hidden = !open;
  }

  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      setMenuOpen(mobileMenu.hidden);
    });
    mobileMenu.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenuOpen(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !mobileMenu.hidden) {
        setMenuOpen(false);
        burger.focus();
      }
    });
  }

  /* ----------------------------------------------------------
     Nav reading-progress bar
     ---------------------------------------------------------- */
  var progressBar = document.querySelector(".scroll-progress");

  if (progressBar) {
    var progressTicking = false;
    var updateProgress = function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      progressBar.style.transform = "scaleX(" + ratio + ")";
      progressTicking = false;
    };
    var requestProgressUpdate = function () {
      if (!progressTicking) {
        progressTicking = true;
        requestAnimationFrame(updateProgress);
      }
    };
    window.addEventListener("scroll", requestProgressUpdate, { passive: true });
    window.addEventListener("resize", requestProgressUpdate, { passive: true });
    updateProgress();
  }

  /* ----------------------------------------------------------
     Footer year
     ---------------------------------------------------------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ----------------------------------------------------------
     Scroll reveal
     ---------------------------------------------------------- */
  var reducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealObserver = null;

  if (!reducedMotion && "IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(
      function (entries) {
        var delay = 0;
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.style.setProperty("--reveal-delay", Math.min(delay, 350) + "ms");
          delay += 70;
          entry.target.classList.add("is-revealed");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
  }

  function observeReveal(el) {
    if (revealObserver) {
      revealObserver.observe(el);
    } else {
      el.classList.add("is-revealed");
    }
  }

  document.querySelectorAll("[data-reveal]").forEach(observeReveal);

  /* ----------------------------------------------------------
     GitHub repositories
     Fetched client-side; rendered with createElement/textContent
     only, so API-supplied strings are never parsed as HTML.
     ---------------------------------------------------------- */
  var GH_USER = "WilliamFelix168";
  var CACHE_KEY = "wf-repos-v1";
  var CACHE_TTL_MS = 10 * 60 * 1000;
  var MAX_REPOS = 9;

  var statusEl = document.getElementById("repoStatus");
  var gridEl = document.getElementById("repoGrid");
  if (!statusEl || !gridEl) return;

  function formatDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "";
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  }

  function readCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.repos)) return null;
      if (Date.now() - parsed.savedAt > CACHE_TTL_MS) return null;
      return parsed.repos;
    } catch (e) {
      return null;
    }
  }

  function writeCache(repos) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), repos: repos }));
    } catch (e) {
      /* quota/private mode — caching is best-effort */
    }
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function renderRepos(repos) {
    gridEl.textContent = "";
    repos.slice(0, MAX_REPOS).forEach(function (repo) {
      var card = el("a", "repo-card");
      card.href = repo.url;
      card.target = "_blank";
      card.rel = "noopener noreferrer";

      var top = el("div", "repo-top");
      top.appendChild(el("span", "repo-name", repo.name));
      if (repo.language) top.appendChild(el("span", "repo-lang", repo.language));
      card.appendChild(top);

      card.appendChild(el("p", "repo-desc", repo.description || "No description yet."));

      var meta = "Updated " + formatDate(repo.updatedAt);
      if (repo.stars > 0) meta += " · ★ " + repo.stars;
      if (repo.forks > 0) meta += " · ⑂ " + repo.forks;
      card.appendChild(el("p", "repo-meta", meta));

      observeReveal(card);
      card.setAttribute("data-reveal", "");
      gridEl.appendChild(card);
    });

    statusEl.textContent = "";
    gridEl.hidden = false;
  }

  function showError() {
    statusEl.textContent = "Couldn't load repositories right now — ";
    var link = el("a", null, "browse them on GitHub ↗");
    link.href = "https://github.com/" + GH_USER + "?tab=repositories";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    statusEl.appendChild(link);
  }

  function loadRepos() {
    var cached = readCache();
    if (cached) {
      renderRepos(cached);
      return;
    }

    statusEl.textContent = "Loading repositories from GitHub…";

    fetch("https://api.github.com/users/" + GH_USER + "/repos?per_page=100&sort=updated", {
      headers: { Accept: "application/vnd.github+json" },
    })
      .then(function (res) {
        if (!res.ok) throw new Error("GitHub API responded " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!Array.isArray(data)) throw new Error("Unexpected GitHub API payload");
        var repos = data
          .map(function (repo) {
            return {
              name: repo.name,
              url: repo.html_url,
              description: repo.description,
              language: repo.language,
              updatedAt: repo.updated_at,
              stars: repo.stargazers_count || 0,
              forks: repo.forks_count || 0,
            };
          })
          .sort(function (a, b) {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
          });
        writeCache(repos);
        renderRepos(repos);
      })
      .catch(function () {
        showError();
      });
  }

  loadRepos();
})();

import { qs, qsa, addListener } from './utils.js';
import { syncHeaderOffset } from './headerLayout.js';

export function initMobileMenuAndDropdown() {
  setActiveNavLink();
  initHeaderDropdownToggles();

  var toggler = qs(".navbar-toggler");
  var menuContainer = qs("#navbarSupportedContent") || qs(".navbar-collapse-container");
  var backdrop = qs(".drawer-backdrop") || qs("[data-drawer-backdrop]");

  if (toggler && menuContainer) {
    toggler.removeAttribute("data-bs-toggle");
    toggler.removeAttribute("data-bs-target");

    addListener(toggler, "click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      var isExpanded = toggler.getAttribute("aria-expanded") === "true";
      var willExpand = !isExpanded;

      toggler.setAttribute("aria-expanded", willExpand ? "true" : "false");
      menuContainer.classList.toggle("show", willExpand);
      document.body.classList.toggle("menu-open", willExpand);

      if (willExpand) {
        menuContainer.focus();
      } else {
        toggler.focus();
      }
    });

    if (backdrop) {
      addListener(backdrop, "click", function () {
        toggler.setAttribute("aria-expanded", "false");
        menuContainer.classList.remove("show");
        document.body.classList.remove("menu-open");
        toggler.focus();
      });
    }
  }

  addListener(document, "click", function (e) {
    var target = e.target;
    var togglerBtn = target && target.closest && target.closest(".navbar-toggler");
    if (togglerBtn) return;

    var opener = target && target.closest && target.closest(".nav-opener, .parent-link");
    if (opener) {
      setTimeout(syncHeaderOffset, 0);
    }
  });
}

function setActiveNavLink() {
  var currentPath = (window.location.pathname || "").replace(/\/+$/, "");

  qsa(".nav-link:not(.parent-link)").forEach(function (link) {
    var linkPath = "";
    try {
      linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/+$/, "");
    } catch (e) {
      linkPath = (link.getAttribute("href") || "").replace(/\/+$/, "");
    }
    link.classList.toggle("active", linkPath && linkPath === currentPath);
  });
}

function initHeaderDropdownToggles() {
  var dropdownParents = qsa(".nav-item.has-dropdown");
  if (!dropdownParents.length) return;

  function closeAllDropdowns(exceptItem) {
    dropdownParents.forEach(function (item) {
      if (item !== exceptItem) item.classList.remove("open");
    });
  }

  dropdownParents.forEach(function (parentItem) {
    var opener = qs(".nav-opener", parentItem);
    var parentLink = qs(".parent-link", parentItem);

    function toggleSubmenu(e) {
      e.preventDefault();
      e.stopPropagation();

      var willOpen = !parentItem.classList.contains("open");
      closeAllDropdowns(parentItem);
      parentItem.classList.toggle("open", willOpen);
    }

    addListener(opener, "click", toggleSubmenu);
    addListener(parentLink, "click", toggleSubmenu);
  });

  addListener(document, "click", function (event) {
    var isDesktop = window.matchMedia && window.matchMedia("(min-width: 768px)").matches;
    if (!isDesktop) return;

    var clickedInside = event.target.closest(".nav-item.has-dropdown");
    if (!clickedInside) {
      dropdownParents.forEach(function (item) {
        item.classList.remove("open");
      });
    }
  });
}

export function initProductDrawerNavDash() {
  const panel = document.querySelector(".product-navigation-panel");
  if (!panel) return;

  const links = Array.from(panel.querySelectorAll('.nav-panel-link[href^="#"]'));
  if (!links.length) return;

  let isManualScrolling = false;
  let manualScrollTimer = null;

  const getHeaderOffset = () => {
    const cssVar = getComputedStyle(document.documentElement).getPropertyValue("--header-offset").trim();
    const n = parseInt(cssVar, 10);
    return Number.isFinite(n) ? n : 72;
  };

  const setActive = (link) => {
    links.forEach((a) => a.classList.toggle("active", a === link));
  };

  links.forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();

      const id = a.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      isManualScrolling = true;
      setActive(a);
      target.scrollIntoView({ behavior: "smooth", block: "center" });

      clearTimeout(manualScrollTimer);
      manualScrollTimer = setTimeout(() => {
        isManualScrolling = false;
        history.replaceState(null, "", `#${id}`);
      }, 1000);
    });
  });

  const sections = links.map((a) => document.getElementById(a.getAttribute("href").slice(1))).filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isManualScrolling) return;

        const visibleEntries = entries.filter((en) => en.isIntersecting);
        if (visibleEntries.length === 0) return;

        const best = visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best.intersectionRatio < 0.1) return;

        if (best) {
          const link = links.find((a) => a.getAttribute("href") === `#${best.target.id}`);
          if (link) setActive(link);
        }
      },
      {
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
        rootMargin: `-${getHeaderOffset() + 24}px 0px -50% 0px`
      }
    );

    sections.forEach((sec) => observer.observe(sec));
  }

  const initial = (location.hash && links.find((a) => a.getAttribute("href") === location.hash)) || links[0];
  if (initial) requestAnimationFrame(() => setActive(initial));
}

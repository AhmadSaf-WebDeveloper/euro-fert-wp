import { qs, qsa, addListener } from "./utils.js";
import { syncHeaderOffset } from "./headerLayout.js";

export function initScrollIndicator() {
  var indicator = qs("#heroScrollIndicator");
  var grid = qs("#productGridContainer");
  if (!indicator) return;

  indicator.addEventListener("animationend", function (e) {
    if (e.animationName === "indicatorFadeIn") {
      indicator.style.animation = "none";
    }
  });

  addListener(indicator, "click", function () {
    if (grid) {
      grid.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  if (!grid) return;

  var ticking = false;
  addListener(
    window,
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          if (window.scrollY > 50) {
            indicator.classList.add("is-hidden");
          } else {
            indicator.classList.remove("is-hidden");
          }
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );
}

export function initHeaderScroll() {
  var header = qs("#header");
  var footer = qs("footer.footer") || qs(".footer");
  if (!header) return;

  var lastScrollY = window.scrollY || 0;
  var isScrolled = null;

  function updateHeaderOnScroll() {
    var currentY = window.scrollY || 0;

    var shouldBeScrolled = currentY > 50;
    if (shouldBeScrolled !== isScrolled) {
      header.classList.toggle("header--scrolled", shouldBeScrolled);
      isScrolled = shouldBeScrolled;
    }

    var menuOpen = document.body.classList.contains("menu-open");
    if (menuOpen) {
      lastScrollY = currentY;
      return;
    }

    if (currentY > lastScrollY && currentY > 120) {
      header.classList.add("header--hidden");
    } else {
      header.classList.remove("header--hidden");
    }

    lastScrollY = currentY;
  }

  var ticking = false;
  addListener(
    window,
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          updateHeaderOnScroll();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  if (footer) {
    var footerObserver = new IntersectionObserver( 
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            document.body.classList.add("footer-visible");
            var drawer = document.getElementById("desktopOverlayDrawer");
            if (drawer) {
              drawer.classList.add("is-hidden");
            }
          } else {
            document.body.classList.remove("footer-visible");
            var drawer = document.getElementById("desktopOverlayDrawer");
            if (drawer) {
              drawer.classList.remove("is-hidden");
            }
          }
        });
      },
      { rootMargin: "0px 0px -10px 0px" }
    );
    footerObserver.observe(footer);
  }

  addListener(window, "resize", syncHeaderOffset);
  addListener(window, "load", syncHeaderOffset);

  updateHeaderOnScroll();
  syncHeaderOffset();
}

export function initViewportAnimations() {

  // ── 1. Existing animation classes (.fade-in, .slide-up, .scale-in) ────────
  // Unchanged behaviour — adds .active class when element enters viewport.
  var animated = qsa(".fade-in, .slide-up, .scale-in");

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) activateEl(entry.target);
        });
      },
      { threshold: 0.15 }
    );
    animated.forEach(function (el) { io.observe(el); });
  } else {
    // Fallback for browsers without IntersectionObserver
    function isInViewport(el) {
      var rect = el.getBoundingClientRect();
      return (
        rect.top  <= (window.innerHeight || document.documentElement.clientHeight) * 0.85 &&
        rect.bottom >= 0
      );
    }
    function check() {
      animated.forEach(function (el) { if (isInViewport(el)) activateEl(el); });
    }
    check();
    addListener(window, "scroll", check, { passive: true });
  }

  // Grid animations are now handled globally by animations.js
}

function activateEl(el) {
  el.classList.add("active");
}

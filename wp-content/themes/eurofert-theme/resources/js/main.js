"use strict";

/** Utility function to query a single element */
function qs(selector, root) {
  return (root || document).querySelector(selector);
}

/** Utility function to query multiple elements */
function qsa(selector, root) {
  return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  // Convert NodeList to Array for easier manipulation allowing forEach, map, filter, etc.
}
/** Utility function to add an event listener */
function addListener(el, eventName, handler, options) {
  if (!el) return;
  el.addEventListener(eventName, handler, options || false);
}
/** Utility function to safely initialize a function and log errors */
function safeInit(fn, name) {
  try {
    fn();
  } catch (e) {
    console.error(name + " failed:", e);
  }
}
/* -----------------------------
   Entry point (runs once)
------------------------------ */
document.addEventListener("DOMContentLoaded", function () {
  safeInit(freezeHeroHeight, "freezeHeroHeight"); // must run first — freezes mobile hero padding before any scroll
  safeInit(initScrollHeaderAndBackToTop, "initScrollHeaderAndBackToTop");
  safeInit(initMobileMenuAndDropdown, "initMobileMenuAndDropdown");
  safeInit(initTestimonialCarousel, "initTestimonialCarousel");
  safeInit(initContactFormValidation, "initContactFormValidation");
  safeInit(initViewportAnimations, "initViewportAnimations");
  safeInit(initProductDrawerNavDash, "initProductDrawerNavDash");
  safeInit(initReadMoreToggle, "initReadMoreToggle");
  safeInit(initScrollIndicator, "initScrollIndicator");
  safeInit(initFixedOverlayPanel, "initFixedOverlayPanel");
});

/* -----------------------------
   Read More Toggle (Category Hero)
------------------------------ */
function initReadMoreToggle() {
  var descText = qs("#heroDescText");
  var readMoreBtn = qs("#heroReadMoreBtn");

  if (!descText || !readMoreBtn) return;

  // Check if text is truncated by comparing scrollHeight with clientHeight
  setTimeout(function () {
    if (descText.scrollHeight > descText.clientHeight) {
      readMoreBtn.style.display = "inline-flex";
    }
  }, 100);

  addListener(readMoreBtn, "click", function () {
    if (descText.classList.contains("is-truncated")) {
      descText.classList.remove("is-truncated");
      readMoreBtn.innerHTML = 'Read less <span class="read-more-arrows">&laquo;</span>';
      readMoreBtn.setAttribute("aria-expanded", "true");
    } else {
      descText.classList.add("is-truncated");
      readMoreBtn.innerHTML = 'Read more <span class="read-more-arrows">&raquo;</span>';
      readMoreBtn.setAttribute("aria-expanded", "false");
    }
  });
}

/* -----------------------------
   Scroll Indicator (Category Hero)
   - Fixed to viewport bottom, visible while user is in the hero section
   - Disappears the moment the product grid enters the viewport
   - Reappears if the user scrolls back up to the hero
   - Mobile: indicator has display:none via CSS — this JS runs but does nothing visible
------------------------------ */
function initScrollIndicator() {
  // 1. Query the indicator and the target product grid
  var indicator = qs("#heroScrollIndicator");
  var grid = qs("#productGridContainer");
  // 2. Safety Check: If this page has no scroll indicator in the HTML, stop
  if (!indicator) return;
  /* --- Step 1: Release the CSS animation lock after the fade-in finishes --- */
  indicator.addEventListener("animationend", function (e) {
    if (e.animationName === "indicatorFadeIn") {
      indicator.style.animation = "none"; // Remove fade-in; scrollBounce on child is unaffected
    }
  });

  // --- Step 2: Click — smooth scroll to product grid ---
  // which triggers the IntersectionObserver below — so the indicator disappears automatically.
  addListener(indicator, "click", function () {
    if (grid) {
      grid.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  if (!grid) return;

  /* --- Step 3: IntersectionObserver — watch the product grid ---
  //
  // IntersectionObserver fires whenever the observed element crosses the viewport boundary.
  // We observe #productGridContainer. The logic:
  //   - Grid enters viewport → products are visible → indicator is no longer needed → hide it
  //   - Grid leaves viewport → user scrolled back to hero → indicator is needed again → show it
  //
  // This covers all four user actions automatically:
      1. Scroll down to grid          → grid enters  → indicator hides
      2. Click indicator              → scroll brings grid in → grid enters → indicator hides
      3. Scroll back up from grid     → grid exits   → indicator reappears
      4. Any other page               → #heroScrollIndicator not in DOM → function returned early*/
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) indicator.classList.add("is-hidden");
        else indicator.classList.remove("is-hidden");
      });
    },
    {
      threshold: 0, // Fire the moment even 1px of the grid crosses the boundary
      rootMargin: "0px 0px 0px 0px" // No offset — hide exactly when grid becomes visible
    }
  );

  observer.observe(grid);
}

/* -----------------------------
   Freeze the expanded header height for mobile hero padding.
   Called ONCE at DOMContentLoaded — before any user scrolling.
   Writes --header-height-top which the mobile CSS uses for
   main > *:first-child padding-top. This value never changes,
   making the hero padding immune to the header shrink animation.
   Desktop is unaffected — it continues to use --header-offset.
------------------------------ */
function freezeHeroHeight() {
  var header = qs("#header") || qs(".header");
  if (!header) return;

  // If the page loaded with a scroll position (e.g. back/forward navigation),
  // temporarily remove the scrolled class so we measure the TRUE expanded height.
  var wasScrolled = header.classList.contains("header--scrolled");
  header.classList.remove("header--scrolled");

  var h = Math.ceil(header.getBoundingClientRect().height);
  document.documentElement.style.setProperty("--header-height-top", h + "px");

  // Restore the class if we temporarily removed it
  if (wasScrolled) header.classList.add("header--scrolled");
}

/* -----------------------------
   Keep CSS --header-offset in sync with real header height.
   Called on: page load, window resize.
   NOT called from scroll or menu events (would capture mid-animation values).
------------------------------ */
function syncHeaderOffset() {
  var header = qs("#header") || qs(".header");
  if (!header) return;

  var h = Math.ceil(header.getBoundingClientRect().height);
  document.documentElement.style.setProperty("--header-offset", h + "px");
}

/* -----------------------------
   1) Header scroll behavior + Back-to-top
   - Safe even if elements are missing
------------------------------ */
function initScrollHeaderAndBackToTop() {
  var header = qs("#header");
  var backToTopBtn = qs(".back-to-top");
  var footer = qs("footer.footer") || qs(".footer"); // retrieving footer for mobile back to top button.
  if (!header) return;

  var lastScrollY = window.scrollY || 0;
  var isScrolled = null; // track header--scrolled state

  // header shrink + auto-hide on scroll down, show on scroll up
  function updateHeaderOnScroll() {
    var currentY = window.scrollY || 0;

    var shouldBeScrolled = currentY > 50;
    if (shouldBeScrolled !== isScrolled) {
      header.classList.toggle("header--scrolled", shouldBeScrolled);
      isScrolled = shouldBeScrolled;
    }

    // if menu open, do not auto-hide
    var menuOpen = document.body.classList.contains("menu-open");
    if (menuOpen) {
      lastScrollY = currentY;
      return;
    }

    // 2) auto-hide on scroll down, show on scroll up
    if (currentY > lastScrollY && currentY > 120) {
      header.classList.add("header--hidden");
    } else {
      header.classList.remove("header--hidden");
    }

    lastScrollY = currentY;
  }

  function updateBackToTopVisibility() {
    if (!backToTopBtn) return;
    backToTopBtn.classList.toggle("active", (window.scrollY || 0) > 300);
  }

  function updateBackToTopPosition() {
    if (!backToTopBtn) return;

    var dynamicOffset = 0;
    if (footer) {
      var footerRect = footer.getBoundingClientRect();
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      // Amount of footer that is currently visible at the bottom of the viewport.
      var rawVisibleFooter = viewportHeight - footerRect.top;

      var visibleFooter = Math.max(0, Math.min(rawVisibleFooter, footerRect.height));

      if (visibleFooter > 0) {
        dynamicOffset = Math.ceil(visibleFooter + 12);
      }
    }

    backToTopBtn.style.setProperty("--back-top-dynamic-offset", dynamicOffset + "px");
  }

  // FIX: Layout Thrashing
  // Group all scroll calculations into a single requestAnimationFrame loop.
  // This guarantees layout math is only executed once per visual frame (60fps), eliminating CPU bottleneck.
  var ticking = false;
  addListener(
    window,
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          updateHeaderOnScroll();
          updateBackToTopVisibility();
          updateBackToTopPosition();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  // Footer visibility: drives body.footer-visible (mobile back-to-top) + overlay auto-collapse (desktop)
  if (footer) {
    var footerObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // 1. Mobile: fade back-to-top button
            document.body.classList.add("footer-visible");

            // 2. Desktop: auto-collapse the overlay if it is currently open.
            //    Only acts when the user has the drawer open — never touches an already-closed drawer.
            var drawer = document.getElementById("desktopOverlayDrawer");
            if (drawer && !drawer.classList.contains("is-collapsed")) {
              drawer.classList.add("is-collapsed");
              drawer.dataset.autoCollapsed = "true"; // flag: system did this, not the user
            }
          } else {
            // Footer left the viewport — restore previous state
            document.body.classList.remove("footer-visible");

            // Restore overlay only if the system auto-collapsed it.
            // If the user manually closed it, data-auto-collapsed is empty → we do nothing.
            var drawer = document.getElementById("desktopOverlayDrawer");
            if (drawer && drawer.dataset.autoCollapsed === "true") {
              drawer.classList.remove("is-collapsed");
              drawer.dataset.autoCollapsed = "";
            }
          }
        });
      },
      { rootMargin: "0px 0px -10px 0px" } // fires just before the footer edge reaches viewport bottom
    );
    footerObserver.observe(footer);
  }

  addListener(window, "resize", function () {
    syncHeaderOffset();
    updateBackToTopPosition();
  });

  addListener(window, "load", function () {
    syncHeaderOffset();
    updateBackToTopPosition();
  });

  addListener(backToTopBtn, "click", function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // initial state
  updateHeaderOnScroll();
  syncHeaderOffset();
  updateBackToTopVisibility();
  updateBackToTopPosition();
}

/* -----------------------------
   2) Mobile menu (Custom GPU transitions) + Dropdown submenu
   - Works for WP templates that include your header
------------------------------ */
function initMobileMenuAndDropdown() {
  // Highlight active page link (desktop & mobile)
  setActiveNavLink();

  // Dropdown open/close behavior for "Product Categories"
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

    // 1) Navbar toggler clicked (custom logic handles it now)
    var togglerBtn = target && target.closest && target.closest(".navbar-toggler");
    if (togglerBtn) {
      return;
    }

    // 2) Dropdown opener / parent link clicked (submenu can change header height on desktop)
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

/* Dropdown open/close behavior: toggles .open on .nav-item.has-dropdown */
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
      // Important: this stops <a href=""> from navigating/reloading
      e.preventDefault();
      e.stopPropagation();

      var willOpen = !parentItem.classList.contains("open");
      closeAllDropdowns(parentItem);
      parentItem.classList.toggle("open", willOpen);
    }

    addListener(opener, "click", toggleSubmenu);
    addListener(parentLink, "click", toggleSubmenu);
  });

  // Desktop only: click outside closes dropdown
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

/* -----------------------------
   3) Bootstrap Testimonial Carousel
------------------------------ */
function initTestimonialCarousel() {
  var el = qs("#testimonialCarousel");
  if (!el) return;

  if (typeof bootstrap === "undefined" || !bootstrap.Carousel) return;

  // eslint-disable-next-line no-unused-vars
  new bootstrap.Carousel(el, { interval: 5000, wrap: true });
}

/* -----------------------------
   4) Contact form validation (only runs if contact form exists)
------------------------------ */
function initContactFormValidation() {
  var form = qs(".contact-form form");
  if (!form) return;

  addListener(form, "submit", function (e) {
    e.preventDefault();

    var isValid = true;
    var requiredFields = qsa("[required]", form);

    requiredFields.forEach(function (field) {
      var ok = field.value && field.value.trim() !== "";
      field.classList.toggle("is-invalid", !ok);
      if (!ok) isValid = false;
    });

    var emailField = qs("#email", form);
    if (emailField && emailField.value) {
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      var okEmail = emailRegex.test(emailField.value);
      emailField.classList.toggle("is-invalid", !okEmail);
      if (!okEmail) isValid = false;
    }

    if (isValid) {
      form.reset();
      alert("Thank you! Your message has been sent successfully.");
    }
  });

  qsa("input, textarea", form).forEach(function (input) {
    addListener(input, "input", function () {
      if (input.hasAttribute("required")) {
        input.classList.toggle("is-invalid", input.value.trim() === "");
      }
      if (input.type === "email" && input.value) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        input.classList.toggle("is-invalid", !emailRegex.test(input.value));
      }
    });
  });
}

/* -----------------------------
   5) Viewport animations (fade/slide/scale)
------------------------------ */
function initViewportAnimations() {
  var animated = qsa(".fade-in, .slide-up, .scale-in, .product-grid-item");
  if (!animated.length) return;

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) activateEl(entry.target);
        });
      },
      { threshold: 0.15 }
    );

    animated.forEach(function (el) {
      io.observe(el);
    });
    return;
  }

  function isInViewport(el) {
    var rect = el.getBoundingClientRect();
    return rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85 && rect.bottom >= 0;
  }

  function check() {
    animated.forEach(function (el) {
      if (isInViewport(el)) activateEl(el);
    });
  }

  check();
  addListener(window, "scroll", check, { passive: true });
}

function activateEl(el) {
  // .product-grid-item uses .animate in animations.css
  if (el.classList.contains("product-grid-item")) {
    el.classList.add("animate");
    return;
  }
  // other viewport animations use .active
  el.classList.add("active");
}

/* drawer navigation*/
function initProductDrawerNavDash() {
  const panel = document.querySelector(".product-navigation-panel");
  if (!panel) return;

  const links = Array.from(panel.querySelectorAll('.nav-panel-link[href^="#"]'));
  if (!links.length) return;

  // 1. STATE LOCK: Prevents observer from firing while we scroll manually
  // THIS IS THE MISSING PART THAT FIXES THE FLICKER
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

      // 2. LOCK ON: Stop the camera immediately
      isManualScrolling = true;
      setActive(a);

      // 3. Scroll: We use scrollIntoView to center the section in the viewport so it doesn't get cut off
      target.scrollIntoView({ behavior: "smooth", block: "center" });

      // 4. LOCK OFF: Restart camera after scroll finishes (approx 1000ms)
      clearTimeout(manualScrollTimer);
      manualScrollTimer = setTimeout(() => {
        isManualScrolling = false;
        // Update URL hash safely
        history.replaceState(null, "", `#${id}`);
      }, 1000);
    });
  });

  const sections = links.map((a) => document.getElementById(a.getAttribute("href").slice(1))).filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        // 5. THE GUARD: If we are manually scrolling, STOP here.
        if (isManualScrolling) return;

        const visibleEntries = entries.filter((en) => en.isIntersecting);
        if (visibleEntries.length === 0) return;

        // Sort by how much is visible (Intersection Ratio)
        const best = visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        // 6. NOISE FILTER: Ignore tiny slivers (less than 10% visible)
        if (best.intersectionRatio < 0.1) return;

        if (best) {
          const link = links.find((a) => a.getAttribute("href") === `#${best.target.id}`);
          if (link) setActive(link);
        }
      },
      {
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
        // 7. SYNC: Matches your CSS offset (Header + 24px)
        rootMargin: `-${getHeaderOffset() + 24}px 0px -50% 0px`
      }
    );

    sections.forEach((sec) => observer.observe(sec));
  }

  // Initial active state check
  const initial = (location.hash && links.find((a) => a.getAttribute("href") === location.hash)) || links[0];
  if (initial) requestAnimationFrame(() => setActive(initial));
}

/* -----------------------------
   Fixed Overlay Toggle Logic
   Performance impact: Near zero. Execution time is <1ms per click.
   Animations are offloaded to CSS GPU acceleration.
------------------------------ */
function initFixedOverlayPanel() {
  const drawer = document.getElementById("desktopOverlayDrawer");
  const toggleBtn = document.getElementById("toggleOverlayBtn");

  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener("click", function () {
    drawer.classList.toggle("is-collapsed");
  });
}

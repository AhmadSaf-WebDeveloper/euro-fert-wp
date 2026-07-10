import { qs, addListener } from "./utils.js";

export function initBackToTop() {
  var backToTopBtn = qs(".back-to-top");
  var idleTimeout = null;
  var isPastThreshold = false;
  var pastSentinel = false;
  var pastFooter = false;

  function updateIdleState() {
    if (!backToTopBtn) return;
    
    backToTopBtn.classList.toggle("active", isPastThreshold);

    // Idle timer logic
    if (isPastThreshold) {
      backToTopBtn.classList.add("is-scrolling");
      clearTimeout(idleTimeout);
      
      // 1.5-second idle timer
      idleTimeout = setTimeout(function () {
        backToTopBtn.classList.remove("is-scrolling");
      }, 1500);
    }
  }

  function updateBackToTopPosition() {
    if (!backToTopBtn) return;
    var footer = qs("footer.footer") || qs(".footer");
    var dynamicOffset = 0;
    if (footer) {
      var footerRect = footer.getBoundingClientRect();
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      var rawVisibleFooter = viewportHeight - footerRect.top;
      var visibleFooter = Math.max(0, Math.min(rawVisibleFooter, footerRect.height));
      if (visibleFooter > 0) {
        dynamicOffset = Math.ceil(visibleFooter + 12);
      }
    }
    document.documentElement.style.setProperty("--back-top-dynamic-offset", dynamicOffset + "px");
  }

  // 1. Intelligent Sentinel Placement
  var grid = qs('.product-grid') || qs('#categories-grid');
  var productHero = qs('.single-eurofert_product .overview-section');
  var targetSection = grid || productHero; // Prioritize grid, fallback to product hero

  var sentinel;
  if (targetSection && targetSection.parentNode) {
      sentinel = document.createElement('div');
      sentinel.className = 'back-to-top-sentinel';
      sentinel.setAttribute('aria-hidden', 'true');
      sentinel.style.height = '1px';
      sentinel.style.pointerEvents = 'none';
      targetSection.parentNode.insertBefore(sentinel, targetSection.nextSibling);
  }

  // 2. High-Performance Multi-Target Observer
  if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
              // True if element is on screen, OR if we scrolled past it (it is above us)
              var isTargetPast = entry.isIntersecting || entry.boundingClientRect.top < 0;
              
              var footerEl = qs('footer.footer') || qs('.footer');

              // Track which element triggered the intersection
              if (sentinel && entry.target === sentinel) {
                  pastSentinel = isTargetPast;
              } else if (footerEl && entry.target === footerEl) {
                  pastFooter = isTargetPast;
              }
          });
          
          // Wake arrow if we passed the Sentinel OR if we hit the Footer (Global Fallback)
          isPastThreshold = pastSentinel || pastFooter;
          updateIdleState();
      }, { threshold: 0 });

      // Observe our targets
      if (sentinel) observer.observe(sentinel);
      var footerTarget = qs('footer.footer') || qs('.footer');
      if (footerTarget) observer.observe(footerTarget);
  } else {
    // Fallback for old browsers
    isPastThreshold = true;
  }

  var ticking = false;
  addListener(window, "scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateIdleState();
        updateBackToTopPosition();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  addListener(window, "resize", updateBackToTopPosition);
  addListener(window, "load", updateBackToTopPosition);

  if (backToTopBtn) {
    addListener(backToTopBtn, "click", function (e) {
      e.preventDefault();
      
      // Fly-away animation
      backToTopBtn.classList.add("fly-away");
      window.scrollTo({ top: 0, behavior: "smooth" });
      
      // Reset fly-away after smooth scroll completes
      setTimeout(function() {
        backToTopBtn.classList.remove("fly-away");
      }, 800);
    });

    // Pause idle timer on hover so it doesn't disappear under the cursor
    addListener(backToTopBtn, "mouseenter", function () {
      clearTimeout(idleTimeout);
      backToTopBtn.classList.add("is-scrolling"); // keep visible
    });

    // Resume idle timer when mouse leaves
    addListener(backToTopBtn, "mouseleave", function () {
      if (isPastThreshold) {
        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(function () {
          backToTopBtn.classList.remove("is-scrolling");
        }, 1500);
      } else {
        backToTopBtn.classList.remove("is-scrolling");
      }
    });
  }

  updateBackToTopPosition();
}

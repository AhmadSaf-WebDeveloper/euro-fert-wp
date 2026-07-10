import { safeInit } from './modules/utils.js';
import { initReadMoreToggle } from './modules/readMore.js';
import { initFixedOverlayPanel } from './modules/overlay.js';
import { initTestimonialCarousel } from './modules/carousel.js';
import { freezeHeroHeight } from './modules/headerLayout.js';
import { initMobileMenuAndDropdown, initProductDrawerNavDash } from './modules/navigation.js';
import { initHeaderScroll, initScrollIndicator, initViewportAnimations } from './modules/scroll.js';
import { initBackToTop } from './modules/backToTop.js';

document.addEventListener("DOMContentLoaded", function () {
  safeInit(freezeHeroHeight, "freezeHeroHeight"); 
  safeInit(initHeaderScroll, "initHeaderScroll");
  safeInit(initMobileMenuAndDropdown, "initMobileMenuAndDropdown");
  safeInit(initTestimonialCarousel, "initTestimonialCarousel");
  safeInit(initViewportAnimations, "initViewportAnimations");
  safeInit(initProductDrawerNavDash, "initProductDrawerNavDash");
  safeInit(initReadMoreToggle, "initReadMoreToggle");
  safeInit(initScrollIndicator, "initScrollIndicator");
  safeInit(initFixedOverlayPanel, "initFixedOverlayPanel");
  safeInit(initBackToTop, "initBackToTop");
});

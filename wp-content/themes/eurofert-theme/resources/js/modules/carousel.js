import { qs } from './utils.js';

export function initTestimonialCarousel() {
  var el = qs("#testimonialCarousel");
  if (!el) return;

  if (typeof bootstrap === "undefined" || !bootstrap.Carousel) return;

  // eslint-disable-next-line no-unused-vars
  new bootstrap.Carousel(el, { interval: 5000, wrap: true });
}

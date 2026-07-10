import { qs } from './utils.js';

export function freezeHeroHeight() {
  var header = qs("#header") || qs(".header");
  if (!header) return;

  var wasScrolled = header.classList.contains("header--scrolled");
  header.classList.remove("header--scrolled");

  var h = Math.ceil(header.getBoundingClientRect().height);
  document.documentElement.style.setProperty("--header-height-top", h + "px");

  if (wasScrolled) header.classList.add("header--scrolled");
}

export function syncHeaderOffset() {
  var header = qs("#header") || qs(".header");
  if (!header) return;

  var h = Math.ceil(header.getBoundingClientRect().height);
  document.documentElement.style.setProperty("--header-offset", h + "px");
}

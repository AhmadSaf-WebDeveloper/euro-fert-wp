export function qs(selector, root) {
  return (root || document).querySelector(selector);
}

export function qsa(selector, root) {
  return Array.prototype.slice.call((root || document).querySelectorAll(selector));
}

export function addListener(el, eventName, handler, options) {
  if (!el) return;
  el.addEventListener(eventName, handler, options || false);
}

export function safeInit(fn, name) {
  try {
    fn();
  } catch (e) {
    console.error(name + " failed:", e);
  }
}

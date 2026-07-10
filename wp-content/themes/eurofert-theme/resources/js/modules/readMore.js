import { qs, addListener } from './utils.js';

export function initReadMoreToggle() {
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

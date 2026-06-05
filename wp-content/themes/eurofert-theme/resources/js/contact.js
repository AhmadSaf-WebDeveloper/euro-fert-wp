/* =============================================================
   EUROFERT CONTACT MODAL — Vanilla JS
   - Intercepts the "Contact us" nav link
   - Opens / closes the fixed-position modal overlay
   - Handles AJAX form submission (no page reload)
   ============================================================= */

document.addEventListener("DOMContentLoaded", function () {

  /* ── 1. MODAL REFERENCES ─────────────────────────────────── */
  const modal     = document.getElementById("contact-modal");
  const closeBtn  = document.getElementById("contact-modal-close");
  const backdrop  = document.getElementById("contact-modal-backdrop");

  if (!modal) return; // Nothing to do if element doesn't exist

  /* ── 2. OPEN MODAL ───────────────────────────────────────── */
  let activeTrigger = null;

  function openModal(triggerElement) {
    activeTrigger = triggerElement || null;
    modal.removeAttribute("hidden");
    // Allow browser to paint "hidden removed" before adding transition class
    requestAnimationFrame(() => {
      modal.classList.add("is-open");
      document.body.classList.add("contact-modal-open");
    });
    // Move focus into the modal for accessibility
    if (closeBtn) closeBtn.focus();
  }

  /* ── 3. CLOSE MODAL ──────────────────────────────────────── */
  function closeModal() {
    modal.classList.remove("is-open");
    document.body.classList.remove("contact-modal-open");
    // Wait for CSS transition to finish before re-hiding
    modal.addEventListener("transitionend", function handler() {
      modal.setAttribute("hidden", "");
      modal.removeEventListener("transitionend", handler);
    });

    // The browser natively restores focus to the original trigger when the modal hides.
    // If closed via Escape, this triggers :focus-visible and highlights the button.
    // We explicitly blur it to satisfy the visual requirement of no sticky highlight.
    if (activeTrigger) {
      setTimeout(() => {
        if (activeTrigger) activeTrigger.blur();
        activeTrigger = null;
      }, 50); // Small timeout ensures it runs after the browser's native focus restore
    }
  }

  /* ── 4. EVENT LISTENERS ──────────────────────────────────── */

  // All links pointing to /contact-us/ → open modal (prevent page navigation)
  const triggers = document.querySelectorAll("a[href*='/contact-us']");
  triggers.forEach(function (triggerBtn) {
    triggerBtn.addEventListener("click", function (e) {
      e.preventDefault();
      openModal(triggerBtn);
    });
  });

  // Close button (desktop only — hidden via CSS on mobile)
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  // ── Backdrop click → close ──────────────────────────────────────────────
  // We listen on the entire modal container. If the user clicks anywhere that
  // is NOT inside the dialog wrapper (the card + close button), we close the modal.
  const dialog = document.querySelector(".contact-modal__dialog");
  if (modal && dialog) {
    modal.addEventListener("click", function(e) {
      if (!dialog.contains(e.target)) {
        closeModal();
      }
    });
  }

  // ── Escape key (desktop) → close ────────────────────────────────────────
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  /* ── 5. AJAX FORM SUBMISSION ─────────────────────────────── */
  const contactForm = document.getElementById("eurofert-contact-form");
  if (!contactForm) return;

  const submitBtn   = contactForm.querySelector('button[type="submit"]');
  const responseMsg = document.getElementById("contact-response-message");

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // UI feedback
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
    responseMsg.style.display = "none";
    responseMsg.className = "contact-modal__response";

    const formData = new FormData(contactForm);
    formData.append("action", "submit_eurofert_contact");

    if (typeof eurofertContact === "undefined") {
      console.error("AJAX object not localized.");
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Submit Inquiry</span><i class="fas fa-paper-plane"></i>';
      return;
    }

    formData.append("security", eurofertContact.nonce);

    fetch(eurofertContact.ajax_url, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Submit Inquiry</span><i class="fas fa-paper-plane"></i>';
        responseMsg.style.display = "block";

        if (data.success) {
          responseMsg.classList.add("success");
          responseMsg.innerHTML =
            '<i class="fas fa-check-circle"></i> ' + data.data.message;
          contactForm.reset();
        } else {
          responseMsg.classList.add("error");
          responseMsg.innerHTML =
            '<i class="fas fa-exclamation-circle"></i> ' + data.data.message;
        }
      })
      .catch((err) => {
        console.error("Contact form error:", err);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Submit Inquiry</span><i class="fas fa-paper-plane"></i>';
        responseMsg.style.display = "block";
        responseMsg.classList.add("error");
        responseMsg.innerHTML =
          '<i class="fas fa-exclamation-circle"></i> An unexpected error occurred. Please try again.';
      });
  });
});

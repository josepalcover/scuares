import { state } from "./state";

/**
 * Toggles contact button visibility based on whether the contact section is in view.
 * Used in non-slides (mobile) mode with IntersectionObserver.
 */
export function setContactBtnVisibilityFromSection(contactSectionInView) {
  const contactBtn = document.querySelector(".contact-btn");
  if (!contactBtn) return;
  if (contactSectionInView) {
    contactBtn.classList.add("contact-btn-hidden");
  } else {
    contactBtn.classList.remove("contact-btn-hidden");
  }
}

export function updateContactBtnVisibility() {
  const lastIndex = document.querySelectorAll(".snap").length;
  const contactBtn = document.querySelector(".contact-btn");

  if (state.index >= lastIndex) {
    contactBtn.classList.add("contact-btn-hidden");
  } else {
    contactBtn.classList.remove("contact-btn-hidden");
  }
}

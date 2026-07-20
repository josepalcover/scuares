import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

export function contactModalInit() {
  const modal = document.querySelector("#contact-modal");
  const pageContent = document.querySelector("#page-content");
  const toggle = document.querySelector("[data-contact-toggle]");
  const openers = document.querySelectorAll("[data-contact-open]");
  const close = document.querySelector("[data-contact-close]");
  const logo = document.querySelector("[data-contact-logo]");
  const navDockSection = document.querySelector(".nav-dock-section");
  const mobileLayout = window.matchMedia(
    "(max-aspect-ratio: 1/1), (max-width: 43.75em), (max-height: 28.125em)",
  );

  if (!modal || !pageContent || !toggle || !logo) return;

  let logoWasLight = false;
  let buttonWasLight = false;
  let isDockingForModal = false;
  let isClosing = false;
  let closeFallbackTimeout;

  function finishClosing() {
    if (!isClosing || modal.classList.contains("contact-modal--open")) return;

    isClosing = false;
    clearTimeout(closeFallbackTimeout);
    modal.removeEventListener("transitionend", handleModalTransitionEnd);
    document.documentElement.classList.remove("contact-modal-open");
    logo.classList.toggle("logo-light", logoWasLight);
    toggle.classList.toggle("contact-btn-light", buttonWasLight);
  }

  function handleModalTransitionEnd(event) {
    if (event.target === modal && event.propertyName === "opacity") {
      finishClosing();
    }
  }

  function setOpen(isOpen) {
    if (isOpen) {
      if (isClosing) {
        isClosing = false;
        clearTimeout(closeFallbackTimeout);
        modal.removeEventListener("transitionend", handleModalTransitionEnd);
      } else {
        logoWasLight = logo.classList.contains("logo-light");
        buttonWasLight = toggle.classList.contains("contact-btn-light");
      }

      document.documentElement.classList.add("contact-modal-open");
    }

    modal.classList.toggle("contact-modal--open", isOpen);
    toggle.classList.toggle("contact-btn--close", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    modal.setAttribute("aria-hidden", String(!isOpen));
    modal.toggleAttribute("inert", !isOpen);
    pageContent.toggleAttribute("inert", isOpen);

    if (isOpen) {
      logo.classList.remove("logo-light");
      toggle.classList.remove("contact-btn-light");
    } else {
      isClosing = true;
      modal.addEventListener("transitionend", handleModalTransitionEnd);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        requestAnimationFrame(finishClosing);
      } else {
        closeFallbackTimeout = setTimeout(finishClosing, 350);
      }
    }
  }

  function openModal() {
    const shouldDockFirst =
      mobileLayout.matches &&
      navDockSection &&
      navDockSection.getBoundingClientRect().top > 0;

    if (!shouldDockFirst) {
      setOpen(true);
      return;
    }

    if (isDockingForModal) return;
    isDockingForModal = true;

    gsap.to(window, {
      scrollTo: navDockSection,
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto",
      onComplete: () => {
        isDockingForModal = false;
        requestAnimationFrame(() => setOpen(true));
      },
      onInterrupt: () => {
        isDockingForModal = false;
      },
    });
  }

  toggle.addEventListener("click", () => {
    const shouldOpen = toggle.getAttribute("aria-expanded") !== "true";

    if (!shouldOpen) {
      setOpen(false);
      return;
    }

    openModal();
  });

  openers.forEach((opener) => {
    opener.addEventListener("click", (event) => {
      event.preventDefault();
      openModal();
    });
  });

  close?.addEventListener("click", () => {
    setOpen(false);
  });

  modal.addEventListener("click", (event) => {
    const target = event.target;

    if (target instanceof Element && target.closest(".text-box")) return;
    setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key !== "Escape" ||
      toggle.getAttribute("aria-expanded") !== "true"
    ) {
      return;
    }

    setOpen(false);
    toggle.focus();
  });
}

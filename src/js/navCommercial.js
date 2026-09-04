import { gsap } from "./gsap.js";

export function navCommercialInit(scrollController, contact) {
  const nav = document.querySelector(".nav-commercial");
  const hamburger = nav?.querySelector(".hamburger-box");
  const offscreenNav = nav?.querySelector(".nav-offscreen");
  const logo = nav?.querySelector(".nav-logo-box");
  const contactButton = nav?.querySelector("[data-contact-toggle]");

  if (!nav || !hamburger || !offscreenNav || !logo || !contactButton) return;

  let navIsActive = false;

  const navTimeline = gsap
    .timeline({ paused: true })
    .fromTo(offscreenNav, { autoAlpha: 0 }, { duration: 0.2, autoAlpha: 1 });

  function showNav() {
    navIsActive = true;
    hamburger.setAttribute("aria-expanded", "true");
    hamburger.setAttribute("aria-label", "Close navigation");
    offscreenNav.setAttribute("aria-hidden", "false");
    offscreenNav.removeAttribute("inert");
    navTimeline.restart();
    logo.classList.add("logo-nav-active");
    hamburger.classList.add("hamburger-nav-active");
    hamburger.classList.add("transparent");
  }

  function hideNav() {
    navIsActive = false;
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "Open navigation");
    offscreenNav.setAttribute("aria-hidden", "true");
    offscreenNav.setAttribute("inert", "");
    navTimeline.reverse();
    logo.classList.remove("logo-nav-active");
    hamburger.classList.remove("hamburger-nav-active");
    hamburger.classList.remove("transparent");
  }

  hamburger.addEventListener("click", () => {
    if (navIsActive) {
      hideNav();
    } else {
      showNav();
    }
  });

  contactButton.addEventListener("click", () => {
    if (!contact?.isOpen() && navIsActive) hideNav();
    contact?.toggle({ opener: contactButton });
  });

  contact?.subscribe(({ isOpen }) => {
    contactButton.classList.toggle("contact-btn--close", isOpen);
    contactButton.setAttribute("aria-expanded", String(isOpen));
  });

  document.body.addEventListener("click", (event) => {
    const navClick = event.target.closest(".nav-commercial");
    if (!navClick && navIsActive) hideNav();
  });

  offscreenNav.addEventListener("click", hideNav);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navIsActive) {
      hideNav();
      hamburger.focus({ preventScroll: true });
    }
  });

  const scrollToSection = (target) => {
    scrollController.scrollTo(target === "#home" ? 0 : target, {
      autoKill: false,
    });
  };

  nav.addEventListener("click", (event) => {
    const clickedLink = event.target.closest(".link");
    if (!clickedLink) return;

    event.preventDefault();

    if (clickedLink.hasAttribute("data-contact-open")) {
      if (navIsActive) hideNav();
      contact?.open({ opener: contactButton });
      return;
    }

    const target = clickedLink.dataset.goto ?? clickedLink.getAttribute("href");
    if (!target) return;

    scrollToSection(target);
    if (navIsActive) hideNav();
  });

  document
    .querySelector(".hero-service-links")
    ?.addEventListener("click", (event) => {
      const clickedLink = event.target.closest(".hero-service-link");
      if (!clickedLink) return;

      event.preventDefault();
      const target = clickedLink.getAttribute("href");
      if (target) scrollToSection(target);
    });
}

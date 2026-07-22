import { gsap } from "../js/gsap.js";

export function navInit(scrollController) {
  const nav = document.querySelector(".nav-commercial");
  const hamburger = document.querySelector(".hamburger-box");
  const offscreenNav = document.querySelector(".nav-offscreen");
  const logo = document.querySelector(".nav-logo-box");
  const logoBox = document.querySelector(".logo-box");

  if (!nav || !hamburger || !offscreenNav || !logo) return;

  let navIsActive = false;

  const navTimeline = gsap
    .timeline({ paused: true })
    .fromTo(
      offscreenNav,
      { autoAlpha: 0 },
      { duration: 0.2, autoAlpha: 1 },
    );

  function showNav() {
    navIsActive = true;
    navTimeline.restart();
    logo.classList.add("logo-nav-active");
    hamburger.classList.add("hamburger-nav-active");
    logoBox?.classList.add("fixed");
    hamburger.classList.add("transparent");
  }

  function hideNav() {
    navIsActive = false;
    navTimeline.reverse();
    logo.classList.remove("logo-nav-active");
    hamburger.classList.remove("hamburger-nav-active");
    logoBox?.classList.remove("fixed");
    hamburger.classList.remove("transparent");
  }

  hamburger.addEventListener("click", () => {
    if (navIsActive) {
      hideNav();
    } else {
      showNav();
    }
  });

  document.body.addEventListener("click", (event) => {
    const navClick = event.target.closest(".nav-commercial");
    if (!navClick && navIsActive) hideNav();
  });

  offscreenNav.addEventListener("click", hideNav);

  const scrollToSection = (target) => {
    scrollController.scrollTo(target === "#home" ? 0 : target);
  };

  nav.addEventListener("click", (event) => {
    const clickedLink = event.target.closest(".link");
    if (!clickedLink) return;

    event.preventDefault();

    if (clickedLink.hasAttribute("data-contact-open")) {
      if (navIsActive) hideNav();
      return;
    }

    const target =
      clickedLink.dataset.goto ?? clickedLink.getAttribute("href");
    if (!target) return;

    scrollToSection(target);
    if (navIsActive) hideNav();
  });

  document.querySelector("#about")?.addEventListener("click", (event) => {
    const clickedLink = event.target.closest(".about-service-link");
    if (!clickedLink) return;

    event.preventDefault();
    const target = clickedLink.getAttribute("href");
    if (target) scrollToSection(target);
  });
}

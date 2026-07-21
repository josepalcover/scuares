gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SINGLE_COLUMN_QUERY } from "../styles/breakpoints.js";
import { state } from "./state.js";

export function navInit() {
  // hamburger
  const nav = document.querySelector(".nav-commercial");
  const hamburger = document.querySelector(".hamburger-box");

  /////////////////
  // SHOW / HIDE NAV ANIMATION

  const logo = document.querySelector(".nav-logo-box");
  const logoBox = document.querySelector(".logo-box");

  let navTl;
  let navIsActive = false;
  let mmNav = gsap.matchMedia();
  let currentId = "#home";
  const portraitMode = window.matchMedia(SINGLE_COLUMN_QUERY);

  const getScrollTarget = (target) => {
    if (!portraitMode.matches || target === 0) return target;

    return {
      y: target,
      offsetY: nav.offsetHeight,
    };
  };

  navTl = gsap
    .timeline({ paused: true })
    .fromTo(
      ".nav-offscreen",
      { autoAlpha: 0 },
      { duration: 0.2, autoAlpha: 1 },
    );

  function showNav() {
    navIsActive = true;
    navTl.restart();
    logo.classList.add("logo-nav-active");
    hamburger.classList.add("hamburger-nav-active");
    logoBox?.classList.add("fixed");
    hamburger.classList.add("transparent");
  }

  function hideNav() {
    navIsActive = false;
    navTl.reverse();
    logo.classList.remove("logo-nav-active");
    hamburger.classList.remove("hamburger-nav-active");
    logoBox?.classList.remove("fixed");
    hamburger.classList.remove("transparent");
  }

  hamburger.addEventListener("click", () => {
    if (navIsActive) return hideNav();
    if (!navIsActive) return showNav();
  });

  // hide nav when clicking outside of the nav
  document.body.addEventListener("click", (e) => {
    const navClick = e.target.closest(".nav-commercial");
    if (!navClick && navIsActive) {
      hideNav();
    }
  });

  // hide nav when clicking on the nav background
  document.querySelector(".nav-offscreen").addEventListener("click", () => {
    hideNav();
  });

  //////////////////
  // LINKS - SCROLL TO

  const scrollToSection = (goTo) => {
    // Keep the home link aligned with the observer's first slide index.
    if (goTo === "#home") goTo = 0;

    gsap.to(window, {
      scrollTo: getScrollTarget(goTo),
      duration: 1,
      onComplete: () => {
        // update index so we can continue with the scrolling animations
        state.index = Math.floor(window.scrollY / innerHeight);
      },
    });
  };

  nav.addEventListener("click", (e) => {
    e.preventDefault();

    const clickedLink = e.target.closest(".link");
    if (!clickedLink) return;

    if (clickedLink.hasAttribute("data-contact-open")) {
      if (navIsActive) hideNav();
      return;
    }

    let goTo = clickedLink.dataset.goto ?? clickedLink.getAttribute("href");
    if (!goTo) return;

    scrollToSection(goTo);
    if (navIsActive) hideNav();
  });

  document.querySelector("#about")?.addEventListener("click", (e) => {
    const clickedLink = e.target.closest(".about-service-link");
    if (!clickedLink) return;

    e.preventDefault();
    const goTo = clickedLink.getAttribute("href");
    if (goTo) scrollToSection(goTo);
  });
}

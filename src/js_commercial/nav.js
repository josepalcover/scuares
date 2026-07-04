gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { state } from "./state.js";
import { updateContactBtnVisibility } from "./nextAndContactBtn.js";

export function navInit() {
  // hamburger
  const hamburger = document.querySelector(".hamburger");
  const lineTop = document.querySelector(".line-top");
  const lineMid = document.querySelector(".line-mid");
  const lineBottom = document.querySelector(".line-bottom");

  let hamburgerClickCount = 0;
  const hamburgerNavAnim = () => {
    if (hamburgerClickCount === 0) {
      /*we don't use an animation in the line to avoid animation on load */
      lineTop.classList.toggle("anim-line-top");
      lineMid.classList.toggle("anim-line-mid");
      lineBottom.classList.toggle("anim-line-bottom");
      //nav.classList.toggle("nav-in");
      hamburgerClickCount++;
    } else {
      lineTop.classList.toggle("anim-line-top");
      lineMid.classList.toggle("anim-line-mid");
      lineBottom.classList.toggle("anim-line-bottom");
      lineTop.classList.toggle("anim-line-top-rev");
      lineMid.classList.toggle("anim-line-mid-rev");
      lineBottom.classList.toggle("anim-line-bottom-rev");
    }
  };

  /////////////////
  // SHOW / HIDE NAV ANIMATION

  const logo = document.querySelector(".logo");
  const logoBox = document.querySelector(".logo-box");

  let navTl;
  let navIsActive = false;
  let mmNav = gsap.matchMedia();
  let currentId = "#home";

  navTl = gsap
    .timeline({ paused: true })
    .fromTo(
      ".nav-box",
      { yPercent: -100, autoAlpha: 0 },
      { yPercent: 0, duration: 0.2, autoAlpha: 1 },
    );

  function showNav() {
    navIsActive = true;
    navTl.restart();
    logo.classList.add("logo-nav-active");
    hamburgerNavAnim();
    logoBox.classList.add("fixed");
    hamburger.classList.add("transparent");
  }

  function hideNav() {
    navIsActive = false;
    navTl.reverse();
    logo.classList.remove("logo-nav-active");
    hamburgerNavAnim();
    logoBox.classList.remove("fixed");
    hamburger.classList.remove("transparent");
  }

  hamburger.addEventListener("click", () => {
    if (navIsActive) return hideNav();
    if (!navIsActive) return showNav();
  });

  // hide nav when clicking outside of the nav
  document.body.addEventListener("click", (e) => {
    const navClick = e.target.closest(".nav");
    if (!navClick && navIsActive) {
      hideNav();
    }
  });

  // hide nav when clicking on the nav background
  document.querySelector(".nav-box").addEventListener("click", () => {
    hideNav();
  });

  //////////////////
  // LINKS - SCROLL TO

  const nav = document.querySelector(".nav");

  nav.addEventListener("click", (e) => {
    e.preventDefault();

    const clickedLink = e.target.closest(".link");
    if (!clickedLink) return;
    let goTo = clickedLink.getAttribute("href");

    // Keep the home link aligned with the observer's first slide index.
    if (goTo === "#home") goTo = 0;

    gsap.to(window, {
      scrollTo: goTo,
      duration: 1,
      onComplete: () => {
        // update index so we can continue with the scrolling animations
        state.index = Math.floor(window.scrollY / innerHeight);
        updateContactBtnVisibility();
      },
    });
    if (navIsActive) hideNav();
  });

  /// CONTACT BUTTON SCROLL TO
  const contactBtn = document.querySelector(".contact-btn");
  contactBtn.addEventListener("click", (e) => {
    e.preventDefault();
    gsap.to(window, {
      scrollTo: "#contact",
      duration: 1,
      onComplete: () => {
        state.index = Math.floor(window.scrollY / innerHeight);
        updateContactBtnVisibility();
      },
    });
    if (navIsActive) hideNav();
  });
}

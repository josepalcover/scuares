// register plugins to avoid problems with tree shaking
// when using build tools
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

import { scrollObserver } from "./scrollObserver.js";
import { scrollSnapping } from "./scrollSnapping.js";
import { state } from "./state.js";

export function scrollInit() {
  ////////////////////////////
  // GSAP defaults

  // for tweens
  gsap.defaults({ duration: 1 });

  // for scrollTrigger
  ScrollTrigger.defaults({
    start: "top bottom",
    end: "+=100%",
    toggleActions: "restart pause pause reverse",
    invalidateOnRefresh: true,
  });

  // create observer (then we will enable or disable it)
  const observer = scrollObserver();
  observer.disable(); //we create the observer and imediately disable it

  const nav = document.querySelector(".nav-main");
  const navDockSection = document.querySelector(".nav-dock-section");
  const logo = document.querySelector(".logo");
  const contactBtn = document.querySelector(".contact-btn");
  ///// MATCH MEDIA (animations only on landscape mode)
  let mm = gsap.matchMedia();

  function updateNavState(isFixed) {
    if (!nav) return;
    nav.classList.toggle("nav-main--fixed", isFixed);
    nav.classList.toggle("nav-main--docked", !isFixed);
  }

  function syncNavState() {
    if (!navDockSection) return;
    updateNavState(navDockSection.getBoundingClientRect().top <= 0);
  }

  function updateNavTheme(page) {
    logo.classList.toggle("logo-light", page.dataset.logo === "light");
    contactBtn.classList.toggle(
      "contact-btn-light",
      (page.dataset.contact ?? page.dataset.logo) === "light",
    );
  }

  if (nav && navDockSection) {
    ScrollTrigger.create({
      trigger: navDockSection,
      start: "top top",
      end: "max",
      onEnter: () => updateNavState(true),
      onLeaveBack: () => updateNavState(false),
      onRefresh: syncNavState,
    });

    syncNavState();
  }

  mm.add(
    "(min-width: 800px) and (min-aspect-ratio: 1.3) and (max-aspect-ratio: 3/1) and (min-height: 450px)",
    () => {
      // slides mode = true
      state.slides = true;
      // save current scroll index in case we come from
      // another match media case without observer
      state.index = Math.floor(window.scrollY / innerHeight);

      // observer-based scroll-to animation
      observer.enable();

      // activagte snapping so it works on touch devices
      scrollSnapping();

      ScrollTrigger.refresh();

      // logo and contact color depending on slide

      //click to any slide for scroll
      const pages = gsap.utils.toArray(".snap");
      const slideClickHandlers = [];

      function scrollToNextSlide(pageIndex) {
        const nextIndex = Math.min(pageIndex + 1, pages.length - 1);
        if (nextIndex === pageIndex) return;

        gsap.to(window, {
          scrollTo: nextIndex * innerHeight,
          duration: 0.5,
          onComplete: () => {
            state.index = nextIndex;
          },
        });
      }

      pages.forEach((page, pageIndex) => {
        ScrollTrigger.create({
          trigger: page,
          start: "top 1%", //when top of the page is 2.5 pages away

          onEnter: () => updateNavTheme(page),
          onEnterBack: () => updateNavTheme(page),
        });

        if (page.id === "home") return;

        const handleSlideClick = () => scrollToNextSlide(pageIndex);
        page.addEventListener("click", handleSlideClick);
        slideClickHandlers.push([page, handleSlideClick]);
      });

      return () => {
        // cleanup function
        slideClickHandlers.forEach(([page, handleSlideClick]) => {
          page.removeEventListener("click", handleSlideClick);
        });
        logo.classList.remove("logo-light");
        contactBtn.classList.remove("contact-btn-light");
        ScrollTrigger.refresh();
        observer.disable();
        state.slides = false;
      };
    },
  );
}

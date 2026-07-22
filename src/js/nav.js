import { gsap, ScrollTrigger } from "./gsap.js";
import { SCROLL_CONFIG } from "./scroll/config.js";

export function navInit(scrollController) {
  const nav = document.querySelector(".nav-main");
  const navDockSection = document.querySelector(".nav-dock-section");
  const logo = nav?.querySelector(".logo");
  const contactButton = nav?.querySelector(".contact-btn");

  if (!nav || !logo || !contactButton) return;

  nav.addEventListener("click", (event) => {
    const clickedLink = event.target.closest(".link");
    if (!clickedLink) return;

    event.preventDefault();
    const target = clickedLink.dataset.goto ?? clickedLink.getAttribute("href");
    if (target) scrollController.scrollTo(target);
  });

  function updateDocking(isFixed) {
    nav.classList.toggle("nav-main--fixed", isFixed);
    nav.classList.toggle("nav-main--docked", !isFixed);
  }

  function syncDocking() {
    if (!navDockSection) return;
    updateDocking(navDockSection.getBoundingClientRect().top <= 0);
  }

  if (navDockSection) {
    ScrollTrigger.create({
      trigger: navDockSection,
      start: "top top",
      end: "max",
      invalidateOnRefresh: true,
      onEnter: () => updateDocking(true),
      onLeaveBack: () => updateDocking(false),
      onRefresh: syncDocking,
    });
    syncDocking();
  }

  function updateTheme(slide) {
    logo.classList.toggle("logo-light", slide.dataset.logo === "light");
    contactButton.classList.toggle(
      "contact-btn-light",
      (slide.dataset.contact ?? slide.dataset.logo) === "light",
    );
  }

  const mediaContext = gsap.matchMedia();
  mediaContext.add(SCROLL_CONFIG.slideMediaQuery, () => {
    const slides = gsap.utils.toArray(SCROLL_CONFIG.slideSelector);
    const themeTriggers = slides.map((slide) =>
      ScrollTrigger.create({
        trigger: slide,
        start: "top 1%",
        end: "+=100%",
        invalidateOnRefresh: true,
        onEnter: () => updateTheme(slide),
        onEnterBack: () => updateTheme(slide),
      }),
    );

    const currentSlide = slides[scrollController.index];
    if (currentSlide) updateTheme(currentSlide);

    return () => {
      themeTriggers.forEach((trigger) => trigger.kill());
      logo.classList.remove("logo-light");
      contactButton.classList.remove("contact-btn-light");
    };
  });
}

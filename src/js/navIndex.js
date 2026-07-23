import { gsap, ScrollTrigger } from "./gsap.js";
import { SCROLL_CONFIG } from "./scroll/config.js";

export function navIndexInit(scrollController, contact) {
  const nav = document.querySelector(".nav-main");
  const navDockSection = document.querySelector(".nav-dock-section");
  const logo = nav?.querySelector(".logo");
  const contactButton = nav?.querySelector("[data-contact-toggle]");

  if (!nav || !logo || !contactButton) return;

  let contactThemeSnapshot;

  function applyTheme({ logoIsLight, contactButtonIsLight }) {
    logo.classList.toggle("logo-light", logoIsLight);
    contactButton.classList.toggle("contact-btn-light", contactButtonIsLight);
  }

  nav.addEventListener("click", (event) => {
    const clickedLink = event.target.closest(".link");
    if (!clickedLink) return;

    event.preventDefault();
    const target = clickedLink.dataset.goto ?? clickedLink.getAttribute("href");
    if (target) scrollController.scrollTo(target, { autoKill: false });
  });

  contactButton.addEventListener("click", () => {
    contact?.toggle({ opener: contactButton });
  });

  contact?.subscribe(({ phase, isOpen }) => {
    contactButton.classList.toggle("contact-btn--close", isOpen);
    contactButton.setAttribute("aria-expanded", String(isOpen));

    if (phase === "open") {
      if (!contactThemeSnapshot) {
        contactThemeSnapshot = {
          logoIsLight: logo.classList.contains("logo-light"),
          contactButtonIsLight:
            contactButton.classList.contains("contact-btn-light"),
        };
      }
      applyTheme({ logoIsLight: false, contactButtonIsLight: false });
    } else if (phase === "closed" && contactThemeSnapshot) {
      applyTheme(contactThemeSnapshot);
      contactThemeSnapshot = undefined;
    }
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
    const nextTheme = {
      logoIsLight: slide.dataset.logo === "light",
      contactButtonIsLight:
        (slide.dataset.contact ?? slide.dataset.logo) === "light",
    };

    if (contactThemeSnapshot) {
      contactThemeSnapshot = nextTheme;
    } else {
      applyTheme(nextTheme);
    }
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
      const defaultTheme = {
        logoIsLight: false,
        contactButtonIsLight: false,
      };

      if (contactThemeSnapshot) {
        contactThemeSnapshot = defaultTheme;
      } else {
        applyTheme(defaultTheme);
      }
    };
  });
}

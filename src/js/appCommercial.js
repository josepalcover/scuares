import { gsap, ScrollTrigger } from "./gsap.js";
import { navCommercialInit } from "./navCommercial.js";
import { filmModalInit } from "./filmModal.js";
import { panosInit } from "./panos.js";
import { heroInit } from "./hero.js";
import { createContactModal } from "./contactModal.js";
import { contactCommercialInit } from "./contactCommercial.js";
import { detectPreferredImageFormat } from "./imageFormat.js";
import { createScrollController } from "./scroll/controller.js";
import { SINGLE_COLUMN_QUERY } from "../styles/breakpoints.js";

const singleColumnLayout = window.matchMedia(SINGLE_COLUMN_QUERY);
const commercialNav = document.querySelector(".nav-commercial");
const scrollController = createScrollController({
  resolveAnchorOffset: ({ target }) => {
    if (
      !singleColumnLayout.matches ||
      typeof target !== "string" ||
      target === "#home"
    ) {
      return 0;
    }

    return commercialNav?.offsetHeight ?? 0;
  },
  onSlideModeExit: () => {
    document
      .querySelector(".pano-overlay")
      ?.classList.remove("pano-overlay-hidden");
  },
});

const contactModal = createContactModal(scrollController);
const contact = contactCommercialInit(contactModal);

navCommercialInit(scrollController, contact);
filmModalInit(scrollController);

const initialImages = gsap.utils.toArray(".img-initial");
const lazyImages = gsap.utils.toArray(".img-lazy");
const filmImages = gsap.utils.toArray(".film-img");
const nonFilmLazyImages = lazyImages.filter(
  (img) => !img.classList.contains("film-img"),
);

function loadFilmsAssets(imgFormat) {
  const videoFilms = document.querySelector(".video-films");
  videoFilms.poster = `/images/${videoFilms.dataset.poster}.${imgFormat}`;
  videoFilms.src = videoFilms.dataset.src;

  filmImages.forEach((img) => {
    img.src = `/images/${img.dataset.src}.${imgFormat}`;
  });
}

function loadImages(imgFormat) {
  heroInit(imgFormat);

  initialImages.forEach((img) => {
    img.src = `/images/${img.dataset.src}.${imgFormat}`;
  });

  loadFilmsAssets(imgFormat);

  ////////////////////////////////////////////
  // FIRST SCROLL - LOWRES IMGS
  ////////////////////////////////////////////

  const firstTrigger = ScrollTrigger.create({
    trigger: "#films",
    start: "top 80%",
    onEnter: () => {
      nonFilmLazyImages.forEach((img) => {
        img.src = `/images/lowres/${img.dataset.src}.${imgFormat}`;
      });

      firstTrigger.kill();
    },
  });

  ////////////////////////////////////////////
  // LAZY LOAD IMAGES WITH SCROLL TRIGGER
  ////////////////////////////////////////////

  nonFilmLazyImages.forEach((img) => {
    const imgTrigger = ScrollTrigger.create({
      trigger: img,
      start: "top 250%",
      onEnter: () => {
        img.src = `/images/${img.dataset.src}.${imgFormat}`;
        imgTrigger.kill();
      },
    });
  });
}

window.addEventListener("load", () => {
  detectPreferredImageFormat().then(loadImages);

  let panosCreated = false;
  const toursTrigger = ScrollTrigger.create({
    trigger: "#tours",
    start: "top 250%",
    onEnter: () => {
      if (!panosCreated) {
        panosInit(scrollController);
        panosCreated = true;
      }
      toursTrigger.kill();
    },
  });
});

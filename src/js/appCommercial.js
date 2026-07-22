import { ScrollTrigger } from "./gsap.js";
import { navCommercialInit } from "./navCommercial.js";
import { filmModalInit } from "./filmModal.js";
import { panosInit } from "./panos.js";
import { heroInit } from "./hero.js";
import { createContactModal } from "./contactModal.js";
import { contactCommercialInit } from "./contactCommercial.js";
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

window.addEventListener("load", () => {
  heroInit();

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

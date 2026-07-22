import { gsap, ScrollTrigger } from "./gsap.js";
import { navIndexInit } from "./navIndex.js";
import { heroInit } from "./hero.js";
import { createContactModal } from "./contactModal.js";
import { contactIndexInit } from "./contactIndex.js";
import { detectPreferredImageFormat } from "./imageFormat.js";
import { createScrollController } from "./scroll/controller.js";

const scrollController = createScrollController();
const contactModal = createContactModal(scrollController);
const contact = contactIndexInit(contactModal, scrollController);

navIndexInit(scrollController, contact);

function loadImages(imgFormat) {
  heroInit(imgFormat);

  ////////////////////////////////////////////
  // LOAD DIRECTLY INITIAL IMAGES (class img-initial) and lowres all
  ////////////////////////////////////////////

  const initialImages = gsap.utils.toArray(".img-initial");
  initialImages.forEach((img) => {
    img.src = `images/${img.dataset.src}.${imgFormat}`;
  });

  const lazyImages = gsap.utils.toArray(".img-lazy");
  lazyImages.forEach((img) => {
    img.src = `images/lowres/${img.dataset.src}.${imgFormat}`;
  });

  ////////////////////////////////////////////
  // LAZY LOAD IMAGES WITH SCROLL TRIGGER (class img-lazy)
  ////////////////////////////////////////////

  lazyImages.forEach((img) => {
    const imgTrigger = ScrollTrigger.create({
      trigger: img,
      start: "top 150%",
      onEnter: () => {
        img.src = `images/${img.dataset.src}.${imgFormat}`;
        imgTrigger.kill();
      },
    });
  });
}

window.addEventListener("load", () => {
  detectPreferredImageFormat().then(loadImages);
});

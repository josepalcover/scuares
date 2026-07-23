import { navIndexInit } from "./navIndex.js";
import { heroInit } from "./hero.js";
import { createContactModal } from "./contactModal.js";
import { contactIndexInit } from "./contactIndex.js";
import { createScrollController } from "./scroll/controller.js";
import { galleryPreloadInit } from "./galleryPreload.js";

galleryPreloadInit();

const scrollController = createScrollController();
const contactModal = createContactModal(scrollController);
const contact = contactIndexInit(contactModal, scrollController);

navIndexInit(scrollController, contact);

window.addEventListener("load", () => {
  heroInit();
});

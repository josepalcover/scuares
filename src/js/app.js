import { gsap, ScrollTrigger } from "./gsap.js";
import { navInit } from "./nav.js";
import { heroInit } from "./hero.js";
import { contactModalInit } from "./contactModal.js";
import { createScrollController } from "./scroll/controller.js";

// initialize scroll behavior and navigation
const scrollController = createScrollController();
navInit(scrollController);
contactModalInit(scrollController);

/////// LOADING

// function to load images with a certain format
// we call it later after cjecking webp support
function loadImages(imgFormat) {
  heroInit(imgFormat);

  ////////////////////////////////////////////
  // LOAD DIRECTLY INITIAL IMAGES (class img-initial) and lowres all
  ////////////////////////////////////////////

  // about images load the supported format
  const initialImages = gsap.utils.toArray(".img-initial");
  initialImages.forEach((img) => {
    img.src = `images/${img.dataset.src}.${imgFormat}`;
  });

  const lazyImages = gsap.utils.toArray(".img-lazy");
  // LOWRES LAZY IMAGES  load the lowres version directly
  lazyImages.forEach((img) => {
    img.src = `images/lowres/${img.dataset.src}.${imgFormat}`;
  });

  ////////////////////////////////////////////

  ////////////////////////////////////////////
  // LAZY LOAD IMAGES WITH SCROLL TRIGGER (class img-lazy)
  ////////////////////////////////////////////

  // all images load the supported img format
  // the high res version with scroll trigger (load using scroll trigger)

  lazyImages.forEach((img) => {
    const imgTrigger = ScrollTrigger.create({
      trigger: img,
      start: "top 150%", //when top of the img is 1.5 pages away
      onEnter: () => {
        // the format is a string "webp" or "jpg" depending on support
        img.src = `images/${img.dataset.src}.${imgFormat}`;
        imgTrigger.kill();
        ///// instead of doing this: we can add a low res image with the same proportion as the high res one! this would help avoid layout shifting
        /////// when page finishes loading we add the good src
      },
    });
  });
}

// when page finishes loading it fires the "load" event on window object
window.addEventListener("load", () => {
  ////////////////////////////////////////////
  // CHECK IMG FORMAT SUPPORT (avif)
  ////////////////////////////////////////////

  //check avif support
  const imgAvif = new Image();
  // if the image can be loaded
  imgAvif.onload = () => loadImages("avif");
  // if the image cannot be loaded
  imgAvif.onerror = () => {
    loadImages("jpg");
  };
  // special string from google webp documentation to check for webp lossy support
  imgAvif.src =
    "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=";

  //webp.src="data:image/webp;base64, UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA";

  // when we load this src, either the onload or onerror event will be triggered
});

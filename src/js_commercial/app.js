gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

import { navInit } from "./nav.js";
import { scrollInit } from "./scroll.js";
import { filmModalInit } from "./filmModal.js";
import { panosInit } from "./panos.js";
import { heroInit } from "../js/hero.js";
import { contactModalInit } from "../js/contactModal.js";

// initialize scroll behavior and navigation
scrollInit();
navInit();
contactModalInit();

/////// ASSET LOADING
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

// Load image assets after checking AVIF support.
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
      // all images load the lowres version directly
      nonFilmLazyImages.forEach((img) => {
        img.src = `/images/lowres/${img.dataset.src}.${imgFormat}`;
      });

      firstTrigger.kill();
    },
  });

  ////////////////////////////////////////////
  // LAZY LOAD IMAGES WITH SCROLL TRIGGER
  ////////////////////////////////////////////

  // all images load the supported img format
  // the high res version with scroll trigger (load using scroll trigger)

  nonFilmLazyImages.forEach((img) => {
    const imgTrigger = ScrollTrigger.create({
      trigger: img,
      start: "top 250%", //when top of the img is 2.5 pages away
      onEnter: () => {
        // the format is a string "avif" or "jpg" depending on support
        img.src = `/images/${img.dataset.src}.${imgFormat}`;
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
  // AVIF support probe.
  imgAvif.src =
    "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=";

  // when we load this src, either the onload or onerror event will be triggered

  ////////////////////////////////////////////
  // GENERATE FILMS MODALS AND VIMEO SCRIPT
  ////////////////////////////////////////////

  // generate film modals (includes loading the vimeo script)
  // with scrollTrigger
  const filmsTrigger = ScrollTrigger.create({
    trigger: "#films",
    start: "top 80%", //when top of the films section is 80% from top of viewmport
    onEnter: () => {
      filmModalInit();
      filmsTrigger.kill();
    },
  });

  ////////////////////////////////////////////
  // PANOS
  ////////////////////////////////////////////

  // generatoe panos (includes loading krpano script)
  // with scrollTrigger

  let panosCreated = false;

  const toursTrigger = ScrollTrigger.create({
    trigger: "#tours",
    start: "top 250%", //when top of the films section is 50% from top of viewmport
    onEnter: () => {
      if (!panosCreated) {
        panosInit();
        panosCreated = true; // so we don't create them again
      }
      toursTrigger.kill();
    },
  });
});

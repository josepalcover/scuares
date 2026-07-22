const initializedHeroes = new WeakSet();

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getInterval(hero) {
  const interval = Number.parseInt(hero.dataset.heroInterval, 10);
  return Number.isFinite(interval) && interval > 0 ? interval : 4000;
}

function getLogoTheme(theme) {
  return theme === "dark" ? "dark" : "light";
}

function getSlides(template) {
  return [...template.content.querySelectorAll("picture[data-hero-slide]")].map(
    (picture) => ({
      picture,
      logoTheme: getLogoTheme(picture.dataset.logo),
    }),
  );
}

function waitForImage(image) {
  if (image.complete) {
    return image.naturalWidth > 0
      ? Promise.resolve()
      : Promise.reject(new Error(`Could not load hero image: ${image.src}`));
  }

  return new Promise((resolve, reject) => {
    image.addEventListener("load", resolve, { once: true });
    image.addEventListener(
      "error",
      () => reject(new Error(`Could not load hero image: ${image.src}`)),
      { once: true },
    );
  });
}

async function prepareSlide(frame, slide) {
  const picture = slide.picture.cloneNode(true);
  const image = picture.querySelector("img");
  if (!image) {
    throw new Error("Hero slide is missing its fallback image");
  }

  picture.removeAttribute("data-hero-slide");
  picture.setAttribute("data-hero-pending", "");
  picture.setAttribute("aria-hidden", "true");
  image.loading = "eager";
  image.decoding = "async";
  frame.append(picture);

  try {
    await waitForImage(image);
    await image.decode?.().catch(() => {});
    return picture;
  } catch (error) {
    picture.remove();
    throw error;
  }
}

function applySlide(currentPicture, logo, slide, nextPicture) {
  currentPicture.replaceWith(nextPicture);
  nextPicture.removeAttribute("data-hero-pending");
  nextPicture.removeAttribute("aria-hidden");
  nextPicture.setAttribute("data-hero-current", "");

  if (logo) {
    logo.dataset.theme = slide.logoTheme;
  }

  return nextPicture;
}

async function runSequence(frame, currentPicture, logo, slides, interval) {
  let currentIndex = 0;

  if (slides.length === 1) return;

  while (true) {
    const nextIndex = (currentIndex + 1) % slides.length;
    const nextSlide = slides[nextIndex];

    const results = await Promise.allSettled([
      delay(interval),
      prepareSlide(frame, nextSlide),
    ]);

    if (results[1].status === "fulfilled") {
      currentPicture = applySlide(
        currentPicture,
        logo,
        nextSlide,
        results[1].value,
      );
    } else {
      console.warn(results[1].reason);
    }

    currentIndex = nextIndex;
  }
}

export function heroInit() {
  const heroes = document.querySelectorAll("[data-hero-sequence]");

  heroes.forEach((hero) => {
    if (initializedHeroes.has(hero)) return;

    const frame = hero.querySelector(".img-hero");
    const currentPicture = frame?.querySelector("picture[data-hero-current]");
    const template = hero.querySelector("template[data-hero-slides]");
    if (!frame || !currentPicture || !template) return;

    const slides = getSlides(template);
    if (slides.length === 0) return;

    initializedHeroes.add(hero);

    const logo = hero.querySelector("[data-hero-logo]");
    const interval = getInterval(hero);

    runSequence(frame, currentPicture, logo, slides, interval);
  });
}

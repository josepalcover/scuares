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
      template: picture,
      logoTheme: getLogoTheme(picture.dataset.logo),
      preparedPicture: undefined,
      preparePromise: undefined,
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
  if (slide.preparedPicture) return slide.preparedPicture;
  if (slide.preparePromise) return slide.preparePromise;

  slide.preparePromise = (async () => {
    const picture = slide.template.cloneNode(true);
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
      slide.preparedPicture = picture;
      return picture;
    } catch (error) {
      picture.remove();
      throw error;
    }
  })();

  try {
    return await slide.preparePromise;
  } catch (error) {
    slide.preparePromise = undefined;
    throw error;
  }
}

function applySlide(currentPicture, logo, slide, nextPicture) {
  currentPicture.removeAttribute("data-hero-current");
  currentPicture.replaceWith(nextPicture);
  nextPicture.removeAttribute("data-hero-pending");
  nextPicture.removeAttribute("aria-hidden");
  nextPicture.setAttribute("data-hero-current", "");

  if (logo) {
    logo.dataset.theme = slide.logoTheme;
  }

  return nextPicture;
}

function isHeroVisible(frame) {
  if (document.hidden) return false;

  const bounds = frame.getBoundingClientRect();
  return bounds.bottom > 0 && bounds.top < window.innerHeight;
}

async function runSequence(frame, currentPicture, logo, slides, interval) {
  let currentIndex = 0;

  if (slides.length === 1) return;

  while (true) {
    if (!isHeroVisible(frame)) {
      await delay(interval);
      continue;
    }

    const nextIndex = (currentIndex + 1) % slides.length;
    const nextSlide = slides[nextIndex];

    const results = await Promise.allSettled([
      delay(interval),
      prepareSlide(frame, nextSlide),
    ]);

    if (results[1].status === "rejected") {
      console.warn(results[1].reason);
      continue;
    }

    if (isHeroVisible(frame)) {
      currentPicture = applySlide(
        currentPicture,
        logo,
        nextSlide,
        results[1].value,
      );
      currentIndex = nextIndex;
    }
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

    // The first slide is already rendered and decoded by the browser. Reuse
    // that same node when the sequence loops instead of decoding it again.
    slides[0].preparedPicture = currentPicture;
    slides[0].preparePromise = Promise.resolve(currentPicture);

    initializedHeroes.add(hero);

    const logo = hero.querySelector("[data-hero-logo]");
    const interval = getInterval(hero);

    runSequence(frame, currentPicture, logo, slides, interval);
  });
}

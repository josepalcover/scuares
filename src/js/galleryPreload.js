const GALLERY_IMAGE_SELECTOR = "img[data-gallery-image]";
const GALLERY_LOADED_CLASS = "gallery-picture--loaded";

function markImageLoaded(image) {
  image.closest("[data-gallery-picture]")?.classList.add(GALLERY_LOADED_CLASS);
}

export function galleryPreloadInit() {
  const images = document.querySelectorAll(GALLERY_IMAGE_SELECTOR);
  if (images.length === 0) return;

  images.forEach((image) => {
    if (image.complete && image.naturalWidth > 0) {
      markImageLoaded(image);
    } else {
      image.addEventListener("load", () => markImageLoaded(image), {
        once: true,
      });
    }
  });

  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const image = entry.target;
        image.loading = "eager";
        observer.unobserve(image);
      });
    },
    { rootMargin: "150% 0px" },
  );

  images.forEach((image) => observer.observe(image));
}

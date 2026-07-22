export function contactCommercialInit(contactModal) {
  if (!contactModal) return null;

  const closeButton = document.querySelector(
    ".nav-commercial [data-contact-close]",
  );
  closeButton?.addEventListener("click", contactModal.close);

  return contactModal;
}

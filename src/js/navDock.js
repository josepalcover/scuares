export const NAV_DOCK_ANCHOR_SELECTOR = "[data-nav-dock-anchor]";
export const NAV_DOCK_TOLERANCE = 1;

export function syncNavDocking(nav, anchor) {
  if (!(nav instanceof Element) || !(anchor instanceof Element)) return false;

  const shouldBeDocked =
    anchor.getBoundingClientRect().top <= NAV_DOCK_TOLERANCE;

  nav.classList.toggle("nav-main--fixed", shouldBeDocked);
  nav.classList.toggle("nav-main--docked", !shouldBeDocked);
  return shouldBeDocked;
}

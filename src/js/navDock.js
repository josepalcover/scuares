export const NAV_DOCK_ANCHOR_SELECTOR = "[data-nav-dock-anchor]";
export const NAV_DOCK_TOLERANCE = 1;

export function isAtNavDock(anchor) {
  return (
    anchor instanceof Element &&
    anchor.getBoundingClientRect().top <= NAV_DOCK_TOLERANCE
  );
}

export function syncNavDocking(nav, anchor) {
  if (!(nav instanceof Element) || !(anchor instanceof Element)) return false;

  const isDocked = isAtNavDock(anchor);
  nav.classList.toggle("nav-main--fixed", isDocked);
  nav.classList.toggle("nav-main--docked", !isDocked);
  return isDocked;
}

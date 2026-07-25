const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "iframe",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function focusWithoutScroll(element) {
  if (!(element instanceof HTMLElement)) return;

  try {
    element.focus({ preventScroll: true });
  } catch {
    element.focus();
  }
}

function getFocusableElements(modal) {
  return [...modal.querySelectorAll(FOCUSABLE_SELECTOR)].filter((element) => {
    if (!(element instanceof HTMLElement) || element.closest("[inert]")) {
      return false;
    }

    const styles = window.getComputedStyle(element);
    return styles.display !== "none" && styles.visibility !== "hidden";
  });
}

function rememberAttribute(element, name) {
  return {
    element,
    name,
    existed: element.hasAttribute(name),
    value: element.getAttribute(name),
  };
}

function restoreAttribute({ element, name, existed, value }) {
  if (existed) {
    element.setAttribute(name, value ?? "");
  } else {
    element.removeAttribute(name);
  }
}

function isolateBackground(modal) {
  const attributes = [];
  let activeBranch = modal;

  while (activeBranch.parentElement) {
    const parent = activeBranch.parentElement;

    for (const sibling of parent.children) {
      if (sibling === activeBranch) continue;

      attributes.push(rememberAttribute(sibling, "inert"));
      sibling.setAttribute("inert", "");
    }

    if (parent === document.body) break;
    activeBranch = parent;
  }

  return () => {
    for (let index = attributes.length - 1; index >= 0; index -= 1) {
      restoreAttribute(attributes[index]);
    }
  };
}

export function createModalFocusManager(modal, { initialFocus, onEscape }) {
  let active = false;
  let opener;
  let restoreBackground;
  let focusFrame;

  const moveInitialFocus = () => {
    const target = initialFocus?.() ?? getFocusableElements(modal)[0];
    focusWithoutScroll(target);
  };

  const handleKeydown = (event) => {
    if (!active) return;

    if (event.key === "Escape") {
      event.preventDefault();
      onEscape?.();
      return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = getFocusableElements(modal);
    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusableElements[0];
    const last = focusableElements.at(-1);
    const current = document.activeElement;

    if (event.shiftKey && (current === first || !modal.contains(current))) {
      event.preventDefault();
      focusWithoutScroll(last);
    } else if (
      !event.shiftKey &&
      (current === last || !modal.contains(current))
    ) {
      event.preventDefault();
      focusWithoutScroll(first);
    }
  };

  const activate = ({ opener: nextOpener } = {}) => {
    if (nextOpener instanceof HTMLElement) opener = nextOpener;

    modal.removeAttribute("inert");
    modal.setAttribute("aria-hidden", "false");

    if (!active) {
      active = true;
      restoreBackground = isolateBackground(modal);
      document.addEventListener("keydown", handleKeydown);
    }

    cancelAnimationFrame(focusFrame);
    focusFrame = requestAnimationFrame(moveInitialFocus);
  };

  const deactivate = ({ restoreFocus = true } = {}) => {
    if (!active) return;

    active = false;
    cancelAnimationFrame(focusFrame);
    document.removeEventListener("keydown", handleKeydown);
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("inert", "");
    restoreBackground?.();
    restoreBackground = undefined;

    const focusTarget = opener;
    opener = undefined;
    if (
      restoreFocus &&
      focusTarget?.isConnected &&
      !focusTarget.closest("[inert]")
    ) {
      focusWithoutScroll(focusTarget);
    }
  };

  return { activate, deactivate };
}

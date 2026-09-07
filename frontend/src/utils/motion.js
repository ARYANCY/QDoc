import gsap from "gsap";

/**
 * Checks if the user or browser prefers reduced motion.
 */
export function isReducedMotion() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.body.classList.contains("reduced-motion")
  );
}

/**
 * Animate elements into view with a subtle staggered fade and slide.
 * @param {HTMLElement | string | Array} target - Elements to animate
 * @param {Object} options - Custom gsap overrides
 */
export function animateEntrance(target, options = {}) {
  if (!target || isReducedMotion()) return null;

  return gsap.fromTo(
    target,
    {
      opacity: 0,
      y: options.y ?? 14,
      scale: options.scale ?? 0.99,
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: options.duration ?? 0.35,
      stagger: options.stagger ?? 0.05,
      ease: options.ease ?? "power2.out",
      clearProps: "transform",
      ...options,
    }
  );
}

/**
 * Animate a modal or drawer opening.
 * @param {HTMLElement} overlayRef - Backdrop overlay element
 * @param {HTMLElement} modalRef - Modal dialog card
 */
export function animateModalOpen(overlayRef, modalRef) {
  if (isReducedMotion()) return;

  const tl = gsap.timeline();
  if (overlayRef) {
    tl.fromTo(overlayRef, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" }, 0);
  }
  if (modalRef) {
    tl.fromTo(
      modalRef,
      { opacity: 0, scale: 0.95, y: 16 },
      { opacity: 1, scale: 1, y: 0, duration: 0.28, ease: "back.out(1.15)" },
      0.05
    );
  }
  return tl;
}

/**
 * Smooth metric count-up animation for KPI numbers.
 * @param {HTMLElement} targetRef - The element displaying the number
 * @param {number} startVal - Starting number
 * @param {number} endVal - Final target number
 * @param {number} decimals - Number of decimal places
 * @param {string} suffix - Optional suffix like '%' or ' ms'
 */
export function animateCounter(targetRef, startVal, endVal, decimals = 1, suffix = "") {
  if (!targetRef) return;
  if (isReducedMotion()) {
    targetRef.textContent = `${Number(endVal).toFixed(decimals)}${suffix}`;
    return;
  }

  const obj = { val: startVal };
  return gsap.to(obj, {
    val: endVal,
    duration: 0.8,
    ease: "power2.out",
    onUpdate: () => {
      if (targetRef) {
        targetRef.textContent = `${obj.val.toFixed(decimals)}${suffix}`;
      }
    },
  });
}

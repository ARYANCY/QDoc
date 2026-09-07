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
    duration: 0.9,
    ease: "power2.out",
    onUpdate: () => {
      if (targetRef) {
        targetRef.textContent = `${obj.val.toFixed(decimals)}${suffix}`;
      }
    },
  });
}

/**
 * Editorial Hero Entrance with luxury staggered fade and slide.
 */
export function animateEditorialHero(containerRef) {
  if (!containerRef || isReducedMotion()) return;
  const elements = containerRef.querySelectorAll(".editorial-reveal");
  if (!elements || elements.length === 0) return;

  return gsap.fromTo(
    elements,
    { opacity: 0, y: 22, filter: "blur(4px)" },
    {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.65,
      stagger: 0.08,
      ease: "power3.out",
      clearProps: "all",
    }
  );
}

/**
 * Editorial Grid / Cards staggered entrance.
 */
export function animateCardStagger(containerRef, cardSelector = ".editorial-card") {
  if (!containerRef || isReducedMotion()) return;
  const cards = containerRef.querySelectorAll(cardSelector);
  if (!cards || cards.length === 0) return;

  return gsap.fromTo(
    cards,
    { opacity: 0, y: 16, scale: 0.98 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.45,
      stagger: 0.06,
      ease: "power2.out",
      clearProps: "transform",
    }
  );
}

/**
 * Subtle breathing pulse glow on status or telemetry nodes.
 */
export function animatePulseGlow(targetRef) {
  if (!targetRef || isReducedMotion()) return;
  return gsap.to(targetRef, {
    boxShadow: "0 0 16px rgba(212, 175, 55, 0.45)",
    repeat: -1,
    yoyo: true,
    duration: 1.6,
    ease: "sine.inOut",
  });
}

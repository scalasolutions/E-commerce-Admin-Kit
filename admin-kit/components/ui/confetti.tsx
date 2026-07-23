"use client";

import confetti from "canvas-confetti";

/**
 * Confetti burst built on `canvas-confetti` (an optional peer dep — install it
 * only if you use this). Defaults to a neutral, brand-agnostic mix; pass
 * `colors` to tint it with your palette. No-op when the user prefers reduced
 * motion.
 */

// A neutral celebratory mix. Override per client via the `colors` option.
const DEFAULT_COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EC4899"];

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

/**
 * Fire a short celebratory burst. No-op when the user prefers reduced motion.
 * Defaults to two side cannons for a fuller spread; pass `origin` to aim it.
 */
export function fireConfetti(
  options?: confetti.Options & { colors?: string[] }
): void {
  if (prefersReducedMotion()) return;

  const colors = options?.colors ?? DEFAULT_COLORS;
  const base: confetti.Options = {
    spread: 70,
    startVelocity: 45,
    ticks: 200,
    gravity: 0.9,
    scalar: 0.9,
    colors,
    disableForReducedMotion: true,
    ...options,
  };

  // Two angled cannons from the lower corners for a celebratory pop.
  void confetti({ ...base, particleCount: 60, angle: 60, origin: { x: 0, y: 0.7 } });
  void confetti({ ...base, particleCount: 60, angle: 120, origin: { x: 1, y: 0.7 } });
}

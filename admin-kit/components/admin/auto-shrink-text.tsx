"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Text that shrinks its own font until it fits a fixed-height box — so nothing
 * is ever truncated. Built for the A6 shipping label, where a clamped address
 * means an undeliverable parcel: we'd rather print the whole address small than
 * print two thirds of it large.
 *
 * The box height is fixed by the caller (`className`, e.g. `h-[55px]`) so the
 * label's total height stays predictable at 150mm. Only the font scales.
 *
 * Line height is unitless so it scales with the font, and measurement re-runs
 * once webfonts settle — Poppins swapping in after the first paint changes text
 * metrics, and without that pass a label can auto-print at the pre-swap size.
 */
export function AutoShrinkText({
  text,
  maxPx,
  minPx = 6,
  className,
}: {
  text: string;
  maxPx: number;
  minPx?: number;
  className?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [fontPx, setFontPx] = useState(maxPx);

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    let cancelled = false;

    const fit = () => {
      if (cancelled || !boxRef.current) return;
      const el = boxRef.current;
      let size = maxPx;
      el.style.fontSize = `${size}px`;
      // Step down until the content stops overflowing its fixed-height box.
      while (size > minPx && el.scrollHeight > el.clientHeight) {
        size -= 0.25;
        el.style.fontSize = `${size}px`;
      }
      setFontPx(size);
    };

    fit();
    // Re-fit after webfonts load; ignore failures (fit() already ran once).
    document.fonts?.ready.then(fit).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [text, maxPx, minPx]);

  return (
    <div
      ref={boxRef}
      className={cn("overflow-hidden leading-[1.3]", className)}
      style={{ fontSize: `${fontPx}px` }}
    >
      {text}
    </div>
  );
}

export default AutoShrinkText;

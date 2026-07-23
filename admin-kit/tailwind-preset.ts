import type { Config } from "tailwindcss";

/**
 * Admin Kit Tailwind preset. Add to your tailwind.config.ts:
 *
 *   import adminKitPreset from "./admin-kit/tailwind-preset";
 *   export default { presets: [adminKitPreset], content: [...] } satisfies Config;
 *
 * The accent trio reads from CSS variables (see styles/admin-theme.css) so a
 * new client re-themes by changing three `:root` values. The neutral scale and
 * status tints are fixed (they're the same across clients) — override here if a
 * client truly needs different neutrals.
 */
const adminKitPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        admin: {
          surface: "#FFFFFF",
          "surface-subdued": "#F6F6F7",
          "surface-hover": "#F1F1F1",
          border: "#E3E3E3",
          "border-subtle": "#EBEBEB",
          text: "#1A1A1A",
          "text-subdued": "#616161",
          "text-disabled": "#8C9196",
          // Per-client accent — driven by CSS variables (admin-theme.css)
          accent: "var(--admin-accent)",
          "accent-hover": "var(--admin-accent-hover)",
          "accent-subdued": "var(--admin-accent-subdued)",
          // Status tints (Polaris-like)
          "success-bg": "#E7F4EC",
          "success-text": "#1F7A44",
          "warning-bg": "#FCF1E1",
          "warning-text": "#8A6116",
          "critical-bg": "#FDEDED",
          "critical-text": "#C0392B",
          "info-bg": "#EAF1F8",
          "info-text": "#1B61A7",
          "neutral-bg": "#F1F1F1",
          "neutral-text": "#4A4A4A",
        },
      },
      boxShadow: {
        admin: "0 1px 2px 0 rgba(0,0,0,0.04), 0 1px 3px 0 rgba(0,0,0,0.06)",
        "admin-lift": "0 4px 12px -2px rgba(0,0,0,0.08)",
      },
      keyframes: {
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(3px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "row-flash": {
          from: { backgroundColor: "rgba(27, 97, 167, 0.16)" },
          to: { backgroundColor: "transparent" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 200ms ease-out both",
        "row-flash": "row-flash 1.2s ease-out both",
      },
    },
  },
};

export default adminKitPreset;

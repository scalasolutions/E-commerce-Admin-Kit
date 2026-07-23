import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import adminKitPreset from "./admin-kit/tailwind-preset";

export default {
  presets: [adminKitPreset],
  content: [
    "./app/**/*.{ts,tsx}",
    "./admin-kit/components/**/*.{ts,tsx}",
    "./admin-kit/config/**/*.{ts,tsx}",
  ],
  plugins: [typography],
} satisfies Config;

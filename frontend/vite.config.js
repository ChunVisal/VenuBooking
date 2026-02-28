import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  plugins: [react(), tailwindcss()],
});

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        graphite: "#0d0f12",
        ink: "#161a1f",
        steel: "#d6dde7",
        mist: "#8d99a8",
        teal: "#33d5b7",
        amber: "#f4b942",
        coral: "#ff6f61"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(0, 0, 0, 0.34)"
      }
    }
  },
  plugins: []
};

export default config;


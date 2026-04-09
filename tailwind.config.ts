import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",      // This scans everything in /app
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",    // For older pages
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // For your UI components
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",      // If you have UI logic in lib
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
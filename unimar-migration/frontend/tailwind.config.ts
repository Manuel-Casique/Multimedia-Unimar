import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        unimar: {
          primary: "#0b3d91", // Azul oscuro principal
          light: "#d0e0fc", // Azul claro (fondos)
          accent: "#336699", // Azul medio (enlaces)
          gray: "gray", // Gris cards
          text: {
            dark: "#000000",
            light: "#e0ded9",
          },
          state: {
            success: "#28a745",
            warning: "#ffc107",
            danger: "#dc3545",
            info: "#17a2b8",
          },
        },
      },
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

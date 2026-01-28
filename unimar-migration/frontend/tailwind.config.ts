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
          primary: "#004b9a", // admin.css: .main-header.navbar-blue-u
          secondary: "#0d4d97", // Contenido.css: .sidebar-container
          tertiary: "#0054A7", // Contenido.css: .filter-header
          hover: "#0b5ed7", // Contenido.css: .filter-item:hover (Bootstrap primary)
          background: "#F5F5F5", // Manteniendo un fondo limpio pero neutro
          card: "#e8e8e8", // Contenido.css: .card background
          surface: "#FFFFFF",
          text: {
            primary: "#000000", // card-title color black
            secondary: "#64748b",
            light: "#94a3b8",
            link: "#336699", // style.css: .card-link
          },
        },
      },
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
      },
      backgroundImage: {
        // Gradient simulando el navbar-blue-u si se desea, o solid
        'unimar-gradient': "linear-gradient(to right, #004b9a, #0d4d97)", 
        'unimar-card-gradient': "linear-gradient(135deg, #0d4d97 0%, #004b9a 100%)",
      }
    },
  },
  plugins: [],
};
export default config;

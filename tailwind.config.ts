import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // The Green Boys Brand Colors
        brand: {
          teal: '#08605F',      // Color primario - verde azulado oscuro
          sage: '#97BD97',      // Color secundario - verde salvia
          purple: '#1B1725',    // Color oscuro para textos y fondos
          black: '#000000',     // Negro puro
          pink: '#FFEAEE',      // Rosa pastel para acentos
        },
        primary: {
          50: '#e6f4f4',
          100: '#cde9e8',
          200: '#9bd3d1',
          300: '#69bdba',
          400: '#37a7a3',
          500: '#08605F',      // Brand teal
          600: '#064d4c',
          700: '#053a39',
          800: '#032726',
          900: '#021413',
        },
        success: {
          50: '#f1f9f1',
          100: '#e3f3e3',
          500: '#97BD97',      // Brand sage
          600: '#7aa87a',
        },
        warning: {
          50: '#fefce8',
          100: '#fef9c3',
          500: '#eab308',
          600: '#ca8a04',
        },
        danger: {
          50: '#fff5f6',
          100: '#FFEAEE',      // Brand pink
          500: '#dc2626',
          600: '#b91c1c',
        },
      },
    },
  },
  plugins: [],
};
export default config;

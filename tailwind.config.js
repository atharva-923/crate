/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#F6F4EF",
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#1B2A2F",
          soft: "#3D4C50",
          muted: "#6B7679",
        },
        brass: {
          50: "#FBF3E3",
          100: "#F3E1B8",
          300: "#DDB05C",
          DEFAULT: "#C08829",
          600: "#A6721E",
          700: "#8F6318",
        },
        pine: {
          DEFAULT: "#2F6F4E",
          50: "#EAF3EC",
          600: "#245A3E",
        },
        rust: {
          DEFAULT: "#B4472E",
          50: "#FBEAE6",
        },
        line: "#E4E0D6",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(27,42,47,0.04), 0 8px 24px -12px rgba(27,42,47,0.12)",
        lift: "0 12px 32px -14px rgba(27,42,47,0.28)",
      },
      backgroundImage: {
        "slats": "repeating-linear-gradient(90deg, transparent, transparent 34px, rgba(27,42,47,0.05) 34px, rgba(27,42,47,0.05) 35px)",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        lg: "14px",
      },
    },
  },
  plugins: [],
};

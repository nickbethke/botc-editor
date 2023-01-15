const tailwindcss = require("tailwindcss");
const tailwindcssNesting = require("tailwindcss/nesting");
const autoprefixer = require('autoprefixer');

module.exports = {
  content: ["./src/**/*.{html,js,tsx,ejs}"],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#010311",
          50: "#4F64F5",
          100: "#3C53F4",
          200: "#1631F1",
          300: "#0C25D2",
          400: "#0A1EAB",
          500: "#081785",
          600: "#06115E",
          700: "#030A38",
          800: "#010311",
          900: "#000000"
        }
      }
    }
  },
  variants: {},
  plugins: [tailwindcssNesting, tailwindcss, autoprefixer]
};

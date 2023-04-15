import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        ltor: ["Custom", "sans-serif"]
      }
    },
  },
  layers: {
    custom: {
      utilities: {
        'ltor-font': {
          fontFamily: 'ltor'
        }
      }
    }
  },
  plugins: [],
} satisfies Config;

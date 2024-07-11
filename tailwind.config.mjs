import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.white'),
            h1: { color: theme('colors.white') },
            h2: { color: theme('colors.white') },
            h3: { color: theme('colors.white') },
            h4: { color: theme('colors.white') },
            h5: { color: theme('colors.white') },
            h6: { color: theme('colors.white') },
            strong: { color: theme('colors.white') },
            a: { color: theme('colors.white') },
            blockquote: { color: theme('colors.white') },
            'ol > li::before': { color: theme('colors.white') },
            'ul > li::before': { backgroundColor: theme('colors.white') },
            code: { color: theme('colors.white') },
            figcaption: { color: theme('colors.white') },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography'),],
};
export default config;

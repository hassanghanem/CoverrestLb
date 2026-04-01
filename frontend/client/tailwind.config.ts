import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  plugins: [
    require('tailwindcss-rtl'),
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
} satisfies Config

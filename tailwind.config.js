/** @type {import('tailwindcss').Config} */
const v = (n) => `rgb(var(--${n}) / <alpha-value>)`;
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { paper: v('paper'), ink: v('ink'), card: v('card'), brand: { DEFAULT: v('brand'), dark: v('brand-dark') } },
      fontFamily: { sans: ['var(--font-sans)', 'system-ui', 'sans-serif'], mono: ['var(--font-mono)', 'ui-monospace', 'monospace'] },
    },
  },
  plugins: [],
};

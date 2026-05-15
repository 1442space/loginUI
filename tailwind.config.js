/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          brown: '#2C1B18',
          gold: '#D4AF37',
          ivory: '#F5F5F5',
        },
      },
      fontFamily: {
        body: ['"Times New Roman"', 'Times', 'serif'],
        title: ['Forum', 'serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 18px rgba(212, 175, 55, 0.35)',
      },
      backgroundImage: {
        'indic-light': 'radial-gradient(circle at 10% 10%, rgba(212, 175, 55, 0.15) 0, transparent 22%), radial-gradient(circle at 80% 20%, rgba(44, 27, 24, 0.08) 0, transparent 28%), repeating-radial-gradient(circle at center, rgba(212, 175, 55, 0.06) 0 2px, transparent 2px 24px)',
        'indic-dark': 'radial-gradient(circle at 20% 15%, rgba(212, 175, 55, 0.22) 0, transparent 26%), radial-gradient(circle at 85% 15%, rgba(245, 245, 245, 0.08) 0, transparent 30%), repeating-radial-gradient(circle at center, rgba(212, 175, 55, 0.1) 0 2px, transparent 2px 24px)',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}

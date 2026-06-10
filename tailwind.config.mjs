/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1877F2',
        secondary: '#E4E6EB',
        background: '#F0F2F5',
        foreground: '#050505',
        'text-secondary': '#65676B',
        border: '#CED0D4',
        success: '#31A24C',
        danger: '#F02849',
      },
    },
  },
  plugins: [],
}

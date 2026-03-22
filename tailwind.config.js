/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        milo: {
          canvas: '#131314',
          surface: '#1e1e20',
          elevated: '#28282c',
          border: '#3c4043',
          text: '#e3e3e3',
          muted: '#9aa0a6',
          accent: '#8ab4f8',
        },
      },
      borderRadius: {
        milo: '1.5rem',
        'milo-input': '1.5rem',
      },
      maxWidth: {
        chat: '48rem',
      },
    },
  },
  plugins: [],
}


/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emergency: {
          red: '#EF4444',
          orange: '#F97316',
          yellow: '#EAB308',
        },
        responder: {
          doctor: '#8B5CF6',
          paramedic: '#3B82F6',
          nurse: '#10B981',
          cpr: '#6B7280',
        },
      },
    },
  },
  plugins: [],
};

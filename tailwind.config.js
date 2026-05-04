/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        /** Synced from server/db.json `siteSettings.primaryColorHex` via `--main-color` */
        main: 'var(--main-color)',
      },
    },
  },
  plugins: [],
};

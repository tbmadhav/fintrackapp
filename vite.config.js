import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// If deploying to GitHub Pages at https://tbmadhav.github.io/fintrackapp
// set base to '/fintrackapp/' so asset paths resolve correctly
export default defineConfig({
  plugins: [react()],
  base: '/fintrackapp/',
});

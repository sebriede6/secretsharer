import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Dein React-Plugin
import tailwindcss from '@tailwindcss/vite'; // Importiere das Tailwind Vite Plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Füge das Plugin hier hinzu
  ],
});
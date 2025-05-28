import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/EmproChampions-2025/', // <- Asegurate de poner el nombre del repo aquí
});

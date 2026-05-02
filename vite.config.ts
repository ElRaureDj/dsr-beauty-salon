import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// vite.config.ts corre en Node, pero @types/node no está instalado.
// Declaración local para que tsc no se queje sin agregar dependencia.
declare const process: { env: Record<string, string | undefined> };

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { port: Number(process.env.PORT) || 5173, host: true },
});

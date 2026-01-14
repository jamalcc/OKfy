
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Removida a exposição insegura do process.env.API_KEY
  // O Vite expõe automaticamente variáveis prefixadas com VITE_ via import.meta.env
})

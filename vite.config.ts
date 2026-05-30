import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base is '/' for local dev; set to '/pocket-treaty/' for GitHub Pages deployment
export default defineConfig({
  plugins: [react()],
  base: '/',
})

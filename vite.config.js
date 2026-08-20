import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Triggering dev server restart to reload .env file changes
export default defineConfig({
  plugins: [react()],
})

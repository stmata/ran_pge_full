import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Augmente la limite d'avertissement de la taille des chunks
    chunkSizeWarningLimit: 1000, // 1000 KB au lieu de 500 KB par défaut

    rollupOptions: {
      output: {
        // Améliore le découpage en chunks en séparant les dépendances tierces
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Tous les modules dans node_modules sont regroupés dans un chunk 'vendor'
            return 'vendor';
          }
        }
      }
    }
  }
})

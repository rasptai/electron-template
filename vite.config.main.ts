import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'out/main',
    emptyOutDir: true,
    ssr: true,
    rollupOptions: {
      input: {
        main: './src/main/main.ts',
      },
    },
  },
})

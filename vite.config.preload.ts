import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'out/preload',
    emptyOutDir: true,
    ssr: true,
    rollupOptions: {
      input: {
        preload: './src/preload/preload.ts',
      },
      output: {
        format: 'esm',
        entryFileNames: '[name].mjs',
      },
    },
  },
})

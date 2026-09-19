import { build } from 'vite';
import { copyFile, mkdir } from 'node:fs/promises';

const entries = { index: 'src/index.js', plugin: 'src/plugin.js' };
await build({
  configFile: false,
  build: {
    outDir: 'dist', emptyOutDir: true, sourcemap: true, minify: false,
    lib: { entry: entries, formats: ['es'], fileName: (_, name) => `${name}.js` },
    rollupOptions: { external: (id) => id === 'mermaid' || id === '@mermaid-js/layout-elk' },
  },
});
await mkdir('dist', { recursive: true });
for (const name of ['index', 'plugin']) await copyFile(`src/${name}.d.ts`, `dist/${name}.d.ts`);
await build({
  configFile: false,
  build: {
    outDir: 'dist/browser', emptyOutDir: true, minify: 'esbuild',
    lib: { entry: 'src/index.js', formats: ['es'], fileName: () => 'mermaid-renderer.esm.min.mjs' },
    rollupOptions: { output: { chunkFileNames: 'chunks/[name]-[hash].mjs' } },
    chunkSizeWarningLimit: 2500,
  },
});

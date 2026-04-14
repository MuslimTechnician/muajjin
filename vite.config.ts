import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

const sanitizeName = (value: string | undefined, fallback: string) => {
  if (!value) return fallback;
  return (
    value
      .replace(/[^a-zA-Z0-9.-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') || fallback
  );
};

const removeExt = (value?: string) => {
  if (!value) return undefined;
  return value.replace(/\.[^./\\]+$/, '');
};

const SOURCE_DATE_EPOCH = process.env.SOURCE_DATE_EPOCH?.trim() || '0';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const updateAlias =
    mode === 'github'
      ? path.resolve(__dirname, './src/features/update-checker/index.github.ts')
      : path.resolve(__dirname, './src/features/update-checker/index.ts');

  if (process.env.CI && !process.env.SOURCE_DATE_EPOCH) {
    console.warn(
      'SOURCE_DATE_EPOCH missing; reproducibility may be compromised.',
    );
  }

  return {
    server: {
      port: 8080,
    },
    plugins: [react()],
    resolve: {
      alias: [
        {
          // Only replace bare "@/features/update-checker" imports.
          // Keep "@/features/update-checker/..." subpath imports untouched.
          find: /^@\/features\/update-checker$/,
          replacement: updateAlias,
        },
        {
          find: '@',
          replacement: path.resolve(__dirname, './src'),
        },
      ],
    },
    define: {
      __SOURCE_DATE_EPOCH__: JSON.stringify(SOURCE_DATE_EPOCH),
      'process.env.SOURCE_DATE_EPOCH': JSON.stringify(SOURCE_DATE_EPOCH),
    },
    build: {
      outDir: 'dist',
      minify: 'terser',
      sourcemap: false,
      target: 'es2020',
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name].js',
          chunkFileNames: (chunkInfo) => {
            const chunkName = sanitizeName(
              chunkInfo.name ?? chunkInfo.facadeModuleId,
              'chunk',
            );
            return `assets/${chunkName}.js`;
          },
          assetFileNames: (assetInfo) => {
            const ext = path.extname(assetInfo.name ?? '') || '';
            const base = removeExt(assetInfo.name) ?? 'asset';
            const safe = sanitizeName(base, 'asset');
            return `assets/${safe}${ext}`;
          },
        },
      },
    },
  };
});

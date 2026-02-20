
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const updateAlias =
    mode === "github"
      ? path.resolve(__dirname, "./src/features/update/index.github.ts")
      : path.resolve(__dirname, "./src/features/update/index.ts");

  return {
    server: {
      port: 8080,
    },
    plugins: [react()],
    resolve: {
      alias: [
        {
          find: "@/features/update",
          replacement: updateAlias,
        },
        {
          find: "@",
          replacement: path.resolve(__dirname, "./src"),
        },
      ],
    },
    build: {
      outDir: 'dist',
      minify: 'terser',
      sourcemap: false,
    },
  };
});

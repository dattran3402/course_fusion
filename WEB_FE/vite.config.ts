import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  root: ".",
  plugins: [react()],
  build: {
    outDir: "./build",
    chunkSizeWarningLimit: 3200,
  },
  server: {
    watch: {
      usePolling: true,
    },
    host: true, // needed for the Docker Container port mapping to work
    strictPort: true,
    port: 4000, // you can replace this port with any port
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "src"),
      },
      {
        find: "@assets",
        replacement: path.resolve(__dirname, "src/assets"),
      },
      {
        find: "@common",
        replacement: path.resolve(__dirname, "src/common"),
      },
      {
        find: "@components",
        replacement: path.resolve(__dirname, "src/components"),
      },
      {
        find: "@layouts",
        replacement: path.resolve(__dirname, "src/layouts"),
      },
      {
        find: "@redux",
        replacement: path.resolve(__dirname, "src/redux"),
      },
      {
        find: "@service",
        replacement: path.resolve(__dirname, "src/service"),
      },
      {
        find: "@utils",
        replacement: path.resolve(__dirname, "src/utils"),
      },
      {
        find: "@types",
        replacement: path.resolve(__dirname, "src/types"),
      },
      {
        find: "@atoms",
        replacement: path.resolve(__dirname, "src/components/atoms"),
      },
      {
        find: "@molecules",
        replacement: path.resolve(__dirname, "src/components/molecules"),
      },
      {
        find: "@organisms",
        replacement: path.resolve(__dirname, "src/components/organisms"),
      },
      {
        find: "@pages",
        replacement: path.resolve(__dirname, "src/components/pages"),
      },
    ],
  },
  define: {
    // fix ReferenceError: process is not defined
    "process.env": {},
  },
  optimizeDeps: {
    exclude: ["js-big-decimal"],
  },
});

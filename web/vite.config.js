/// <reference types="vitest" />
import { fileURLToPath, URL } from "node:url"
import { resolve, dirname } from 'node:path'

// Plugins
import vue from "@vitejs/plugin-vue"
import vuetify from "vite-plugin-vuetify"
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite"

// Utilities
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
    vuetify({
      autoImport: true,
    }),
    VueI18nPlugin({
      include: resolve(dirname(fileURLToPath(import.meta.url)), './src/locales/**'),
    }),
  ],
  build: {
    outDir: "./dist",
  },
  define: { "process.env": {} },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
  },
  server: {
    port: 8080,
  },
  test: {
    globals: true, // https://vitest.dev/config/#globals
  },
})

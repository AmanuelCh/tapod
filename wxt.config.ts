import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    permissions: ['storage'],
    icons: {
      "16": "logo.png",
      "32": "logo.png",
      "48": "logo.png",
      "96": "logo.png",
      "128": "logo.png"
    },
    browser_specific_settings: {
      gecko: {
        id: 'tapod@example.com',
        strict_min_version: '109.0',
      },
    },
  },
});

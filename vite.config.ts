import { fileURLToPath, URL } from 'node:url';
import electron from 'vite-plugin-electron';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        electron([
            {
                // Main-Process entry file of the Electron App.
                entry: 'electron/electron.ts',
                onstart: (options) => {
                    // Start Electron App
                    options.startup(['.', '--no-sandbox']);
                },
            },
            {
                entry: 'electron/preload.ts',
                onstart(options) {
                    // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete,
                    // instead of restarting the entire Electron App.
                    options.reload();
                },
            },
            {
                entry: 'electron/nocturneElectronWrapper.ts',
            },
        ]),
        vue(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    build: {
        sourcemap: true,
    },
});

import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
export default defineConfig({
    base: process.env.GITHUB_ACTIONS ? '/guitar-theory-app/' : './',
    plugins: process.env.GITHUB_ACTIONS ? [] : [viteSingleFile()],
    build: {
        assetsInlineLimit: 100000,
    },
});

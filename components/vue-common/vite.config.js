import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue'
import {resolve} from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    build: {
        target: "modules",
        lib: {
            entry: resolve(__dirname, 'index.js'),
            name: 'VueCommon',
            formats: ["es", "umd"]
        },
        rollupOptions: {
            external: ['vue'],
            output: {
                globals: {
                    vue: 'Vue'
                }
            }
        }
    }
})

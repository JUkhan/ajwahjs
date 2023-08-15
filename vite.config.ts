import { defineConfig } from 'vite'
import path from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
    build: {
        lib: {
            entry:path.resolve('./src', 'index.ts'),
            name: 'ajwahjs',
            fileName: (format) => `index.${format}.js`,
        },
        sourcemap:true,
        emptyOutDir:true,
    },
    plugins:[dts()]
})

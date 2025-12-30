import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron/simple'  // 简单模式
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(),
    createSvgIconsPlugin({
      // 指定需要缓存的图标文件夹
      iconDirs: [path.resolve(process.cwd(), 'src/assets/svg')],
      // 指定symbolId格式
      symbolId: 'icon-[dir]-[name]',
      // 自定义插入位置
      inject: 'body-last',
      // 自定义dom id
      customDomId: '__svg__icons__dom__',
    }),
    electron({
    main: {
      entry: 'electron/main.js',
    },
    preload: {
      input: 'electron/preload.js',
    },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  }
  
})

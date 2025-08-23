import PrimeUI from 'tailwindcss-primeui'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,vue,ts}',
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      // 可以在这里添加自定义样式
    },
  },
  
  // 重要：防止Tailwind样式覆盖PrimeVue组件样式
  corePlugins: {
    preflight: false, // 禁用Tailwind的基础样式重置
  },
  
  plugins: [PrimeUI],
}

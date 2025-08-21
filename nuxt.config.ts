// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  // 添加必要的模块
  modules: [
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss',
    '@nuxt/eslint',
    'shadcn-nuxt',
  ],
  devtools: { enabled: true },

  // CSS 配置
  css: ['~/style/main.css'],

  // 运行时配置
  runtimeConfig: {
    // 私有键（仅在服务器端可用）
    // authSecret: process.env.NUXT_AUTH_SECRET,

    // 公开键（会暴露给前端）
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  },
  compatibilityDate: '2025-07-15',

  // shadcn-vue 配置
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './app/components/ui'
  },

  // 别名配置（Nuxt 3 有内置的别名支持）
  // alias: {
  //   "@": resolve(__dirname, "."),
  //   "lib": resolve(__dirname, "./lib"),
  //   "components": resolve(__dirname, "./components")
  // },

  // Supabase 配置
  supabase: {
    // 明确指定 URL 和 Key
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
    // 自动重定向配置
    redirectOptions: {
      login: '/login',
      callback: '/dashboard',
      exclude: ['/'],
    },
  },
})

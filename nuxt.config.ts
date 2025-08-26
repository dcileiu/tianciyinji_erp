import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/supabase', '@nuxt/eslint', 'shadcn-nuxt'],

  // 组件自动导入配置
  components: [
    // 启用嵌套组件扫描
    {
      path: '~/components',
      pathPrefix: false,
    },
    // UI组件通过 shadcn-nuxt 模块自动处理，无需手动配置
  ],

  // 自动导入配置
  imports: {
    dirs: [
      // 自动导入composables
      'composables/**',
      // 自动导入utils
      'utils/**',
      // 自动导入types
      'types/**',
    ],
  },

  devtools: { enabled: true },

  app: {
    head: {
      title: 'ERP管理系统',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '现代化企业资源规划系统' },
      ],
    },
  },

  css: ['~/assets/css/tailwind.css'],

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    },
  },

  // 开发服务器配置
  devServer: {
    port: 3000,
    host: 'localhost',
  },

  future: {
    compatibilityVersion: 4,
  },

  experimental: {
    appManifest: false,
  },

  compatibilityDate: '2025-08-20',

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['vue', 'vue-router', '@vueuse/core'],
    },
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },

  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
    redirectOptions: {
      login: '/login',
      callback: '/auth/callback',
      exclude: [
        '/login/register',
        '/login/forgot-password',
        '/login/reset-password',
        '/getting-started',
        '/components-demo',
        '/db-init',
      ],
    },
  },
})

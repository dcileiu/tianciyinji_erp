// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/supabase', '@nuxtjs/tailwindcss', 'shadcn-nuxt', '@pinia/nuxt'],

  // shadcn-nuxt 配置
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },

  // 组件自动导入配置（shadcn-nuxt会自动处理ui组件）
  components: [
    {
      path: '~/components',
      pathPrefix: false,
      ignore: ['**/ui/**'], // 由shadcn-nuxt处理
    },
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

  // PostCSS 配置
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  // SSR渲染配置
  ssr: true,

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
    payloadExtraction: false,
  },



  compatibilityDate: '2025-08-20',

  vite: {
    optimizeDeps: {
      include: ['vue', 'vue-router', '@vueuse/core', 'lucide-vue-next'],
    },
  },

  // Nitro 配置用于生产优化
  nitro: {
    compressPublicAssets: true,
    minify: true,
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
});

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // 添加必要的模块
  modules: [
    "@nuxtjs/supabase",
    "@nuxt/eslint",
    // "shadcn-nuxt", // 暂时禁用，避免Nuxt 4兼容性问题
  ],

  // 开发工具
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },

  // CSS 配置
  css: ["@/assets/css/tailwind.css"], // 使用app目录下的assets (Nuxt 4推荐结构)

  // PostCSS 配置
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  },

  // 运行时配置
  runtimeConfig: {
    // 私有配置
    authSecret: process.env.NUXT_AUTH_SECRET,

    // 公开配置
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      appVersion: process.env.npm_package_version || "1.0.0",
      isDevelopment: process.env.NODE_ENV === "development",
    },
  },

  // 兼容性日期
  compatibilityDate: "2025-07-15",

  // shadcn-vue 配置（暂时禁用自动导入）
  // shadcn: {
  //   prefix: "",
  //   componentDir: "./app/components/ui",
  // },

  // Supabase 配置
  supabase: {
    // 明确指定 URL 和 Key
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
    // 自动重定向配置
    redirectOptions: {
      login: "/login",
      callback: "/dashboard",
      exclude: ["/"],
    },
  },

  // TypeScript 配置
  typescript: {
    strict: true,
    typeCheck: false, // 暂时禁用类型检查，但保持严格模式
  },

  // 性能优化
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true,
  },

  // 构建优化
  build: {
    transpile: ["@headlessui/vue"],
  },

  // Vite 配置
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["vue", "vue-router"],
            ui: ["lucide-vue-next"],
          },
        },
      },
    },
    optimizeDeps: {
      include: ["vue", "vue-router", "@vueuse/core"],
    },
  },

  // 应用配置
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      title: "ERP管理系统",
      meta: [
        {
          name: "description",
          content: "Enterprise Resource Planning Management System",
        },
        { name: "keywords", content: "ERP, 管理系统, Vue3, Nuxt3" },
        { name: "author", content: "ERP Team" },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  // 路由配置
  router: {
    options: {
      strict: true,
    },
  },

  // 渲染配置
  ssr: true,

  // 预渲染配置（用于静态生成）
  nitro: {
    prerender: {
      routes: ["/login", "/register"],
    },
  },
});
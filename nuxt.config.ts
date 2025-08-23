import Aura from '@primeuix/themes/aura';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: [
    '@nuxtjs/supabase',
    '@nuxt/eslint',
    '@primevue/nuxt-module'
  ],

  devtools: { enabled: true },

  app: {
    head: {
      title: 'ERP管理系统',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '现代化企业资源规划系统' }
      ],
    },
  },

  css: [
    '~/assets/css/tailwind.css'
  ],

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  },

  build: {
    transpile: ['primevue']
  },
  future: {
    compatibilityVersion: 4,
  },
  
  experimental: {
    appManifest: false,
  },

  compatibilityDate: '2025-08-20',

  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            ui: ['primevue'],
          },
        },
      },
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', '@vueuse/core', 'primevue']
    },
    ssr: {
      noExternal: ['primevue', '@primeuix/themes']
    }
  },

  eslint: {
    config: {
      stylistic: true
    }
  },

  primevue: {
    options: {
      theme: {
        preset: Aura
      }
    }
  },

  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/auth/callback',
      exclude: ['/register', '/forgot-password', '/auth/reset-password', '/getting-started', '/components-demo', '/db-init'],
    },
  },
})

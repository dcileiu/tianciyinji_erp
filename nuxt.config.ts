// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    '@unocss/nuxt'
  ],
  css: ['~/assets/css/main.css'],
  ui: {
    global: true,
    icons: ['heroicons', 'lucide']
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/callback',
      exclude: ['/auth/*']
    }
  },
  runtimeConfig: {
    // Private keys (only available on server-side)
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    // Public keys (exposed to client-side)
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    }
  },
  typescript: {
    strict: true
  }
})

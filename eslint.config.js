// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  ignores: [
    // 暂时忽略有解析问题的文件
    '**/*.vue',
    'components/**',
    'pages/**',
    'layouts/**'
  ],
  rules: {
    'no-undef': 'off', // Nuxt auto-imports会处理这个
  }
}) 
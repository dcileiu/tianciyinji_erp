module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:nuxt/recommended'
  ],
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    // 关闭一些严格的规则
    '@typescript-eslint/no-unused-vars': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    'no-console': 'off',
    'no-undef': 'off',
    'camelcase': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'import/order': 'off',
    'n/handle-callback-err': 'off',
    'vue/no-v-html': 'off'
  }
}
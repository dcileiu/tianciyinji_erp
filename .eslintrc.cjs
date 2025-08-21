module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended'
  ],
  plugins: [],
  rules: {
    // 基本规则 - 比较宽松
    'no-console': 'off', // 允许console
    'no-debugger': 'warn', // debugger只是警告
    'no-unused-vars': 'off', // 关闭未使用变量检查
    'no-undef': 'off', // 关闭未定义变量检查（Nuxt有自动导入）
    
    // 基本语法错误仍然报错
    'no-unreachable': 'error',
    'no-dupe-keys': 'error',
    'no-duplicate-case': 'error',
    'valid-typeof': 'error'
  },
  ignorePatterns: [
    'dist',
    '.nuxt',
    '.output',
    'node_modules',
    '*.d.ts'
  ]
} 
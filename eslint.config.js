// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  ignores: [
    'node_modules/**',
    '.nuxt/**',
    '.output/**',
    'dist/**',
    'public/**',
    'supabase/migrations/**'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    '@stylistic/comma-dangle': 'off',
    '@stylistic/semi': 'off',
    'comma-dangle': 'off',
    'semi': 'off',
    // 允许变量声明后空行的格式
    '@stylistic/padding-line-between-statements': 'off',
    'padding-line-between-statements': 'off',
    '@typescript-eslint/padding-line-between-statements': 'off',
    // 允许空行的相关规则
    '@stylistic/no-multiple-empty-lines': 'off',
    'no-multiple-empty-lines': 'off',
    // 允许多空格，用于对齐
    '@stylistic/no-multi-spaces': 'off',
    'no-multi-spaces': 'off',
    // 允许行尾空格
    '@stylistic/no-trailing-spaces': 'off',
    'no-trailing-spaces': 'off',
    // 文件末尾换行符保持启用，允许自动修复
    '@stylistic/eol-last': 'error',
    'eol-last': 'error',
    // Vue相关格式化规则
    'vue/html-indent': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/html-self-closing': 'off',
    'vue/html-closing-bracket-newline': 'off',
    'vue/html-closing-bracket-spacing': 'off',
    // TypeScript格式化规则
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/object-curly-spacing': 'off',
    '@typescript-eslint/space-before-function-paren': 'off',
    // 大括号风格规则关闭
    '@stylistic/brace-style': 'off',
    'brace-style': 'off',
    // 其他格式化规则
    '@stylistic/indent': 'off',
    '@stylistic/quotes': 'off',
    '@stylistic/space-before-function-paren': 'off',
    '@stylistic/object-curly-spacing': 'off',
    // TypeScript类型相关规则 - 改为警告，不阻止运行
    '@typescript-eslint/no-explicit-any': 'warn',
    // 禁用Vue属性连字符检查
    'vue/attribute-hyphenation': 'off',
  }
})

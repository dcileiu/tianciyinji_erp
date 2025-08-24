// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  ignores: ['node_modules/**', '.nuxt/**', '.output/**', 'dist/**', 'public/**', 'supabase/migrations/**'],
  rules: {
    // TypeScript 规则
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-const': 'error',
    '@typescript-eslint/no-var-requires': 'error',

    // Vue 规则
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    'vue/attribute-hyphenation': 'off',
    'vue/v-on-event-hyphenation': 'off',
    'vue/require-default-prop': 'off',
    'vue/require-explicit-emits': 'off',
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'never',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      },
    ],

    // 代码风格规则 (由 Prettier 处理)
    indent: 'off',
    quotes: 'off',
    semi: 'off',
    'comma-dangle': 'off',
    'max-len': 'off',
    'object-curly-spacing': 'off',
    'array-bracket-spacing': 'off',
    'space-before-function-paren': 'off',
    'keyword-spacing': 'off',
    'space-infix-ops': 'off',
    'no-multiple-empty-lines': 'off',
    'no-trailing-spaces': 'off',
    'eol-last': 'off',

    // @stylistic 规则关闭 (由 Prettier 处理)
    '@stylistic/indent': 'off',
    '@stylistic/quotes': 'off',
    '@stylistic/semi': 'off',
    '@stylistic/comma-dangle': 'off',
    '@stylistic/max-len': 'off',
    '@stylistic/object-curly-spacing': 'off',
    '@stylistic/array-bracket-spacing': 'off',
    '@stylistic/space-before-function-paren': 'off',
    '@stylistic/keyword-spacing': 'off',
    '@stylistic/space-infix-ops': 'off',
    '@stylistic/no-multiple-empty-lines': 'off',
    '@stylistic/no-trailing-spaces': 'off',
    '@stylistic/eol-last': 'off',
    '@stylistic/brace-style': 'off',
    '@stylistic/padding-line-between-statements': 'off',
    '@stylistic/no-multi-spaces': 'off',

    // Vue 格式化规则关闭 (由 Prettier 处理)
    'vue/html-indent': 'off',
    'vue/html-quotes': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/html-closing-bracket-newline': 'off',
    'vue/html-closing-bracket-spacing': 'off',
    'vue/script-indent': 'off',

    // TypeScript 格式化规则关闭 (由 Prettier 处理)
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/object-curly-spacing': 'off',
    '@typescript-eslint/space-before-function-paren': 'off',
    '@typescript-eslint/comma-dangle': 'off',
    '@typescript-eslint/semi': 'off',
    '@typescript-eslint/quotes': 'off',
    '@typescript-eslint/padding-line-between-statements': 'off',

    // 代码质量规则
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-duplicate-imports': 'error',
    'no-unused-expressions': 'warn',
    curly: ['error', 'multi-line'],
    eqeqeq: ['error', 'always'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    yoda: 'error',

    // 导入规则
    'sort-imports': [
      'error',
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        allowSeparatedGroups: false,
      },
    ],
  },
})

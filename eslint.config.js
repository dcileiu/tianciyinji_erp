// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    ignores: ['node_modules/**', '.nuxt/**', '.output/**', 'dist/**', 'public/**', 'supabase/migrations/**'],
    rules: {
      'no-console': 'off',
      'no-debugger': 'warn',
      'generator-star-spacing': 'off',
      'no-mixed-operators': 0,
      // Vue specific rules
      'vue/max-attributes-per-line': [
        2,
        {
          singleline: 5,
          multiline: 1,
        },
      ],
      'vue/attribute-hyphenation': 0,
      'vue/html-self-closing': 0,
      'vue/component-name-in-template-casing': 0,
      'vue/html-closing-bracket-spacing': 0,
      'vue/singleline-html-element-content-newline': 0,
      'vue/no-unused-components': 0,
      'vue/multiline-html-element-content-newline': 0,
      'vue/no-use-v-if-with-v-for': 0,
      'vue/html-closing-bracket-newline': 0,
      'vue/no-parsing-error': 0,
      'vue/multi-word-component-names': 'off',
      'no-tabs': 0,
      'quotes': [
        2,
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: true,
        },
      ],
      'quote-props': ['error', 'consistent'],
      'no-delete-var': 2,
      'prefer-const': [
        2,
        {
          ignoreReadBeforeAssign: false,
        },
      ],
      'template-curly-spacing': 'off',
      'indent': 'off',
      // TypeScript规则 - 将any改为警告
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      // 放宽格式化规则，让Prettier处理
      '@stylistic/semi': 'off',
      '@stylistic/quotes': 'off',
      '@stylistic/comma-dangle': 'off',
      '@stylistic/indent': 'off',
      '@stylistic/no-trailing-spaces': 'off',
      '@stylistic/eol-last': 'off',
      '@stylistic/brace-style': 'off',
      '@stylistic/arrow-parens': 'off',
      '@stylistic/operator-linebreak': 'off',
      '@stylistic/member-delimiter-style': 'off',
    },
  },
  {
    files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)'],
    languageOptions: {
      globals: {
        jest: true,
      },
    },
  },
  {
    files: ['**/components/ui/**/*.{ts,vue}', '**/ui/**/*.{ts,vue}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/no-required-prop-with-default': 'off',
    },
  },
)

import globals from 'globals'
import eslintJs from '@eslint/js'

const jsFiles = ['*.js']

const languageOptions = {
  globals: {
    ...globals.node,
  },
  ecmaVersion: 2023,
  sourceType: 'module',
}

const customJavascriptConfig = {
  files: jsFiles,
  languageOptions: {
    ...languageOptions,
    parserOptions: {
      ecmaVersion: 2023,
    },
  },
  rules: {
    'no-duplicate-imports': 'error',
    'no-unneeded-ternary': 'error',
    'prefer-object-spread': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'no-unused-vars': [
      'error',
      {
        ignoreRestSiblings: true,
        args: 'none',
      },
    ],
  },
}

export default [
  { ignores: ['docs/*', 'lib/*'] },
  eslintJs.configs.recommended,
  customJavascriptConfig,
]

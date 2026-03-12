import tseslint from 'typescript-eslint'

export default tseslint.config({
  ignores: ['dist', 'node_modules', 'src/routeTree.gen.ts'],
}, {
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    parser: tseslint.parser,
  },
  rules: {},
})

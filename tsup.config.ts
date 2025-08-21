import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  minify: false,
  external: [
    'react',
    'react-dom',
    '@payloadcms/richtext-lexical',
    '@payloadcms/richtext-lexical/client',
    '@payloadcms/richtext-lexical/lexical'
  ],
  esbuildOptions: (options) => {
    options.jsx = 'automatic'
    options.jsxImportSource = 'react'
  },
  banner: {
    js: '"use client";',
  },
  onSuccess: async () => {
    console.log('✅ Build completed successfully!')
  }
})

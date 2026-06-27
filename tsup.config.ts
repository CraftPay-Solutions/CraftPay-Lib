import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    splitting: false,
  },
  {
    entry: { 'gateway/index': 'src/gateway/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
  },
])

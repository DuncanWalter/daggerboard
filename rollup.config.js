const typescript = require('rollup-plugin-typescript2')
const { terser } = require('rollup-plugin-terser')

module.exports = [
  {
    input: './src/index.ts',
    output: [
      {
        file: 'lib/index.js',
        format: 'umd',
        name: 'daggerboard',
      },
      {
        file: 'lib/index.es.js',
        format: 'es',
        name: 'daggerboard',
      },
    ],
    plugins: [typescript()],
  },
  {
    input: './src/index.ts',
    output: [
      {
        file: 'lib/index.min.js',
        format: 'umd',
        name: 'daggerboard',
      },
    ],
    plugins: [typescript(), terser()],
  },
]

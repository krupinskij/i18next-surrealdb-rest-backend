import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import commonJS from 'rollup-plugin-commonjs';
import dts from 'rollup-plugin-dts';
import external from 'rollup-plugin-peer-deps-external';

const resolveNonExternals = ({ dir = '', extension = '', nonExternals = [] }) => ({
  resolveId: (source) => {
    if (nonExternals.some((nonExternal) => source.startsWith(nonExternal))) {
      return `${dir}/${source}${extension}`;
    }
    return null;
  },
});

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: `${process.env.DIR}/cjs/index.js`,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: `${process.env.DIR}/esm/index.js`,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      external(),
      resolve(),
      commonJS(),
      typescript({
        tsconfig: './tsconfig.build.json',
      }),
      terser(),
    ],
  },
  {
    input: `${process.env.DIR}/esm/types/index.d.ts`,
    output: [{ file: `${process.env.DIR}/index.d.ts`, format: 'esm' }],
    plugins: [
      resolveNonExternals({
        dir: `${process.env.DIR}/esm/types`,
        extension: '.d.ts',
        nonExternals: ['./model'],
      }),
      dts(),
    ],
  },
];

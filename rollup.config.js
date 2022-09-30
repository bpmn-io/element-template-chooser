import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import css from 'rollup-plugin-css-only';

import pkg from './package.json';

function pgl(plugins = []) {
  return [
    css({ output: 'element-template-chooser.css' }),
    resolve({
      mainFields: [
        'browser',
        'module',
        'main'
      ]
    }),
    commonjs(),
    ...plugins
  ];
}

const deps = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {})
];

const external = (id) => {
  return deps.some(dep => id.startsWith(dep) || id === dep);
};

const srcEntry = pkg.source;

export default [
  {
    input: srcEntry,
    output: [
      { file: pkg.main, format: 'cjs', exports: 'auto', sourcemap: true },
      { file: pkg.module, format: 'es', sourcemap: true }
    ],
    external: external,
    plugins: pgl()
  }
];
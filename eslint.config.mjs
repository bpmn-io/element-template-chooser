import bpmnIoPlugin from 'eslint-plugin-bpmn-io';

const files = {
  ignored: [
    'public',
    'dist'
  ],
  build: [
    '*.js',
    '*.mjs'
  ],
  test: []
};

export default [
  {
    ignores: files.ignored
  },

  // build
  ...bpmnIoPlugin.configs.node.map(config => {

    return {
      ...config,
      files: files.build
    };
  }),

  // build
  {
    files: files.build,
    languageOptions: {
      ecmaVersion: 2025
    }
  },

  // lib + example
  ...bpmnIoPlugin.configs.browser.map(config => {

    return {
      ...config,
      ignores: files.build
    };
  })
];
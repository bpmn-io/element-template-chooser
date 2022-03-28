const path = require('path');

const CopyPlugin = require('copy-webpack-plugin');

const mode = process.env.NODE_ENV || 'development';

module.exports = {
  mode,
  entry: './example/app.js',
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'app.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.bpmn$/,
        type: 'asset/source'
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: '*.html', context: 'example', to: '.' },
        { from: 'bpmn-js/dist/assets/**/*', context: 'node_modules', to: './vendor' },
        { from: 'bpmn-js-properties-panel/dist/assets/**/*', context: 'node_modules', to: './vendor' }
      ],
    }),
  ],
  devtool: mode === 'development' ? 'eval-source-map' : 'source-map'
};
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  // 1. Entry point: Webpack starts here
  entry: './src/index.js',

  // 2. Output: Where Webpack puts the bundled file
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../backend/public/js'),
    clean: true,
  },

  // 3. Modules (Loaders): Rules for non-JS files (like CSS)
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.css$/,
        use: [
          process.env.NODE_ENV === 'production'
            ? MiniCssExtractPlugin.loader
            : 'style-loader',
          'css-loader',
        ],
      },
    ],
  },
}

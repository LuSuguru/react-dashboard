const path = require('path')
const autoprefixer = require('autoprefixer')

module.exports = {
  entry: {
    app: require.resolve('../src/app.tsx')
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      draggable: path.resolve(__dirname, '../../packages/draggable/src'),
      resizable: path.resolve(__dirname, '../../packages/resizable/src'),
      'grid-layout': path.resolve(__dirname, '../../packages/grid-layout/src')
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },

  mode: 'none',

  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.(js|jsx|ts|tsx)$/,
            use: [{
              loader: 'babel-loader',
              options: {
                cacheDirectory: './webpack_cache/',
              },
            }],
            include: [
              path.resolve(__dirname, '../../packages/draggable/src'),
              path.resolve(__dirname, '../../packages/resizable/src'),
              path.resolve(__dirname, '../../packages/grid-layout/src'),
              path.resolve(__dirname, '../src'),
            ]
          },
          {
            test: /\.(c|le)ss$/,
            use: ['style-loader', 'css-loader',
              {
                loader: require.resolve('postcss-loader'),
                options: {
                  ident: 'postcss',
                  plugins: () => [
                    require('postcss-flexbugs-fixes'),
                    autoprefixer(),
                  ],
                },
              }, 'less-loader']
          },
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: './dist/[name].[hash:8].[ext]',
            },
          },
          {
            exclude: [/\.js$/, /\.html$/, /\.json$/, /\.less$/],
            loader: 'file-loader',
            options: {
              name: './dist/[name].[hash:8].[ext]',
            }
          }
        ]
      }
    ]
  }
}

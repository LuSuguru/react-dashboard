const ora = require('ora')
const rm = require('rimraf')
const path = require('path')
const chalk = require('chalk')
const { argv } = require('yargs')
const webpack = require('webpack')
const webpackConfig = require('./webpack.prod.conf')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

if (argv.analyzer) {
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

const spinner = ora('building for production...')
spinner.start()

rm(path.join(__dirname, '../build'), err => {
  if (err) throw err
  webpack(webpackConfig, function (err1, stats) {
    spinner.stop()
    if (err1) throw err

    process.stdout.write(`${stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    })}\n\n`)

    console.log(chalk.cyan('  打包成功\n'))
  })
})

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const {extendDefaultPlugins} = require("svgo");

const json = require('./package.json');
const LiveReloadPlugin = require("webpack-livereload-plugin");
const project_name = json.name;
const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const filename = (ext) => isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`;
const optimization = () => {
  const configObj = {
    splitChunks: {
      chunks: 'all',
    },
  }

  if (isProd) {
    configObj.minimizer = [
      new CssMinimizerWebpackPlugin(),
      new TerserWebpackPlugin(),
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            // Lossless optimization with custom option
            // Feel free to experiment with options for better result for you
            plugins: [
              ["gifsicle", {interlaced: true}],
              ["jpegtran", {progressive: true}],
              ["optipng", {optimizationLevel: 5}],
              // Svgo configuration here https://github.com/svg/svgo#configuration
              [
                "svgo",
                {
                  plugins: extendDefaultPlugins([
                    {
                      name: "removeViewBox",
                      active: false,
                    },
                    {
                      name: "addAttributesToSVGElement",
                      params: {
                        attributes: [{xmlns: "http://www.w3.org/2000/svg"}],
                      },
                    },
                  ]),
                },
              ],
            ],
          },
        },
      }),
    ];
  }
  return configObj;
}

const plugins = () => {
  const basePlugins = [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      filename: 'index.html',
      minify: {
        collapseWhitespace: isProd
      },
    }),
    new MiniCssExtractPlugin({
      filename: `./assets/css/${filename('css')}`,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/assets'), to: path.resolve(__dirname, 'app/assets'),
          globOptions: {
            ignore: ["**/*.scss", "**/scss"]
          }
        }
      ]
    })
  ];

  return basePlugins;
}

module.exports = {
  mode: 'development',
  context: path.resolve(__dirname, './src'),
  entry: './index.js',
  output: {
    filename: `./assets/js/${filename('js')}`,
    path: path.resolve(__dirname, 'app'),
    clean: true,
    publicPath: '',
  },
  devServer: {
    historyApiFallback: true,
    open: true,
    compress: true,
    hot: 'only',
    liveReload: true,
    port: 3000,
    watchFiles: ['src/**/*'],
  },
  optimization: optimization(),
  plugins: plugins(),
  devtool: isProd ? false : 'source-map',
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev
            },
          },
          "css-loader"
        ],
      },
      {
        test: /\.s[ac]ss$/,
        use: [{
          loader: MiniCssExtractPlugin.loader,
          options: {
            publicPath: (resourcePath, context) => {
              return path.relative(path.dirname(resourcePath), context) + '/';
            }
          }
        },
          'css-loader',
          'sass-loader'
        ],
      },
      {
        test: /\.(?:|jpe?g|png|gif|svg|ico)$/i,
        type: 'asset/resource',
        generator: {
          filename: () => {
            return isDev ? 'img/[name][ext]' : 'img/[name].[contenthash][ext]';
          },
        },
      },
      {
        test: /\.(?:|woff2|woff)$/i,
        type: 'asset/resource',
        generator: {
          filename: () => {
            return isDev ? 'fonts/[name][ext]' : 'fonts/[name].[contenthash][ext]';
          },
        },
      },
    ]
  },
}

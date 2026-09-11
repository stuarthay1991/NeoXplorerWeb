const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const packageJson = require("./package.json");
const TerserWebpackPlugin = require("terser-webpack-plugin");

module.exports = function(_env, argv) {
  const isProduction = argv.mode === "production";
  const isDevelopment = !isProduction;

  return {
    devtool: isDevelopment && "cheap-module-source-map",
    entry: [
      require.resolve("regenerator-runtime/runtime"),
      "./src/index.js",
    ],
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: "app.js",
      publicPath: "/ICGS/Oncosplice/smart/"
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules\/(?!(ai|@ai-sdk)\/).*/,
          use: {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
              cacheCompression: false,
              envName: isProduction ? "production" : "development"
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : "style-loader",
            "css-loader"
          ]
        },
        {
          test: /\.svg$/,
          use: {
            loader: "@svgr/webpack",
            options: {
              name: '[name].[ext]'
            }
          }
        },
        {
          test: /\.(png|jpg|gif)$/i,
          use: {
            loader: "file-loader",
            options: {
              name: '[name].[ext]'
            }
          }
        }
      ]
    },
    resolve: {
      extensions: [".js", ".jsx", ".txt", ".png", ".css", ".html", ".md", "*"]
    },
    plugins: [
      isProduction &&
        new MiniCssExtractPlugin({
          filename: "style.css",
          chunkFilename: "style.chunk.css"
        }),
      new HtmlWebpackPlugin({
        filename: "./index.html",
        template: path.resolve(__dirname, "index.html"),
        inject: true
      }),
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(
          "build"
        )
      }),
      new webpack.ProvidePlugin({
        React: "react",
        regeneratorRuntime: "regenerator-runtime",
      })
    ].filter(Boolean),
    stats: {
      errorDetails: true,
      children: true
    }
  };
};

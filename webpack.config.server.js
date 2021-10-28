const nodeExternals = require("webpack-node-externals");
const path = require("path");

module.exports = {
  name: 'server',
  entry: {
    server: path.resolve(__dirname, 'server/server.tsx'),
  },
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.tsx'],
  },
  externals: [nodeExternals()],
  target: 'node',
  node: {
    __dirname: false,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          configFile: "tsconfig.server.json",
        },
      },
      {
        test: /\.(sa|sc)ss$/,
        use: [
          {
            loader: "css-loader",
            options: {
              importLoaders: 2
            }
          },
          {
            loader: "sass-loader"
          }
        ]
      },
      {
        test: /\.svg$/,
        loader: 'url-loader',
        options: {
          limit: 8192,
        }
      },
    ],
  },
}
const webpack = require("webpack");
const path = require("path");

module.exports = {
  name: "server",
  entry: {
    server: path.resolve(__dirname, "server/index.tsx"),
  },
  mode: "production",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  externals: [],
  target: "node",
  node: {
    __dirname: false,
  },
  plugins: [
    new webpack.EnvironmentPlugin({ "REACT_APP_VERSION": "development" }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "babel-loader"
          },
          {
            loader: "ts-loader",
            options: {
              compilerOptions: {
                noEmit: false
              }
            }
          }
        ]
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
        loader: "url-loader",
        options: {
          limit: 8192,
        }
      },
    ],
  },
}

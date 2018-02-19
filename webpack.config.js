const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: {
        app: "./app/js/home.js",
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
    },
    module: {
        rules: [{
            test: /\.less$/,
            use: [{
                loader: "style-loader", // creates style nodes from JS strings
            }, {
                loader: "css-loader", // translates CSS into CommonJS
            }, {
                loader: "less-loader", // compiles Less to CSS
            }],
        },
        {
            test: /\.(png|woff|woff2|eot|ttf|svg)$/,
            loader: "file-loader",
        },
        {
            enforce: "pre",
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "eslint-loader",
        },
        {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "babel-loader",
        }],
    },
    devtool: "inline-source-map",
    plugins: [
        new HtmlWebpackPlugin({
            title: "Output Management",
        }),
    ],
};


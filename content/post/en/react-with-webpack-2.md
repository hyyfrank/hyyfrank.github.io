---
title: "React With Webpack (2)"
date: 2019-08-08T11:07:49+08:00
lastmod: 2019-08-10T11:07:49+08:00
draft: false
tags: ["webpack4","react18","babel","HMR","DevServer"]
categories: ["frontend"]
---

> A webpack 4 frontend architecture series: building a scaffold from scratch, integrating React, Redux, webpack 4, gitignore, formatting, env config, HMR, debugging.

## version in package.json
1. What is the difference between `^` and `~` in package.json?
    - They control which versions of a dependency your project may use. For example `3.4.5` follows MAJOR.MINOR.PATCH (semantic versioning). Official site: https://semver.org/.
      - MAJOR: incompatible API changes
      - MINOR: backward-compatible new functionality
      - PATCH: backward-compatible bug fixes
    - Example: you ship API version `1.0.0`, fix four bugs → `1.0.4`, add backward-compatible APIs → `1.1.0`, fix two more bugs → `1.1.2`. If a release breaks dependents, that is `2.0.0`, and so on.
    - In package.json, `~3.4.5` means `>=3.4.5 <3.5.0` (patch updates within the minor line). `^3.4.5` means `>=3.4.5 <4.0.0` (any compatible 3.x). See the link above for details.
    - `npm install antd --save` often records `^3.13.0`—you can use any 3.x below 4.0.0. There are edge cases for `0.x` versions; roughly, treat `^` like `~` for those—check the official page.
    - Before hot module replacement (HMR), a few prerequisites. We continue from the last example:

## html-webpack-plugin
html-webpack-plugin generates HTML for you. Without it, after a build your JS lives under `dist/` (the docs often use `dist`, so we rename `build` to `dist`). You would still hand-edit HTML to point at the new bundle paths. This plugin generates HTML and injects references to the JS in `dist`. Example:

```javascript
plugins: [
  new HtmlWebpackPlugin({
        // template; you can point at a template but need a loader—here we use html-loader
        template: path.resolve(__dirname, "src", "index.html"),
        // output file name, default index.html, path relative to webpackConfig.output.path
        filename: "index.html",
        // cache busting: adds a query param so the browser treats each build as a new file; similar idea to incremental deploys with new asset names
        hash: true,
        // minify options—see the plugin docs if unsure
        minify: {
              collapseWhitespace: true,
              removeComments: true,
              removeRedundantAttributes: true,
              removeScriptTypeAttributes: true,
              removeStyleLinkTypeAttributes: true,
              useShortDoctype: true,
              removeAttributeQuotes: true
        },
        meta: {
          viewport: "width=device-width, initial-scale=1, shrink-to-fit=no",
          "theme-color": "#4285f4"
        }
  })
];
```
Generated HTML looks like this—the first view is minified, the second after format, because we enabled minify. Note `publicPath` in webpack.config.js: if set, the script src becomes something like `publicpath/bundle.js?71ac66103d2a`.

  ```html
  <!DOCTYPE html>
  <html lang="en"></html>
  <head>
      <meta charset=UTF-8>
      <meta name=viewport content="width=device-width,initial-scale=1">
      <meta http-equiv=X-UA-Compatible content="ie=edge">
      <meta name=viewport content="width=device-width,initial-scale=1,shrink-to-fit=no">
      <meta name=theme-color content=#4285f4>
  </head>
  <body>HTML WEBPACK PLUGIN TEMPLATE.
      <script src=bundle.js?71ac66103d2a01102753></script>
  </body>
  </html>
````

## clean-webpack-plugin

We used an npm package to delete directories before; webpack has a plugin for that too:

```javascript
plugins:[
    new CleanWebpackPlugin(['dist']),
]
````

## css plugin
For CSS I originally wanted mini-css-extract-plugin, but it did not support HMR at the time, so the classic loaders are fine:

```javascript

module: {
  rules: [
    {
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }
  ]
}

```

## webpack-dev-server
Next configure webpack-dev-server and HotModuleReplacementPlugin:

```javascript
new webpack.HotModuleReplacementPlugin();
```

Dev server in webpack:

```javascript
devServer: {
      contentBase: './dist',
      hot: true
    },
```

## final package.json
Install every plugin with cnpm. package.json:

```javascript
{
  "name": "webpack4",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/hyyfrank/webpack4.git"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/hyyfrank/webpack4/issues"
  },
  "scripts": {
    "build": "webpack --watch",
    "dev": "webpack-dev-server"
  },
  "homepage": "https://github.com/hyyfrank/webpack4#readme",
  "dependencies": {
    "webpack": "^4.29.0"
  },
  "devDependencies": {
    "clean-webpack-plugin": "^1.0.1",
    "css-loader": "^2.1.0",
    "html-loader": "^0.5.5",
    "html-webpack-plugin": "^4.0.0-beta.5",
    "style-loader": "^0.23.1",
    "webpack-cli": "^3.2.1",
    "webpack-dev-server": "^3.1.14"
  }
}
```

## final webpack.config.js
Final webpack.config.js:

```javascript
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
module.exports = {
  entry: {
    app: "./src/index.js"
  },
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist",
    hot: true
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(["dist"]),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "index.html"), // template
      filename: "index.html",
      hash: true // cache busting
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  output: {
    publicPath: "/",
    path: path.resolve(__dirname, "dist"),
    filename: "[name]-bundle.js"
  }
};
```

## Final result
Open the browser inspector, Console panel—you should see `[WDS] Hot Module Replacement enabled.` HMR is working; edit JS and the page updates immediately.

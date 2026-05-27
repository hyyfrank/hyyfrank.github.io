---
title: "React With Webpack (4)"
date: 2019-08-13T11:11:33+08:00
lastmod: 2019-08-14T11:11:33+08:00
draft: false
tags: ["webpack4","react18","babel","HMR","DevServer"]
categories: ["frontend"]
---

> A webpack 4 frontend architecture series: building a scaffold from scratch, integrating React, Redux, webpack 4, gitignore, formatting, env config, HMR, debugging.

# webpack4 with Babel, React, CSS Module

- This part covers a simple setup for Babel, React, and CSS modules. We will refine later; first ship a working version.

## What you need
- Packages to install and what they do:
```javascript
"dependencies": {
    "react": "^16.8.1", //react package
    "react-dom": "^16.8.1",//the entry point to the DOM and server renderers for React
    "webpack": "^4.29.0",
    // polyfill: you can use Promise, WeakMap,Array.from,Object.assign,Array.includes..
    // this is a polyfill, we need it to be a dependency
    "@babel/polyfill": "^7.2.5"
  },
  "devDependencies": {
    //Compile object rest and spread to ES5
    "@babel/plugin-proposal-object-rest-spread": "^7.3.2",
    // re-use of Babel's injected helper code to save on codesize.
    "@babel/plugin-transform-runtime": "^7.2.0",
    //a library that contain's Babel modular runtime
    //helpers and a version of regenerator-runtime.
    "@babel/runtime": "^7.0.0-beta.55",
    //babel comman line tool.
    "@babel/cli": "^7.2.3",
    "@babel/core": "^7.2.2",
    //a smart preset that allows you to use the latest JavaScript without needing to        //micromanage which syntax transforms
    "@babel/preset-env": "^7.3.1",
    //@babel/plugin-syntax-jsx
    //@babel/plugin-transform-react-jsx
    //@babel/plugin-transform-react-display-name
    //@babel/plugin-transform-react-jsx-self
    //@babel/plugin-transform-react-jsx-source
    "@babel/preset-react": "^7.0.0",
    "babel-loader": "^8.0.5",
    "babel-plugin-transform-object-rest-spread": "^6.26.0",
    "css-loader": "^2.1.0",
    "html-loader": "^0.5.5",
    "style-loader": "^0.23.1",
    "html-webpack-plugin": "^4.0.0-beta.5",
    "clean-webpack-plugin": "^1.0.1",
    "webpack-cli": "^3.2.1",
    "webpack-dev-server": "^3.1.14"
  }
```

- Note `@babel/polyfill` belongs in `dependencies` because polyfills ship to production, not only at build time. Babel config `.babelrc`:
```javascript
{
  "presets": [
    ["@babel/preset-env", {
      "targets": {
        "node": "current"
      }
    }],
    ["@babel/preset-react"]
  ],
  "plugins": [
    ["@babel/plugin-transform-runtime"],
    ["@babel/plugin-proposal-object-rest-spread",{ "useBuiltIns": true }]
  ]
}
```

## Add React support
- webpack.config.js
```javascript
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const baseConfig = {
  entry: [
    "@babel/polyfill", // required here for polyfill; can also import in source
    "./src/index.js"
  ],
  devtool: "cheap-module-source-map", // source map for production
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            // use CSS modules and the modules query string format
            loader: "css-loader?modules&localIdentName=[name]_[hash:base64:5]"
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          // run js/jsx through babel-loader
          loader: "babel-loader"
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader"
          }
        ]
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
  resolve: {
    extensions: ["*", ".js", ".jsx"]
  },
  output: {
    publicPath: "/",
    path: path.resolve(__dirname, "dist"),
    filename: "[name]-bundle.js"
  }
};
// in development, enable HMR and inline-source-map
if (process.env.NODE_ENV === "development") {
  baseConfig.devtool = "inline-source-map";
  baseConfig.devServer = {
    contentBase: "./dist",
    hot: true,
    open: true
  };
}
module.exports = baseConfig;
```

## First JSX
- A minimal JSX component:
```javascript
import React from "react";
import * as style from "../css/main.css";
const HomeComponent = () => {
  // test object rest/spread
  let { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 };
  console.log(x); // 1
  console.log(y); // 2
  console.log(z); // { a: 3, b: 4 }
  // test Array.from
  const arr = Array.from(new Set([1, 2, 3, 2, 1]));
  const arr2 = [1, [2, 3], [4, [5]]].flat(2);
  console.log(arr2);
  // test Promise
  const promise = new Promise((resolve, reject) => {
    console.log("promise");
    resolve(1);
  });
  // test Symbol
  const sym = Symbol();
  console.log("symbol:" + sym.toString());
  return (
    <div>
      <h2>Hello React16.7.0!</h2>
      <div className={style.hello}>Hello CSS Module!</div>
    </div>
  );
};
export default HomeComponent;
```

At this point the simplest React example runs. Entry `index.js`:

```javascript
import React from "react";
import ReactDOM from "react-dom";
import HomeComponent from "./components/home";
ReactDOM.render(<HomeComponent />, document.getElementById("app"));
```

Scripts in package.json:

```javascript
"scripts": {
    "prod": "webpack --mode production",
    "dev": "NODE_ENV=development webpack-dev-server --mode development --open"
  },
```

## Conclusion
We only wired up the minimum React stack. Next we will extend this baseline step by step until the app feels more professional.

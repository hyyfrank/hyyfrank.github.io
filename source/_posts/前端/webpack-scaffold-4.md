---
title: start from a easy demo
date: 2020-10-2 23:45:00
author: hyyfrank
cover: true
top: true
categories: 前端
tags:
  - Webpack4
  - JavaScript
---

> 这是一个webpack4的前端架构主题，主要涉及怎么从0到1构建前端脚手架
> 如何把最新流行的技术整合在一起,涉及react,redux,webpack4相关技术
> 也包含一些项目构建需要的东西，比如gitignore,code format，不同环境设置，
> 热部署，调试环境等等问题


# webpack4 with Babel, React, CSS Module

- 这节主要讲下 babel, react, css module 的简单引入，后续会根据需要再来修改，我们先做一个版本

## 需要什么
- 首先，看下需要装哪些包，都是干什么的
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

- 这里要注意的是@babel/polyfill，这个要放在 dependencies 里边，因为是 polyfill,代码最后也是要在里边的，所以不能放在 devDependencies 里。接着看 babel 的配置文件。.babelrc
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
## 增加react支持
- webpack.config.js
```javascript
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const baseConfig = {
  entry: [
    "@babel/polyfill", //这里要写，配置polyfill,也可以写在源码里
    "./src/index.js"
  ],
  devtool: "cheap-module-source-map", //production的source map
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            //这里注意，要使用css module以及css module的格式
            loader: "css-loader?modules&localIdentName=[name]_[hash:base64:5]"
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          //js/jsx使用babel-loader来处理
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
      template: path.resolve(__dirname, "src", "index.html"), //模板
      filename: "index.html",
      hash: true //防止缓存
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  resolve: {
    extensions: ["*", ".js", ".jsx"]
  },
  output: {
    publicPath: "",
    path: path.resolve(__dirname, "dist"),
    filename: "[name]-bundle.js"
  }
};
//增加这部分，当是开发环境的时候，再使用hmr和inline-source-map.
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
## 第一个JSX
- 然后写个简单的 jsx
```jsx
import React from "react";
import * as style from "../css/main.css";
const HomeComponent = () => {
  //测试对象展开
  let { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 };
  console.log(x); // 1
  console.log(y); // 2
  console.log(z); // { a: 3, b: 4 }
  //测试array.from
  const arr = Array.from(new Set([1, 2, 3, 2, 1]));
  const arr2 = [1, [2, 3], [4, [5]]].flat(2);
  console.log(arr2);
  //测试下promise
  const promise = new Promise((resolve, reject) => {
    console.log("promise");
    resolve(1);
  });
  //测试下symbol
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
到这里就能让 react 的一个最简单的例子跑起来了,看下 index.js
```jsx
import React from "react";
import ReactDOM from "react-dom";
import HomeComponent from "./components/home";
ReactDOM.render(<HomeComponent />, document.getElementById("app"));
```
package.json 里的 scripts 这样写
```javascript
"scripts": {
    "prod": "webpack --mode production",
    "dev": "NODE_ENV=development webpack-dev-server --mode development --open"
  },
```

## 结论
可以看到，我们只是简单把一个react需要引入的东西引入进来，接下来，我们在这个最简单的例子上，逐步增加支持，让我们的应用更加professional

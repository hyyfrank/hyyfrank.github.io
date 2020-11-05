---
title: Hot Module Replacement
date: 2020-10-1 00:30:00
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

## version in package.json
1. package.json 里的^和~有啥区别
    - 这个其实就是说明你项目中可以用哪个版本的软件，例如：3.4.5 类似 MAJOR.MINOR.PATCH 这种格式，这个叫 sematic versioning, 官网地址(https://semver.org/)。
      - MAJOR: 引入了不向后兼容的 API
      - MINOR:引入了向后兼容的 API.
      - PATCH:修 bug 的版本
    - 举个例子，一般发布 API 版本从 1.0.0，修了四个 bug,变成 1.0.4，引入新的 API,但是这些 API 向后兼容，那就变成 1.1.0，再修两个 bug,就变成 1.1.2，如果新的版本加入了新 API 是不向后兼容的，可能会破坏依赖，这种版本就是 2.0.0，以此类推
    - package.json 的情况是，~3.4.5 就是指 3.4.x 这样的版本，但是不超过 3.5.0， ^3.4.5 的意思就是 3.x.x 都是，但是低于 4.0.0 的版本。这样说就好理解了(具体看我上面的提供的链接)。
    - 我们常见的 npm install antd --save 通常你在 package.json 看到的是^3.13.0 就是你可以使用 3.x.x 的版本但低于 4.0.0.当然有规则就有例外，如果是 0 开头的，有些许不同，简单讲，可以将^理解成~就成了，具体官方网页瞄一眼就明白了。
    - 再说 hot replacement module(HRM)之前，需要了解几个东西，我们在上次的例子里来继续做：
## html-webpack-plugin
html-webpack-plugin: 这个 plugin 可以帮我们生成 html 文件，比如如果不使用他，你打包了，js 都到 dist 目录下(官方喜欢用 dist，我们就把 build 改成 dist),那你的 html 是不是还要自己手动引用这个新生成的地址，怎么自动化也帮我们把 html 生成并且把生成的 dist 目录下的 js 也引用进来呢，这个 plugin 就做这个事情，代码如下：
```javascript
plugins: [
  new HtmlWebpackPlugin({
        //模板,可以指定模板，但是要指定loader,这里我们用html-loader
        template: path.resolve(__dirname, "src", "index.html"),
        //输出文件的文件名字，默认就是index.html,路径是相对于webpackConfig.output.path路径
        filename: "index.html",
        //防止缓存,也就是生成的时候引用的时候，会有一个参数，这样就每次都去加载这个js，浏览器认为这是一个新的文件，有的人会做增量更新，其实道理差不多，就是用新的名字，让浏览器强制加载新的文件
        hash: true,
        //压缩的选项，字面意思，不知道的话，可以看下官网
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
生成了 html 长这样,第一图是压缩的，第二图是 format 之后，因为我们制定了压缩，所以生成第一图这样的代码，这里要注意 webpack.config.js 里的 publicpath,如果指定，那么，生成的 js 的地址会变成 publicpath/bundle.js?71ac66103d2a 这样的引用

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

我们之前有一个删除目录的npm包，webpack里也有相应的plugin可以做这个事情，代码如下：
```javascript
plugins:[
    new CleanWebpackPlugin(['dist']),
]
````
## css plugin
关于 css, 本来想使用 mini-css-extract-plugin，但是这个 plugin 目前不支持 HRM,所以用老的就行

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
然后要配置 webpack-dev-server 和 HotModuleReplacementPlugin

```javascript
new webpack.HotModuleReplacementPlugin();
```

Dev_server_plugin 在 webpack 里这样配：
```javascript
devServer: {
      contentBase: './dist',
      hot: true
    },
```
## final package.json
所有安装的 plugin 都需要 cnpm install,package.json 如下：
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
webpack.config.js 最后长这样：

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
      template: path.resolve(__dirname, "src", "index.html"), //模板
      filename: "index.html",
      hash: true //防止缓存
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  output: {
    publicPath: "",
    path: path.resolve(__dirname, "dist"),
    filename: "[name]-bundle.js"
  }
};
```

## 最后效果
打开浏览器的inspector,到console面板里，看到有个字写[WDS] Hot Module Replacement enabled.说明 hrm 是好的，你修改下 JS 会发现立马自己更新。

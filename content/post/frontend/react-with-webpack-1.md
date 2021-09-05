---
title: "React With Webpack(一)"
date: 2019-08-06T23:36:30+08:00
lastmod: 2019-08-06T23:36:30+08:00
draft: false
tags: ["webpack4","react18","babel","HMR","DevServer"]
categories: [ "frontend" ]
---


> 这是一个webpack4的前端架构主题，主要涉及怎么从0到1构建前端脚手架
> 如何把最新流行的技术整合在一起,涉及react,redux,webpack4相关技术
> 也包含一些项目构建需要的东西，比如gitignore,code format，不同环境设置，
> 热部署，调试环境等等问题


## webpack scaffold

### 环境

  - 第一：开发环境
  使用 vscode, [github](https://github.com/hyyfrank/react_with_webpack) 概念啥的很多地方都讲过了，这里水一下，请看[文档](https://www.webpackjs.com/concepts/) OK, 接着开始讲怎么用，一般项目需要的功能，我们一个个做,先做个例子，看看打包大概流程是怎么样的，不 bb.
  - 先用 npm 初始化项目，当然用 yarn 也行，执行 npm -init -y 就生成 package.json 文件了(最好换 cnpm 稍微快点)
  - 先去 vscode 的 plugin 下一个 html boilerplate 然后写 html 就舒服了，先写个 html,这时候只要简单建个文件输入 html:5 回车，就得到一个简单的 html5 文件了
  - 简单加个 css 文件和 js 文件，那三剑客就齐了，这也是最网页最简单的样子了

      ```html
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <link rel="stylesheet" href="./main.css">
            <title>Hello Webpack</title>
        </head>
        <body>
            <h2>Say hello to webpack4!</h2>
            <script src="./bundle.js"></script>
        </body>
        </html>
      ```

### http-server
  1. 为了简单看到 html 网页的效果，我们装个库：cnpm install http-server -g
  2. 我要用 webpack 自然得装下，cnpm install webpack -g
  3. 启动网页，用我们刚才得 http-server: http-server -p 3000, 访问 http://127.0.0.1:3000/ 就能看到简单页面
   
### webpack入坑

  - 简单网页打完收工。接着就是来使用 webpack 来打包和混淆了 js 了。

    1. 先简单试一下：./node_modules/webpack/bin/webpack.js ./main.js bundle.js
    然后你去把 html 里的 js 的 src 改成 bundle.js，打开网页看下，也是好的，说明 webpack 已经把 main.js 打包成 bundle.js 了，你可以去看下里边代码长什么样，有个了解
    2. 当然，我不能每次都自己动手去改这个 html 和输入命令吧，所以我们 webpack 提供了配置文件的方式来让你写，结合 package.json 里的 scripts 部分，可以让我们加命令，这样就不会敲命令敲到手软了
    3. 开始正式打包
      - web pack.config.js 长这样：
        ```javascript
        const path = require("path");
          module.exports = {
            entry: {
              app: "./src/main.js"
            },
            output: {
              publicPath: __dirname + "/build/", // js引用路径或者CDN地址
              path: path.resolve(__dirname, "build"), // 打包文件的输出目录
              filename: "bundle.js"
            }
          };
          ```
      - 结果
        和我们刚才命令行差不多，不过这次用配置文件的方式展示出来,啥意思呢，就是上面注释那意思。什么，你不知道 entry 和 output 的意思，拜托，稍微看下文档，中文的也行啊，起码有个大概了解【参考文章开始的链接】，写完这个，直接在当前目录下打 webpack 命令搞定！然后我们把命令放在 package.json 里的 scripts 部分，以后直接 npm run build 就跑这个构建命令，就方便了，如下：(这里 webpack 是全局装的，方便点)
    - 把命令放进去package.json
      ```javascript

      "build": "webpack"

      ```
    - OK,那我每次执行完构建，会生成一个 build 目录，我不想每次自己手动去删掉，所以，我们可以构建之前先删除这个文件，然后再开始构建，简单装个酷，cnpm install rmdir-cli,然后我们的 package.json 里的 build 脚本变成：
      ```javascript
      "build": "rmdir-cli build && webpack --watch"
      ```
      稍微调整下文件结构，加个 src 目录来放 js, 只需要修改下 webpack.config.js 里的 entry 的路径就可以了,当然了你 html 如果要应用到文件，js 的 src 要改成从 build 中去取就行了，详细代码看我的 github repo,watch 就是为了你能监听文件的变化，修改文件 webpack 重新编译你也能看到
- 各种规范打包出来的样子
  因为支持 webpack 支持 ES6、CommonJs 和 AMD 规范，所以都可以在 js 里去写，举个栗子，加上 es6：

  main.js

  ```javascript
  import addtwo from "./add";

  console.log("javascript say hello.");

  addtwo(1, 2);
  ```

  add.js

  ```javascript
  export default (a, b) => {
    console.log("a+b =", a + b);

    return a + b;
  };
  ```

  重新构建下，跑一下，看看打开 html 里的 chrome dev tool,看看 a+b=3 有没有打出来。搞定！

  看一眼打完包是什么样子

  ```javascript
  !(function(e) {
    var t = {};

    function r(n) {
      if (t[n]) return t[n].exports;

      var o = (t[n] = {
        i: n,

        l: !1,

        exports: {}
      });

      return e[n].call(o.exports, o, o.exports, r), (o.l = !0), o.exports;
    }

    (r.m = e),
      (r.c = t),
      (r.d = function(e, t, n) {
        r.o(e, t) ||
          Object.defineProperty(e, t, {
            enumerable: !0,

            get: n
          });
      }),
      (r.r = function(e) {
        "undefined" != typeof Symbol &&
          Symbol.toStringTag &&
          Object.defineProperty(e, Symbol.toStringTag, {
            value: "Module"
          }),
          Object.defineProperty(e, "__esModule", {
            value: !0
          });
      }),
      (r.t = function(e, t) {
        if ((1 & t && (e = r(e)), 8 & t)) return e;

        if (4 & t && "object" == typeof e && e && e.__esModule) return e;

        var n = Object.create(null);

        if (
          (r.r(n),
          Object.defineProperty(n, "default", {
            enumerable: !0,

            value: e
          }),
          2 & t && "string" != typeof e)
        )
          for (var o in e)
            r.d(
              n,
              o,
              function(t) {
                return e[t];
              }.bind(null, o)
            );

        return n;
      }),
      (r.n = function(e) {
        var t =
          e && e.__esModule
            ? function() {
                return e.default;
              }
            : function() {
                return e;
              };

        return r.d(t, "a", t), t;
      }),
      (r.o = function(e, t) {
        return Object.prototype.hasOwnProperty.call(e, t);
      }),
      (r.p = "/Users/hyy/github/webpack4/build/"),
      r((r.s = 0));
  })([
    function(e, t, r) {
      "use strict";

      r.r(t);

      console.log("javascript say hello."),
        ((e, t) => (console.log("a+b =", e + t), e + t))(1, 2);
    }
  ]);
  ```

  今天困了，先写到这吧，不知道说啥了，扯个淡收场吧！
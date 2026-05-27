---
title: "React With Webpack (1)"
date: 2019-08-06T23:36:30+08:00
lastmod: 2019-08-06T23:36:30+08:00
draft: false
tags: ["webpack4","react18","babel","HMR","DevServer"]
categories: [ "frontend" ]
---

> A webpack 4 frontend architecture series: building a scaffold from scratch, integrating React, Redux, webpack 4, gitignore, formatting, env config, HMR, debugging.

## webpack scaffold

### Environment

  - First: development environment
  Use VS Code and [github](https://github.com/hyyfrank/react_with_webpack). Concepts are covered in many places already, so I will keep this brief—see the [docs](https://www.webpackjs.com/concepts/). OK, let us start with how to use it. We will build the features a typical project needs one by one. First, a small example to see what the bundling flow looks like—no long talk.
  - Initialize the project with npm (yarn works too). Run `npm init -y` to generate `package.json` (cnpm is a bit faster if you switch to it).
  - Install the HTML Boilerplate plugin in VS Code, then writing HTML is comfortable. Create a file and type `html:5` + Enter to get a simple HTML5 file.
  - Add a simple CSS file and JS file—the classic trio—and you have the simplest possible web page.

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
  1. To quickly preview the HTML page, install a helper globally: `cnpm install http-server -g`
  2. Since we will use webpack, install it too: `cnpm install webpack -g`
  3. Start the page with http-server: `http-server -p 3000`, then visit http://127.0.0.1:3000/ to see the simple page

### Getting started with webpack

  - The simple static page is done. Next we use webpack to bundle and minify JS.

    1. Try it once: `./node_modules/webpack/bin/webpack.js ./main.js bundle.js`
    Then change the script `src` in HTML to `bundle.js`, open the page—it still works. Webpack packed `main.js` into `bundle.js`. Open the bundle and see what the output looks like.
    2. Of course we should not edit HTML and type commands by hand every time. Webpack gives you a config file, and with `scripts` in `package.json` you can add shortcuts so you are not typing commands all day.
    3. Formal bundling
      - `webpack.config.js` looks like this:
        ```javascript
        const path = require("path");
          module.exports = {
            entry: {
              app: "./src/main.js"
            },
            output: {
              publicPath: __dirname + "/build/", // JS public path or CDN base
              path: path.resolve(__dirname, "build"), // output directory for bundles
              filename: "bundle.js"
            }
          };
          ```
      - Result
        Similar to the CLI run above, but shown through a config file—meaning what the comments say. Do not know `entry` and `output`? Please skim the docs (Chinese is fine) for a rough idea [see the link at the top]. After writing this, run `webpack` in the project root. Put the command in `package.json` `scripts` so later you run `npm run build` for the build. Example (webpack installed globally here for convenience):
    - Put the command in package.json
      ```javascript

      "build": "webpack"

      ```
    - OK, each build creates a `build` directory. I do not want to delete it manually every time, so run a clean before build. Install `cnpm install rmdir-cli`, then the build script becomes:
      ```javascript
      "build": "rmdir-cli build && webpack --watch"
      ```
      Adjust the layout slightly: add a `src` folder for JS and only change the `entry` path in `webpack.config.js`. If HTML references the bundle, point the script `src` at `build/`. See my GitHub repo for full code. `watch` recompiles when files change so you see updates immediately.
- Bundled output for different module styles
  Webpack supports ES6, CommonJS, and AMD in your JS. Example with ES6:

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

  Rebuild, run, open Chrome DevTools on the HTML page, and check that `a+b = 3` is logged. Done!

  A peek at the bundle:

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

  Getting sleepy—stopping here for today. Not sure what else to say, so I will wrap with a bit of filler!

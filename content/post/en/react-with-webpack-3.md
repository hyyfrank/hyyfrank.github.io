---
title: "React With Webpack (3)"
date: 2019-08-10T11:11:30+08:00
lastmod: 2019-08-11T11:11:30+08:00
draft: false
tags: ["webpack4","react18","babel","HMR","DevServer"]
categories: ["frontend"]
---

> A webpack 4 frontend architecture series: building a scaffold from scratch, integrating React, Redux, webpack 4, gitignore, formatting, env config, HMR, debugging.

# Basics

## entry: configure module entry points
  - When webpack resolves files it uses `context` as the base directory. Default `context` is the directory where you run webpack—in our project that is usually the repo root. You can also set it on the CLI, e.g. `webpack --context`.
    ```javascript
    module.exports = {
      context: path.resolve(__dirnaame, "app")
    };
    ```
    Paths in `entry` are relative to `context`, which affects how later config paths are resolved.
  - `entry` can be a string, array, or object. A single page might be `'./src/index.js'`; multiple pages `['./src/firstpage.js','./src/secondpage.js']`.
    - chunk: webpack names each generated chunk. With string/array `entry` you get one chunk; with an object you get multiple chunks named by the object keys.
  - Dynamic entry:
    For many pages and many entry points you can return an object synchronously or a Promise asynchronously:
    ```javascript
    // sync
    entry: () => {
      return {
        first: "./src/firstpage",
        second: "./src/sencordpage"
      };
    };
    // async
    entry: () => {
      return new Promise(resolve => {
        resolve({
          first: "./src/firstpage",
          second: "./src/secondpage"
        });
      });
    };
    ```

## output: configure emitted bundles
  - filename: a single string such as `bundle.js`; for multiple chunks use placeholders like `[name].js`, or `[id]-[name]-[hash]-[chunkhash].js` (internal variables for chunk id, name, hash, content hash).
  - chunkFilename: e.g. filenames from CommonsChunkPlugin; same placeholders as above.
  - path: output directory for bundles.
  - publicPath: base URL when assets are on a CDN—try your own domain to see the effect.
  - crossOriginLoading: when async-loaded assets need CORS; often used with JSONP injected into HTML.
  - libraryTarget & library: how the bundle is exposed as a library and under what name.
  - libraryExport: when exporting as commonjs/commonjs2, pick which submodule to export.

## module: rules for processing modules
  - rules: how webpack reads and transforms modules—usually an array of loader configs. Each rule has three parts:
    - Which files to match: test (arrays supported), include, exclude
    - Which loader(s) to run: babel-loader, css-loader, etc. Multiple options can be passed as an object, often `options: { ... }`.
    - Order: enforce `pre` or `post` to run a loader first or last.
  - noParse: tell webpack not to parse certain files, e.g. jquery/chartjs:
    ```javascript
    noParse:|jquery/chartjs/
    // or as a function
    noParse: (content) =>{
    return /jquery/chartjs/.test(content)
    }
    ```
  - parser: AMD, CommonJS, SystemJS, ES6, etc. Example:
    ```javascript
    {
        moudle:{
            rules:{
                test: /\.js$/,
                use:['babel:loader'],
                parser:[
                    amd: false,
                    commonjs: false,
                    system:false,
                    harmony:false,
                    requireInclude: false,// disable require.include
                    requireEnsure: false,// disable require.ensure
                    requireContext: false,// disable require.context
                    browserify: false,
                    requireJs:false
                ]
            }
        }
    }
    ```

## resolve: how webpack finds module files
  - alias: import shortcuts mapped to real paths:
    ```javascript
    resolve: {
      alias: {
        components: "./src/components";
      }
    }
    ```
    `import xxx from "components/xxx"` becomes `"./src/components/xxx"`.
  - mainFields: some packages ship different builds per environment—choose which field wins.
  - extensions: when imports omit extensions, webpack tries these suffixes:
    ```
    // try .ts, then .js, then .json
    extentsions:['.ts','.js','.json']
    ```
  - modules: directories to search for dependencies; default includes `node_modules`. Example:
    ```
    modules:['./src/components','node_modules']
    ```
    Then `import xxx from ../../../components/xxx` can become `import xxx from xxx`.
  - enforeExtention: if true, imports must include a file extension or resolution fails.

## plugins: extend webpack
  - We already use several; imports look similar—the important part is each plugin’s options.
    - dev-server: devServer options
      - hot: used with hot module replacement
      - inline: when enabled, the dev-server client drives HMR and refresh; when off, changes run in an iframe at localhost:8080/webpack-dev-server
      - Others worth reading in the docs: historyApiFallback, contentBase, headers, host, port, allowHosts, disableHostCheck, https, clientLogLevel, compress, open
    - others: config can export more than a plain object
      - target: web, node, async-node, webworker, electron-main, electron-renderer
      - Devtool: how source maps are generated
      - watch: rebuild on file changes
      - external: libraries not bundled by webpack, e.g. jquery
      - ResolveLoader: where webpack discovers loaders

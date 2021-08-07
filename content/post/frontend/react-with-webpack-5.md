---
title: "React With Webpack(五)"
date: 2021-08-07T11:11:36+08:00
lastmod: 2021-08-07T11:11:36+08:00
draft: false
tags: ["webpack4","react18","babel","HMR","DevServer"]
categories: ["frontend","technology"]
---

> 这是一个webpack4的前端架构主题，主要涉及怎么从0到1构建前端脚手架
> 如何把最新流行的技术整合在一起,涉及react,redux,webpack4相关技术
> 也包含一些项目构建需要的东西，比如gitignore,code format，不同环境设置，
> 热部署，调试环境等等问题


# Webpack4 如何处理 css

- [github demo](https://github.com/hyyfrank/webpack4) branch: feature/lesson5

## 我们需要做什么
  - 支持 css 的处理
  - 把 css 抽取成单独的 css 文件
  - 支持 css module
  - 支持 css next 等新特性
  - 支持 css style lint 校验
  - 减少无用的 css 代码
  - 使用 post css 做些处理比如 autoprefix,css-next
  - 最小化 css 文件
## 需要什么 loader 和 plugin
  > loader 用于对模块的源代码进行转换。loader 可以使你在 import 或"加载"模块时预处理文件。因此，loader 类似于其他构建工具中“任务(task)”，并提供了处理前端构建步骤的强大方法。loader 可以将文件从不同的语言（如 TypeScript）转换为 JavaScript，或将内联图像转换为 data URL。loader 甚至允许你直接在 JavaScript 模块中 import CSS 文件！
  - **loader**:
    - sass-loader: 简单说就是 sass 转换成 css
    - postcss-loader: postcss 很强大，可以这么简单理解下，css-->ast-->plugin-->xxxx,大概就是，先把 css 转化为抽象语法树，然后使用 javascript 处理，然后厉害的就是，真的啥都有个插件，只有想不到!
    - css-loader:**The `css-loader` interprets `@import` and `url()` like `import/require()` and will resolve them.**选项我们会用到 modules, localIdentName
    - style-loader:**Adds CSS to the DOM by injecting a `<style>` tag**
  - **plugin**:
    - mini-css-extract-plugin：抽取 css 成单独文件
    - purifycss-webpack： 删除没使用的 css 选择器
    - stylelint-webpack-plugin：对 css 做 lint
    - optimize-css-assets-webpack-plugin:webpack 在 build 的过程中优化和最小化 css，默认使用 cssnano 做预处理器，cssnano 也是个 postcss 的 plugin
好了，废话到此为止，上代码看下就都明了，为了让代码更清晰，我们把对 css 的处理单独拉出来，再通过 webpack-merge 合到一起，下面是 css 的处理代码：
抽取代码成单独文件，现在目测原来的 extract-text-webpack-plugin 还是能用的，如果是使用 webpack4 的话，也得更新 extract-text-webpack-plugin 的版本到^4.0.0-beta.0，下面注释掉的，大家可以加回来试试，因为 webpack4 推荐使用 mini-css-extract-plugin，所以我们就使用这个,而且 mini-css-extract-plugin 不支持 hmr,但是不是在开发环境，我们只放在生产环境，其实还是 ok 的。
第一步：**support style-loader,css-loader,sass-loader**
```javascript
const cssDevRules=[
    {
        loader:'style-loader'
    },
    {
        loader:'css-loader?modules&localIdentName=[name]_[local]_[hash:base64:5]',
    },
    {
        loader:'sass-loader',
    }
];
const cssProdRules=[
    {
        loader: MiniCssExtractPlugin.loader,
    },
    {
        loader:'css-loader?modules&localIdentName=[name]_[local]_[hash:base64:5]',
    },
    {
        loader:'sass-loader',
    }
];
console.log("is prod:"+isProd);
const baseConfig = {
    module: {
        rules: [
            {
                test: /\.(css|sass|scss)$/,
                use: isProd? cssProdRules:cssDevRules,
                exclude: /node_modules/,
            },
        ]
    },
    plugins: [
    ],
};
```
## css支持
第二步：**css-next /autoprefixer support**
加上 posts-loader 来支持 auto-prfix 自动增加，同时，为了支持 css-next 最新的特性，现在不需要单独加，看官方文档有个 postcss-preset-env，直接加了支持 autoprefixer,[PostCSS Preset Env](https://github.com/csstools/postcss-preset-env) 能把现代的 css 转化成大部分浏览器都能解析的样式，会根据浏览器的版本决定加什么样的 polyfill.
```shell script
npm install postcss-preset-env
```
简单修改下 postcss.config.js
```javascript
module.exports = {
  plugins: {
    "postcss-import": {},
    "postcss-preset-env": {
      browsers: "last 2 versions"
    },
    cssnano: {}
  }
};
```
```javascript
    {
        loader:'postcss-loader',
        options: {
            sourceMap: true,
            config: {
                path: __dirname + '/postcss.config.js'
            }
        },
    },
```

## 风格校验
第三步：**add style-lint support**
加 style-lint 来控制代码质量，当然我只是加上而已，具体规则要自己去定，或者你可以用标准的 stylelint-config-standard,对应的 plugin 是 stylelint-config-standard

```javascript
const StyleCssLintPlugin = require("stylelint-webpack-plugin");
const StyleLintPlugin = new StyleCssLintPlugin({
  configFile: ".stylelintrc",
  context: "src",
  files: "**/*.scss",
  failOnError: false,
  quiet: false
});
baseConfig.plugins = [StyleLintPlugin, MiniCssPlugin, OptimizeCSSPlugin];
```
当然也要加个.stylelintrc 文件,现在简单先用 stylelint-config-standard。
```javascript
{
  "extends": "stylelint-config-standard"
}
```
## 移除冗余css
第四步：**remove unused css**
purifycss： 移除无用 css,有人使用 css tree shake 这种术语，anyway,感觉差不多
```javascript
const PurifyCSSPlugin = require("purifycss-webpack");
const PurifyCssPlugin = new PurifyCSSPlugin({
  paths: glob.sync(path.join(__dirname, "../src/index.js")),
  styleExtensions: [".css", ".scss"],
  purifyOptions: {
    whitelist: ["*purify*"]
  }
});
baseConfig.plugins = [
  MiniCssPlugin,
  PurifyCssPlugin,
  StyleLintPlugin,
  OptimizeCSSPlugin
  // new ExtractTextPlugin("styles.css"),
];
```
## 最小化CSS
第五步：**minimize css**
optimize-css-assets-webpack-plugin
**cssProcessor**: 压缩和优化 CSS 的预处理器，现在默认是 cssnano.这是一个函数，接受一个 CSS 和 options 参数，返回 promise
**canPrint**: {bool} 表示插件能够在 console 中打印信息，默认值是 true
```javascript
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const OptimizeCSSPlugin = new OptimizeCSSAssetsPlugin({
  cssProcessor: cssnano,
  cssProcessorOptions: {
    discardComments: {
      removeAll: true
    },
    // Run cssnano in safe mode to avoid
    // potentially unsafe transformations.
    safe: true
  },
  canPrint: true
});

baseConfig.plugins = [
  MiniCssPlugin,
  PurifyCssPlugin,
  StyleLintPlugin,
  OptimizeCSSPlugin
  // new ExtractTextPlugin("styles.css"),
];
```
## 最后
OK，好了，大概该做的都做完了，如果需要进一步处理，可以考虑 postcss 的一些 plugin，甚至可以自己写点 plugin,因为这是讲 webpack 不是 postcss，所以留给你自己探索吧～

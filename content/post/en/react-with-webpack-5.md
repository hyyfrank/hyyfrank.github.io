---
title: "React With Webpack (5)"
date: 2019-08-15T11:11:36+08:00
lastmod: 2019-08-16T07:11:36+08:00
draft: false
tags: ["webpack4","react18","babel","HMR","DevServer"]
categories: ["frontend"]
---

> This is a webpack 4 frontend architecture series focused on building a frontend scaffold from scratch.
> It shows how to combine popular modern technologies—React, Redux, webpack 4, and related tooling.
> It also covers project essentials such as `.gitignore`, code formatting, per-environment configuration,
> hot reload, debugging setup, and similar topics.


# How Webpack 4 Handles CSS

- [github demo](https://github.com/hyyfrank/webpack4) branch: feature/lesson5

## What We Need to Do
  - Support CSS processing
  - Extract CSS into separate CSS files
  - Support CSS Modules
  - Support modern CSS features (e.g. CSS Next)
  - Support CSS style linting
  - Remove unused CSS
  - Use PostCSS for tasks such as autoprefixer and css-next
  - Minimize CSS files
## Loaders and Plugins We Need
  > Loaders transform module source code. They let you preprocess files when you import or “load” a module—similar to tasks in other build tools, and a powerful way to handle frontend build steps. Loaders can turn TypeScript into JavaScript, inline images into data URLs, or even let you `import` CSS directly from JavaScript modules!
  - **loaders**:
    - sass-loader: converts Sass to CSS
    - postcss-loader: PostCSS is powerful; think of it roughly as css → AST → plugins → output. Almost anything has a plugin.
    - css-loader: **The `css-loader` interprets `@import` and `url()` like `import/require()` and will resolve them.** We use options such as `modules` and `localIdentName`.
    - style-loader: **Adds CSS to the DOM by injecting a `<style>` tag**
  - **plugins**:
    - mini-css-extract-plugin: extracts CSS into separate files
    - purifycss-webpack: removes unused CSS selectors
    - stylelint-webpack-plugin: lints CSS
    - optimize-css-assets-webpack-plugin: optimizes and minifies CSS during the webpack build; defaults to cssnano as the processor (cssnano is also a PostCSS plugin)

That’s enough theory—here is the code. To keep things clear, we pull CSS handling into its own file and merge it with `webpack-merge`. Below is the CSS setup:

We extract the config into a separate file. The older `extract-text-webpack-plugin` can still work; with webpack 4 you need `extract-text-webpack-plugin` at `^4.0.0-beta.0`. The commented-out bits below are for you to try. Webpack 4 recommends `mini-css-extract-plugin`, so we use that. Note that `mini-css-extract-plugin` does not support HMR, but we only use it in production, which is fine.

**Step 1: support `style-loader`, `css-loader`, `sass-loader`**
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

## CSS Support

**Step 2: css-next / autoprefixer support**

Add `postcss-loader` for autoprefixer. To use the latest CSS features without a separate plugin, use `postcss-preset-env` per the official docs—it includes autoprefixer. [PostCSS Preset Env](https://github.com/csstools/postcss-preset-env) turns modern CSS into something most browsers understand and adds polyfills based on browser targets.

```shell script
npm install postcss-preset-env
```

Update `postcss.config.js`:

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

## Style Linting

**Step 3: add style-lint support**

Add stylelint to control code quality. Here we only wire it up; you define the rules yourself, or use `stylelint-config-standard` with the matching plugin.

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

Add a `.stylelintrc` file; for now we use `stylelint-config-standard`:

```javascript
{
  "extends": "stylelint-config-standard"
}
```

## Remove Redundant CSS

**Step 4: remove unused CSS**

PurifyCSS removes unused CSS. Some call this “CSS tree shaking”; either way, the idea is similar.

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

## Minimize CSS

**Step 5: minimize CSS**

`optimize-css-assets-webpack-plugin`

**cssProcessor**: preprocessor that compresses and optimizes CSS; default is cssnano. It is a function that receives CSS and options and returns a promise.

**canPrint**: `{bool}` whether the plugin logs to the console; default `true`.

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

## Wrap-Up

That covers the main pieces. For more, explore PostCSS plugins—or write your own. This series is about webpack, not PostCSS, so the rest is up to you.

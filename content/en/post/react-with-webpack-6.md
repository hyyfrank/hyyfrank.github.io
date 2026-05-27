---
title: "React With Webpack (6)"
date: 2019-08-18T09:11:39+08:00
lastmod: 2019-08-19T13:11:39+08:00
draft: false
tags: ["webpack4","react18","babel","HMR","DevServer"]
categories: ["frontend"]
---

> This is a webpack 4 frontend architecture series focused on building a frontend scaffold from scratch.
> It shows how to combine popular modern technologies—React, Redux, webpack 4, and related tooling.
> It also covers project essentials such as `.gitignore`, code formatting, per-environment configuration,
> hot reload, debugging setup, and similar topics.

# Webpack 4: Images and Fonts

## Code

[https://github.com/hyyfrank/webpack4](https://github.com/hyyfrank/webpack4) branch: feature/lesson7

## Preparation

- What we need to do

  - Support jpeg, jpg, gif, png, and similar formats

  - Combine images into sprites

  - Compress images

  - How to load and handle fonts

- Loaders and plugins we need

  - **loaders**:

    - file-loader: resolves `import` / `require()` in files into URLs and emits files to the output directory

    - url-loader: like file-loader, but returns a Data URL when the file is below a size limit (in bytes)

    - img-loader: minimizes images; depends on imagemin; usually used with the loaders above for compression

    - svg-url-loader: SVG is XML text; base64 is not required. UTF-8 encoding can be shorter, compresses better with gzip, and browsers parse UTF-8 faster than base64

## **Step 1**: Add image handling

```javascript
{
    test: /\.(jpe?g|png|gif)$/i,
    use:[
        {
            loader: "url-loader",
            options:{
                name: "[name]-[hash:5].min.[ext]",
                limit: 10000, // size <= 20KB
                publicPath: "images/",
                outputPath: "images/"
            }
        },
    ]
}
```

## **Step 2**: Image compression

Each format has its own plugin; install them with npm. See each project on GitHub for options—worth reading if you care about image optimization.

```javascript
{
    test: /\.(jpe?g|png|gif)$/i,
    use:[
        {
            loader: "url-loader",
            options:{
                name: "[name]-[hash:5].min.[ext]",
                limit: 10000, // size <= 20KB
                publicPath: "images/",
                outputPath: "images/"
            }
        },
    ]
}
```

Run `npm run dev` and compare image sizes before and after compression—they should be smaller.

## **Step 3**: Generate sprites

```javascript
{
    loader:'postcss-loader',
    options: {
        sourceMap: true,
        config: {
            path: __dirname + '/postcss.config.js'
        },
        plugins: [require("postcss-sprites")({
            spritePath: "./dist/images"
        })]
    },
},
```

This plugin builds the sprite sheet. Example result:

![Screen Shot 2019-03-15 at 11.23.08 PM.png](https://upload-images.jianshu.io/upload_images/11577190-8efb3bbde7750c20.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## **Step 4**: Font handling

1. Download a font from Google Fonts (or elsewhere if you cannot reach it), convert it with an online font converter, and you get ttf, otf, eot, woff, and other formats locally. Then parse fonts with:

```javascript
{
    test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
    exclude: /images/,  /* dont want svg images from image folder to be included */
    use: [
        {
            loader: 'file-loader',
            options: {
                outputPath: 'fonts/',
                name: '[name][hash].[ext]',
            },
        },
    ],
}
```

After that, you can reference your fonts in CSS with a custom name:

```javascript
@font-face {
  font-family: "frankfont";
  src: url("../fonts/RobotoCondensed-Regular.woff2") format("woff2"),      		url("../fonts/RobotoCondensed-Regular.woff") format("woff");
}
```

Usage example:

```javascript
    .hello {
     font-family: frankfont Monaco Arial, Verdana, Tahoma, sans-serif;
     font-size: 20px;
     width: 300px;
     font-weight: bold;
     color: var(--color-black);
     background: rgba(153, 221, 153, 0.8);
    }
```

Result:

The “hello css module” text uses our custom font. Image compression and sprite generation look like this:

![Screen Shot 2019-03-15 at 11.20.55 PM.png](https://upload-images.jianshu.io/upload_images/11577190-2f6d868cf74258f8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## Wrap-Up

That covers the basics for this lesson. There is more you could do; I may write more when I have time.

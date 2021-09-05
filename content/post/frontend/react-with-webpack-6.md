---
title: "React With Webpack(六)"
date: 2019-08-18T09:11:39+08:00
lastmod: 2019-08-19T13:11:39+08:00
draft: false
tags: ["webpack4","react18","babel","HMR","DevServer"]
categories: ["frontend"]
---

> 这是一个webpack4的前端架构主题，主要涉及怎么从0到1构建前端脚手架
> 如何把最新流行的技术整合在一起,涉及react,redux,webpack4相关技术
> 也包含一些项目构建需要的东西，比如gitignore,code format，不同环境设置，
> 热部署，调试环境等等问题

# webpack4 图片，字体

## 代码
[https://github.com/hyyfrank/webpack4](https://github.com/hyyfrank/webpack4) branch: feature/lesson7

## 准备
- 我们需要做什么

  - 支持 jpeg, jpg,gif,png 等文件格式

  - 图片处理成雪碧图

  - 压缩图片

  - 字体如何下载和处理

- 需要什么 loader 和 plugin

  - **loader**:

    - file-loader:可以解析文件中的 import`/`require()，转成 url，把文件打到 output 目录中

    - url-loader: 类似 file-loader,但是在文件大小（单位 byte）低于指定的限制时，可以返回一个 DataURL

    - img-loader:图片最小化的 loader,它有个依赖叫 imagemin，一般会和上面两个 loader 一起做图片的压缩

    - svg-url-loader:svg 文件是 xml 字符串，使用 base-64 不是必须的，使用 utf-8 编码比 base64 有一些好处，比如编码后短一点，使用 gzip 压缩的时候效果好点，浏览器解析 utf-8 比 base64 快

## **第一步**：先增加对图片的处理

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

## **第二步**：处理图片压缩

这边对每一种格式都有一个 plugin，这些 plugin 都要 npm install 一下，然后具体的配置选项可以 github 上搜到，有图片优化需求的，要详细看一下各个选项

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

可以执行 npm run dev 查看之前图片的大小和压缩后的大小，发现确实变小了

## **第三步**：生成雪碧图

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

这里的 plugin 是为了生成雪碧图，效果如下：
![Screen Shot 2019-03-15 at 11.23.08 PM.png](https://upload-images.jianshu.io/upload_images/11577190-8efb3bbde7750c20.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## **第四步**： 字体处理

1.  去 google font 下载个字体，如果翻不了墙，可以自己其他地方下一个，然后用在线字体转换器转换下，然后就能转出 ttf|otf|eot|woff 各种格式，这样本地就有字体文件了，然后解析的话，使用下面这个代码就可以

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

做完这个，就可以在 css 中包含自己的字体，自己可以命名下

```javascript
@font-face {
  font-family: "frankfont";
  src: url("../fonts/RobotoCondensed-Regular.woff2") format("woff2"),      		url("../fonts/RobotoCondensed-Regular.woff") format("woff");
}
```

然后我们看一下使用的情况：

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

具体的效果：

可以看到 hello css module 这句话，已经使用我们自己的字体了，图片压缩的效果和雪碧图生成效果如下：

![Screen Shot 2019-03-15 at 11.20.55 PM.png](https://upload-images.jianshu.io/upload_images/11577190-2f6d868cf74258f8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 最后
OK，好了，大概该做的都做完了，这基本任务算是都能处理了，其实还有好多东西要做，有空会多写一些。

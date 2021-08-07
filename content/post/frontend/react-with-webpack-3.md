---
title: "React With Webpack(三)"
date: 2021-08-07T11:11:30+08:00
lastmod: 2021-08-07T11:11:30+08:00
draft: false
tags: ["webpack4","react18","babel","HMR","DevServer"]
categories: ["frontend","technology"]
---

> 这是一个webpack4的前端架构主题，主要涉及怎么从0到1构建前端脚手架
> 如何把最新流行的技术整合在一起,涉及react,redux,webpack4相关技术
> 也包含一些项目构建需要的东西，比如gitignore,code format，不同环境设置，
> 热部署，调试环境等等问题

# 基础
## entry: 配置模块的入口
  - webpack 寻找文件的时候会以 context 为基础，context 默认的是执行 webpack 的路径，比如我们项目就是默认根目录，当然也可以采取命令行去配置，比如 webpack --context
    ```javascript
    module.exports = {
      context: path.resolve(__dirnaame, "app")
    };
    ```
    我们现在看到的 entry 里的路径也是相对于这个 context 的路径的，这个选项会影响后续配置的文件的路径
  - entry 可以配成三种方式 string, array, object,比如我们现在是一个页面就是‘./src/index.js’,多个页面的入口就是['./src/firstpage.js','./src/secondpage.js']
    - chunk: webpack 会为每个生成的 chunk 起名字，如果上面 entry 配了 string/array,则只有一个 chunk,如果配成 object,那么 chunk 会有多个，每个的名字就是 object 里的 key 的名字:
  - 配置动态 entry:
    这个就是如果你有多个页面，要做多个入口，可以写成动态的，比如同步的直接返回一个 object，异步方式就返回一个 promise
    ```javascript
    //同步
    entry: () => {
      return {
        first: "./src/firstpage",
        second: "./src/sencordpage"
      };
    };
    //异步
    entry: () => {
      return new Promise(resolve => {
        resolve({
          first: "./src/firstpage",
          second: "./src/secondpage"
        });
      });
    };
    ```
## output:配置如何输出最终需要的代码
  - filename:如果只有一个，就是字符串，比如我们的 bundle.js,如果输出多个 chunk,就用通配符[name].js,
    可以这样[id]-[name]-[hash]-[chunkhash].js,这几个都是他的内部变量，表示 chunk 的唯一标示，名称，唯一标示的 hash,chunk 内容的 hash
  - chunkFilename:比如 commonchunkplugin 输出的文件名，内置变量和上面一致
  - path：打包文件的输出目录
  - publicpath：这个就是静态资源如果放 cdn 上，需要去配的，可以自己写个域名放上去看看效果就知道了
  - crossOriginLoading：输出的时候如果需要异步加载一些资源，这个就是配置这些资源的获取，一般是通过 jsonp 来做的，会往 html 里插一个
  - libraryTarget & library：配置以什么方式导出库和导出库的名称
  - libraryExport： 如果上面导出方式是 commons/commonjs2 的时候，你可以在这里导出你想导出的字模块
## module:配置处理模块的规则
  - rules 配置模块的读取和解析规则，就是配置 loader 的时候，一般是一个数组，然后每一部分配置怎么处理一个类型的文件，每一部分包括三个方面
    - 匹配到需要处理的文件，包括 test(支持数组), include, exclude
    - 使用特定的 loader 来处理这些匹配到的文件 babel-loader, css-loader...loader 如果有多个参数需要传入，可以使用 object 来传递，经常看到的是 option:{xxxx}这样的
    - 执行 loader 的顺序可以调整到最开始或者最后执行，通过 enforce 来配置，设为 pre/post
  - noParse: 这个就是用来让 webpack 忽略一些文件，比如 jquery/chartjs,举个例子：
    ```javascript
    noParse:|jquery/chartjs/
    // 或者是函数形式
    noParse: (content) =>{
    return /jquery/chartjs/.test(content)
    }
    ```
  - parser: 支持 amd, commonjs,systemjs,es6,举个例子
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
                    requireInclude: false,//禁用require.include
                    requireEnsure: false,//禁用require.ensure
                    requireContext: false,//禁用require.context
                    browserify: false,
                    requireJs:false
                ]
            }
        }
    }
    ```
## resolve: webpack 如何寻找模块所对应的文件
  - alias: 就是别名，比如你 import 的时候，它会替换成真正的位置
    ```javascript
    resolve: {
      alias: {
        components: "./src/components";
      }
    }
    ```
    上面代码就会在你 import xxx from "components/xxx"的时候帮你替换成“./src/components/xxx”
  - mainFields: 有的模块提供不同环境的代码，这个字段可以指定优先使用哪个版本
  - extentions: 让 webpack 在寻找文件的时候，找这样扩展名的文件，你导入文件的时候不指定后缀名的话，会去看这个选项的配置，然后去寻找
    ```
    // 先去找ts文件，然后js,然后json文件
    extentsions:['.ts','.js','.json']
    ```
  - modules: resolve.modules 配置 web pack 去哪些目录寻找第三方模块，默认指定 node_modules,一般我们应用会这样配
    ```
    modules:['./src/components','node_modules']
    ```
    这样配后，你以前可能需要 import xxx from ../../../components/xxx 就可以直接 import xxx from xxx;简洁了许多
  - enforeExtention: 如果配成 true,那么你 import 语句就必须加后缀名，否则会找不到
## plugins:配置扩展插件
  - 我们项目里用到了一些，你也可以看到，其实引入都是大同小异，主要是要搞清楚这里面的具体的配置项
    - dev-server:配置 dev-server
      - hot: 我们在配置 hot module replacement 的时候会配的
      - inline： 一般使用这个模式，打开之后，webpack 通过代理客户端控制模块替换和刷新，如果关闭，那它文件变化后，会通过 iframe 的方式去运行，要到 localhost:8080/webpack-dev-server 看效果
      - 还有一些配置项，参考文档，比如 historyApiFallback, contentBase ,headers ,host, port, allowHosts ,disableHostCheck, https,clientLogLevel,compress,open 这些都可以去看看，经常涉及到
    - others:其他配置项，配置文件不止可以返回 object,也可以返回其他形式
      - target: 针对不同的环境，比如 web, node,async-node,webworker,electron-main,electron-renderer
      - Devtool: 配置 webpack 如何生成 sourcemap
      - watch: 配置文件更新监听
      - external：有些第三方库，这些不需要 webpack 打包，比如 jquery
      - ResolveLoader: 告诉 webpack 如何发现 loader

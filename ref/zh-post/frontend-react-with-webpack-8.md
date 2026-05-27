---
title: "React With Webpack(八)"
date: 2019-08-21T20:11:44+08:00
lastmod: 2019-08-20T19:11:44+08:00
draft: false
tags: ["webpack4","react18","babel","HMR","DevServer"]
categories: ["frontend"]
---

> 这是一个webpack4的前端架构主题，主要涉及怎么从0到1构建前端脚手架
> 如何把最新流行的技术整合在一起,涉及react,redux,webpack4相关技术
> 也包含一些项目构建需要的东西，比如gitignore,code format，不同环境设置，
> 热部署，调试环境等等问题

# how react interact with middleware

* 函数式编程的思想
    curry化的函数具有延迟执行的特点，不断的currying形成的middleware可以累积参数，在配合compose,这样就可以形成类似pipeline的方式来处理数据
* store因为闭包的原因，applyMiddlewar完成后，所有的middleware内部拿到的store是最新的
 ```javascript
 export default function applyMiddleware(...middlewares) {
  return (createStore) => (...args) => {
    const store = createStore(...args)
    let dispatch = store.dispatch
    let chain = []
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    //其实就是获得一个中间件执行的函数数组，一个个去执行
    chain = middlewares.map(middleware => middleware(middlewareAPI))
    //对dispatch加强，就是通过中间件函数加强
    //我们这里也就是个例子，其实就是compose把中间件一个个的合起来跑
    dispatch = compose(...chain)(store.dispatch)
    return {
      ...store,
      dispatch
    }
  }
}
 ```
 ## 具体什么道理
 看了下源码，其实applymiddleware就是curry+compose来对dispatch进行加强的一种方式。复习下curry和compose的实现
 * 实现一个加法
 ```javascript
 const add=(...args)=>args.reduce((res, cur) => { return res + cur; }, 0)
 ```
这样我就有一个函数了，我再写一个函数
```javascript
const mul2 = cur => cur * 2
```
为了和applymiddleware类似，我有一个store,当然store可以更复杂，这里就简单一个数组
```javascript
const store=[1,2,3]
```
接着需要一个compose函数，把这两个函数合起来，当然可以多个，要实现的效果如：
```javascript
(f1, f2, f3, f4…) => value => f1(f2(f3(f4(value))));
```
写出来的compose是这样：
```javascript
const compose = (...fns) => fns.reduceRight((f, g) => (...args) => f(g(...args)))
```
curry化其实是在connect那边有体现，但是这里也提一下怎么实现

```javascript
const curry = (fn,...arg1)=>{
    if(arg1.length>=fn.length) return fn(...arg1)
    return (...arg2)=>curry(fn,...arg1,...arg2)
}
```

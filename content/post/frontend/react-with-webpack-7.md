---
title: "React With Webpack(七)"
date: 2019-08-19T20:11:44+08:00
lastmod: 2019-08-20T19:11:44+08:00
draft: false
tags: ["webpack4","react18","babel","HMR","DevServer"]
categories: ["frontend","technology"]
---

> 这是一个webpack4的前端架构主题，主要涉及怎么从0到1构建前端脚手架
> 如何把最新流行的技术整合在一起,涉及react,redux,webpack4相关技术
> 也包含一些项目构建需要的东西，比如gitignore,code format，不同环境设置，
> 热部署，调试环境等等问题


# 增加 react—redux 支持

## add redux && react-redux support

```shell script
npm install --save redux react-redux
```

## 代码上的改动

![react_redux](/images/1.png)
![react_redux](/images/2.png)

## 分析下这个代码改动

- 原来的 HomeComponent 变成了 App,并且 App 组件有个 connect 方法，方法有两个参数 mapStateToProps，mapDispatchToProps
- Provider 使组件层级中的 connect()方法都能够获得 Redux store。正常情况下，你的根组件应该嵌套在 Provider 中才能使用上面那条说的 connect()方法

### 具体说下这些函数的功能

1. mapStateToProps 是一个函数。它的作用就是像它的名字那样，建立一个从（外部的）state 对象到（UI 组件的）props 对象的映射关系
2. mapDispatchToProps 是 connect 函数的第二个参数，用来建立 UI 组件的参数到 store.dispatch 方法的映射。也就是说，它定义了哪些用户的操作应该当作 Action，传给 Store。它可以是一个函数，也可以是一个对象。
3. React-Redux 提供 connect 方法，用于从 UI 组件生成容器组件
4. React-Redux 提供 Provider 组件，可以让容器组件拿到 state。

具体如何调用，找了张图，画的还可以：
![react-redux-workflow.png](/images/react-redux-workflow.png)

### creatstore

方法：createStore(reducer, [preloadedState], [enhancer])

- reducer：什么是 reducer

> A reducer (also called a reducing function) is a function that accepts an accumulation and a value and returns a new accumulation. They are used to reduce a collection of values down to a single value.

```javascript
type Reducer<S, A> = (state: S, action: A) => S
```

有没有似成相识的感觉，为啥我喜欢问你 array.prototype.reduce?这是函数式编程的一个基础概念，在 redux 里，这个 accumulate state 其实就是 state object,这个过程简单来说就是，（之前状态，action）=>(新的状态)，他们必须是纯函数，这样才能保证一些功能，比如热加载，时间漫游这类功能

- \[preloadedState\]
  就是初始状态，现在大多使用 combineReducers 来生成它，你可以传入你 reducer 认识的任何数据（plain object）
- \[enhancer\]
  意思是字面的意思，就是 store 的 enhancer，你可以传入第三方中间件，比如 time travel, persistence 等，默认使用的是 applyMiddleware()

  ```javascript
  createStore(
  combineReducers({
    ...reducers,
    routing: routerReducer
  }),
  applyMiddleware(thunk)
  )
  ```
### todo
* add typescript支持
* add hook支持
* 这两个其实都不难弄，就不写了
### 参考资料

- https://redux.js.org/
- https://cn.redux.js.org/
- 深入 react 技术栈

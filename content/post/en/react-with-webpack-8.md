---
title: "React With Webpack (8)"
date: 2019-08-21T20:11:44+08:00
lastmod: 2019-08-20T19:11:44+08:00
draft: false
tags: ["webpack4","react18","babel","HMR","DevServer"]
categories: ["frontend"]
---

> This is a webpack 4 frontend architecture series focused on building a frontend scaffold from scratch.
> It shows how to combine popular modern technologies—React, Redux, webpack 4, and related tooling.
> It also covers project essentials such as `.gitignore`, code formatting, per-environment configuration,
> hot reload, debugging setup, and similar topics.

# How React Interacts With Middleware

* Functional programming ideas
    Curried functions defer execution. Middleware built by repeated currying accumulates arguments; with `compose`, you get a pipeline-style data flow.
* Because of closures, after `applyMiddleware` finishes, every middleware sees the latest `store`.
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
    // Basically build an array of middleware runner functions and invoke each one
    chain = middlewares.map(middleware => middleware(middlewareAPI))
    // Enhance dispatch by running it through the middleware chain
    // This example uses compose to run middleware in sequence
    dispatch = compose(...chain)(store.dispatch)
    return {
      ...store,
      dispatch
    }
  }
}
 ```
 ## How it works

Reading the source, `applyMiddleware` is essentially curry + compose to enhance `dispatch`. Quick review of curry and compose:

 * Implement addition
 ```javascript
 const add=(...args)=>args.reduce((res, cur) => { return res + cur; }, 0)
 ```
Now we have one function; add another:

```javascript
const mul2 = cur => cur * 2
```

To mirror `applyMiddleware`, we have a `store`—it can be more complex; here it is a simple array:

```javascript
const store=[1,2,3]
```

We need `compose` to chain functions (any number of them). The desired shape:

```javascript
(f1, f2, f3, f4…) => value => f1(f2(f3(f4(value))));
```

A minimal `compose`:

```javascript
const compose = (...fns) => fns.reduceRight((f, g) => (...args) => f(g(...args)))
```

Currying shows up in `connect` too, but here is a simple implementation:

```javascript
const curry = (fn,...arg1)=>{
    if(arg1.length>=fn.length) return fn(...arg1)
    return (...arg2)=>curry(fn,...arg1,...arg2)
}
```

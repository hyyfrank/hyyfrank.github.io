---
title: "React With Webpack (7)"
date: 2019-08-19T20:11:44+08:00
lastmod: 2019-08-20T19:11:44+08:00
draft: false
tags: ["webpack4","react18","babel","HMR","DevServer"]
categories: ["frontend"]
---

> This is a webpack 4 frontend architecture series focused on building a frontend scaffold from scratch.
> It shows how to combine popular modern technologies—React, Redux, webpack 4, and related tooling.
> It also covers project essentials such as `.gitignore`, code formatting, per-environment configuration,
> hot reload, debugging setup, and similar topics.


# Adding React-Redux Support

## Add redux && react-redux support

```shell script
npm install --save redux react-redux
```

## Code changes

![react_redux](/images/1.png)
![react_redux](/images/2.png)

## What changed in the code

- The original `HomeComponent` became `App`. `App` uses `connect` with two arguments: `mapStateToProps` and `mapDispatchToProps`.
- `Provider` lets `connect()` anywhere in the tree access the Redux store. Normally the root component should be wrapped in `Provider` so child components can use `connect()` as described above.

### What these pieces do

1. `mapStateToProps` is a function that maps external state to UI props—as the name suggests.
2. `mapDispatchToProps` is the second argument to `connect`. It maps UI events to actions dispatched to the store. It can be a function or an object.
3. React-Redux’s `connect` turns a UI component into a container component.
4. React-Redux’s `Provider` lets container components read state.

A decent diagram of the flow:

![react-redux-workflow.png](/images/react-redux-workflow.png)

### createStore

Signature: `createStore(reducer, [preloadedState], [enhancer])`

- reducer: what is a reducer?

> A reducer (also called a reducing function) is a function that accepts an accumulation and a value and returns a new accumulation. They are used to reduce a collection of values down to a single value.

```javascript
type Reducer<S, A> = (state: S, action: A) => S
```

Sound familiar? This is why I like asking about `Array.prototype.reduce`—a functional programming idea. In Redux, the accumulated value is the state object: roughly `(previousState, action) => newState`. Reducers must be pure functions so features like hot reload and time travel work.

- `[preloadedState]`
  Initial state. Most apps use `combineReducers` to build it. You can pass any plain object your reducer understands.
- `[enhancer]`
  Enhances the store—third-party middleware for time travel, persistence, etc. Default enhancement is `applyMiddleware()`.

  ```javascript
  createStore(
  combineReducers({
    ...reducers,
    routing: routerReducer
  }),
  applyMiddleware(thunk)
  )
  ```

### Todo

* Add TypeScript support
* Add Hooks support

Both are straightforward; leaving them out here.

### References

- https://redux.js.org/
- https://cn.redux.js.org/
- 深入 react 技术栈

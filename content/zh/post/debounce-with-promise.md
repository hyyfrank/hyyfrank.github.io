---
title: "[Autodesk] 用 Promise 做防抖"
date: 2022-08-11T11:53:41+08:00
lastmod: 2022-08-12T11:53:41+08:00
draft: false
tags: ["javascript"]
categories: ["frontend"]
aliases:
  - /post/frontend/debounce-with-promise/
---

## 基础防抖

```javascript
const _debounce = (fn, delay, immediate = false) => {
  let timer;
  return (...args) => {
    const callNow = immediate && !timer;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!immediate) fn(...args);
    }, delay);
    if (callNow) fn(...args);
  };
};
```

## 带 Promise 的防抖

鼠标拖拽时如果频繁触发防抖，而被包装函数会调 API 并返回 **Promise**，通常只希望**最后一次**真正执行。Lodash 的 `debounce` 要求 `func` 必须是函数：

```javascript
if (typeof func !== 'function') {
  throw new TypeError('Expected a function');
}
```

异步场景需要稍作改造：

### 只保留最后一次 Promise

```javascript
const debounce_promise_last = (fn, delay) => {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    return new Promise((resolve) => {
      timer = setTimeout(() => resolve(fn(...args)), delay);
    });
  };
};
```

### 每次调用都返回 Promise，延迟后统一结算

```javascript
function debounce_promise_all(fn, delay = 0) {
  let timer = null;
  let resolves = [];
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const result = fn(...args);
      resolves.forEach((r) => r(result));
      resolves = [];
    }, delay);
    return new Promise((r) => resolves.push(r));
  };
}
```

## API 场景：节流、取消、重试

调 API 时除了防抖，**节流**也很常见。更复杂的情况还有**取消**和**重试**（常配合指数退避）。当 Promise 数量极大（我们曾遇到 **1000+**）时，通常需要：

1. **分批**执行，例如每批 20 个；
2. 为每个 Promise 分配**唯一 ID**；
3. 做好**日志**（我们曾打到 Splunk）；
4. 明确**取消**语义；
5. Ajax 重试配合**指数退避**。

具体实现与业务强相关，这里不贴完整代码。

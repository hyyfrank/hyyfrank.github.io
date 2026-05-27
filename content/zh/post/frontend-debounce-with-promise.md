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

拖拽鼠标时若频繁触发防抖，而被包装函数会请求 API 并返回 **Promise**，往往只希望**最后一次**调用生效。Lodash 的 `debounce` 会校验 `func` 必须是函数：

```javascript
if (typeof func !== 'function') {
  throw new TypeError('Expected a function');
}
```

异步场景可以这样写：

### 只保留最后一次 Promise

```javascript
const debounce_promise_last = (fn, delay) => {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    return new Promise((resolve) => {
      timer = setTimeout(
        () => resolve(fn(...args)),
        delay,
      );
    });
  };
};
```

### 每次调用都返回 Promise，延迟后一起 resolve

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

## API 调用：节流、取消、重试

调 API 时常用**节流**限制单位时间内的请求次数。更复杂的情况包括**取消**和**重试**（指数退避）。当并发 Promise 非常多（例如 **1000+**）时，通常需要：

1. 分批处理（如每批 20 个）；
2. 为每个 Promise 绑定任务 ID；
3. 单条日志便于排查（我们使用 Splunk）；
4. 设计取消策略；
5. Ajax 重试使用指数退避。

实现与产品逻辑耦合较紧，此处不展开示例代码。

---
title: "[Autodesk] debounce with promise"
date: 2022-08-11T11:53:41+08:00
lastmod: 2022-08-12T11:53:41+08:00
draft: false
tags: ["javascript"]
categories: ["frontend"]
---

## A basic debounce

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

## debounce with promise

When debounce fires during mouse drag but the wrapped function calls an API and returns a **Promise**, you often want only the **last** call to run. Lodash’s `debounce` requires `func` to be a function:

```javascript
if (typeof func !== 'function') {
  throw new TypeError('Expected a function');
}
```

For async work you need a small variant:

### Only the last Promise

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

### Every call gets a Promise, flushed together

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

## API calls: throttle, cancel, retry

For APIs, **throttle** is common when you want at most one request per window. Harder cases include **cancel** and **retry** (often exponential backoff). With very large promise counts (we once had **1000+**), you typically need:

1. Batch promises (e.g. 20 per group)
2. Unique IDs per promise / task
3. Per-promise logging (we used Splunk)
4. Cancel semantics
5. Retry with backoff for Ajax

Implementation is product-specific; no sample code here.

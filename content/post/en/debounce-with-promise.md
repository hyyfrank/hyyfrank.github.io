---
title: "[Autodesk] debounce with promise"
date: 2022-08-11T11:53:41+08:00
lastmod: 2022-08-12T11:53:41+08:00
draft: false
tags: ["javascript"]
categories: ["frontend"]
---

## A Basic debounce

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

If you trigger debounce while dragging the mouse, but the wrapped function calls an API and returns a **Promise**, you often want to run **only the last** invocation. How should debounce be written for that?

Lodash’s `debounce` checks that `func` is a function:

```javascript
if (typeof func !== 'function') {
  throw new TypeError('Expected a function');
}
```

For async work you need a small variant. The idea is straightforward:

### Only the last Promise

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

### Every call gets a Promise, flushed together after delay

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

For API calls, **throttle** is also common when you want at most one request per time window.

More involved cases include **cancel** and **retry** (often with exponential backoff). When the number of promises is very large—for example, we once had **1000+** concurrent promises—you need more structure:

1. **Batch promises** — e.g. 20 per group.
2. **Unique IDs** — tie each promise to a task id.
3. **Logging** — per-promise logs for debugging (we sent ours to Splunk).
4. **Cancel** — whether in-flight work should be aborted.
5. **Retry** — for Ajax APIs, exponential backoff for retry delays is a good fit.

The implementation is tightly coupled to the product; no sample code here.

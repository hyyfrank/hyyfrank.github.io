---
title: "[Autodesk] How Autodesk Uses WebAssembly"
date: 2020-01-25T11:53:41+08:00
lastmod: 2020-07-19T11:53:41+08:00
draft: false
tags: ["webassembly", "emscripten", "web_worker", "service_worker"]
categories: ["frontend"]
---

## What Is WebAssembly?

WebAssembly (Wasm) is a portable, compact, fast-loading binary format for the web. C, C++, Rust, Go, Java, C#, and other toolchains can compile to Wasm and ship it to the browser to complement JavaScript. Real-world uses include large games, Google Earth, Magnum, Blazor, and **AutoCAD on the web** — this post focuses on our AutoCAD case.

## Why WebAssembly?

Mainly **performance**. JavaScript struggles with heavy CPU/memory work, drawing, and high concurrency. The platform has added pieces like `SharedArrayBuffer`, but limits remain. We used Emscripten and asm.js, later **Binaryen**, for roughly **12–15%** overall speedup.

## How We Use It

We compile C++ to Wasm with **Emscripten**. Main challenges:

- Huge codebase
- Long startup
- Desktop vs web differences

### Sync vs async I/O

The main thread cannot block without jank; rewriting is costly and third-party libs may need changes. Web Workers help but blocking calls, message timing, no shared memory, and no semaphore-like sync make communication hard.

### Approaches we considered

1. **Emterpreter** — bytecode + interpreter for sync-like behavior via saved stack/state and timers. Too slow; hard to identify stack functions; hard to maintain.

2. **SharedArrayBuffer** — fast but manual serialization; **Spectre** concerns led browsers to disable it in many cases.

   ![SharedArrayBuffer](/images/9.png)

3. **Service Worker + sync XHR** — simulate blocking with sync XHR; intercept network in a service worker. New SW versions require refresh; version consistency needs background updates; startup waits for SW ready.

   ![Service Worker & Sync XHR](/images/11.png)

### Memory access consistency

**First:** asm.js/Wasm was slow on forced casts (e.g. `char*` → `int*`). We standardized on `memcpy`:

```cpp
int* a = new int;
unsigned char b = 1;
a = (int*) &b;
/* became */
memcpy(a, &b, sizeof(int));
```

**Second:** Emscripten function pointers require strict types:

```cpp
typedef void (*voidType)(int);
int myfun(int a) {}
voidType fn = (voidType)myfun; // error
```

After optimization, **82 subprojects** improved ~50%; builds dropped from ~90 minutes to ~50.

### Exceptions

Some exceptions were removed for efficiency.

## Summary

**Startup flow:** UI thread → UI init → service worker init → web worker init (Wasm init, fonts, i18n, etc.) → C++ startup.

**Optimization:** Wasm instantiation dominates worker startup — faster instantiation and compiler flags (**-O3**, smaller code, fewer exceptions) help.

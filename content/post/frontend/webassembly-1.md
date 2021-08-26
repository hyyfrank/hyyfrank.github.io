---
title: "how autodesk use webassembly "
date: 2018-07-17T11:53:41+08:00
lastmod: 2018-07-19T11:53:41+08:00
draft: true
tags: ["webassembly","emscripten","web_worker","service_worker"]
categories: ["frontend","technology"]
---

## 什么是web assembly
就是一个可移植、体积小、加载快并且兼容 Web 的全新格式。可以使用C、C++、Rust、Go、Java、C#等编译器来生成wasm,以二进制的方式发送给浏览器，可以增强javascript的效率。目前的实践情况有c++开发的大型游戏，google earth, Magnum，Blazor，我司的autocad.这里主要介绍我司的autocad.
## 为什么用web assembly
这个就不必说了，主要是效率问题，js显然对于效率这块有点无能为力。对于大型游戏和对于画图这种很重cpu,内存的，以及高并发的场景，javascript支持其实有限，当然也有增加这方面的能力，比如sharedArrayBuffer来提供某种程度的并发，但是其实还是相当有限。我司的使用是emScripten和asm.js然后，后面用更加优化的Binaryen,整体速度提高了大概12%-15%左右。
## 我们怎么用
我们主要是用emScripten来把c++编译成wasm.主要问题在于：
* 代码code base太大
* 应用启动时间长
* 桌面应用和网站的区别
  * 同步和异步IO
    * 浏览器主线程不允许阻塞调用，不然就很卡了，重写可能比较麻烦，第三方库可能也需要重写
    * 弄个web worker来做也有点问题，比如阻塞的调用，我后面onMessage接受不到数据，也没有共享内存，没有类似信号量的机制来保证我的通讯机制
  * 缺乏共享内存
      1. Emterpreter: 他是可以把asm.js编译成bytecode,然后有个解释器可以来跑，可以支持同步,主要是有可以保存执行的状态和堆栈，然后有个定时器，然后恢复堆栈和状态这样的方式来支持同步。问题是执行太慢，而且没有一种确切的方式来识别栈中的函数，维护也困难。
      2. SharedArrayBuffer:很快，但是要手动去处理序列化，更大的问题是有幽灵攻击的漏洞存在，所以也不行
        ![SharedArrayBuffer](/images/9.png)
      3. service worker & xhr: 使用同步XHR来模拟阻塞调用，用service worker来拦截网络调用，当有新版本的service worker上线的时候，用户要刷新才能看到,这里就要自己管理版本保证一致性，所以需要做个后台更新,还有就是启动的时候需要等待service worker的启动完成，这也算是一个启动时间的一种负担
        ![Service Worker & Sync XHR](/images/11.png)

   
  * 内存访问不一致性的问题
    第一，asm.js直接不支持，wasm跑的很慢，主要是涉及一些强制类型转换的时候的内存拷贝，比如char的指针拷贝到int的指针的位置，所以后来统一换成了memcpy,主要是code修改，避免wasm变慢影响性能。
    
      ```C++
        int* a = new int;
        unsigned char b = 1;
        a = (int*) &b;
        /*改成*/
        memcpy(a,&b,sizeof(int))
      ```
    第二是：函数指针的转换，emscripten的函数指针需要严格类型

      ```C++
         typedef void (*voidType)(int);
         int myfun(int a){}
         voidType fn = (voidType)myfun; //这里报错 
      ```
    优化后82个子项目提升了50%左右，构建从90分钟降低到50分钟
  * 不支持异常：移除部分异常，提高效率

## 总结
  * 启动过程，从UI主线程开始，首先是UI初始化，service worker初始化，初始化web worker,web worker里边又包括wasm初始化，下载资源（font, 国际化的数据等等），然后是c++初始化启动的代码。
  * 启动优化：因为web worker中的wasm实例化占了大部分的时间，所以web assembly实例化的速度可以优化，还有就是代码优化比如O3(采取很多向量化算法，提高代码的并行执行程度，利用现代CPU中的流水线，Cache等),降低code size移除异常等等


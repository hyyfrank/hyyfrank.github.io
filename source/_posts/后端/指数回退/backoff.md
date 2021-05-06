---
title: 指数退避算法的应用
date: 2019-3-2 14:34:00
author: hyyfrank
cover: false
top: false
categories: 后端
tags:
  - backoff
  - algorithms
---

# 什么是指数退避算法
  - 维基百科概念：
    > In a variety of computer networks, binary exponential backoff or truncated binary exponential backoff refers to an algorithm used to space out repeated retransmissions of the same block of data, often to avoid network congestion.
# 项目中怎么使用
  - 项目中我们主要是在做aws请求的时候，做了这个处理，直接上代码可能理解起来简单点，网络上的大量组件 (例如 DNS 服务器、交换机、负载均衡器等) 都可能在某个指定请求生命周期中的任一环节出现问题。在联网环境中，处理这些错误回应的常规技术是在客户应用程序中实施重试。此技术可以提高应用程序的可靠性和降低开发人员的操作成本
  - backoff algorithm[random jitter back off]
  - ```JavaScript
        let retryInMs : number = 0;
        let temp1 : number = Math.min(maxThrottleRetryDelay,backOffBase*Math.pow(2,currentThrottleRetryTime)); // exponential back-off
        let temp2 : number = Math.random()*temp1; // add random jitter
        if(randomStart){
            retryInMs  = Math.floor(temp2);
        }
    ``` 
    其实就是使用了random jitter back off,主要是计算重试的时间,这个操作是在throttle之后做的
- ```JavaScript
        let retryInMs : number = random_between(0,min(cap,base**2**attempt))
    ```
- 以前只在apue看到过这类应用，摘抄在这里，以便以后翻阅
  ```C++
    #include "apue.h"
    #include <sys/socket.h>

    #define MAXSLEEP 128

    int connect_retry(int domain, int type, int protocol,
                      const struct sockaddr *addr, socklen_t alen)
    {
        int numsec, fd;

        /*
        * 使用指数退避尝试连接
        */
        for (numsec = 1; numsec < MAXSLEEP; numsec <<= 1)
        {
            if (fd = socket(domain, type, protocol) < 0)
                return (-1);
            if (connect(fd, addr, alen) == 0)
            {
                /*
                * 连接接受
                */
                return (fd);
            }
            close(fd);

            /*
            * 延迟后重试
            */
            if (numsec <= MAXSLEEP / 2)
                sleep(numsec);
        }
        return (-1);
    }
  ```
# 总结
  一般限流后，如果发生需要重试的场景，那么加上指数避让算法来做重试，可以有效避免马上又冲突的情况
# 参考材料
【1】https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
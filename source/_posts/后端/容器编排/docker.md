---
title: Docker镜像最小化
date: 2019-4-2 19:34:00
author: hyyfrank
cover: false
top: false
categories: 后端
tags:
  - docker
  - shell
---
# docker
这里不谈论一些基础的使用，主要说说，我怎么让docker镜像变小的方法
# 代码
从代码上看我做了几步操作来降低docker image的size

```Dockerfile
    
    FROM artifactory.dev.net/alpine:latest
   
    # Download and unarchive Java, NodeJS and boto3
    RUN apk --no-cache add ca-certificates && \
        set -x && \
        curl -o zulu8.42.tar.gz https://art-bobcat.autodesk.com/artifactory/openjdk-azul/Zulu8/8.42/alpine/zulu8-sa-8.0.232-r4.apk_repo.x86_64.tar.gz &&\
        tar zxvf zulu8.42.tar.gz &&\
        apk add --allow-untrusted zulu8-8.0.232-r4.apk_repo.x86_64/x86_64/*jre*.apk &&\
        rm -rf zulu8-8.0.232-r4.apk_repo.x86_64 &&\
        rm zulu8.42.tar.gz &&\
        apk add --no-cache nodejs && \
        pip3 install --no-cache-dir boto3 && \
        apk --no-cache --update --virtual .build-deps add \
            curl \
            gzip \
            tar && \
        apk del .build-deps
    
```

* base image选择alpine,这里注意一点，如果是按照python一些分析库，可能需要重新编译gcc,由于Alpine镜像使用的根本不是gnu libc而是musl libc，所以/lib64/ld-linux-x86-64.so.2是不存在的，而实际上/lib64都是不存在的,所以可能需要自己手动再装一下
* 安装完后，中间文件要删除，比如这段

```shell
apk --no-cache --update --virtual .build-deps add \
            curl \
            gzip \
            tar && \
apk del .build-deps
```
* 使用multiple stage,然后用copy --from这样拷贝进去
* run命令会增加一个layer,大多数时候你不是写很多RUN而应该把他们尽可能放在一个RUN里，这样只有一层，可以减少不少的size.
* 额外谈一点，docker原生的一号线程树，应该做一些处理，否则，比如你做成了container，使用程序来kill一号进程树，其实是杀不了的，可以用一些简单的库fix掉，或者有个tricky的方式就是你直接用shell的特点fork来做一个新的，实测也能杀掉，不过这种方法不够通用.
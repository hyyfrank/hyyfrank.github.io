---
title: "Java With Spring (八)"
date: 2018-09-01T11:35:32+08:00
lastmod: 2018-09-08T19:20:12+08:00
draft: true
tags: ["java","Spring"]
categories: ["Spring"]
---

# 自定义异常处理

![Project Link](https://github.com/hyyfrank/play_with_springboot/tree/feature/lesson1)

* 增删改查
    1. 作为一个简单的脚手架程序，我们先从最基本的功能开始，增删改查，返回json,包装JSON数据
    2. 配置好依赖，可以看到我们仅有最简单的三个依赖
        ```java
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter</artifactId>
            </dependency>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-web</artifactId>
            </dependency>
        ```
    

---
title: 几种负载均衡的方法
date: 2019-1-2 20:34:00
author: hyyfrank
cover: false
top: false
categories: 后端
tags:
  - load balance
  - algorithms
---

# 负载均衡
* 常见算法
  * Round Robin
  * Weight Round Robin
  * Random
  * Least Connection
  * Source Hashing
* 实现负载均衡的几种技术
  * HTTP重定向：其实就是增加一个服务器，来解析当前请求到具体的服务器ip上，返回的是一个重定向302，但是可能会有SEO作弊的嫌疑，而且要两次请求才能请求完成，太坑爹了
  * DNS域名负载均衡: 优点是把负载均衡的事情扔给dns,省掉网站维护的麻烦，同时dns还可以解析成地理位置最近的。缺点是dns多层解析，这样一来每一层如果缓存A记录的话，如果有下线的机器，就可能解析到下线的机器里，而且DNS负载均衡的控制权在域名服务商那里，很难维护。现在是部分使用，作为第一级负载均衡手段，解析到自己的负载均衡服务器，再自己来控制分发到具体的物理服务器上
  * 反向代理：http层面的负载均衡，反向代理服务器可以用来缓存资源改善网站性能，当然也可以做负载均衡，做负载均衡的话，要配内部外部两套IP地址，缺点是所有请求都要经过它，可能会是性能瓶颈
  * IP负载均衡：网络四层负载均衡，负载均衡设备在接收到第一个来自客户端的 SYN 请求时，选择一个最佳的服务器，并对报文中目标 IP 地址进行修改(改为后端服务器 IP），直接转发给该服务器。 TCP 的连接建立，即三次握手是客户端和服务器直接建立的，负载均衡设备只是起到一个类似路由器的转发动作,为保证服务器回包可以正确返回给负载均衡设备，在转发报文的同时可能还会对报文原来的源地址进行修改,即源地址转换SNAT,和上面一样，受限于负载服务器的带宽
  * 数据链路层的负载均衡：通过在数据链路层修改mac地址，达到负载均衡的目的，三角传输模式，也就是数据传输不改ip地址，只改mac地址。通过配置真是无力服务器集群是有机器虚拟IP和负载均衡服务器IP地址一致，从而达到不修改数据包的源地址和目的地址就可以进行数据分发的目的，由于实际处理请求的真是物理服务器IP和数据请求目的IP的一致，不需要经过LB服务器进行转换，直接返回给用户浏览器，所以也叫直接路由方式DR.这种方式应用较多的是LVS,也是大型网站使用最广的负载均衡手段。接下来会写一篇讲LVS的

* AWS的负载均衡方案
  这里摘抄一段网络文本：
  * ------------我是分割线---------------
  Amazon 提供的 ELB 服务包含三种类型：ALB, NLB, CLB。

  * ALB
    Application Load Balancer 运行于请求级别（第 7 层），可根据请求的内容将流量路由至 EC2 实例、容器、IP 地址和 Lambda 函数等目标。Application Load Balancer 最适合 HTTP 和 HTTPS 流量的高级负载均衡，面向交付包括微服务和基于容器的应用程序在内的现代应用程序架构，提供高级请求路由功能。Application Load Balancer 通过确保始终使用最新的 SSL/TLS 密码和协议，简化并提高应用程序的安全性。
    ABL于2016年8月发布，与现有的负载均衡器（OSI第4层TCP/UDP均衡器）不同，ALB将查看数据包并将其发送到正确的服务。单个ALB可以为许多后端服务平衡流量，而不是为每个服务运行弹性负载均衡器。例如，包含的URL /api可以路由到与包含的URL /signup不同的后端服务。

  * NLB
    Network Load Balancer 网络负载均衡器运行于连接级别（第 4 层），可根据 IP 协议数据将连接路由至 Amazon Virtual Private Cloud (Amazon VPC) 内的不同目标（Amazon EC2 实例、微服务和容器）。网络负载均衡器最适合 TCP 流量的负载均衡，能够在保持超低延迟的同时每秒处理数百万个请求。网络负载均衡器还经过了优化，能够处理突发的和不稳定的流量模式，同时在每个可用区使用单个静态 IP 地址。它与其他流行的 AWS 服务集成，例如 Auto Scaling、Amazon EC2 Container Service (ECS)、Amazon CloudFormation 和 Amazon AWS Certificate Manager (ACM)。

  * CLB
    Classic Load Balancer 同时运行于请求级别和连接级别，可在多个 Amazon EC2 实例之间提供基本的负载均衡。Classic Load Balancer 适用于在 EC2-Classic 网络内构建的应用程序。在使用 Virtual Private Cloud (VPC) 时，我们建议使用第 7 层 Application Load Balancer 和第 4 层网络负载均衡器。

    使用 CLB 而不是 ALB 具有以下优势：
    支持 EC2-Classic
    支持 TCP 和 SSL 侦听器
    支持使用应用程序生成的 cookie 的粘性会话
    CLB速度慢于ALB。
* -------------我是分割线---------------  
    
* 因为我司用的是instance,所以还是停留在CLB上，至于一些场景，比如同一个请求要到同一台机器，还是使用sticky session实现，auto-scaling我会另外写一篇。
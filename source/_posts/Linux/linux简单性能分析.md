---
title: Linux服务器简单的性能分析方法
date: 2021-5-3 18:34:00
author: hyyfrank
cover: true
top: true
categories: Linux
tags:
  - linux
  - optimization
---

# Linux服务器性能分析

## 目标
找出性能瓶颈，有目的的系统优化，主要是看一下几个方面：
* 应用程序
* 操作系统
* 服务器硬件
* 网络环境
比较常见的问题是，cpu使用量很大，造成系统中很多等待的进程，响应缓慢；进程的大量增加造成系统内存资源的使用增加，当物理内存耗尽，就会使用虚拟内存，虚拟内存的使用又造成磁盘IO的增加，并增加cpu的开销，所以其实性能优化是在硬件，操作系统，软件之间找一个平衡点。
## 主要考虑的优化因素
* 硬件方面： CPU, 内存， 磁盘IO, 网络带宽
* OS方面：
  * 系统安装优化： 磁盘划分(选择恰当的RAID级别)，swap内存设置（内存小于4G，swap就设一般，内存4G~16G，swap可以设置稍微小于内存大小就行）
  * 内核参数优化： oracle数据库可以调整下系统共享内存段kernel.shmmax,kernel.shmmni,kernel.shmall，系统信号量kernal.sem，文件句柄fs.file-max等。常见的网站应用，可以调整下tcp的参数，比如net.ipv4.ip_local_port_range, net.ipv4.tcp_tw_reuse,net.core.somaxconn等等。调整的时候要注意网络环境，看是不是NAT,因为有些参数可能有影响，比如recyle参数。
  * 文件系统优化：主要是ext2,ext3,xfs,ReiserFS
* 应用程序方面：主要是代码层级的优化
## 分析的原则
* cpu使用量加起来不超过70%
* 内存：swap in/out ==0 
* 磁盘：iowait < 20% 就是说，cpu等待输入输出完成时间的百分比
## 分析工具
* 虚拟内存统计

```shell
    vmstat [-V] [-n] [delay [count]]
```
* 获取系共同的cpu,运行队列，磁盘IO,分页，内存，cpu中断，网络性能等数据
  
```shell
    sar [options] [-o filename] [interval [count]]
```

*I/O统计

```shell
    iostat [-c | -d] [-k] [-t] [-x [device]] [interval [count]]
```
* 还有一些比如：free, uptime, netstat, top，如果协议问题的话，可以用wire shark来分析,如果是应用软件方面的话，有些是有相应的分析工具的，可以结合着分析

## 总结
基本上面的命令可以帮你定位瓶颈在哪里，结合自身情况具体分析，找到硬件，操作系统，软件之间找一个优化平衡点，这样才能高效的使用当前的资源，发挥更大的效益。
  
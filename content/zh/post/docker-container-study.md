---
title: "[Docker] container研究"
date: 2019-09-02T23:03:48+08:00
lastmod: 2019-09-02T23:03:48+08:00
draft: false
tags: ["docker","container","UnionFS","Veth","clone"]
categories: [ "docker" ]
---
## PPT
- [**组内分享的PPT**](/images/tom.key)
## conttainer
* `namespace`
* `linux control group`
* `UnionFS`
* `veth`

- 容器应该具备哪些东西
  - 隔离文件系统： 通过 chroot 命令切换根目录的挂载点
  - 隔离网络： 为了分布式环境下的通讯： 要有独立的 IP、端口和路由 veth, 每个容器用有其独立的网络设备，IP 地址，IP 路由表，/proc/net 目录，端口号等等。这也使得一个 host 上多个容器内的同一个应用都绑定到各自容器的 80 端口上
  - 主机名：需要一个主机名方便在网络中标识自己
  - IPC: 每个容器有其自己的 System V IPC 和 POSIX 消息队列文件系统，因此，只有在同一个 IPC namespace 的进程之间才能互相通信
  - 用户权限: 在 user namespace 中的进程的用户和组 ID 可以和在 host 上不同； 每个 container 可以有不同的 user 和 group id；一个 host 上的非特权用户可以成为 user namespace 中的特权用户
- 容器主要的部分
  - `namespace`
    - UTS, IPC, PID, NETWORK, MOUNT, USER
  - `cgroup`
    - CPU, Memory, Blkio, Device...
  - `UnionFS`
    - aufs(ubuntu), btrfs(suse), vfs, devicemapper(centos), overlayer2(centos,ubuntu)
  - `veth`
    - bridge, host, container, none
- 容器实现
  - 容器是特殊的进程
  - ```int clone(int (*fn)(void*), void *child_stack, int flags, void*arg);```
  - Fork = Clone + CLONE_VM | CLONE_VFORK | SIGHILD (NOTE: Fork和Clone都是对sys_clone的封装，所以其实这里表达有少许不准确)
  - fork是从调用点继续执行，clone是从fn(args)继续执行，因为子进程和父进程共享内存，但是维护单独的变量副本，所以需要为子进程单独分配栈，就是`child_stack`指针指向的位置，flags有两个作用，低位字节可以放返回信号，flags和docker相关的flag就是上述的UTS, IPC, PID, NETWORK, MOUNT, USER对应的标签`CLONE_NEWUTS`,`CLONE_NEWIPC`,`CLONE_NEWPID`,`CLONE_NEWNET`,`CLONE_NEWNS`,`CLONE_NEWUSER`
  - cgroup包含着对资源的控制，对应linux下是在`/sys/fs/cgroup`目录下
  - UnionFS对应overlay2FS的路径是`sudo ls /var/lib/docker/image/overlay2/layerdb/${id}`
  - veth:虚拟网卡


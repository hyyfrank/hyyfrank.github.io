---
title: "[Docker] Container Internals"
date: 2019-09-02T23:03:48+08:00
lastmod: 2019-09-02T23:03:48+08:00
draft: false
tags: ["docker", "container", "UnionFS", "Veth", "clone"]
categories: ["docker"]
---

## Slides

- [**Team sharing deck**](/images/tom.key)

## Container building blocks

- `namespace`
- Linux **control groups** (cgroups)
- **UnionFS**
- **veth**

### What a container should provide

- **Filesystem isolation** — e.g. `chroot` to change the root mount
- **Network isolation** — for distributed apps: own IP, ports, routes; **veth** pairs so each container has its own netdev, IP, routing table, `/proc/net`, ports. Multiple containers on one host can each bind port 80 inside their own network namespace
- **Hostname** — UTS namespace for identity on the network
- **IPC** — separate System V IPC and POSIX message queues; only processes in the same IPC namespace can talk to each other
- **User IDs** — in a user namespace, UID/GID can differ from the host; an unprivileged host user can be “root” inside the container

### Main pieces

| Piece | Details |
|-------|---------|
| **namespace** | UTS, IPC, PID, NETWORK, MOUNT, USER |
| **cgroup** | CPU, memory, blkio, devices, … |
| **UnionFS** | aufs (Ubuntu), btrfs (SUSE), vfs, devicemapper (CentOS), **overlay2** (CentOS/Ubuntu) |
| **veth** | Docker network modes: bridge, host, container, none |

### How containers are implemented

A container is essentially a **special process** created with `clone(2)`:

```c
int clone(int (*fn)(void*), void *child_stack, int flags, void *arg);
```

(`fork` and `clone` both go through `sys_clone` on Linux; the note below is simplified.)

- **fork** — child continues after the call site
- **clone** — child starts at `fn(args)`; parent and child have separate memory views but may share pages; `child_stack` points at the child stack
- **flags** — low bits can carry a signal; Docker-related flags map namespaces: `CLONE_NEWUTS`, `CLONE_NEWIPC`, `CLONE_NEWPID`, `CLONE_NEWNET`, `CLONE_NEWNS`, `CLONE_NEWUSER`

**cgroup** — resource limits under `/sys/fs/cgroup`

**UnionFS / overlay2** — layer metadata example:

```shell
sudo ls /var/lib/docker/image/overlay2/layerdb/${id}
```

**veth** — virtual Ethernet pair connecting container to the host bridge

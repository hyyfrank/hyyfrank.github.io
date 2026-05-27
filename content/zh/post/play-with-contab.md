---
title: "Crontab 排错笔记"
date: 2017-08-07T12:33:21+08:00
lastmod: 2017-09-07T19:33:29+08:00
draft: false
tags: ["shell"]
categories: ["linux"]
aliases:
  - /post/linux/play-with-contab/
---

## 如何查日志

```shell
sudo /var/log/syslog | grep cron
```

## 捕获输出

```shell
1 2 * * * /home/hyy/Start.py >/tmp/output.log 2>&1
```

## 确认 cron 在跑

```shell
ps -ef | grep cron | grep -v grep
```

## 路径要对

- crontab 默认在 `$HOME` 下执行；若脚本里用 `os.getcwd()`，目录不对会报找不到模块。
- 命令里尽量写**绝对路径**，或在任务前 `source ~/.zshrc`，保证环境变量可用。

## 最后一行要空行

- 很多人踩坑：crontab 文件**末尾需要空行**，否则最后一条可能不执行。

## Debian/Ubuntu 的权限与命名

`/etc/cron.d` 及 `cron.{hourly,daily,weekly,monthly}` 下的文件需满足：

- 属主为 root；
- 仅 root 可写；
- 组和其他用户不可写；
- 文件名不要包含 `.`，除 `-`、`_` 外不要有特殊字符。

## Python 脚本注意点

- 可在脚本首行加 `#!/usr/bin/python`（非必须）；
- 一定要把输出重定向到日志，方便排查。

## 脚本权限

- 尽量用普通用户 crontab，不要用 `sudo crontab -e`。
- 若日志被 root 删掉又 root 新建，权限会错；正确做法是 `echo "" > logfile`，保留原文件权限与属组。

---
title: "Play With Shell"
date: 2018-08-31T22:13:56+08:00
lastmod: 2018-08-31T22:13:56+08:00
draft: false
tags: ["shell"]
categories: ["backend","technology"]
---

## shell逐行处理两种常用速度较快的方法
* 使用文件描述符，把标准输出关联到文件描述符4上面，然后重定向标准输出到```$OUTFILE```,然后回复标准输出并且关闭文件描述符4
    ```shell
    function while_read_line_bottom_fd_out
    {
    >$OUTFILE
    exec 4<&1
    exec 1> $OUTFILE
    while read LINE
    do
        echo "$LINE"
        :
    done < $INFILE
    exec 1<$4
    exec 4>&-
    }
    ```
* 不使用文件描述符的版本,这个处理起来比较方便，容易维护
    ```shell
    function while_read_line_bottom
    {
    >$OUTFILE
    while read LINE
    do
        echo "$LINE" >> $OUTFILE
        :
    done < $INFILE
    }
    ```

* 简单的任务
    * 任务描述，拷贝文件夹到远程目录
    * 一般来说一句命令就行了```scp /home/frank/local.txt root@192.168.1.100:/home/frank/```
    * 但是我们想写个shell脚本，自动拷贝目录到15台远程机器上
    * 目标：不进行密码提示，直接拷贝，对每个机器的配置不同，要先sed处理配置文件，以及expect使用
    * 因为我是mac机器做这个操作，所以直接本地安装expect, ```brew install expect```安装成功后如下：
        ```shell
            🍺  /usr/local/Cellar/tcl-tk/8.6.11_1: 3,041 files, 51.6MB
            ==> Installing expect
            ==> Pouring expect--5.45.4_1.big_sur.bottle.tar.gz
            License: Public Domain
            ==> Dependencies
            Build: autoconf ✔, automake ✔, libtool ✘
            Required: tcl-tk ✔ 
        ```
---
title: "Compile openssl from source"
date: 2021-09-07T18:29:48+08:00
lastmod: 2021-09-07T19:29:48+08:00
draft: false
tags: ["openssl"]
categories: ["linux"]
---
# 更新并替换原有openssl版本
## Remove Current Version of Openssl
- 第一，先删除现在的openssl版本
```shell
sudo apt-get remove openssl
sudo apt-get remove --auto-remove openssl
sudo apt-get purge openssl
```
## Download package and compile from source
- 第二，从源码安装
```shell
  ./config --prefix=/opt/software/ssl --openssldir=/opt/software/ssl shared zlib
```
## configure link library
- 第三，链接库配置
```shell
cd /etc/ld.so.conf.d/
sudo touch openssl-1.1.1.conf
sudo echo "/opt/software/ssl/lib" > openssl-1.1.1.conf
```
- 重新加载动态连接```sudo ldconfig -v```
## configure environment path
```shell
emacs ~/.zshrc  # if you like bash, go and set in ~/.bashrc
export PATH=/opt/software/ssl/bin:$CONDA_HOME/bin:$PATH
```
- 确定你把路径放在conda前面，因为conda有时候会有自己的一个低版本1.1.1k这种
## check the result
```shell
openssl version -a
```
- 结果如下：
```shell
OpenSSL 1.1.1l  24 Aug 2021

built on: Tue Sep  7 10:19:48 2021 UTC

platform: linux-x86_64

options:  bn(64,64) rc4(16x,int) des(int) idea(int) blowfish(ptr) 

compiler: gcc -fPIC -pthread -m64 -Wa,--noexecstack -Wall -O3 -DOPENSSL_USE_NODELETE -DL_ENDIAN -DOPENSSL_PIC -DOPENSSL_CPUID_OBJ -DOPENSSL_IA32_SSE2 -DOPENSSL_BN_ASM_MONT -DOPENSSL_BN_ASM_MONT5 -DOPENSSL_BN_ASM_GF2m -DSHA1_ASM -DSHA256_ASM -DSHA512_ASM -DKECCAK1600_ASM -DRC4_ASM -DMD5_ASM -DAESNI_ASM -DVPAES_ASM -DGHASH_ASM -DECP_NISTZ256_ASM -DX25519_ASM -DPOLY1305_ASM -DZLIB -DNDEBUG

OPENSSLDIR: "/opt/software/ssl"

ENGINESDIR: "/opt/software/ssl/lib/engines-1.1"

Seeding source: os-specific
```

## 完成
最好，安装软件的时候，都从源码编译，你可以更了解你需要什么，定制安装你的软件，不要什么的apt-get install


---
title: "Play With Nginx (一)"
date: 2017-01-07T12:33:21+08:00
lastmod: 2017-07-07T19:33:29+08:00
draft: false
tags: ["git"]
categories: ["git"]
---

## 1. TODO LIST

- `how to configure nginx when set up`
- `how to optimize the parameter`
- `how nginx process the request`
- `how to apply rolling log`
- `how to configure load balance`
- `why i have to use lua`
- `how to make force https in lua`
- `how to update the request header`

## 2. Build from source(How To)

### (1).download the source file
Download the nginx package from official website
- Download pcre(`version 1` and `version 4.4 — 8.43`), from the document of nginx, it doesn't support pcre2.
- Download zlib(`version 1.1.3 — 1.2.11`) from official website
- Install openssl via `sudo apt-get install openssl-dev`
Start to build from source
```shell
./configure \
--prefix=/opt/software/nginx/ \
--with-http_stub_status_module \
--with-http_sub_module \
--with-http_gzip_static_module \
--with-pcre=../pcre-8.42 \
--with-zlib=../zlib-1.2.11 \
--with-openssl=../openssl-1.1.1f \
--with-http_secure_link_module \
--with-http_random_index_module \
--with-http_ssl_module \
--with-http_realip_module \
--with-http_addition_module \
--with-http_gzip_static_module \
--with-cc-opt=-O3 \
--with-http_gunzip_module \
--with-http_random_index_module \
--with-http_secure_link_module \
--with-http_auth_request_module \
--with-threads \
--with-stream_ssl_module \
--with-http_slice_module \
--with-file-aio \
--with-http_v2_module \
--without-mail_pop3_module \
--without-mail_imap_module \
--without-mail_smtp_module
make && make install
```
### (2) How to optimize the parameter in the server
- kernel tunning for performance, go and edit the file `/etc/sysctl.conf` and activate it via `/sbin/sysctl -p`
```shell
# here is some configuration of tcp/ip setting in kernel
net.ipv4.tcp_max_tw_buckets = 6000
net.ipv4.ip_local_port_range = 1024 65000
net.ipv4.tcp_tw_recycle = 1
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_syncookies = 1
#--------------------------------
net.core.somaxconn = 262144
net.core.netdev_max_backlog = 262144
#--------------------------------
net.ipv4.tcp_max_orphans = 262144
net.ipv4.tcp_max_syn_backlog = 262144
net.ipv4.tcp_synack_retries = 1
net.ipv4.tcp_syn_reties = 1
net.ipv4.tcp_fin_timeout = 1
net.ipv4.tcp_keepalive_time = 30
```

### (3) how nginx process the request
- nginx include two part, core and module. 
- module include three part, core module、basic module and thirdparty module
  - core module: `http module`, `event module` and `mail module`
  - basic module: `http access module`, `http fastcgi module`, `http proxy module`, `http rewrite module`
  - third party: `http upstream request hash module`, `Notice module`, `Http access key module`.
- how to process request
  - http request --> nginx core --> handlers --> filter1 --> filter2 --> ...more filters --> output
  - more detail: 
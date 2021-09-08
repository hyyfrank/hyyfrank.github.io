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
- go and edit the file `/etc/sysctl.conf` and activate it via `/sbin/sysctl -p`
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

### (4) openresty module list
```shell
  --without-http_echo_module         disable ngx_http_echo_module
  --without-http_xss_module          disable ngx_http_xss_module
  --without-http_coolkit_module      disable ngx_http_coolkit_module
  --without-http_set_misc_module     disable ngx_http_set_misc_module
  --without-http_form_input_module   disable ngx_http_form_input_module
  --without-http_encrypted_session_module
                                     disable ngx_http_encrypted_session_module
  --without-http_srcache_module      disable ngx_http_srcache_module
  --without-http_lua_module          disable ngx_http_lua_module
  --without-http_lua_upstream_module disable ngx_http_lua_upstream_module
  --without-http_headers_more_module disable ngx_http_headers_more_module
  --without-http_array_var_module    disable ngx_http_array_var_module
  --without-http_memc_module         disable ngx_http_memc_module
  --without-http_redis2_module       disable ngx_http_redis2_module
  --without-http_redis_module        disable ngx_http_redis_module
  --without-http_rds_json_module     disable ngx_http_rds_json_module
  --without-http_rds_csv_module      disable ngx_http_rds_csv_module
  --without-stream_lua_module        disable ngx_stream_lua_module
  --without-ngx_devel_kit_module     disable ngx_devel_kit_module
  --without-stream                   disable TCP/UDP proxy module
  --without-http_ssl_module          disable ngx_http_ssl_module
  --without-stream_ssl_module        disable ngx_stream_ssl_module

  --with-http_iconv_module           enable ngx_http_iconv_module
  --with-http_drizzle_module         enable ngx_http_drizzle_module
  --with-http_postgres_module        enable ngx_http_postgres_module

  --without-lua_cjson                disable the lua-cjson library
  --without-lua_tablepool            disable the lua-tablepool library (and by consequence, the
                                     lua-resty-shell library)
  --without-lua_redis_parser         disable the lua-redis-parser library
  --without-lua_rds_parser           disable the lua-rds-parser library
  --without-lua_resty_dns            disable the lua-resty-dns library
  --without-lua_resty_memcached      disable the lua-resty-memcached library
  --without-lua_resty_redis          disable the lua-resty-redis library
  --without-lua_resty_mysql          disable the lua-resty-mysql library
  --without-lua_resty_upload         disable the lua-resty-upload library
  --without-lua_resty_upstream_healthcheck
                                     disable the lua-resty-upstream-healthcheck library
  --without-lua_resty_string         disable the lua-resty-string library
  --without-lua_resty_websocket      disable the lua-resty-websocket library
  --without-lua_resty_limit_traffic  disable the lua-resty-limit-traffic library
  --without-lua_resty_lock           disable the lua-resty-lock library
  --without-lua_resty_lrucache       disable the lua-resty-lrucache library
  --without-lua_resty_signal         disable the lua-resty-signal library (and by consequence,
                                     the lua-resty-shell library)
  --without-lua_resty_shell          disable the lua-resty-shell library
  --without-lua_resty_core           disable the lua-resty-core library

  --with-luajit=DIR                  use the external LuaJIT 2.1 installation specified by DIR
  --with-luajit-xcflags=FLAGS        Specify extra C compiler flags for LuaJIT 2.1
  --with-luajit-ldflags=FLAGS        Specify extra C linker flags for LuaJIT 2.1
  --without-luajit-lua52             Turns off the LuaJIT extensions from Lua 5.2 that may break
                                     backward compatibility
  --without-luajit-gc64              Turns off the LuaJIT GC64 mode (which is enabled by default
                                     on x86_64)

  --with-libdrizzle=DIR              specify the libdrizzle 1.0 (or drizzle) installation prefix
  --with-libpq=DIR                   specify the libpq (or postgresql) installation prefix
  --with-pg_config=PATH              specify the path of the pg_config utility


```

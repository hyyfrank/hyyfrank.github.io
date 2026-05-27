---
title: "[GLP] Flask 搭配 MySQL（2）"
date: 2021-08-06T23:36:30+08:00
lastmod: 2021-08-06T23:36:30+08:00
draft: false
tags: ["python", "flask", "mysql"]
categories: ["backend"]
---

> 接上篇，继续记录 JWT、权限与工程化细节。

## 1. JWT 流程

- **Access Token 短有效期**，提高安全性。

### 流程

1. 登录换取 **access token + refresh token**（refresh 放 HttpOnly、Secure、SameSite Cookie）。
2. 请求携带 **payload + access token**；access token 放内存，登出即清。
3. access 过期后用 refresh Cookie 换新 access。
4. access 常设约 1 分钟，缩小被盗用窗口。
5. 参数加**单向哈希**做完整性校验，最好带请求时间。
6. 敏感头字段用 **HMAC** 加密；刷新 token 时服务端同样校验 HMAC。
7. JWT 可存 **Redis** 做吊销；我们对外提供无状态 API，未在服务端持久化会话。

### 实现注意

- `Set-Cookie` 由**服务端**设置，不要在前端 JS 里写 Cookie。
- Cookie 必须 `HttpOnly`、`Secure`、`SameSite`，否则后续请求可能带不上。

### 取舍

refresh Cookie 更安全，但浏览器扩展仍可能读到 Cookie。无状态是为方便其他系统调用，属于有意取舍。

## 2. 权限模型

![常见权限模型](/images/permission.png)

## 3. 前端实现

- **redux-thunk**、Redux、React、**react-hooks**、**Konva** 做单向数据流。
- redux-thunk 比 redux-saga 上手快，适合多数异步。
- hooks 比 class 生命周期少写样板代码。
- Konva 配合 TypeScript 画 canvas 很顺手。

## 4. 数据库与 XSS

- 优先 **SQLAlchemy ORM**；若必须原生 SQL，务必转义与校验，防注入/XSS。
- 按需加索引。
- 重要 SQL 用 **EXPLAIN** 分析。

## 5. Flask 后端基础

### 日志（按天滚动 + 双 Handler）

```python
self.logger.setLevel(logging.DEBUG)
formatter = logging.Formatter(getattr(config, "LOG_FORMAT"))
timedRotatingFileHandler = handlers.TimedRotatingFileHandler(
    getattr(config, "LOG_FILENAME"),
    when=getattr(config, "LOG_WHEN"),
    interval=getattr(config, "LOG_INTERVAL"),
    backupCount=getattr(config, "LOG_BACKUP_COUNT"),
)
timedRotatingFileHandler.setLevel(logging.INFO)
timedRotatingFileHandler.setFormatter(formatter)

errorLogHandler = handlers.RotatingFileHandler(
    getattr(config, "LOG_ROTATE_FILENAME"),
    maxBytes=getattr(config, "LOG_ROTATE_MAXBYTES"),
    backupCount=getattr(config, "LOG_ROTATE_BACKUP_COUNT"),
)
errorLogHandler.setLevel(logging.ERROR)
errorLogHandler.setFormatter(formatter)
```

### 其他基线

- 分环境配置；
- CORS 响应头与显式 **OPTIONS**（可不依赖 `flask-cors`）；
- 序列化 ORM 行：

```python
from sqlalchemy.inspection import inspect

class Serializer(object):
    def serialize(self):
        return {c: getattr(self, c) for c in inspect(self).attrs.keys()}

    @staticmethod
    def serialize_list(lo):
        return [m.serialize() for m in lo]
```

### 单例（配置、日志等）

```python
import threading

lock = threading.Lock()

class Singleton(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            with lock:
                if cls not in cls._instances:
                    cls._instances[cls] = super(Singleton, cls).__call__(
                        *args, **kwargs
                    )
        return cls._instances[cls]
```

### Sphinx + Postman

- 文档由 **Markdown** 生成；
- Postman 集合与文档放一起，团队可直接导入联调。

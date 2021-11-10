---
title: "Flask With Mysql(二)"
date: 2021-08-06T23:36:30+08:00
lastmod: 2021-08-06T23:36:30+08:00
draft: false
tags: ["python","flask","mysql"]
categories: [ "backend" ]
---


> 这是一个flask基础框架，由于python之前只是写一些零散的脚本
> 刚好使用python构建一个项目脚手架

## 1. jwt token的流程
- short live token to make application more secure
- 工作流程
  - 发送请求获取token+refreshToken(secure cookie, httponly,samesit)
  - 发送请求(payload + token) 到后端，token存于内存变量，退出就失效
  - 如果token失效，使用cookie的refresh token重新获取token
  - 一般token维持一分钟，一分钟后就会失效，这可以阻止中间人攻击
  - 同时要对参数加一个单项hash的加密，用来保证参数的完整性，最好包含请求时间
  - header的部分也要做hmac的对称加密，后台刷新token是用hmac解密
  - jwt token可以持久化到redis来做主动失效，例如白名单，因为我们应用想做成无状态的，方便其他系统调用，所以就没做成存token的机制
- 实现细节
  - `set-cookie` 是在服务端做，不是在客户端做
  - 最主要是cookie的处理要注意httponly,secure,samesite都要加，不然可能会有后续请求拿不到之前服务器设置的cookie的问题
- 要注意的地方是这种方案还是有安全风险，虽然对secure cookie已经有一定的安全保证，但是无法保证不被一些扩展工具获取到cookie，所以为了无状态也是对安全这方面做了一点的折中。

## 2. 授权模型
![网络上的授权模型，大差不差](/images/permission.png)

## 3. 客户端实现
- redux-thunk, redux, react, react-hook， konva实现单向数据流应用
- 异步使用redux-thunk比redux-saga要方便使用，也基本能实现异步操作
- react-hook避免了写一大堆生命周期的代码
- konva画图可以兼容Typescript

## 4. 数据库的安全(XSS防范)
- 尽量不要写raw sql,使用sqlchemy的ORM最好，如果使用raw-sql一定要转义，要检查，否则可能会有xss攻击的风险
- 增加一些必要的索引，增加请求速度
- 对每条sql语句进行explain,查找优化的点


## 5. flask后台需要支持一些基础功能
- 日志，按天滚动,写两个handler
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
- 按环境区分配置
- 跨域设置响应头，要有处理option请求的逻辑，无需使用flask-cros之类的library
- 数据库返回的数据要序列化，写个通用的方法
  ```python
  from sqlalchemy.inspection import inspect
    class Serializer(object):
        def serialize(self):
            return {c: getattr(self, c) for c in inspect(self).attrs.keys()}

        @staticmethod
        def serialize_list(lo):
            return [m.serialize() for m in lo]
  ```
  
- 有些地方要做单例，比如配置，logger这类
  ```python
  import threading
    lock = threading.Lock()
    class Singleton(type):
        _instances = {}  # type: ignore
        def __call__(cls, *args, **kwargs):
            if cls not in cls._instances:
                with lock:
                    if cls not in cls._instances:
                        cls._instances[cls] = super(Singleton, cls).__call__(
                            *args, **kwargs
                        )
            return cls._instances[cls]

  ```
  - sphinx文档生成
    - 改成了支持markdown的方式，后面写文档直接写markdown文件就可以
    - postman同样把api调用放到这里，可以方便团队使用postman配置文件快速开发


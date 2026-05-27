---
title: "[GLP] Flask With MySQL (2)"
date: 2021-08-06T23:36:30+08:00
lastmod: 2021-08-06T23:36:30+08:00
draft: false
tags: ["python", "flask", "mysql"]
categories: ["backend"]
---

> A Flask starter scaffold — I had mostly written small Python scripts before, and this project was a chance to build a proper backend skeleton.

## 1. JWT token flow

- Use **short-lived access tokens** for better security.

### Workflow

1. Request **access token + refresh token** (refresh token in a secure cookie: `HttpOnly`, `Secure`, `SameSite`).
2. Send requests with **payload + access token**; keep the access token in memory (cleared on logout).
3. When the access token expires, use the refresh cookie to obtain a new access token.
4. Access tokens often live ~1 minute to limit window for MITM abuse.
5. Add a **one-way hash** over parameters for integrity, ideally including request time.
6. Encrypt sensitive header fields with **HMAC**; the backend uses HMAC when refreshing tokens.
7. JWTs can be stored in **Redis** for revocation / allowlists; we aimed for a **stateless** API for other systems to call, so we did not persist sessions server-side.

### Implementation notes

- `Set-Cookie` is set **on the server**, not in client JS.
- Cookies must use `HttpOnly`, `Secure`, and `SameSite` or later requests may not send cookies correctly.

### Security trade-offs

This design improves security for the refresh cookie, but browser extensions can still read cookies in some cases. Going stateless is a deliberate compromise.

## 2. Authorization model

![Common authorization model](/images/permission.png)

## 3. Client implementation

- **redux-thunk**, Redux, React, **react-hooks**, **Konva** for unidirectional data flow.
- redux-thunk is simpler than redux-saga for most async flows.
- react-hooks reduce boilerplate vs class lifecycle methods.
- Konva works well with TypeScript for canvas drawing.

## 4. Database safety (XSS)

- Prefer **SQLAlchemy ORM** over raw SQL; if you must use raw SQL, escape and validate inputs to avoid injection/XSS-style issues.
- Add indexes where needed for query speed.
- Run **EXPLAIN** on important queries and optimize.

## 5. Flask backend basics

### Logging (daily rotation, two handlers)

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

### Other baseline pieces

- Per-environment configuration
- CORS response headers and explicit **OPTIONS** handling (no `flask-cors` dependency required)
- Serialize DB rows with a small helper:

```python
from sqlalchemy.inspection import inspect

class Serializer(object):
    def serialize(self):
        return {c: getattr(self, c) for c in inspect(self).attrs.keys()}

    @staticmethod
    def serialize_list(lo):
        return [m.serialize() for m in lo]
```

### Singletons (config, logger, etc.)

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

### Sphinx + Postman

- Docs generated from **Markdown** sources.
- Postman collections live alongside docs so the team can import and develop against the API quickly.

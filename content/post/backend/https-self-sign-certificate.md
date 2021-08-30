---
title: "how to create https self-signed certificate"
date: 2018-08-07T12:20:45+08:00
lastmod: 2018-08-07T12:20:45+08:00
draft: false
tags: ["https","CA", "Self-Signed"]
categories: ["backend"]
---

## 动机
公司内网想做一个小型的https，不想申请https证书，想自己做自验证的证书
## 关注点
* https的握手流程
    * ![react_redux](/images/ssl.png)
    * 浏览器尝试连接网站 https://demowebsite.com.
    * demowebsite.com server 会把证书送回给浏览器。这个证书包含网站服务器的公钥，还有一些其他信息证明这个公钥属于网站
    * 浏览器验证这个证书来确认他有正确的公钥
    * 浏览器选择一个随机对称key K用来连接到服务器。客户端使用公钥加密K
    * 服务端使用私钥解密K,这样客户端服务器都知道K,但是其他人不知道
    * 接着任何从客户端发送到服务端的信息，都用K加密。
* 自己做CA
    * 要先创建root CA, 这个root ca不做客户端或者服务器端证书的签发，它是用来创建一个中间CA,这个中间CA会替代root CA签发证书，这样root key就可以离线保存，这样安全性才能得到保证
    * 准备目录结构
        * 创建目录,命令和最后结果类似如下
        ```shell
        mkdir -p /root/ca
         cd /root/ca
         mkdir certs crl newcerts private
         chmod 700 private
         touch index.txt
         touch serial
         echo 1000 > serial
        ```
        ![ca root directory](/images/caroot.png)
        * 准备配置文件openssl.cnf
        * 创建root key
        ```shell
        cd /root/ca
        openssl genrsa -aes256 -out private/ca.key.pem 4096
        chmod 400 private/ca.key.pem
        ```
        * 创建root secret
        ```shell
        cd /root/ca
        openssl req -config openssl.cnf \
            -key private/ca.key.pem \
            -new -x509 -days 7300 -sha256 -extensions v3_ca \
            -out certs/ca.cert.pem
        chmod 444 certs/ca.cert.pem
        ```
        * 验证root证书
        ```shell
            openssl x509 -noout -text -in certs/ca.cert.pem
        ```

* 创建中间证书颁发机构
    * 创建目录
    ```shell
    mkdir /root/ca/intermediate
    cd /root/ca/intermediate
    mkdir certs crl csr newcerts private
    chmod 700 private
    touch index.txt
    touch serial
    touch crlnumber
    echo 1000 > serial
    ```
    * 准备配置文件openssl-intermediate.cnf
    * 创建intermediate key
    ```shell
    cd /root/ca
    openssl req -config intermediate/openssl-intermediate.cnf -new -sha256 \
      -key intermediate/private/intermediate.key.pem \
      -out intermediate/csr/intermediate.csr.pem
    ```
    * 创建intermediate secret
    ```shell
    cd /root/ca
    openssl ca -config openssl.cnf -extensions v3_intermediate_ca \
      -days 3650 -notext -md sha256 \
      -in intermediate/csr/intermediate.csr.pem \
      -out intermediate/certs/intermediate.cert.pem
    chmod 444 intermediate/certs/intermediate.cert.pem
    ```
    * 验证证书
    ```shell
    // 和上面一样验证中间证书的有效性
    openssl x509 -noout -text \
      -in intermediate/certs/intermediate.cert.pem
    // 使用根证书验证中间证书
    openssl verify -CAfile certs/ca.cert.pem \
      intermediate/certs/intermediate.cert.pem
    ```
* 证书链的生成
    * 一般如果有证书通过中间证书颁发机构来验证，也要去根证书机构验证
    * 使用如下来把根证书和中间证书合并到一起
    ```shell
    cat intermediate/certs/intermediate.cert.pem \
      certs/ca.cert.pem > intermediate/certs/ca-chain.cert.pem
    chmod 444 intermediate/certs/ca-chain.cert.pem
    ```
* 服务器的证书部署
    * 签发服务端和客户端的证书，和上面一样，只不过用中间证书颁发机构的配置来创建
    * 创建key
    ```shell
    cd /root/ca
    openssl genrsa -aes256 \
        -out intermediate/private/www.example.com.key.pem 2048
    chmod 400 intermediate/private/www.example.com.key.pem
    ```
    * 创建证书签发请求
    ```shell
    cd /root/ca
    openssl req -config intermediate/openssl.cnf \
      -key intermediate/private/www.example.com.key.pem \
      -new -sha256 -out intermediate/csr/www.example.com.csr.pem
    ```
    * 创建服务端证书
    ```shell
    cd /root/ca
    openssl ca -config intermediate/openssl.cnf \
        -extensions server_cert -days 375 -notext -md sha256 \
        -in intermediate/csr/www.example.com.csr.pem \
        -out intermediate/certs/www.example.com.cert.pem
    chmod 444 intermediate/certs/www.example.com.cert.pem
    ```
    * 创建完后，可以在```intermediate/index.txt```文件中有一条相应的记录
    * 验证证书
    ```shell
    openssl x509 -noout -text \
      -in intermediate/certs/www.example.com.cert.pem
    # 使用证书链文件来验证新建的证书
    openssl verify -CAfile intermediate/certs/ca-chain.cert.pem \
      intermediate/certs/www.example.com.cert.pem
    ```
    * 部署需要的证书
    ```shell 
    ca-chain.cert.pem
    www.example.com.key.pem
    www.example.com.cert.pem
    ```
 
* 证书验证
    ```shell
    // 这个命令会显示服务器的CA证书,showcerts
    openssl s_client -connect localhost:443 -prexit -showcerts
    // 验证当前的证书是不是被根ca签发
    openssl verify -verbose -x509_strict -CAfile ca-chain.cert.pem localhost.cert.pem
    ```
* 代码里怎么用
    * 建立一个简单的torado web服务器
    * 把上面三个文件拷贝到对应目录
    * 代码如下：
    ```python
    /* 这里要注意ssl_options,要把证书链也加进去，不然是不行的 */
    import tornado.ioloop
    import tornado.web
    import ssl
    class MainHandler(tornado.web.RequestHandler):
        def get(self):
            self.write("Hello, world")
    def make_app():
        return tornado.web.Application([
            (r"/", MainHandler),
        ])
    if __name__ == "__main__":
        application = make_app()
        chainpath="./ca-chain.cert.pem"
        crtpath="./localhost.cert.pem"
        keypath="./localhost.key.pem"
        ssl_ctx= ssl.create_default_context(ssl.Purpose.CLIENT_AUTH,cafile=chainpath)
        ssl_ctx.load_cert_chain(crtpath,keypath)
        http_server = tornado.httpserver.HTTPServer(application, ssl_options=ssl_ctx)
        http_server.listen(443)
        tornado.ioloop.IOLoop.current().start()
    ```


* 如何测试
    * ![result](/images/sslverify.png)
    *  浏览器上的话，可以考虑firefox,chrome也可以，不过要自己导入证书，可能还要做格式转化，下面直接在firefox里导入证书，结果如下：
    ![result](/images/result.jpeg)
* 总结
    * 这里还有些其他可能碰到的问题，比如，证书回收，格式转换方法，测速，当前最佳实践等主题，这里主要记录下做这种证书的步骤


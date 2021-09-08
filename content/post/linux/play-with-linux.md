---
title: "Some Useful Command"
date: 2017-09-07T12:33:21+08:00
lastmod: 2017-09-07T19:33:29+08:00
draft: false
tags: ["shell"]
categories: ["linux"]
---

## window文件的CRLF转成linux文件
经常碰到window提交的文件，然后在linux拉下来有这个问题，下面列举几种解决法子
- `sed`
  ```shell
  sed 's/\r$//' winfile.txt > unixfile.txt
  ```
- `awk`
  ```shell
    awk '{ sub("\r$", ""); print }' winfile.txt > unixfile.txt
  ```
- `perl`
  ```shell
    perl -lne 's/\r//g; print' winfile.txt > unixfile.txt
  ```
- `doc2unix`
  ```shell
  dos2unix -n winfile unixfile
  ```
- `fromdocs`
  ```shell
    fromdos yourtextfile
  ```
- `bash`
  ```shell
    tr -d '\r' < file1 > file2
  ```
- `emacs`
  ```shell
    ctrl-s ctrl-q ctrl-j
  ```

## 格式转化
碰到个有很多服务器信息是这种格式的
  ```shell
  host
  port
  name
  address
  #...还有五十个
  ```
需要转化为如下格式
  ```shell
  host1,port1,name1,address1
  host2,port2,name2,address2
  #...还有五十个
  ```
解决方法,定义宏命令，用F4做，也可以保存宏
  - `emacs`
  ```shell
    # macro definition
    F3
    # start define action
    ctrl+e  + , + -> + backspace
    # end of definition
    F4
  ```
## 替换配置文件某一个字段的内容
- 匹配某一个配置文件，把配置文件里的`BASE_URL: http://www.baidu.com`动态的配置为`BASE_URL: http:${var}`
```shell
 sed -i "" 's|BASE_URL:.*,|BASE_URL: '\"http://${BASE_URL}\",'|g' /fe/APIConst.json    
```
- Note: 如果你是mac环境，用上面的脚本没问题，如果是linux环境，则要把`-i`去掉才可以

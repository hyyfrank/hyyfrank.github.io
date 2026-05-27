---
title: "[Autodesk] Play With Shell"
date: 2020-06-07T11:33:39+08:00
lastmod: 2020-08-07T11:33:39+08:00
draft: true
tags: ["shell"]
categories: ["shell"]
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

* 简单的部署任务
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
    * 先把要部署上去的服务器的信息写好到配置文件中，但是我有一堆按行的配置信息，拷贝过来就是这样，所以要先处理下
      ```shell
         园区1
         100001
         user1
         pass1
         类型1
         类型2

        园区2
        100002
        user2
        pass
        抽帧服务器
        room/road
        
        ..以下还有50条
      ```
    * emacs宏命令处理这种就挺方便的
      ```shell
         园区1,100001,user1,pass1,类型1,类型2
         园区2,100002,user2,pass,类型3,类型4
         ..以下还有50条
         
         # setting emacs macros as below.
         # F3 to start define macro
         # Ctrl-e to go to the end of the line
         # then add space and dot
         # the second space will to to next line
         # the delete will make second line append to the end of first line
         # F4 to end define macro
         # go to certain line, and Enjoy F4 to help you avoid the dirty operation.
         F3 + Ctrl-e + space + , + space + delete +F4
      ```    
    * 拷贝脚本
      ```shell
      #!/bin/sh
        # add time for user friendly output
        curtime=$(date +%Y-%m-%d,%H:%M:%S)
        # read server config from file
        cat /Users/frank/server.yaml | while read line
        do
            IFS=', ' read -r -a serverConfig <<< $line
            echo [$curtime] "Start To Deploy: ${serverConfig[5]}"
            # 1. read APICONST file and replace with server config and split by comma
            # 2. replace base url and instrument url
            BASE_URL="${serverConfig[1]}:${serverConfig[8]}"
            INSTRUMENT_URL="${serverConfig[1]}:${serverConfig[9]}"
            # below command will work in mac environment, if you have linux, try this one instead
            # sed -i 's/BASE_URL:.*,/BASE_URL: '\"${BASE_URL}\",'/g' /Users/g2/work/fe-algo/src/services/APIConst.js
            sed -i "" 's/BASE_URL:.*,/BASE_URL: '\"${BASE_URL}\",'/g' src/services/APIConst.js
            sed -i "" 's/INSTURMENT_URL:.*,/INSTURMENT_URL: '\"${INSTRUMENT_URL}\",'/g' src/services/APIConst.js
            echo [$curtime] "Deploy ${serverConfig[5]} : [......Base URL] change to: ${BASE_URL}"
            echo [$curtime] "Deploy ${serverConfig[5]} : [Instrument URL] change to: ${INSTRUMENT_URL}"

            # 3. npm run build to build website
            echo [$curtime] "Working Directory: ${PWD}"
            echo [$curtime] "Check Node_Module Directory..."
            NodeModuleDir="${PWD}/node_modules"
            if [ -d "$NodeModuleDir" ]; then
                echo [$curtime] "node module already existed, run npm build directly"
            else
                echo [$curtime] "no node module found, run npm install and then build"
                npm install > /dev/null 2>&1
            fi
            echo [$curtime] "Start To Build: "
            # npm run build > /dev/null 2>&1
            curtime=$(date +%Y-%m-%d,%H:%M:%S)
            echo [$curtime] "Build Completed!"
            echo [$curtime] "Check Build Output:"
            ls -la ${PWD}/dist/
            # 4. scp copy current dist folder to certain server
            set timeout 160
            username=${serverConfig[3]}
            host=${serverConfig[1]}
            pass=${serverConfig[4]}
            port=${serverConfig[2]}
            echo "username:${username},host:${host},pass:${pass},port:${port}"
            echo "scp command:"
            echo "scp -P ${port} -r ${PWD}/dist/ ${username}@${host}:/home/${username}/work/webcontent/"
            expect_commands="
            spawn scp -P ${port} -r ${PWD}/dist ${username}@${host}:/home/${username}/work/webcontent
                expect \"password:\"
                send \"${pass}\r\"
            expect eof
            "
            expect -c "${expect_commands}"
            curtime=$(date +%Y-%m-%d,%H:%M:%S)
            echo [$curtime] "SCP Copy file Completed."
            
            echo "[$curtime] scp completed."
            # 5. check server status: nginx, frp
            # 6. output the machine deploy status
        done
        # add progressing bar when doing the deployment    

      ```  

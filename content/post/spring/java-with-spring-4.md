---
title: "Java With Spring (四)"
date: 2018-08-04T09:33:39+08:00
lastmod: 2018-08-11T20:33:39+08:00
draft: false
tags: ["java","Spring"]
categories: ["Spring"]
---

# 增加多个环境支持
1. 目录结构如下：
    ```java
    └── resources
            ├── application-dev.properties
            ├── application-pre-prod.properties
            ├── application-prod.properties
            ├── application-staging.properties
            ├── application-test.properties
            ├── application.properties
            ├── customize.properties
    ```
2. 对于每个配置文件会包含热加载，log, database, mybatis, redis, kafka等等，这里不一一列举，当前只有log,database,热加载，mybatis,配置如下
    ```java
    server.port=9001
    # HMR
    spring.devtools.restart.enabled=true
    spring.devtools.restart.additional-paths=src/main/java/
    spring.devtools.restart.log-condition-evaluation-delta=false
    spring.devtools.livereload.enabled=false
    logging.level.com.example.datas.manager.mapper=debug
    # Database
    spring.datasource.url=jdbc:mysql://127.0.0.1:3306/springboot?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=GMT%2B8
    spring.datasource.username=root
    spring.datasource.password=pass123
    spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
    # MyBatis
    mybatis.type-aliases-package=com.autodesk.www.model
    mybatis.config-locations=classpath:mybatis/mybatis-config.xml
    mybatis.mapper-locations=classpath:mybatis/mapper/\*.xml 
    mybatis.configuration.log-impl= org.apache.ibatis.logging.stdout.StdOutImpl

    ```
3. 在application.properties中设置启动的环境```spring.profiles.active=dev```
4. 在不同的配置文件指定不同的端口
5. 改用maven profile来配置多个环境，在pom.xml里指定
    ```xml
        <profiles>
            <profile>
                <id>dev</id>
                <activation>
                    <activeByDefault>true</activeByDefault>
                </activation>
                <properties>
                    <env>dev</env>
                </properties>
            </profile>
            <profile>
                <id>staging</id>
                <properties>
                    <env>staging</env>
                </properties>
            </profile>
            <profile>
                <id>preprod</id>
                <properties>
                    <env>pre-prod</env>
                </properties>
            </profile>
            <profile>
                <id>prod</id>
                <properties>
                    <env>prod</env>
                </properties>
            </profile>
            <profile>
                <id>test</id>
                <properties>
                    <env>test</env>
                </properties>
            </profile>
        </profiles>
    ```
6. 把上面application.properties中设置启动的环境```spring.profiles.active=@env@```这样配置后，可以在IDEA的Maven Project小窗口看到我们的各个环境，

## 总结
* 这样就完成了对不同环境的管理和配置了，不同环境支持在大部分项目中都是需要的，所以这个我们先配置下

> 镇静待敌，众心则宁


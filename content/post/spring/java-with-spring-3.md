---
title: "Java With Spring (三)"
date: 2018-07-28T09:33:39+08:00
lastmod: 2018-08-04T22:33:39+08:00
draft: false
tags: ["java","Spring"]
categories: ["Spring"]
---

# 配置kombok
1. 介绍：Lombok 是一个jar包，可以节约很多敲代码的工作
2. 安装其实很简单，就是IDEA里找到插件，安装一下
3. 增加pom的依赖
    ```xml
    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <version>1.18.2</version>
      <scope>provided</scope>
    </dependency>
    ```
4. 增加@Data标签，可以直接看到生成的get set等结构了
# 增加gitignore
1. gitignore帮我们把不需要提交到git的文件列出来
    ```xml
    target
    .idea
    .project
    .settings
    .classpath
    *.iml
    ```
# 支持热部署
1. 原理： 使用了两个ClassLoader，一个Classloader加载那些不会改变的类（第三方Jar包），另一个ClassLoader加载会更改的类，称为restart ClassLoader,这样在有代码更改的时候，原来的restart ClassLoader 被丢弃，重新创建一个restart ClassLoader，由于需要加载的类相比较少，所以实现了较快的重启时间
2. 增加dependency
    ```xml
        <dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-devtools</artifactId>
			<optional>true</optional>
		 </dependency>

        <plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <fork>true</fork>
                </configuration>
			</plugin>
		 </plugins>
    ```
    4. IDEA里的选项Build Project automatically配置为true
    5. 配置文件可以这样配一下
    ```conf
    spring.devtools.restart.enabled=true
    spring.devtools.restart.additional-paths=src/main/java/
    spring.devtools.restart.log-condition-evaluation-delta=false
    spring.devtools.livereload.enabled=false
    logging.level.com.example.datas.manager.mapper=debug
    ```
# JSON包装结果
   1. 其实就是把结果用JSON的格式包装一下，这样返回的结果才比较一致
   ```java
    package com.autodesk.www.utils;
    import java.util.List;
    import com.fasterxml.jackson.databind.JsonNode;
    import com.fasterxml.jackson.databind.ObjectMapper;
    public class JsonWrapResult {
        // 定义jackson对象
        private static final ObjectMapper MAPPER = new ObjectMapper();
        // 响应业务状态
        private Integer status;
        // 响应消息
        private String msg;
        // 响应中的数据
        private Object data;
        private String ok;	// 不使用
        public static JsonWrapResult build(Integer status, String msg, Object data) {
            return new JsonWrapResult(status, msg, data);
        }
        public static JsonWrapResult ok(Object data) {
            return new JsonWrapResult(data);
        }
        public static JsonWrapResult ok() {
            return new JsonWrapResult(null);
        }
        public static JsonWrapResult errorMsg(String msg) {
            return new JsonWrapResult(500, msg, null);
        }
        public static JsonWrapResult errorMap(Object data) {
            return new JsonWrapResult(501, "error", data);
        }
        public static JsonWrapResult errorTokenMsg(String msg) {
            return new JsonWrapResult(502, msg, null);
        }
        public static JsonWrapResult errorException(String msg) {
            return new JsonWrapResult(555, msg, null);
        }
        public JsonWrapResult() {
        }
        public JsonWrapResult(Integer status, String msg, Object data) {
            this.status = status;
            this.msg = msg;
            this.data = data;
        }
        public JsonWrapResult(Object data) {
            this.status = 200;
            this.msg = "OK";
            this.data = data;
        }
        public Boolean isOK() {
            return this.status == 200;
        }
        public Integer getStatus() {
            return status;
        }
        public void setStatus(Integer status) {
            this.status = status;
        }
        public String getMsg() {
            return msg;
        }
        public void setMsg(String msg) {
            this.msg = msg;
        }
        public Object getData() {
            return data;
        }
        public void setData(Object data) {
            this.data = data;
        }
        public static JsonWrapResult formatToPojo(String jsonData, Class<?> clazz) {
            try {
                if (clazz == null) {
                    return MAPPER.readValue(jsonData, JsonWrapResult.class);
                }
                JsonNode jsonNode = MAPPER.readTree(jsonData);
                JsonNode data = jsonNode.get("data");
                Object obj = null;
                if (clazz != null) {
                    if (data.isObject()) {
                        obj = MAPPER.readValue(data.traverse(), clazz);
                    } else if (data.isTextual()) {
                        obj = MAPPER.readValue(data.asText(), clazz);
                    }
                }
                return build(jsonNode.get("status").intValue(), jsonNode.get("msg").asText(), obj);
            } catch (Exception e) {
                return null;
            }
        }
        public static JsonWrapResult format(String json) {
            try {
                return MAPPER.readValue(json, JsonWrapResult.class);
            } catch (Exception e) {
                e.printStackTrace();
            }
            return null;
        }
        public static JsonWrapResult formatToList(String jsonData, Class<?> clazz) {
            try {
                JsonNode jsonNode = MAPPER.readTree(jsonData);
                JsonNode data = jsonNode.get("data");
                Object obj = null;
                if (data.isArray() && data.size() > 0) {
                    obj = MAPPER.readValue(data.traverse(),
                            MAPPER.getTypeFactory().constructCollectionType(List.class, clazz));
                }
                return build(jsonNode.get("status").intValue(), jsonNode.get("msg").asText(), obj);
            } catch (Exception e) {
                return null;
            }
        }
        public String getOk() {
            return ok;
        }
        public void setOk(String ok) {
            this.ok = ok;
        }
    }
   ```



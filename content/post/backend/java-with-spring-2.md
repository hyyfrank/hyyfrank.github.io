---
title: "Java With Spring (二)"
date: 2018-07-21T09:33:39+08:00
lastmod: 2018-12-28T22:33:39+08:00
draft: false
tags: ["java","Spring"]
categories: ["backend","technology"]
---

## 增删改查
1. 作为一个简单的脚手架程序，我们先从最基本的功能开始，增删改查，返回json,包装JSON数据
2. 配置好依赖，可以看到我们仅有最简单的三个依赖
    ```java
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
        <groupId>org.mybatis.spring.boot</groupId>
        <artifactId>mybatis-spring-boot-starter</artifactId>
        <version>2.1.1</version>
    </dependency>

    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>druid-spring-boot-starter</artifactId>
        <version>1.1.10</version>
    </dependency>

    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <scope>runtime</scope>
    </dependency>
    ```
3. 从基本的目录结构
    ```java
    main
    ├── java
    │   └── com
    │       └── autodesk
    │           └── www
    │               ├── PlayWithBootApplication.java
    │               ├── controller
    │               │   └── PostController.java
    │               ├── dao
    │               │   └── PostDao.java
    │               ├── exception
    │               │   └── CustomExceptionHandler.java
    │               ├── model
    │               │   └── Post.java
    │               ├── services
    │               │   ├── PostService.java
    │               │   └── impl
    │               │       └── PostServiceImpl.java
    │               └── utils
    │                   └── JsonWrapResult.java
    └── resources
        ├── application.properties
        ├── customize.properties
        └── mybatis
            ├── mapper
            │   └── PostMapper.xml
            └── mybatis-config.xml
    ```
3. 基本的目录结构大体如此，测试目录就不列出来了，mybatic配置如下：
    ```xml
    # database
    spring.datasource.url=jdbc:mysql://127.0.0.1:3306/springboot?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=GMT%2B8
    spring.datasource.username=root
    spring.datasource.password=test
    spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
    # MyBatis
    mybatis.type-aliases-package=com.autodesk.www.model
    mybatis.config-locations=classpath:mybatis/mybatis-config.xml
    mybatis.mapper-locations=classpath:mybatis/mapper/*.xml
    mybatis.configuration.log-impl= org.apache.ibatis.logging.stdout.StdOutImpl
    ```
4. ```PostController.java```代码如下
    ```java
    @RestController
    @RequestMapping("/post")
    public class PostController {
        private PostService postService;
        @Autowired
        public PostController(PostService postService){
            this.postService = postService;
        }
        @PostMapping(path= "/add", consumes = "application/json", produces = "application/json")
        public JsonWrapResult addEmployee(@RequestBody Post post) throws Exception {
            this.postService.createPost(post);
            return JsonWrapResult.ok(this.postService.findAllPosts());
        }
        @RequestMapping(value = "/delete/{postId}", method = RequestMethod.DELETE)
        public JsonWrapResult deletePost(@PathVariable("postId") Long postId) {
            this.postService.deletePost(postId);
            return JsonWrapResult.ok("Delete Successful.");
        }
        @PostMapping(path= "/update", consumes = "application/json", produces = "application/json")
        public JsonWrapResult updateEmployee(@RequestBody Post post) throws Exception {
            this.postService.updatePost(post);
            return JsonWrapResult.ok(this.postService.findAllPosts());
        }
        @RequestMapping("/query/{id}")
        public JsonWrapResult testQuery(@PathVariable Long id) {
            return JsonWrapResult.ok(postService.findPost(id));
        }
        @RequestMapping(value = "/all", method = RequestMethod.GET)
        public JsonWrapResult listAllPosts() {  
        List<Post> allPosts = this.postService.findAllPosts();
        return JsonWrapResult.ok(allPosts);
        }
    ```
5. ```PostDao.java```代码如下
    ```java
    @Repository
    @Mapper
    public interface PostDao {
        void save(Post post);
        void delete(Long postId);
        void update(Post post);
        Post find(Long postId);
        List<Post> findAll();
    }
    ```
6. ```PostService.java```代码如下
    ```java
    public interface PostService {
        void createPost(Post post);
        void deletePost(Long postId);
        void updatePost(Post post);
        Map<String, Object> findPost(Long postId);
        List<Post> findAllPosts();
    }
    ```
7. ```Post.java```代码如下
    ```java
    public class Post implements Serializable {
        private static final long serialVersionUID = 1L;
        private Long id;
        private String title;
        private String content;
        private Timestamp creationDate;
        public Long getId() {
            return id;
        }
        public void setId(Long id) {
            this.id = id;
        }
        public String getTitle() {
            return title;
        }
        public void setTitle(String title) {
            this.title = title;
        }
        public String getContent() {
            return content;
        }
        public void setContent(String content) {
            this.content = content;
        }
        public Timestamp getCreationDate() {
            return creationDate;
        }
        public void setCreationDate(Timestamp creationDate) {
            this.creationDate = creationDate;
        }
        @Override
        public String toString() {
            return "Post [id=" + id + ", title=" + title + ", content=" + content + ", creationDate=" + creationDate + "]";
        }
    }
    ```
8. ```PostServiceImpl.java```代码如下
    ```java
    @Service("postService")
    @Transactional
    public class PostServiceImpl implements PostService {
        private PostDao postDao;
        @Autowired
        public PostServiceImpl(PostDao postDao){
            this.postDao = postDao;
        }
        @Override
        public void createPost(Post post) {
            post.setCreationDate(new Timestamp(System.currentTimeMillis()));
            this.postDao.save(post);
        }
        @Override
        public void deletePost(Long postId) {
            this.postDao.delete(postId);
        }
        @Override
        public void updatePost(Post post) {
            this.postDao.update(post);
        }
        @Override
        public Map<String, Object> findPost(Long postId) {
            Map<String, Object> attributes = new HashMap<>();
            Post post = this.postDao.find(postId);
            attributes.put("post", post);
            return attributes;
        }
        @Override
        public List<Post> findAllPosts() {
            return this.postDao.findAll();
        }
    }
    ```
9. ```postMapper.xml```配置的mybatic如下：
    ```xml
    <mapper namespace="com.autodesk.www.dao.PostDao">
        <resultMap id="PostResultMap" type="com.autodesk.www.model.Post">
            <id property="id" column="post_id"/>
            <result property="title" column="post_title"/>
            <result property="content" column="post_content"/>
            <result property="creationDate" column="post_creation_date"/>
        </resultMap>
        <insert id="save">
            INSERT INTO `T_POST` (title, content, creationDate) VALUES (#{title}, #{content}, #{creationDate})
        </insert>
        <select id="findAll" resultMap="PostResultMap">
            SELECT
                p.id as post_id,
                p.title as post_title,
                p.content as post_content,
                p.creationDate as post_creation_date
            FROM T_POST p
            ORDER BY p.creationDate DESC
        </select>
        <select id="find" resultMap="PostResultMap">
            SELECT
                p.id as post_id,
                p.title as post_title,
                p.content as post_content,
                p.creationDate as post_creation_date
            FROM T_POST p
            WHERE p.id = #{postId}
        </select>
        <update id="update">
            UPDATE T_POST SET 
                title = #{title},
                content = #{content}
            WHERE id = #{id}
        </update>
        <delete id="delete" parameterType="Long">
            DELETE FROM T_POST WHERE id = #{postId}
        </delete>
    </mapper>
    ```
10. mybatic基本配置如下```mybatis-config.xml```
    ```xml
    <?xml version="1.0" encoding="UTF-8" ?>
    <!DOCTYPE configuration PUBLIC "-//mybatis.org//DTD Config 3.0//EN" "http://mybatis.org/dtd/mybatis-3-config.dtd">
    <configuration>
        <typeAliases>
            <typeAlias alias="Integer" type="java.lang.Integer" />
            <typeAlias alias="Long" type="java.lang.Long" />
            <typeAlias alias="String" type="java.lang.String" />
            <typeAlias alias="HashMap" type="java.util.HashMap" />
            <typeAlias alias="Date" type="java.util.Date" />
            <typeAlias alias="LinkedHashMap" type="java.util.LinkedHashMap" />
            <typeAlias alias="ArrayList" type="java.util.ArrayList" />
            <typeAlias alias="LinkedList" type="java.util.LinkedList" />
        </typeAliases>
    </configuration>
    ```
## 完成基本的curd
   *  这样我们就有了基本的CURD,接着会在接下来的文章中，一步步的添加成具有完备功能的脚手架
   * Happy hacking...
   
> 不积小流，无以成江海 


    

---
title: Git Most Used Command
date: 2020-10-03 21:50:00
author: hyyfrank
img: http://static.blinkfox.com/hexoblog_20180924_git.jpg
categories: 软件工具
tags: Git
---

## 常用命令

### 1 submit feature branch code

```javascript
git checkout master 
git pull origin master

git pull origin feature/mybranch
git rebase master
...
...
git add .
git commit -m "JIRA-1: XXXXXX reviewer:xxxxx"
git push origin feature/mybranch

git checkout master
git merge feature/mybranch
git tag "your tag format"

git push origin master
```

### 2 add delete branch
### 3 remove cache and make gitignore work
### 4 how to use rebase to merge commit together
### 5 how to reset to a certain commit
### 6 how to add security and code check in your code
### 7 how to manage your code with agile method



## 参考
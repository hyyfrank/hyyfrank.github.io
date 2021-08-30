---
title: "Crontab Issue Tracking"
date: 2019-08-07T11:36:45+08:00
lastmod: 2019-08-07T11:36:45+08:00
draft: false
tags: ["linux"]
categories: ["backend","crontab"]
---

* how to track issue
  ```shell
  sudo /var/log/syslog | grep cron
  ```
* capture the output
  ```shell
  1 2 * * * /home/hyy/Start.py >/tmp/output.log 2>&1
  ```
* check cron is running
  ```shell
    ps -ef | grep cron | grep -v grep
  ```
* check the path is correct
  crontab  is running in with cwd == $HOME, if you using python os.getcwd() in different folder structure, make sure you cd to the correct place or else it will affect your code by output "can not find module" stuff.
* last command in crontab should have a blank line
  this is tricky, if you didn't notice it.
* be careful the dot thing
  Debian Linux and its derivative (Ubuntu, Mint, etc) have some peculiarities that may prevent your cron jobs from executing; in particular, the files in /etc/cron.d, /etc/cron.{hourly,daily,weekly,monthly} must :
    * be owned by root
    * only be writable by root
    * not be writable by group or other users
    * have a name without any dots '.' or any other special character but '-' and '_' .
* python issue run in crontab
  * make sure python script have #!/usr/bin/python at the beginning, not neccessary
  * make sure log the output, so you can debug in a smooth way
* chmod to the script
  * always run in normal user mode, not root user, and do not use 
  ```shell
    # don't do this
    sudo contab -e  
  ```
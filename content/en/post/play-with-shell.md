---
title: "[GLP] Play With Shell"
date: 2020-06-07T11:33:39+08:00
lastmod: 2020-08-07T11:33:39+08:00
draft: false
tags: ["shell"]
categories: ["shell"]
aliases:
  - /post/autodesk/play-with-shell/
---

## Two Efficient Methods for Line-by-Line File Processing in Shell

### Method 1: Using a File Descriptor

Redirect stdout to a file descriptor (fd 4), then restore it after processing. This is slightly faster for large files.

```shell
function while_read_line_bottom_fd_out
{
  >$OUTFILE
  exec 4<&1
  exec 1>$OUTFILE
  while read LINE
  do
    echo "$LINE"
    :
  done < $INFILE
  exec 1<&4
  exec 4>&-
}
```

### Method 2: Without a File Descriptor

Simpler and easier to maintain — appends each line directly to the output file.

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

---

## A Simple Deployment Task

**Goal:** Copy a built frontend project to 15 remote servers automatically, without password prompts, and apply per-server configuration changes before copying.

### Step 1 — Install `expect` (macOS)

```shell
brew install expect
```

### Step 2 — Prepare the Server Config File

Raw server info (one field per line) came in this format:

```
Site1
100001
user1
pass1
type1
type2

Site2
100002
user2
pass
type3
type4

# ... 50 more entries
```

We need each server on a single comma-separated line. An **Emacs keyboard macro** handles this nicely:

```
# F3 = start recording macro
# Ctrl-e = go to end of line
# , = insert comma separator
# Delete = join next line
# F4 = stop / replay macro

F3 → Ctrl-e → , → Delete → F4
```

Result:

```
Site1,100001,user1,pass1,type1,type2
Site2,100002,user2,pass,type3,type4
# ... 50 more
```

### Step 3 — Deployment Script

```shell
#!/bin/sh
curtime=$(date +%Y-%m-%d,%H:%M:%S)

cat /Users/frank/server.yaml | while read line
do
  IFS=', ' read -r -a serverConfig <<< $line
  echo "[$curtime] Start To Deploy: ${serverConfig[5]}"

  # 1. Update API constants with per-server base URL and instrument URL
  BASE_URL="${serverConfig[1]}:${serverConfig[8]}"
  INSTRUMENT_URL="${serverConfig[1]}:${serverConfig[9]}"

  # macOS sed requires empty string after -i; on Linux omit the ""
  sed -i "" 's/BASE_URL:.*,/BASE_URL: '"\"${BASE_URL}\","'/g' src/services/APIConst.js
  sed -i "" 's/INSTURMENT_URL:.*,/INSTURMENT_URL: '"\"${INSTRUMENT_URL}\","'/g' src/services/APIConst.js

  echo "[$curtime] Deploy ${serverConfig[5]}: Base URL → ${BASE_URL}"
  echo "[$curtime] Deploy ${serverConfig[5]}: Instrument URL → ${INSTRUMENT_URL}"

  # 2. Build the frontend
  echo "[$curtime] Checking node_modules..."
  NodeModuleDir="${PWD}/node_modules"
  if [ -d "$NodeModuleDir" ]; then
    echo "[$curtime] node_modules found, running build directly"
  else
    echo "[$curtime] node_modules missing, running npm install first"
    npm install > /dev/null 2>&1
  fi

  curtime=$(date +%Y-%m-%d,%H:%M:%S)
  echo "[$curtime] Build started..."
  # npm run build > /dev/null 2>&1
  echo "[$curtime] Build completed!"
  ls -la ${PWD}/dist/

  # 3. SCP the dist folder to the remote server using expect (no password prompt)
  username=${serverConfig[3]}
  host=${serverConfig[1]}
  pass=${serverConfig[4]}
  port=${serverConfig[2]}

  echo "[$curtime] Deploying via scp -P ${port} to ${username}@${host}..."

  expect_commands="
  spawn scp -P ${port} -r ${PWD}/dist ${username}@${host}:/home/${username}/work/webcontent
  expect \"password:\"
  send \"${pass}\r\"
  expect eof
  "
  expect -c "${expect_commands}"

  curtime=$(date +%Y-%m-%d,%H:%M:%S)
  echo "[$curtime] SCP completed."
done
```

> **Note:** Steps such as checking nginx/frp service status and printing a deployment summary can be appended after step 3 as needed.

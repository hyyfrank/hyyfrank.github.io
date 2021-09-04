---
title: "Play With Git (二)"
date: 2017-02-07T12:33:21+08:00
lastmod: 2017-08-07T19:33:29+08:00
draft: false
tags: ["git"]
categories: ["backend","technology"]
---

## How to: Remove large file in git
### problem description
* i have a git repository in github, it is kindof 20M at the most.but when i try to clone it to my local machine, it takes 10 min to clone the repository. That is wired. so i start to check the git file, and i find some big file out there. i check with a script to list the big file in git.
  ```python
   from subprocess import check_output, CalledProcessError, Popen, PIPE
    import argparse
    import signal
    import sys

    sortByOnDiskSize = False

    def main():
        global sortByOnDiskSize

        signal.signal(signal.SIGINT, signal_handler)

        args = parseArguments()
        sortByOnDiskSize = args.sortByOnDiskSize
        sizeLimit = 1024*args.filesExceeding

        if args.filesExceeding > 0:
            print(f"Finding objects larger than {args.filesExceeding}kB…")
        else:
            print(f"Finding the {args.matchCount} largest objects…")

        blobs = getTopBlobs(args.matchCount, sizeLimit)

        populateBlobPaths(blobs)
        printOutBlobs(blobs)

    def getTopBlobs(count, sizeLimit):
        sortColumn = 4

        if sortByOnDiskSize:
            sortColumn = 3

        verifyPack = f"git verify-pack -v `git rev-parse --git-dir`/objects/pack/pack-*.idx | grep blob | sort -k{sortColumn}nr"

        output = check_output(verifyPack, shell=True).decode('utf-8').split("\n")[:-1]

        blobs = dict()
        compareBlob = Blob(f"a b {sizeLimit} {sizeLimit} c") # use __lt__ to do the appropriate comparison

        for objLine in output:
            blob = Blob(objLine)
            if sizeLimit > 0:
                if compareBlob < blob:
                    blobs[blob.sha1] = blob
                else:
                    break
            else:
                blobs[blob.sha1] = blob
                if len(blobs) == count:
                    break

        return blobs


    def populateBlobPaths(blobs):
        if len(blobs) > 0:
            print("Finding object paths…")
            outstandingKeys = set(blobs.keys())

            # Only include revs which have a path. Other revs aren't blobs.
            revList = "git rev-list --all --objects | awk '$2 {print}'"
            allObjectLines = check_output(revList, shell=True).decode('utf-8').split("\n")[:-1]

            for line in allObjectLines:
                cols = line.split()
                sha1, path = cols[0], " ".join(cols[1:])

                if sha1 in outstandingKeys:
                    outstandingKeys.remove(sha1)
                    blobs[sha1].path = path
                    # short-circuit the search if we're done
                    if not len(outstandingKeys):
                        break


    def printOutBlobs(blobs):
        if len(blobs) > 0:
            csvLines = ["size,pack,hash,path"]
            for blob in sorted(blobs.values(), reverse=True):
                csvLines.append(blob.csvLine())

            p = Popen(["column", "-t", "-s", "','"], stdin=PIPE, stdout=PIPE, stderr=PIPE)
            lines = "\n".join(csvLines)+"\n"
            stdout, stderr = p.communicate(lines.encode("UTF-8"))

            print("\nAll sizes in kB. The pack column is the compressed size of the object inside the pack file.\n")
            print(stdout.decode('utf-8').rstrip('\n'))
        else:
            print("No files found which match those criteria.")


    def parseArguments():
        parser = argparse.ArgumentParser(description='List the largest files in a git repository')
        parser.add_argument('-c', '--match-count', dest='matchCount', type=int, default=10,
                            help='The number of files to return. Default is 10. Ignored if --files-exceeding is used.')
        parser.add_argument('--files-exceeding', dest='filesExceeding', type=int, default=0,
                            help='The cutoff amount, in KB. Files with a pack size (or pyhsical size, with -p) larger than this will be printed.')
        parser.add_argument('-p', '--physical-sort', dest='sortByOnDiskSize', action='store_true', default=False,
                            help='Sort by the on-disk size of the files. Default is to sort by the pack size.')

        return parser.parse_args()


    def signal_handler(signal, frame):
        print('Caught Ctrl-C. Exiting.')
        sys.exit(0)


    class Blob(object):
        sha1 = ''
        size = 0
        packedSize = 0
        path = ''

        def __init__(self, line):
            cols = line.split()
            self.sha1, self.size, self.packedSize = cols[0], int(cols[2]), int(cols[3])

        def __repr__(self):
            return f"{self.sha1} - {self.size} - {self.packedSize} - {self.path}"

        def __lt__(self, other):
            if (sortByOnDiskSize):
                return self.size < other.size
            else:
                return self.packedSize < other.packedSize

        def csvLine(self):
            return f"{int(self.size/1024)},{int(self.packedSize/1024)},{self.sha1},{self.path}"


    if __name__ == '__main__':
        main()%
  ```
* after run the python script above, i can locate big file first,i get the result as below.
    ```javscript
        ➜  blog git:(blog) ✗ python3 gitlarge.py
        Finding the 10 largest objects…
        Finding object paths…

        All sizes in kB. The pack column is the compressed size of the object inside the pack file.

        size   pack   hash                                      path
        64746  64587  b3d332b95ba9e107966bea04a0be3a145e035095  static/images/kongzhigui.gif
        43240  42950  de1fa35205a84a43f5f7a6e9789d9bde67c634a7  static/images/canvas.gif
        5428   5272   1d9c75b9f443d1fc4f4d07dfe207bc594db4f2a6  images/result.jpeg
        1802   1711   280f009d2b756df094999520c99ddb0cc9ed45e4  source/medias/videos/demo.mp4
        716    675    387b39185455422b2a93c951cfd97f1445bb87f9  static/images/redis2.jpeg
        450    435    9d6c69f8076a7d8a3a2a663a8f267311f0882b7d  static/images/11.png
        437    417    7c9eba52b5c5cd94dcb85c1fbb8f08983fe9f78f  static/images/9.png
        390    309    4b52b537f41501219cd58b5e896752681a32aa78  static/images/redis.jpg
        315    297    0ad208e70fa43def85c9cdbfbe5c0f52f2cc944c  images/sslverify.png
        269    268    5147e1c7a184bc4a5440bad87e032445d3fe4f14  themes/hexo-theme-matery/source/medias/banner/4.jpg
    ```
* clean it via bfg tool ```java -jar bfg.jar --strip-blobs-bigger-than 1M hyyfrank.github.io.git```
  ```javascript
    Cleaning
    --------

    Found 46 commits
    Cleaning commits:       100% (46/46)
    Cleaning commits completed in 546 ms.

    Updating 4 Refs
    ---------------

        Ref                            Before     After
        --------------------------------------------------
        refs/heads/blog              | cb01ff9c | f3b5c671
        refs/heads/gh-pages          | 5ea63877 | d02c6d76
        refs/heads/master            | 6b97e4a6 | 0bb279aa
        refs/remotes/origin/gh-pages | 8c8c69fe | 484a6805

    Updating references:    100% (4/4)
    ...Ref update completed in 48 ms.

    Commit Tree-Dirt History
    ------------------------

        Earliest                                Latest
        |                                            |
        ..DDD.DDDDmmmDmmmmmmmmmmmmmmmmmmmmDDmmmmmmmDmm

        D = dirty commits (file tree fixed)
        m = modified commits (commit message or parents changed)
        . = clean commits (no changes to file tree)

                                Before     After
        -------------------------------------------
        First modified commit | 5b81df40 | 602d79bd
        Last dirty commit     | b7dc4b86 | c0aec55e

    Deleted files
    -------------

        Filename         Git id
        -----------------------------------
        canvas.gif     | de1fa352 (42.2 MB)
        demo.mp4       | 280f009d (1.8 MB)
        kongzhigui.gif | b3d332b9 (63.2 MB)
        result.jpeg    | 1d9c75b9 (5.3 MB)


    In total, 66 object ids were changed. Full details are logged here:

        /Users/g2/work/hyyfrank.github.io.git.bfg-report/2021-08-30/14-28-32

    BFG run is complete! When ready, run: git reflog expire --expire=now --all && git gc --prune=now --aggressive
  ```
  * and i find 4 file which size is larger than 5M, then i find a tool to delete it. and fix the commit history of git.
  * i find the tool bfg repo-cleaner is kind of the tool i need, i try it out. it works. after running below command, i am happy with my repo.
  ```shell
    java -jar bfg.jar --strip-blobs-bigger-than 5M hyyfrank.github.io.git
    # you can find the bfg.jar here: https://rtyley.github.io/bfg-repo-cleaner/
  ```
  * and then run 

  ```shell
  # run git gc command
  cd some-big-repo.git
  git reflog expire --expire=now --all && git gc --prune=now --aggressive
  git push
  ```
  * there is another way to fix the history and make this working(check the commit which push the large file, and fix it), but not quite straightforward, sometimes, the correct tools can save your life.
### My repo reduce from 120M to 20M, Happy Hacking...  


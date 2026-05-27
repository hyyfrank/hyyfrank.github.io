---
title: "FFMPEG"
date: 2022-03-04T10:36:30+08:00
lastmod: 2022-03-04T13:36:30+08:00
draft: true
tags: ["ffmpeg"]
categories: [ "ffmpeg" ]
---

## 基本组成

- AVFormat: 包含绝大多数的媒体封装格式，封装和解封装（编译enable）
- AVCodec: 包含绝大多数的编解码格式（第三方要另外安装，比如x264, libfdk_aac等）
- AVFilter: 音频，视频，字幕等滤镜处理模块，可以有多个输入输出，e.g, crop flip使用的是同一个滤镜处理线性链，split和overlay使用的另一个滤镜处理线性链，可以理解为第一个分号，把视频流拆成2部分，第一部分标签main,第二部分叫tmp;第二个分号，把tmp作为输入，通过crop和vflip处理后，放到flip的标签里，第三个分号则是把main标签和flip标签合并作为输入，输出到output里面，最后完成镜像的效果

  ```javascript
  ffmpeg -i INPUT -vf "split [main][tmp]; [tmp] crop=iw:ih/2:0:0, vflip [flip]; [main][flip] overlay=0:H/2" OUTPUT
  ```

- 视频图像计算模块swscale: 图像缩放和像素格式转换的功能
- 音频转换模块swresample: 音频采样，音频通道布局转换，布局调整

## ffmpeg工作流程

- 读取文件
- 解封装 Demuxer
- 解码 Decoder
- 转换参数 Encoder
- 封装 Muxer
- 写入文件

## FFmpeg的编解码工具ffmpeg

- 主要注意格式就行

  ```javascript
   ffmpeg [options] [[infile options] -i infile]... {[outfile options] outfile}...
   ffmpeg [全局参数] 
   [[输入文件参数] -i [输入文件]] 
   [[输出文件参数]    [输出文件]]
  ```

## FFmpeg的播放器ffplay

- FFmpeg提供播放各种流和媒体文件(avformat, avcodec), ffplay需要SDL-2支持才能完整使用

## FFmpeg多媒体分析器ffprobe

- 多媒体分析工具可以查询以下信息：
  - 音频参数（编码格式）
  - 视频参数 （编码格式）
  - 媒体容器的参数信息（时长，复合码率）
  - 媒体文件中每个包长度，类型，帧的信息等

## build from source

- 我只需要mp4,h264,libfdk_aac,其他的暂时不需要，指定如下编译选项

   ```javascript
   ./configure --disable-filters --disable-encoders --disable-decoders --disable-hwaccels --disable-muxers --disable-demuxers --disable-parsers --disable-bsfs --disable-protocols --disable-indevs --disable-devices --enable-libx264 --enable-libfdk_aac --enable-gpl --enable-nonfree --enable-muxer=mp4
   ```

- 安装完毕，查看编码器，解码器，封装，解封装和通讯协议的支持

  ``` javascript
  ./configure --list-encoders
  ./configure --list-decoders
  ./configure --list-muxers
  ./configure --list-demuxers
  ./configure --list-protocols
   ```

## 常用命令

- 查看ffmpeg的格式和支持情况

- 查询支持情况

   ```javascript
   ffmpeg -formats | grep aac .. or mp4 or webm
   ffmpeg -codes | grep h264
   ffmpeg -encoders | grep libx264
   ffmpeg -filters | grep h264
   ffmpeg -h muxer=flv
   ffmpeg -h demuxer=flv
   ffmpeg -h encoder=h264
   ffmpeg -h decoder=h264
   ```

- 常见使用
  - 提取音频 ``` ffmpeg -i source.mp4 -vn -c:a copy target.aac ```
  - 格式转化 ``` ffmpeg -i source.rmvb -vcodec mpeg4 -b:v 200k -r 15 -an target.mp4 ```
  - 调整码率 ``` ffmpeg -i source.mp4 -minrate 964K -maxrate 3856K -bufsize 2000K target.mp4 ```
  - 改分辨率 ``` ffmpeg -i source.mp4 -vf scale=480:-1 target.mp4 ``` (1080p -> 480p)
  - 视频截图 ``` ffmpeg -y -i source.mp4 -ss 00:01:24 -t 00:00:01 target.jpg ```
  - 裁剪视频 ``` ffmpeg -ss [start] -i [input] -t [duration] -c copy [output] ```
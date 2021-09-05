---
title: "Algorithm Guy Always Good?"
date: 2021-07-07T11:36:45+08:00
lastmod: 2021-08-07T11:36:45+08:00
draft: false
tags: ["algorithm"]
categories: ["technology"]
---
* 今天一个同事甩我一段代码，让我实现功能，说是对图片做半透明太慢了
* 我拿到手头一看，代码是这样的，据说是一个别的组算法厉害的大神写的
  ```python
  # -*- coding: utf-8 -*-
  import numpy as np
  import os
  import cv2
  def put_mask(img_path,output_fold):
      image = cv2.imread(r'E:\testdemo.jpg')
      bbox1 = [72,41,208,330]
      bbox2 = [100,80,248,334]
      zeros1 = np.zeros((image.shape), dtype=np.uint8)
      zeros2 = np.zeros((image.shape), dtype=np.uint8)
      zeros_mask1 = cv2.rectangle(zeros1, (bbox1[0], bbox1[1]), (bbox1[2], bbox1[3]),color=(0,0,255), thickness=-1 ) 
      zeros_mask2 = cv2.rectangle(zeros2, (bbox2[0], bbox2[1]), (bbox2[2], bbox2[3]),color=(0, 255, 0), thickness=-1)
      zeros_mask = np.array((zeros_mask1 + zeros_mask2))
      try:
        # alpha 为第一张图片的透明度
          alpha = 1
          # beta 为第二张图片的透明度
          beta = 0.5
          gamma = 0
          # cv2.addWeighted 将原始图片与 mask 融合
          mask_img = cv2.addWeighted(image, alpha, zeros_mask, beta, gamma)
          cv2.imwrite(os.path.join(output_fold,'mask_img.jpg'), mask_img)
      except:
          print('异常')
      put_mask(img_path = '107.jpg', output_fold='E:\output')
  ```
  * 我看了之后只是觉得，这代码写的太草率了吧，大家都说python简单，没错，是简单，但是也不能乱写吧。这一看就是把mask层放大到和图片一样大，再做addWeighted，addweight本来就慢，还变成大的来做，就不能只对小的部分做完再拼回去么，于是我写了一下测试代码如下，这甚至都谈不上什么算法，只是工程上的直觉而已，一个个像素处理，自然是能少处理就少处理一些，也才能块一些呗
  ```python
  # -*- coding: utf-8 -*-
  import cv
  def combine_two_color_images(image1, image2):
      masklayer, background = image1.copy(), image2.copy()
      masklayer_height = masklayer.shape[0]
      masklayer_width = masklayer.shape[1]
      alpha =0.5
      # do composite on the upper-left corner of the background image.
      blended_portion = cv.addWeighted(masklayer,
                  alpha,
                  background[:masklayer_height,:masklayer_width,:],
                  1 - alpha,
                  0,
                  background)
      background[:masklayer_height,:masklayer_width,:] = blended_portion
      cv.imshow('composited image', background)
      cv.waitKey(10000)
  ```
  * 结果测下来，快了非常多，以前慢的感觉完全不存在了，主要原因，我们的mask层，一般只有200 * 200，但是图片大小是1960 * 1080，这个处理级别一下就差了50倍左右，然后我们一般每小时要处理上万张图片的数量级，所以这个差距就差很多了。写代码还是要把效率放心上才是。
  * 吐槽完毕。
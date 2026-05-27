---
title: "[GLP] Why Is It Running Slow?"
date: 2021-07-07T11:36:45+08:00
lastmod: 2021-08-07T11:36:45+08:00
draft: false
tags: ["algorithm"]
categories: ["algorithm"]
---

A colleague dropped some code on me and asked why applying a semi-transparent mask to images was so slow. Apparently it was written by a "strong algorithm engineer" from another team. Here it is:

```python
# -*- coding: utf-8 -*-
import numpy as np
import os
import cv2

def put_mask(img_path, output_fold):
    image = cv2.imread(r'E:\testdemo.jpg')
    bbox1 = [72, 41, 208, 330]
    bbox2 = [100, 80, 248, 334]
    zeros1 = np.zeros((image.shape), dtype=np.uint8)
    zeros2 = np.zeros((image.shape), dtype=np.uint8)
    zeros_mask1 = cv2.rectangle(zeros1, (bbox1[0], bbox1[1]), (bbox1[2], bbox1[3]), color=(0, 0, 255), thickness=-1)
    zeros_mask2 = cv2.rectangle(zeros2, (bbox2[0], bbox2[1]), (bbox2[2], bbox2[3]), color=(0, 255, 0), thickness=-1)
    zeros_mask = np.array((zeros_mask1 + zeros_mask2))
    try:
        alpha = 1    # opacity of the original image
        beta = 0.5   # opacity of the mask layer
        gamma = 0
        # blend original image with mask
        mask_img = cv2.addWeighted(image, alpha, zeros_mask, beta, gamma)
        cv2.imwrite(os.path.join(output_fold, 'mask_img.jpg'), mask_img)
    except:
        print('error')
    put_mask(img_path='107.jpg', output_fold=r'E:\output')
```

My first reaction: this is pretty careless. Python is easy to write — that's true — but that doesn't mean anything goes.

The problem is obvious: the mask is blown up to the full image size before calling `addWeighted`. `addWeighted` is already not the fastest operation; doing it on a full-resolution frame when your mask is tiny makes it much worse. Why not blend only the small bounding-box region and copy it back?

Here's the fix — this isn't even an algorithm, it's just basic engineering intuition: process fewer pixels.

```python
# -*- coding: utf-8 -*-
import cv2 as cv

def combine_two_color_images(image1, image2):
    masklayer, background = image1.copy(), image2.copy()
    masklayer_height = masklayer.shape[0]
    masklayer_width  = masklayer.shape[1]
    alpha = 0.5
    # blend only the region of interest, not the whole frame
    blended_portion = cv.addWeighted(
        masklayer,
        alpha,
        background[:masklayer_height, :masklayer_width, :],
        1 - alpha,
        0,
        background,
    )
    background[:masklayer_height, :masklayer_width, :] = blended_portion
    cv.imshow('composited image', background)
    cv.waitKey(10000)
```

The result was dramatically faster — the sluggishness completely disappeared.

**Why?** Our mask is typically **200×200** pixels; the source image is **1960×1080**. That's roughly a **50× difference** in pixel count per operation. Multiply that by tens of thousands of images processed per hour, and a 50× per-frame inefficiency becomes very significant in aggregate.

Write code that respects efficiency. End of rant.

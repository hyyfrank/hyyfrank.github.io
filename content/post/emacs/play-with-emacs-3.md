---
title: "[Emacs] Play With Emacs(三)"
date: 2020-09-12T23:03:48+08:00
lastmod: 2020-09-22T23:03:48+08:00
draft: true
tags: ["emacs"]
categories: ["backend","technology"]
---

## emacs循序渐进
* 基本设置如下
[emacs setting](https://github.com/hyyfrank/emacsconfig.git)

1. org mode除了可以写备忘录，TODO,还可以做其他的
    * org文件来管理emacs的配置
    * org文件可以用reveal.js做成ppt
    * org文件可以直接eval出来结果并显示出来
    * pandoc可以在不同文件格式转换，包括org
    ```lisp
    (use-package org-bullets
        :ensure t
        :config
        (add-hook 'org-mode-hook (lambda () (org-bullets-mode 1))))
    ```
2. Ace window
    * 不同子窗口切换的时候，会有个窗口编号，方便切换
    ```lisp
    (use-package ace-window
        :ensure t
        :config
        (setq aw-scope 'frame) ;; was global
        (global-set-key (kbd "C-x O") 'other-frame)
        (global-set-key [remap other-window] 'ace-window))
    ```
3. Swiper
    * 方便导航和搜索
    ```lisp
    (use-package counsel
        :ensure t
        )

        (use-package swiper
        :ensure try
        :config
        (progn
        (ivy-mode 1)
        (setq ivy-use-virtual-buffers t)
        (global-set-key "\C-s" 'swiper)
        (global-set-key (kbd "C-c C-r") 'ivy-resume)
        (global-set-key (kbd "<f6>") 'ivy-resume)
        (global-set-key (kbd "M-x") 'counsel-M-x)
        (global-set-key (kbd "C-x C-f") 'counsel-find-file)
        (global-set-key (kbd "<f1> f") 'counsel-describe-function)
        (global-set-key (kbd "<f1> v") 'counsel-describe-variable)
        (global-set-key (kbd "<f1> l") 'counsel-load-library)
        (global-set-key (kbd "<f2> i") 'counsel-info-lookup-symbol)
        (global-set-key (kbd "<f2> u") 'counsel-unicode-char)
        (global-set-key (kbd "C-c g") 'counsel-git)
        (global-set-key (kbd "C-c j") 'counsel-git-grep)
        (global-set-key (kbd "C-c k") 'counsel-ag)
        (global-set-key (kbd "C-x l") 'counsel-locate)
        (global-set-key (kbd "C-S-o") 'counsel-rhythmbox)
        (define-key read-expression-map (kbd "C-r") 'counsel-expression-history)
        ))
    ```
4. Python Support
    * FLY CHCK
    * JEDI
    * AUTO-COMPLETED
    * Yasnippet
    ```lisp
        (use-package flycheck
            :ensure t
            :init
            (global-flycheck-mode t))
        
        (use-package jedi
            :ensure t
            :init
            (add-hook 'python-mode-hook 'jedi:setup)
            (add-hook 'python-mode-hook 'jedi:ac-setup))

            (use-package elpy
            :ensure t
            :config
            (elpy-enable))

        (use-package auto-complete
            :ensure t
            :init
            (progn
                (ac-config-default)
                (global-auto-complete-mode t)
            ))

        (use-package yasnippet
            :ensure t
            :init
            (yas-global-mode 1))


    ```

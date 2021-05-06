---
title: 求指数的另一种算法
date: 2020-4-2 20:34:00
author: hyyfrank
cover: false
top: false
categories: 后端
tags:
  - algorithms
---

# 从一道算法题开始
  * Problem: Implement pow(x, n), which calculates x raised to the power n (i.e., xn).
  * Solution 1 as below, 这个是最直观的可以想到的方法了
  ```c++
  class Solution {
    public:
    double myPow(double x, int n) {
       if(x == 1.0) return 1;
       if(n == 0) return 1;
       if(n<0){
         n = -n;
         x = 1/x;
       }
       return (n%2 == 0) ? pow(x*x, n/2) : x*pow(x*x, n/2);
    }
  }
  ```
  * Solution2,有趣的解法是在一篇论文中看到的，分享下，感觉也蛮优雅的
  ```c++
  class Solution {
    public:
        double myPow(double x, int n) {
            bool isNegative = false;
            if(x == 1.0) return 1;
            if(n == 0){return 1;}
            if(n<0) {isNegative = true;}
            if(isNegative){n=abs(n);}
            double P;
            while((n&1)==0){//even for this bit
                x = x*x;
                n>>=1;
            }
            P = x;
            n>>=1;
            while(n>0){
                x = x * x;
                if((n&1)!=0){P = P * x;}
                n>>=1;
            }
            return isNegative? 1/P:P;
        }
    };
  ```
  按位运算，也是很强了，奇码共赏析！！！




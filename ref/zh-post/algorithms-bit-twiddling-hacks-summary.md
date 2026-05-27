---
title: "Bit Twiddling Hacks 常用位运算技巧总结"
date: 2026-05-27T22:15:00+08:00
lastmod: 2026-05-27T22:35:00+08:00
draft: false
tags: ["algorithm", "bit", "bit-hacks", "cpp"]
categories: ["algorithm"]
---

# Bit Twiddling Hacks 常用位运算技巧总结

来源整理自 [Bit Twiddling Hacks](https://graphics.stanford.edu/~seander/bithacks.html)，这里只归纳工程里最常见、最实用的一批技巧。  
风格保持和 `common-algorithm-patterns.md` 一致：每个技巧只保留 **解释** + **代码框架（C++）**。

## 0) 使用前提（很重要）

### 解释
位运算技巧很依赖整数表示和移位语义。为了减少未定义行为和平台差异：
- 优先使用 `uint32_t/uint64_t` 等无符号类型做位运算。
- 右移有符号负数在标准里是实现定义（不同编译器/架构可能不同）。
- 涉及溢出的表达式（如 `x - y`）要先考虑范围。

### 代码框架
```cpp
#include <bit>
#include <cstdint>
#include <limits>

using u32 = uint32_t;
using u64 = uint64_t;
using i32 = int32_t;
```

## 1) 判断符号 / 是否异号

### 解释
- 符号：常见返回 `-1/0/1` 三值。
- 异号：两个数符号位不同，则 `x ^ y` 的最高位为 1（在补码机器上很常用）。

### 代码框架
```cpp
#include <cstdint>

int sign3(int x) {
    // 返回 -1 / 0 / 1，分支少且可读性高
    return (x > 0) - (x < 0);
}

bool oppositeSigns(int x, int y) {
    // 常见位技巧（依赖补码/符号位语义）
    return (x ^ y) < 0;
}
```

## 2) 无分支 abs / min / max

### 解释
这类写法常见于追求分支预测稳定性的场景。现代编译器对普通 `std::abs/std::min/std::max` 也很强，实战要基准测试后再决定是否上 hack。

### 代码框架
```cpp
#include <cstdint>

int absNoBranch(int v) {
    int mask = v >> 31;          // 若 v<0，mask 全1；否则全0（实现相关）
    return (v ^ mask) - mask;    // 或 (v + mask) ^ mask
}

int minNoBranch(int x, int y) {
    return y ^ ((x ^ y) & -(x < y));
}

int maxNoBranch(int x, int y) {
    return x ^ ((x ^ y) & -(x < y));
}
```

## 3) 判断 2 的幂 / 提取 lowbit

### 解释
- `x & (x - 1)` 会清掉最低位的 1。
- 因此 `x != 0 && (x & (x - 1)) == 0` 表示只有一位为 1，即 2 的幂。
- `x & -x` 可提取最低位 1（Fenwick 树等常用）。

### 代码框架
```cpp
#include <cstdint>

bool isPowerOfTwo(uint32_t x) {
    return x && ((x & (x - 1)) == 0);
}

uint32_t lowbit(uint32_t x) {
    return x & (~x + 1); // 等价于 x & -x
}
```

## 3.5) 异或核心恒等式（`a ^ a = 0`）与两道高频题模板

### 解释
`ref/fucking-algorithm/算法思维系列/常用的位操作.md` 里非常强调这一组性质，它确实是算法题高频：
- `a ^ a = 0`
- `a ^ 0 = a`
- 异或满足交换律/结合律  

这三条足够解决大量“成对出现 + 一个落单”类题目。

### 代码框架
```cpp
#include <vector>
using namespace std;

int singleNumber(const vector<int>& nums) {
    int x = 0;
    for (int v : nums) x ^= v;
    return x;
}

int missingNumber(const vector<int>& nums) {
    // nums 长度为 n，元素应覆盖 [0..n] 且缺一个
    int n = (int)nums.size();
    int x = n;
    for (int i = 0; i < n; ++i) {
        x ^= i ^ nums[i];
    }
    return x;
}
```

## 3.6) `index & (len - 1)` 环形数组技巧

### 解释
你引用的那篇里这个技巧也很实用：当 `len` 是 2 的幂时，`index & (len - 1)` 等价于 `index % len`。  
适合 ring buffer / 循环数组热路径。若 `len` 不是 2 的幂，这个技巧不成立。

### 代码框架
```cpp
#include <cassert>
#include <cstdint>
#include <vector>
using namespace std;

bool isPowerOfTwo(size_t x) {
    return x && ((x & (x - 1)) == 0);
}

int circularAt(const vector<int>& arr, int64_t index) {
    size_t n = arr.size();
    assert(isPowerOfTwo(n)); // 前提条件
    size_t pos = static_cast<size_t>(index) & (n - 1);
    return arr[pos];
}
```

## 4) 条件置位 / 清位 / 按掩码合并

### 解释
这类技巧用于“按条件更新某些位”，避免 `if` 分支。

### 代码框架
```cpp
#include <cstdint>

uint32_t setOrClearByFlag(uint32_t w, uint32_t mask, bool flag) {
    // flag=true -> 置位；false -> 清位
    // 常见分支消除写法
    return (w & ~mask) | (static_cast<uint32_t>(-static_cast<int>(flag)) & mask);
}

uint32_t mergeByMask(uint32_t a, uint32_t b, uint32_t mask) {
    // mask 为 1 的位来自 b，否则来自 a
    return (a & ~mask) | (b & mask);
}
```

## 4.5) 位掩码状态操作（增删查改）

### 解释
在子集枚举、DP 状压、权限位里是必备模板：
- 查第 k 位
- 置 1 / 清 0 / 翻转
- 清除最低位 1

### 代码框架
```cpp
#include <cstdint>

bool testBit(uint32_t x, int k) {
    return (x >> k) & 1u;
}

uint32_t setBit(uint32_t x, int k) {
    return x | (1u << k);
}

uint32_t clearBit(uint32_t x, int k) {
    return x & ~(1u << k);
}

uint32_t toggleBit(uint32_t x, int k) {
    return x ^ (1u << k);
}

uint32_t clearLowestOne(uint32_t x) {
    return x & (x - 1);
}
```

## 5) 统计 1 的个数（popcount）

### 解释
最常用两种：
1) Kernighan：每轮消一个 1，复杂度和 1 的个数相关。  
2) `std::popcount`：C++20 标准库，通常会映射到 CPU 指令。

### 代码框架
```cpp
#include <bit>
#include <cstdint>

int popcountKernighan(uint32_t x) {
    int cnt = 0;
    while (x) {
        x &= (x - 1);
        ++cnt;
    }
    return cnt;
}

int popcountStd(uint32_t x) {
    return std::popcount(x);
}
```

## 6) 奇偶校验（parity）

### 解释
`parity = popcount(x) % 2`。  
可用折叠异或快速压缩到 1 bit。

### 代码框架
```cpp
#include <cstdint>

int parity32(uint32_t x) {
    x ^= x >> 16;
    x ^= x >> 8;
    x ^= x >> 4;
    x ^= x >> 2;
    x ^= x >> 1;
    return x & 1; // 1=奇数个1，0=偶数个1
}
```

## 7) 末尾 0 个数（ctz）/ 最高位位置（log2）

### 解释
- `ctz` 常用于位图、稀疏状态、lowbit 跳转。
- `floor(log2(x))` 本质是最高位 1 的位置。
- 推荐 `std::countr_zero` / `std::bit_width`（C++20）。

### 代码框架
```cpp
#include <bit>
#include <cstdint>

int ctz32(uint32_t x) {
    if (x == 0) return 32; // 约定返回位宽
    return std::countr_zero(x);
}

int floorLog2(uint32_t x) {
    // x > 0
    return std::bit_width(x) - 1;
}
```

## 8) 向上取整到最近 2 的幂

### 解释
经典“位扩散”技巧：先把最高位 1 右边全部填满，再 +1。

### 代码框架
```cpp
#include <cstdint>

uint32_t roundUpPow2(uint32_t x) {
    if (x <= 1) return 1;
    --x;
    x |= x >> 1;
    x |= x >> 2;
    x |= x >> 4;
    x |= x >> 8;
    x |= x >> 16;
    return x + 1;
}
```

## 9) 位反转（bit reverse）

### 解释
常见于 FFT/图像/编码场景。  
简单写法是逐位搬运；追求极致性能可用查表或并行交换技巧。

### 代码框架
```cpp
#include <cstdint>

uint32_t reverseBits32(uint32_t x) {
    uint32_t r = 0;
    for (int i = 0; i < 32; ++i) {
        r = (r << 1) | (x & 1u);
        x >>= 1;
    }
    return r;
}
```

## 10) 字（word）内字节检测（zero-byte trick）

### 解释
在一个 32/64 位整数里并行判断“某字节是否为 0”，常用于字符串扫描优化。  
经典式：`((x - 0x0101...) & ~x & 0x8080...) != 0`

### 代码框架
```cpp
#include <cstdint>

bool hasZeroByte(uint32_t x) {
    return ((x - 0x01010101u) & ~x & 0x80808080u) != 0;
}
```

## 11) 模 2^s 与模 (2^s - 1)

### 解释
- `x % (1 << s)` 可直接用掩码：`x & ((1<<s)-1)`。
- `% (2^s - 1)` 有折叠求和技巧（页面有多版本），常见于特定编码/校验优化。

### 代码框架
```cpp
#include <cstdint>

uint32_t modPow2(uint32_t x, unsigned s) {
    return x & ((1u << s) - 1u);
}

uint32_t modPow2Minus1(uint32_t x, unsigned s) {
    // 通用折叠框架（非最优版，重在思路）
    uint32_t d = (1u << s) - 1u;
    while (x > d) {
        x = (x & d) + (x >> s);
    }
    return (x == d) ? 0 : x;
}
```

## 12) 下一个同 1 个数的排列（snoob）

### 解释
给定一个 bitmask，求字典序下一个且“1 的个数相同”的 bitmask。  
组合枚举、子集状态迭代里非常有用。

### 代码框架
```cpp
#include <cstdint>

uint32_t nextBitPermutation(uint32_t v) {
    uint32_t c = v & -v;
    uint32_t r = v + c;
    if (r == 0) return 0; // 溢出，无下一个
    return (((r ^ v) >> 2) / c) | r;
}
```

## 13) 实战建议：优先标准库，再用 hacks

### 解释
`bithacks` 的核心价值是“理解位级等价变换”。但工程上推荐：
1) 先写可读版本；  
2) 优先 `std::popcount/std::countr_zero/std::bit_width`；  
3) 只在性能瓶颈处引入 hack，并附注释和基准测试结果。

### 代码框架
```cpp
// 1) baseline 可读实现
// 2) profiler 发现热点
// 3) 替换成位技巧或 intrinsic
// 4) 基准测试 + 单元测试（边界值：0、INT_MIN、全1、单bit）
```


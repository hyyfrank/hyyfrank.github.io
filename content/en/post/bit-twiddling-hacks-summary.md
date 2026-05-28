---
title: "Bit Twiddling Hacks Summary"
date: 2026-05-27T22:40:00+08:00
lastmod: 2026-05-27T22:40:00+08:00
draft: false
tags: ["algorithm", "bit", "bit-hacks", "cpp"]
categories: ["algorithm"]
aliases:
  - /post/algorithms/bit-twiddling-hacks-summary/
---

# Bit Twiddling Hacks Summary

## 0) Preconditions and Portability

### Explanation
Bit hacks are highly sensitive to integer representation and shift semantics:
- Prefer unsigned fixed-width types like `uint32_t` / `uint64_t`.
- Right-shifting negative signed values is implementation-defined.
- Be careful with overflow-prone expressions such as `x - y`.

### Code Framework
```cpp
#include <bit>
#include <cstdint>
#include <limits>

using u32 = uint32_t;
using u64 = uint64_t;
using i32 = int32_t;
```

## 1) Sign and Opposite-Sign Detection

### Explanation
- Sign extraction is often normalized to `-1 / 0 / 1`.
- Two values have opposite signs when their sign bits differ.

### Code Framework
```cpp
int sign3(int x) {
    return (x > 0) - (x < 0); // -1 / 0 / 1
}

bool oppositeSigns(int x, int y) {
    return (x ^ y) < 0;
}
```

## 2) Branchless abs / min / max

### Explanation
Useful when branch misprediction is expensive, but always benchmark against normal standard-library versions first.

### Code Framework
```cpp
int absNoBranch(int v) {
    int mask = v >> 31;          // implementation-dependent for signed right shift
    return (v ^ mask) - mask;
}

int minNoBranch(int x, int y) {
    return y ^ ((x ^ y) & -(x < y));
}

int maxNoBranch(int x, int y) {
    return x ^ ((x ^ y) & -(x < y));
}
```

## 3) Power of Two and Lowbit

### Explanation
- `x & (x - 1)` clears the least significant set bit.
- A power of two has exactly one set bit.
- `x & -x` extracts the lowest set bit.

### Code Framework
```cpp
#include <cstdint>

bool isPowerOfTwo(uint32_t x) {
    return x && ((x & (x - 1)) == 0);
}

uint32_t lowbit(uint32_t x) {
    return x & (~x + 1); // same as x & -x
}
```

## 3.5) XOR Identity Templates (`a ^ a = 0`)

### Explanation
For many interview problems, these identities are enough:
- `a ^ a = 0`
- `a ^ 0 = a`
- XOR is associative and commutative

### Code Framework
```cpp
#include <vector>
using namespace std;

int singleNumber(const vector<int>& nums) {
    int x = 0;
    for (int v : nums) x ^= v;
    return x;
}

int missingNumber(const vector<int>& nums) {
    int n = (int)nums.size();
    int x = n;
    for (int i = 0; i < n; ++i) {
        x ^= i ^ nums[i];
    }
    return x;
}
```

## 3.6) Ring Indexing via `index & (len - 1)`

### Explanation
When `len` is a power of two, `index & (len - 1)` is equivalent to `index % len`, often used in ring buffers.

### Code Framework
```cpp
#include <cassert>
#include <cstdint>
#include <vector>
using namespace std;

bool isPow2(size_t n) {
    return n && ((n & (n - 1)) == 0);
}

int circularAt(const vector<int>& arr, int64_t index) {
    const size_t n = arr.size();
    assert(isPow2(n));
    size_t pos = static_cast<size_t>(index) & (n - 1);
    return arr[pos];
}
```

## 4) Conditional Bit Set/Clear and Mask Merge

### Explanation
These are common branch-elimination patterns for partial bit updates.

### Code Framework
```cpp
#include <cstdint>

uint32_t setOrClearByFlag(uint32_t w, uint32_t mask, bool flag) {
    return (w & ~mask) | (static_cast<uint32_t>(-static_cast<int>(flag)) & mask);
}

uint32_t mergeByMask(uint32_t a, uint32_t b, uint32_t mask) {
    return (a & ~mask) | (b & mask);
}
```

## 4.5) Bitmask State Operations

### Explanation
Essential toolbox for state compression and subset DP:
- test / set / clear / toggle
- clear lowest set bit

### Code Framework
```cpp
#include <cstdint>

bool testBit(uint32_t x, int k) { return (x >> k) & 1u; }
uint32_t setBit(uint32_t x, int k) { return x | (1u << k); }
uint32_t clearBit(uint32_t x, int k) { return x & ~(1u << k); }
uint32_t toggleBit(uint32_t x, int k) { return x ^ (1u << k); }
uint32_t clearLowestOne(uint32_t x) { return x & (x - 1); }
```

## 5) Popcount

### Explanation
- Kernighan method: loops by number of set bits.
- `std::popcount`: preferred C++20 API.

### Code Framework
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

## 6) Parity

### Explanation
Parity is `popcount(x) % 2`, often reduced via XOR folding.

### Code Framework
```cpp
#include <cstdint>

int parity32(uint32_t x) {
    x ^= x >> 16;
    x ^= x >> 8;
    x ^= x >> 4;
    x ^= x >> 2;
    x ^= x >> 1;
    return x & 1;
}
```

## 7) CTZ and Log2

### Explanation
- CTZ (count trailing zeros) is common in sparse-bit iteration.
- `floor(log2(x))` is the highest set-bit index.

### Code Framework
```cpp
#include <bit>
#include <cstdint>

int ctz32(uint32_t x) {
    if (x == 0) return 32;
    return std::countr_zero(x);
}

int floorLog2(uint32_t x) {
    return std::bit_width(x) - 1; // x > 0
}
```

## 8) Round Up to Next Power of Two

### Explanation
Classic bit spreading: fill all bits right of MSB, then add one.

### Code Framework
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

## 9) Bit Reverse

### Explanation
Used in FFT and encoding contexts. Simple per-bit loop is portable and clear.

### Code Framework
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

## 10) Zero-Byte Detection in a Word

### Explanation
A classic trick to check if any byte in a word is zero.

### Code Framework
```cpp
#include <cstdint>

bool hasZeroByte(uint32_t x) {
    return ((x - 0x01010101u) & ~x & 0x80808080u) != 0;
}
```

## 11) Mod by `2^s` and by `(2^s - 1)`

### Explanation
- `% (1 << s)` can be replaced with bitmasking.
- `% (2^s - 1)` often uses fold-and-add strategies.

### Code Framework
```cpp
#include <cstdint>

uint32_t modPow2(uint32_t x, unsigned s) {
    return x & ((1u << s) - 1u);
}

uint32_t modPow2Minus1(uint32_t x, unsigned s) {
    uint32_t d = (1u << s) - 1u;
    while (x > d) {
        x = (x & d) + (x >> s);
    }
    return (x == d) ? 0 : x;
}
```

## 12) Next Bit Permutation with Same Popcount

### Explanation
Given a bitmask, compute the next larger mask with the same number of set bits.

### Code Framework
```cpp
#include <cstdint>

uint32_t nextBitPermutation(uint32_t v) {
    uint32_t c = v & -v;
    uint32_t r = v + c;
    if (r == 0) return 0;
    return (((r ^ v) >> 2) / c) | r;
}
```

## 13) Practical Guidance

### Explanation
1) Start with readable baseline code.  
2) Prefer C++20 `<bit>` APIs where possible.  
3) Introduce hacks only in measured hotspots.  
4) Test edge cases: `0`, all-ones, single-bit, `INT_MIN`.

### Code Framework
```cpp
// baseline -> profile -> optimize -> benchmark -> keep tests
```


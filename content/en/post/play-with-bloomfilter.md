---
title: "[Autodesk] Play With Bloom Filter"
date: 2020-08-07T11:38:41+08:00
lastmod: 2020-08-07T11:38:41+08:00
draft: false
tags: ["bigdata", "bloomfilter", "cache", "algorithm"]
categories: ["technology"]
aliases:
  - /post/autodesk/play-with-bloomfilter/
---

## What Is a Bloom Filter?

A Bloom filter is a space-efficient probabilistic data structure used to test whether an element is a member of a set. When an element is added, it is hashed by **K independent hash functions**, each mapping the element to a position in a bit array, which is then set to `1`.

To query membership, the same K positions are checked:
- If **any bit is 0** → the element is **definitely not** in the set.
- If **all bits are 1** → the element is **probably** in the set (false positives are possible).

The key difference from a single-hash bitmap: using K hash functions spreads the load and significantly reduces collision probability.

![bloomfilter](/images/bloomfilter.jpg)

---

## Cache Penetration

**Cache penetration** occurs when requests for non-existent keys bypass the cache entirely and hit the database on every call. A Bloom filter is a classic solution: check the filter first, and if the element is definitely absent, return early without touching the database.

---

## Limitations of Bloom Filters

The speed and space efficiency come with two trade-offs:

1. **False positives** — An element that was never inserted may still pass the membership check if all K bit positions happen to be set by other elements. One mitigation: maintain a separate whitelist for elements known to produce false positives.

2. **No deletion** — Setting a bit back to `0` would affect other elements that share that position. If deletion is required, use a **Counting Bloom Filter** instead, which stores counters rather than single bits.

---

## How I Implemented It (Node.js)

```javascript
const hashers = (value, times) => {
  const hash = crypto.createHash('sha1').update(value).digest();
  const h1 = hash.readUInt32BE(8);
  const h2 = hash.readUInt32BE(12);
  const hashes = [];
  // Two hash functions are sufficient to implement a Bloom filter
  // without loss in asymptotic false-positive probability.
  for (let i = 1; i <= times; i++) {
    hashes.push(h1 + h2 * i);
  }
  return hashes;
};

class BloomFilter {
  constructor({ cache, size = 1000000, errorRate = 0.005 }) {
    if (cache) {
      const [mark, m, k, e, bits] = cache;
      this._m = m;
      this._k = k;
      this._e = e;
      this._bits = new Bits(0, bits);
    } else {
      this._m = Math.round((-1 * size * Math.log(errorRate)) / LN2_SQUARE);
      if (this._m % BYTE_LEN) {
        this._m += BYTE_LEN - (this._m % BYTE_LEN);
      }
      this._k = Math.max(1, Math.round((this._m / size) * Math.LN2));
      this._e = errorRate;
      this._bits = new Bits();
    }
  }

  add(value) {
    if (isInteger(value)) {
      this._bits.set(value);
    } else {
      hashers(value, this._k).forEach(_ => this._bits.set(_ % this._m));
    }
    return this;
  }

  has(value) {
    if (isInteger(value)) {
      return this._bits.get(value);
    }
    return hashers(value, this._k).every(_ => this._bits.get(_ % this._m));
  }
}

module.exports = BloomFilter;
```

---

## Summary

- Java's **Guava** library ships a ready-to-use Bloom filter implementation.
- The hash function above follows the double-hashing technique described in the referenced paper — only two hash functions are needed to achieve optimal false-positive rates.

**Reference:** [Less Hashing, Same Performance — Kirsch & Mitzenmacher (2008)](https://www.eecs.harvard.edu/~michaelm/postscripts/rsa2008.pdf)

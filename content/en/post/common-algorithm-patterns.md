---
title: "Common Algorithm Patterns"
date: 2026-05-27T22:02:00+08:00
lastmod: 2026-05-27T22:02:00+08:00
draft: false
tags: ["algorithm", "template"]
categories: ["algorithm"]
aliases:
  - /post/algorithms/common-algorithm-patterns/
---

# Common Algorithm Patterns
Each pattern has only two parts: **Explanation** + **Code Framework**.

## 1) Framework Thinking (Traversal First)

### Explanation
Most problems are traversal problems in disguise: arrays, linked lists, trees, graphs.  
Identify the data structure first, then pick traversal order, then fill business logic into the skeleton.

### Code Framework
```cpp
#include <vector>
using namespace std;

struct ListNode {
    int val;
    ListNode* next;
};

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
};

void processValue(int x) {
    // TODO: business logic
    (void)x;
}

void traverseArray(const vector<int>& nums) {
    for (int i = 0; i < (int)nums.size(); ++i) {
        processValue(nums[i]);
    }
}

void traverseList(ListNode* head) {
    for (ListNode* p = head; p != nullptr; p = p->next) {
        processValue(p->val);
    }
}

void traverseTree(TreeNode* root) {
    if (root == nullptr) return;
    // Pre-order
    processValue(root->val);
    traverseTree(root->left);
    traverseTree(root->right);
    // Post-order
}
```

## 2) Binary Search (Shrink Search Space)

### Explanation
Use binary search when monotonicity exists.  
The key is consistency: interval definition + boundary update rules.

### Code Framework
```cpp
#include <vector>
using namespace std;

int binarySearch(const vector<int>& nums, int target) {
    int left = 0, right = (int)nums.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}

int leftBound(const vector<int>& nums, int target) {
    int left = 0, right = (int)nums.size(); // [left, right)
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] >= target) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }
    if (left >= (int)nums.size() || nums[left] != target) return -1;
    return left;
}
```

## 3) BFS (Minimum Steps / Layer Expansion)

### Explanation
BFS explores level by level, so it naturally solves minimum-step problems on unweighted graphs.  
The main difficulty is usually state modeling, not BFS itself.

### Code Framework
```cpp
#include <queue>
#include <unordered_set>
#include <vector>
using namespace std;

vector<int> neighbors(int state) {
    // TODO: generate adjacent states
    return {};
}

int bfsMinStep(int start, int target) {
    queue<int> q;
    unordered_set<int> visited;
    q.push(start);
    visited.insert(start);
    int step = 0;

    while (!q.empty()) {
        int sz = (int)q.size();
        for (int i = 0; i < sz; ++i) {
            int cur = q.front();
            q.pop();
            if (cur == target) return step;
            for (int nxt : neighbors(cur)) {
                if (!visited.count(nxt)) {
                    visited.insert(nxt);
                    q.push(nxt);
                }
            }
        }
        ++step;
    }
    return -1;
}
```

## 4) Bidirectional BFS

### Explanation
Expand from both start and target. Stop when frontiers meet.  
Usually faster than single-source BFS in large state spaces.

### Code Framework
```cpp
#include <unordered_set>
#include <vector>
using namespace std;

vector<int> neighbors(int state) {
    // TODO: generate adjacent states
    return {};
}

int bidirectionalBfs(int start, int target) {
    if (start == target) return 0;

    unordered_set<int> front{start}, back{target}, visited{start, target};
    int step = 0;

    while (!front.empty() && !back.empty()) {
        if (front.size() > back.size()) swap(front, back);
        unordered_set<int> nextFront;

        for (int cur : front) {
            if (back.count(cur)) return step;
            for (int nxt : neighbors(cur)) {
                if (!visited.count(nxt)) {
                    visited.insert(nxt);
                    nextFront.insert(nxt);
                }
            }
        }
        front = move(nextFront);
        ++step;
    }
    return -1;
}
```

## 5) Backtracking (Decision Tree Enumeration)

### Explanation
Core cycle: choose -> recurse -> undo.  
Best for permutations/combinations/subsets/constraint search.

### Code Framework
```cpp
#include <vector>
using namespace std;

vector<vector<int>> result;
vector<int> path;
vector<int> used;

bool isValid(int choice) {
    // TODO: pruning rule
    (void)choice;
    return true;
}

void backtrack(const vector<int>& nums) {
    if ((int)path.size() == (int)nums.size()) {
        result.push_back(path);
        return;
    }
    for (int i = 0; i < (int)nums.size(); ++i) {
        if (used[i]) continue;
        if (!isValid(nums[i])) continue;
        path.push_back(nums[i]);
        used[i] = 1;
        backtrack(nums);
        used[i] = 0;
        path.pop_back();
    }
}
```

## 6) Partition Backtracking (Element View / Bucket View)

### Explanation
Two common models:
1) assign each element to one bucket;  
2) fill buckets one by one.  
Combine with pruning (sorting, overflow cutoff, symmetry pruning).

### Code Framework
```cpp
#include <algorithm>
#include <vector>
using namespace std;

bool dfsPartition(int i, const vector<int>& nums, vector<int>& bucket, int target) {
    if (i == (int)nums.size()) {
        for (int s : bucket) {
            if (s != target) return false;
        }
        return true;
    }
    for (int j = 0; j < (int)bucket.size(); ++j) {
        if (bucket[j] + nums[i] > target) continue;
        if (j > 0 && bucket[j] == bucket[j - 1]) continue;
        bucket[j] += nums[i];
        if (dfsPartition(i + 1, nums, bucket, target)) return true;
        bucket[j] -= nums[i];
    }
    return false;
}

bool canPartitionKSubsets(vector<int> nums, int k) {
    int sum = 0;
    for (int x : nums) sum += x;
    if (k <= 0 || sum % k != 0) return false;
    int target = sum / k;
    sort(nums.rbegin(), nums.rend());
    vector<int> bucket(k, 0);
    return dfsPartition(0, nums, bucket, target);
}
```

## 7) Sliding Window

### Explanation
Maintain a dynamic window `[left, right)`: expand right to find feasible answers, shrink left to optimize.  
Works well for contiguous substring/subarray constraints.

### Code Framework
```cpp
#include <climits>
#include <string>
#include <unordered_map>
using namespace std;

int slidingWindowTemplate(const string& s, const string& t) {
    unordered_map<char, int> need, window;
    for (char c : t) need[c]++;

    int left = 0, right = 0;
    int valid = 0;
    int bestLen = INT_MAX;

    while (right < (int)s.size()) {
        char c = s[right++];
        if (need.count(c)) {
            window[c]++;
            if (window[c] == need[c]) valid++;
        }

        while (valid == (int)need.size()) {
            // TODO: update your answer
            bestLen = min(bestLen, right - left);

            char d = s[left++];
            if (need.count(d)) {
                if (window[d] == need[d]) valid--;
                window[d]--;
            }
        }
    }
    return bestLen == INT_MAX ? -1 : bestLen;
}
```

## 8) Two Pointers (Fast/Slow and Left/Right)

### Explanation
- Fast/slow pointers: same direction, in-place filtering and linked-list tricks.  
- Left/right pointers: opposite direction, pairing/palindrome/reverse style problems.

### Code Framework
```cpp
#include <string>
#include <vector>
using namespace std;

bool isValidValue(int x) {
    // TODO: business condition
    return x >= 0;
}

int fastSlowFilter(vector<int>& nums) {
    int slow = 0;
    for (int fast = 0; fast < (int)nums.size(); ++fast) {
        if (isValidValue(nums[fast])) {
            nums[slow++] = nums[fast];
        }
    }
    return slow;
}

bool isPalindrome(const string& s) {
    int left = 0, right = (int)s.size() - 1;
    while (left < right) {
        if (s[left] != s[right]) return false;
        ++left;
        --right;
    }
    return true;
}
```

## 9) Prefix Sum

### Explanation
Precompute accumulations once, answer range sum queries in O(1).  
Classic space-for-time optimization.

### Code Framework
```cpp
#include <vector>
using namespace std;

struct PrefixSum1D {
    vector<long long> pre;
    explicit PrefixSum1D(const vector<int>& nums) {
        pre.assign(nums.size() + 1, 0);
        for (int i = 1; i <= (int)nums.size(); ++i) {
            pre[i] = pre[i - 1] + nums[i - 1];
        }
    }
    long long rangeSum(int l, int r) const { // [l, r]
        return pre[r + 1] - pre[l];
    }
};

struct PrefixSum2D {
    vector<vector<long long>> pre;
    explicit PrefixSum2D(const vector<vector<int>>& mat) {
        int m = (int)mat.size();
        int n = m ? (int)mat[0].size() : 0;
        pre.assign(m + 1, vector<long long>(n + 1, 0));
        for (int i = 1; i <= m; ++i) {
            for (int j = 1; j <= n; ++j) {
                pre[i][j] = pre[i - 1][j] + pre[i][j - 1] - pre[i - 1][j - 1] + mat[i - 1][j - 1];
            }
        }
    }
};
```

## 10) Difference Array

### Explanation
Best when range updates are frequent and final array is needed once.  
For adding `val` on `[l, r]`, only modify two endpoints in `diff`.

### Code Framework
```cpp
#include <vector>
using namespace std;

struct Difference {
    vector<long long> diff;
    explicit Difference(int n) : diff(n, 0) {}

    void add(int l, int r, long long val) {
        diff[l] += val;
        if (r + 1 < (int)diff.size()) diff[r + 1] -= val;
    }

    vector<long long> result() const {
        vector<long long> nums(diff.size(), 0);
        if (diff.empty()) return nums;
        nums[0] = diff[0];
        for (int i = 1; i < (int)diff.size(); ++i) {
            nums[i] = nums[i - 1] + diff[i];
        }
        return nums;
    }
};
```

## 11) Union-Find (Disjoint Set Union)

### Explanation
For dynamic connectivity: union sets and query connectivity.  
Typical optimizations: path compression + union by size/rank.

### Code Framework
```cpp
#include <vector>
using namespace std;

class UnionFind {
public:
    explicit UnionFind(int n) : parent(n), sz(n, 1) {
        for (int i = 0; i < n; ++i) parent[i] = i;
    }

    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }

    void unite(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return;
        if (sz[ra] < sz[rb]) swap(ra, rb);
        parent[rb] = ra;
        sz[ra] += sz[rb];
    }

    bool connected(int a, int b) {
        return find(a) == find(b);
    }

private:
    vector<int> parent;
    vector<int> sz;
};
```

## 12) Bit Operations

### Explanation
Great for state compression and parity/frequency tricks.  
Common identities: `n & (n - 1)`, `x ^ x = 0`, bit masking.

### Code Framework
```cpp
#include <vector>
using namespace std;

bool isBitOne(int x, int k) {
    return ((x >> k) & 1) == 1;
}

int setBit(int x, int k) {
    return x | (1 << k);
}

int clearBit(int x, int k) {
    return x & ~(1 << k);
}

int hammingWeight(unsigned int x) {
    int cnt = 0;
    while (x != 0) {
        x &= (x - 1);
        ++cnt;
    }
    return cnt;
}

int singleNumber(const vector<int>& nums) {
    int ans = 0;
    for (int v : nums) ans ^= v;
    return ans;
}
```

## 13) Matrix Traversal & Transform

### Explanation
Two high-frequency patterns:
1) geometric transforms (transpose/reverse) for rotation;  
2) boundary contraction (`top/bottom/left/right`) for spiral traversal.

### Code Framework
```cpp
#include <algorithm>
#include <vector>
using namespace std;

void rotateClockwise90(vector<vector<int>>& matrix) {
    int n = (int)matrix.size();
    for (int i = 0; i < n; ++i) {
        for (int j = i + 1; j < n; ++j) {
            swap(matrix[i][j], matrix[j][i]);
        }
    }
    for (auto& row : matrix) {
        reverse(row.begin(), row.end());
    }
}

vector<int> spiralOrder(const vector<vector<int>>& mat) {
    vector<int> ans;
    if (mat.empty() || mat[0].empty()) return ans;
    int top = 0, bottom = (int)mat.size() - 1;
    int left = 0, right = (int)mat[0].size() - 1;

    while (top <= bottom && left <= right) {
        for (int j = left; j <= right; ++j) ans.push_back(mat[top][j]);
        ++top;
        for (int i = top; i <= bottom; ++i) ans.push_back(mat[i][right]);
        --right;
        if (top <= bottom) {
            for (int j = right; j >= left; --j) ans.push_back(mat[bottom][j]);
            --bottom;
        }
        if (left <= right) {
            for (int i = bottom; i >= top; --i) ans.push_back(mat[i][left]);
            ++left;
        }
    }
    return ans;
}
```

## 14) String Multiplication (Grade-School Simulation)

### Explanation
When integers are too large for built-in numeric types, simulate multiplication digit by digit.  
The core is index mapping + carry handling.

### Code Framework
```cpp
#include <string>
#include <vector>
using namespace std;

string multiplyStrings(const string& num1, const string& num2) {
    if (num1 == "0" || num2 == "0") return "0";
    int m = (int)num1.size(), n = (int)num2.size();
    vector<int> res(m + n, 0);

    for (int i = m - 1; i >= 0; --i) {
        for (int j = n - 1; j >= 0; --j) {
            int mul = (num1[i] - '0') * (num2[j] - '0');
            int p1 = i + j, p2 = i + j + 1;
            int sum = mul + res[p2];
            res[p2] = sum % 10;
            res[p1] += sum / 10;
        }
    }

    string ans;
    int i = 0;
    while (i < (int)res.size() && res[i] == 0) ++i;
    for (; i < (int)res.size(); ++i) ans.push_back(char('0' + res[i]));
    return ans.empty() ? "0" : ans;
}
```

## 15) Fisher-Yates Shuffle

### Explanation
To make all permutations equally likely, at step `i` choose random index in `[i, n - 1]` and swap.

### Code Framework
```cpp
#include <random>
#include <vector>
using namespace std;

void shuffleArray(vector<int>& nums) {
    static random_device rd;
    static mt19937 gen(rd());
    for (int i = 0; i < (int)nums.size(); ++i) {
        uniform_int_distribution<int> dist(i, (int)nums.size() - 1);
        int j = dist(gen);
        swap(nums[i], nums[j]);
    }
}
```

## 16) Monte Carlo Validation

### Explanation
For randomized algorithms, run many trials and inspect frequency distribution.  
Not a formal proof, but very useful for sanity checks.

### Code Framework
```cpp
#include <iostream>
#include <random>
#include <string>
#include <unordered_map>
#include <vector>
using namespace std;

void shuffleArrayForCheck(vector<int>& nums) {
    static random_device rd;
    static mt19937 gen(rd());
    for (int i = 0; i < (int)nums.size(); ++i) {
        uniform_int_distribution<int> dist(i, (int)nums.size() - 1);
        int j = dist(gen);
        swap(nums[i], nums[j]);
    }
}

string stateKey(const vector<int>& arr) {
    string key;
    for (int x : arr) key += to_string(x) + ",";
    return key;
}

void monteCarloCheck(vector<int> arr, int T) {
    unordered_map<string, int> counter;
    for (int i = 0; i < T; ++i) {
        vector<int> tmp = arr;
        shuffleArrayForCheck(tmp);
        counter[stateKey(tmp)]++;
    }

    // TODO: analyze distribution in counter
    cout << "distinct states = " << counter.size() << "\n";
}
```

## 17) Pancake Sort (Constructive Recursion)

### Explanation
Move current maximum to front, then to final position, and recurse on remaining prefix.

### Code Framework
```cpp
#include <algorithm>
#include <vector>
using namespace std;

void flip(vector<int>& cakes, int i, int j) {
    while (i < j) swap(cakes[i++], cakes[j--]);
}

int indexOfMax(const vector<int>& cakes, int n) {
    int idx = 0;
    for (int i = 1; i < n; ++i) {
        if (cakes[i] > cakes[idx]) idx = i;
    }
    return idx;
}

void pancakeSortDfs(vector<int>& cakes, int n, vector<int>& ops) {
    if (n <= 1) return;
    int idx = indexOfMax(cakes, n);
    flip(cakes, 0, idx);
    ops.push_back(idx + 1);
    flip(cakes, 0, n - 1);
    ops.push_back(n);
    pancakeSortDfs(cakes, n - 1, ops);
}
```

## 18) Probability Modeling (Sample-Space First)

### Explanation
Avoid intuition traps.  
Define random process clearly, then define sample space/events, then compute with conditional/total probability.

### Code Framework
```cpp
#include <vector>
using namespace std;

struct EventCase {
    double pCase;
    double pEventGivenCase;
};

double totalProbability(const vector<EventCase>& cases) {
    double ans = 0.0;
    for (const auto& c : cases) {
        ans += c.pCase * c.pEventGivenCase;
    }
    return ans;
}

double conditionalProbability(double pEandC, double pC) {
    if (pC == 0.0) return 0.0;
    return pEandC / pC;
}
```


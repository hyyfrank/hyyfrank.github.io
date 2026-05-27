---
title: "常见算法套路"
date: 2026-05-27T21:40:00+08:00
lastmod: 2026-05-27T21:40:00+08:00
draft: false
tags: ["algorithm", "template"]
categories: ["algorithm"]
---

# 常见算法套路

## 1) 框架思维（遍历是核心）

### 解释
很多题目本质是「遍历某种结构」：数组、链表、树、图。先确定数据结构，再确定遍历顺序，最后把业务判断填进遍历骨架。

### 代码框架
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
    // TODO: 业务处理
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
    // 前序位置
    processValue(root->val);
    traverseTree(root->left);
    traverseTree(root->right);
    // 后序位置
}
```

## 2) 二分查找（缩小搜索空间）

### 解释
当问题满足单调性（答案在一边）时，用二分不断折半区间。关键在区间定义一致（闭区间或左闭右开）和边界收缩逻辑一致。

### 代码框架
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

## 3) BFS（最短步数/层序扩散）

### 解释
BFS 用队列按层扩散，天然适合「最少操作次数」「最短路径（无权图）」问题。难点通常不是 BFS 本身，而是把题目状态抽象成图节点。

### 代码框架
```cpp
#include <queue>
#include <unordered_set>
#include <vector>
using namespace std;

vector<int> neighbors(int state) {
    // TODO: 根据题意生成相邻状态
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

## 4) 双向 BFS（两头夹逼）

### 解释
从起点和终点同时扩散，当前沿相遇时结束。通常比单向 BFS 更快，适合状态空间很大、且可以反向扩展的问题。

### 代码框架
```cpp
#include <unordered_set>
#include <vector>
using namespace std;

vector<int> neighbors(int state) {
    // TODO: 根据题意生成相邻状态
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

## 5) 回溯（决策树穷举）

### 解释
回溯本质是 DFS 枚举决策树：做选择 -> 递归 -> 撤销选择。适用于排列、组合、子集、约束搜索等。

### 代码框架
```cpp
#include <vector>
using namespace std;

vector<vector<int>> result;
vector<int> path;
vector<int> used;

bool isValid(int choice) {
    // TODO: 剪枝条件
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
        path.push_back(nums[i]);   // 做选择
        used[i] = 1;
        backtrack(nums);
        used[i] = 0;               // 撤销选择
        path.pop_back();
    }
}
```

## 6) 集合划分回溯（元素视角 / 桶视角）

### 解释
划分问题常见两种建模：  
1) 元素视角：每个元素放入某个桶。  
2) 桶视角：逐个桶去装元素。  
配合剪枝（排序、超限剪枝、空桶去重）降低搜索量。

### 代码框架
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
        if (j > 0 && bucket[j] == bucket[j - 1]) continue; // 对称剪枝
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
    sort(nums.rbegin(), nums.rend()); // 常见剪枝
    vector<int> bucket(k, 0);
    return dfsPartition(0, nums, bucket, target);
}
```

## 7) 滑动窗口（子串/子数组线性扫描）

### 解释
核心是维护一个可变窗口 `[left, right)`：右指针扩张找可行解，左指针收缩优化答案。适用于连续区间问题，常配计数器/哈希表。

### 代码框架
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
            // TODO: 这里更新业务答案
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

## 8) 双指针（快慢 / 左右）

### 解释
双指针用两个位置变量协同遍历：  
- 快慢指针：同向，常用于去重、原地删除、链表判环。  
- 左右指针：相向，常用于有序数组配对、回文判断、反转。

### 代码框架
```cpp
#include <string>
#include <vector>
using namespace std;

bool isValidValue(int x) {
    // TODO: 业务判断
    return x >= 0;
}

int fastSlowFilter(vector<int>& nums) {
    int slow = 0;
    for (int fast = 0; fast < (int)nums.size(); ++fast) {
        if (isValidValue(nums[fast])) {
            nums[slow++] = nums[fast];
        }
    }
    return slow; // [0, slow) 有效
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

## 9) 前缀和（快速求区间和）

### 解释
预处理累加信息后，用 O(1) 代价查询区间和。典型是「空间换时间」；一维和二维都适用。

### 代码框架
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

## 10) 差分数组（区间增减高效更新）

### 解释
当「区间修改很多、最后统一求结果」时，用差分数组。对区间 `[l, r]` 加 `val`，只改两个端点；最后做前缀和还原原数组。

### 代码框架
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

## 11) 并查集 Union-Find（连通分量）

### 解释
处理动态连通性：两个点是否连通、合并两个集合。常见优化是路径压缩 + 按秩/按大小合并。

### 代码框架
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

## 12) 位运算（状态压缩与位级技巧）

### 解释
位运算适合做集合状态压缩、快速判定、去重和奇偶性/次数问题。常用恒等式：`n & (n-1)`、`x ^ x = 0`、位掩码测试与设置。

### 代码框架
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

## 13) 矩阵花式遍历（边界控制 + 变换）

### 解释
二维题目常见两类套路：  
1) 通过几何变换（转置、翻转）完成旋转。  
2) 通过四边界 `top/bottom/left/right` 控制螺旋遍历。

### 代码框架
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

## 14) 字符串乘法（模拟竖式）

### 解释
大整数不能直接转内置整数时，按竖式逐位乘法。核心是结果数组下标映射和进位处理。

### 代码框架
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

## 15) 洗牌算法（Fisher-Yates）

### 解释
要让所有排列等概率出现，必须在第 `i` 轮从 `[i, n-1]` 中等概率选一个位置交换。常用于随机打乱数组。

### 代码框架
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

## 16) 蒙特卡罗验证（随机算法自检）

### 解释
对随机算法可用大量重复实验做统计，观察频率分布是否接近期望分布。它不是证明，但可以快速发现明显偏差。

### 代码框架
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
    for (int x : arr) {
        key += to_string(x) + ",";
    }
    return key;
}

void monteCarloCheck(vector<int> arr, int T) {
    unordered_map<string, int> counter;
    for (int i = 0; i < T; ++i) {
        vector<int> tmp = arr;
        shuffleArrayForCheck(tmp);
        counter[stateKey(tmp)]++;
    }

    // TODO: 根据 counter 做统计分析
    cout << "distinct states = " << counter.size() << "\n";
}
```

## 17) 递归排序思路：烧饼排序（翻转构造）

### 解释
把当前最大元素翻到最前，再翻到目标末尾，递归处理剩余前缀。属于「先解决一个元素，再缩小问题规模」的构造性递归套路。

### 代码框架
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

## 18) 概率问题建模（拆分样本空间）

### 解释
概率题常见误区是凭直觉。应先定义实验过程，再写清样本空间和条件事件，最后按条件概率/全概率公式计算。

### 代码框架
```cpp
#include <functional>
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
    if (pC == 0.0) return 0.0; // 或抛异常
    return pEandC / pC;
}
```

---



---
title: "VaR 回测"
date: 2026-05-28T17:25:00+08:00
lastmod: 2026-05-28T17:25:00+08:00
draft: false
math: true
tags: ["risk-management", "var", "backtesting", "ewma", "finance"]
categories: ["quant"]
---

## Task 3：VaR 回测与基于 EWMA 波动率预测的 VaR 回测

# VaR 回测
* 在大多数情况下，我们假设日收益率服从正态分布，并且按照题目要求，VaR 取 99% 置信水平。

**导入库**

```python
await __import__("piplite").install('numpy', 'scipy', 'matplotlib', 'pandas', 'tabulate')
```

```python
# hyy:fix the import failed issue
await __import__("piplite").install('tabulate')
```

```python
# hyy:fix excel issue, miss the excel read library, install here.
await __import__("piplite").install('openpyxl')
```

```python
import numpy as np
import pandas as pd
from scipy import stats
import matplotlib.pyplot as plt
from tabulate import tabulate
```

```python
# set precision
pd.set_option('display.precision', 4)
```

**加载数据**

```python
# hyy: in order to save time, load from excel via pandas is easier.
df = pd.read_excel('./res/Indices_Download_2026.xlsx')
df['Date'] = pd.to_datetime(df['Date'])
df = df.set_index('Date')
df_filtered = df.loc['2025-01-01':'2026-01-15'].copy()
sp500 = df_filtered['^GSPC'].dropna()
# take a look at the data is right or not.
sp500.head()
```

```text
Date
2025-01-02    5868.5498
2025-01-03    5942.4702
2025-01-06    5975.3799
2025-01-07    5909.0298
2025-01-08    5918.2500
Name: ^GSPC, dtype: float64
```

**数据处理**

```python
# hyy: caculate the daily return first
d_rtns = np.log(sp500 / sp500.shift(1)).dropna()

# rolling standard deviation
r_std = d_rtns.rolling(window=21).std()
# the 10D VaR

# hyy: just take a test for different cofidence_level and check the result.
# set CONFIDENCE_LEVEL 0.99, FACTOR = 2.33
# but we also test 0.95 and 0.9, FACTOR should be 1.645 and 1.28 in below.
# i take a test, when change to 0.95, bleach number 15, zone is GREEN, when change to 0.9, bleach number 16, zone is GREEN too.
# lower confidence level -> higher quantile -> more breaches
# this seems like if the confidence_level is 0.9,which is smaller than 0.99,it should have more breach point, make sense!
var_10d = -2.33 * r_std * np.sqrt(10)

# forward 10D returns
f_10_ret = np.log(sp500.shift(-10) / sp500)

# Create analysis dataframe
a_df = pd.DataFrame({
    'Close': sp500,
    'Rolling_Std': r_std,
    'VaR_10D': var_10d,
    'Forward_10D': f_10_ret
})

# Remove NaN values
a_df = a_df.dropna()

# check is breaches or not
a_df['Breach'] = (a_df['Forward_10D'] < a_df['VaR_10D']).astype(int)

a_df.head()
```

```text
                Close  Rolling_Std  VaR_10D  Forward_10D  Breach
Date                                                            
2025-02-04  6037.8799       0.0089  -0.0657       0.0174       0
2025-02-05  6061.4800       0.0086  -0.0631       0.0092       0
2025-02-06  6083.5698       0.0085  -0.0628      -0.0116       0
2025-02-07  6025.9902       0.0084  -0.0620      -0.0071       0
2025-02-10  6066.4399       0.0085  -0.0627      -0.0185       0
```

## (a) VaR 突破统计

```python
# Calculate breach statistics
breach_count = a_df['Breach'].sum()
total_comparisons = len(a_df)
breach_percentage = breach_count / total_comparisons * 100
# hyy: just take a test for different cofidence_level and check the result.
# try 0.9 and 0.95 for a quick check
# expected_breaches = total_comparisons * (1 - 0.9)
# expected_breaches = total_comparisons * (1 - 0.95)
expected_breaches = total_comparisons * (1 - 0.99)
print("Total Comparisons:", total_comparisons, "Number of Breaches:", breach_count, "Breach Percentage:", breach_percentage, "%, Expected Breaches:", expected_breaches)
```

```text
Total Comparisons: 229 Number of Breaches: 10 Breach Percentage: 4.366812227074235 %, Expected Breaches: 2.290000000000002
```

## (b) 可视化

图中展示 VaR 突破点（用叉号标记）。

![Task 3 图](/assets/images/21.png)

```python
# Create the plot one by one
# fig, axes = plt.subplots(3, 1, figsize=(14, 10), sharex=True)
# fig.suptitle('S&P500 Analysis (2025-01-01 to 2026-01-15)', fontsize=14, fontweight='bold')

# S&P Price
# ax = axes[0]
# ax.plot(a_df.index, a_df['Close'], 'b-', linewidth=1)
# ax.set_ylabel('Price')
# ax.set_title('S&P500 Price')
# ax.legend(loc='upper left')
# ax.grid(True, alpha=0.3)

# make them together seems better.
fig, (apx, ret_val, vol_val) = plt.subplots(3, 1, figsize=(12, 8))

# price
apx.plot(a_df.index, a_df['Close'])
apx.set_title('S&P500')

# return and VaR
breach_dates = a_df[a_df['Breach'] == 1].index
breach_values = a_df.loc[breach_dates, 'Forward_10D']
ret_val.plot(a_df.index, a_df['Forward_10D'], label='Forward 10D')
ret_val.plot(a_df.index, a_df['VaR_10D'], 'r--', label='VaR 99%')
ret_val.scatter(breach_dates, breach_values, c='red', marker='x', s=50)
ret_val.legend()

# volatility
vol_val.plot(a_df.index, a_df['Rolling_Std'] * 100, 'g')
vol_val.set_xlabel('Date')

plt.tight_layout()
plt.show()
```

```text
<Figure size 1200x800 with 3 Axes>
```

> [Notebook 原始输出包含图像，纯 Markdown 导出中省略。]

## (c) 交通灯区间

```python
# Calculate binomial percentiles
n_trials = total_comparisons

# hyy: just take a test for different cofidence_level and check the result.
# when i change confidence to 0.95 and 0.9, p_breach also need to change to 0.05 and 0.1 as well
# p_breach = 0.05 
# p_breach = 0.1
p_breach = 0.01

q_pG = stats.binom.ppf(0.95, n_trials, p_breach)
q_pY = stats.binom.ppf(0.9999, n_trials, p_breach)
print(q_pG)
print(q_pY)

# Determine zone
if breach_count <= q_pG:
    zone = "GREEN"
elif breach_count <= q_pY:
    zone = "YELLOW"
else:
    zone = "RED"

# Output results
print("Breaches:", breach_count, "Zone:", zone)
```

```text
5.0
10.0
Breaches: 10 Zone: YELLOW
```

```python
print(f"Period: 2025-02-04 to 2025-12-31, Total Comparisons: {total_comparisons}, Breach Count: {breach_count}, Breach Rate: {breach_percentage:}%, Traffic Light Zone: {zone}")
```

```text
Period: 2025-02-04 to 2025-12-31, Total Comparisons: 229, Breach Count: 10, Breach Rate: 4.366812227074235%, Traffic Light Zone: YELLOW
```

```python

```

---

## Task 4：基于 EWMA 波动率预测的 VaR 回测

# Task 4：基于 EWMA 波动率预测的 VaR 回测
* 99% VaR、10 日期限、正态分布假设。

**导入库**

```python
await __import__("piplite").install('numpy')
await __import__("piplite").install('scipy')
await __import__("piplite").install('matplotlib')
await __import__("piplite").install('pandas')
await __import__("piplite").install('tabulate')
await __import__("piplite").install('openpyxl')
```

```python
import numpy as np
import pandas as pd
from scipy import stats
import matplotlib.pyplot as plt
from tabulate import tabulate
```

```python
pd.set_option('display.precision', 4)
```

**加载数据**

```python
# hyy: Using pandas to load Excel directly
df = pd.read_excel('./res/Indices_Download_2026.xlsx')
df['Date'] = pd.to_datetime(df['Date'])
df = df.set_index('Date')

# filter data
df_filtered = df.loc['2025-01-01':'2026-01-15'].copy()
sp500 = df_filtered['^GSPC'].dropna()
print(f"Data loaded: {len(sp500)} observations from {sp500.index[0]} to {sp500.index[-1]}")
# take a look at the data
sp500.head()
```

```text
Data loaded: 260 observations from 2025-01-02 00:00:00 to 2026-01-15 00:00:00

Date
2025-01-02    5868.5498
2025-01-03    5942.4702
2025-01-06    5975.3799
2025-01-07    5909.0298
2025-01-08    5918.2500
Name: ^GSPC, dtype: float64
```

**数据预处理**

```python
# daily log returns
d_ret = np.log(sp500 / sp500.shift(1)).dropna()

# Calculate EWMA volatility
init_var = d_ret.var()

ewma_var = np.zeros(len(d_ret))

ewma_var[0] = init_var

for t in range(1, len(d_ret)):
    ewma_var[t] = 0.72 * ewma_var[t-1] + (1 - 0.72) * (d_ret.iloc[t] ** 2)

# Convert to volatility
ewma_vol = np.sqrt(ewma_var)

# Create series
ewma_ser = pd.Series(ewma_vol, index=d_ret.index, name='EWMA_Volatility')

# Calculate 10D VaR
var_10d = -2.33 * ewma_ser * np.sqrt(10)
var_10d.name = 'VaR_10D'

# forward 10D returns
for_rets = np.log(sp500.shift(-10) / sp500)
for_rets.name = 'Forward_10D'

a_df = pd.DataFrame({
    'Close': sp500,
    'EWMA_Volatility': ewma_ser,
    'VaR_10D': var_10d,
    'Forward_10D': for_rets
})

# NaN filter
a_df = a_df.dropna()

# Identify breaches
a_df['Breach'] = (a_df['Forward_10D'] < a_df['VaR_10D']).astype(int)

print(f"Analysis period: {a_df.index[0]} to {a_df.index[-1]}")
print(f"Total observations: {len(a_df)}")
# hyy: check some data to verify
# a_df.head()
```

```text
Analysis period: 2025-01-03 00:00:00 to 2025-12-31 00:00:00
Total observations: 249
```

## (a) VaR 突破统计

```python
breach_count = int(a_df['Breach'].sum())
total_comparisons = len(a_df)
breach_percentage = breach_count / total_comparisons * 100
expected_breaches = total_comparisons * (1 - 0.99)

print(f"Total Comparisons: {total_comparisons}, Number of Breaches: {breach_count}, Breach Percentage: {breach_percentage}%, Expected Breaches: {expected_breaches}")
```

```text
Total Comparisons: 249, Number of Breaches: 11, Breach Percentage: 4.417670682730924%, Expected Breaches: 2.490000000000002
```

## 交通灯区间

```python
n_trials = total_comparisons
p_breach = 0.01

q_pG = stats.binom.ppf(0.95, n_trials, p_breach)
q_pY = stats.binom.ppf(0.9999, n_trials, p_breach)

if breach_count <= q_pG:
    zone = "GREEN"
elif breach_count <= q_pY:
    zone = "YELLOW"
else:
    zone = "RED"

print("Breaches:", breach_count)
print("Zone:", zone)
```

```text
Breaches: 11
Zone: RED
```

## (b) 可视化

图中展示 VaR 突破点（用叉号标记）。

![Task 4 图](/assets/images/22.png)

```python
fig, axes = plt.subplots(3, 1, figsize=(12, 9), sharex=True)

# ---hyy: price ---
ax = axes[0]
ax.plot(a_df.index, a_df['Close'], label='price')
ax.set_title('S&P500')
ax.legend()
ax.grid(True)

# --- hyy: returns vs var ---
ax = axes[1]
ax.plot(a_df.index, a_df['Forward_10D'], label='fwd ret', alpha=0.7)
ax.plot(a_df.index, a_df['VaR_10D'], '--', label='VaR')
ax.axhline(0)

# breach points
bd = a_df[a_df['Breach'] == 1]
ax.scatter(bd.index, bd['Forward_10D'], marker='x', label='breach')

ax.set_title('returns vs var')
ax.legend()
ax.grid(True)

# --- ewma vol ---
ax = axes[2]
vol = a_df['EWMA_Volatility'] * 100
ax.plot(a_df.index, vol, label='ewma vol')

# hyy: mark breach
ax.scatter(a_df.index, a_df['Breach'] * 2, marker='x', label='breach')

ax.set_title('vol')
ax.legend()
ax.grid(True)

plt.xticks(rotation=45)
plt.tight_layout()
plt.show()
```

```text
<Figure size 1200x900 with 3 Axes>
```

> [Notebook 原始输出包含图像，纯 Markdown 导出中省略。]

## (c) 三种方法对比

### 结合课程讨论，可总结三种方法的优缺点：

- **历史模拟法**：不依赖**分布假设**，可体现**厚尾**；但滚动窗口长度非常关键。
- **滚动标准差法**：估计相对稳定，但对波动率结构变化响应**较慢**。
- **EWMA**：对新信息响应**更快**，但结果依赖衰减参数 **λ**。

### 从上图可以看到：
  *  **共同点**：图 2 的突破事件在图 1 所示市场下跌阶段（约 2025 年 3-4 月）明显聚集，说明三种方法都能响应风险上升，但速度不同。
  *  **滚动标准差法**：Task 3 中实现的 Rolling SD 响应更慢。观察到当极端收益在 3 月下旬逐步移出 21 日窗口后，波动率估计会突然下降，可能产生“风险缓和”的错觉。
  *  **历史模拟法** 也存在类似滞后：需要极端收益进入并填满窗口后，风险估计才会充分调整，通常需要 2-3 周。
  * **EWMA**：我的波动率图（Figure 3）显示在 2025 年 4 月压力期，EWMA 波动率可从约 1% 快速升至 5% 以上。尽管仍有正态分布假设，它在压力期风险管理中的适应性最好。Rolling SD 处于中间位置：比 EWMA 慢，又没有历史模拟法“分布无关”的优势。
### 个人结论：
风险管理方法的选择应取决于具体场景：
- 对于波动期的**实时风险监控**，EWMA 因响应快更合适。
- 对于强调稳定性的**监管报表**场景，历史模拟法可能更合适。
- Rolling SD 虽然概念简单，但在上述两类场景中优势都比较有限。

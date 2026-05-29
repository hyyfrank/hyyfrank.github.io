---
title: "期权定价"
date: 2026-05-28T16:01:00+08:00
lastmod: 2026-05-28T16:01:00+08:00
draft: false
math: true
tags: ["quant", "monte-carlo", "options", "numerical-methods", "finance"]
categories: ["quant"]
---

# 使用蒙特卡洛模拟对欧式与二元期权定价

## 1. 引言

本文在风险中性框架下，使用蒙特卡洛模拟研究欧式看涨期权与二元看涨期权的定价问题。根据资产定价基本定理，期权价值 $V(S,t)$ 等于风险中性测度 $\mathbb{Q}$ 下贴现支付的期望：

$$V(S, t) = e^{-r(T-t)} \mathbb{E}^\mathbb{Q} [\text{Payoff}(S_T)]$$

假设标的资产价格服从几何布朗运动（GBM），其随机微分方程（SDE）为：
$$dS_t = r S_t dt + \sigma S_t dW_t$$
其中，$r$ 为无风险利率，$\sigma$ 为波动率，$dW_t$ 为维纳过程增量。

为模拟资产路径，本文采用三种数值方法：
1. **Euler-Maruyama 方法**：一阶离散近似。
   $$S_{t+\Delta t} = S_t + r S_t \Delta t + \sigma S_t \sqrt{\Delta t} Z$$
2. **Milstein 方法**：包含 Itô 展开修正的高阶近似。
   $$S_{t+\Delta t} = S_t + r S_t \Delta t + \sigma S_t \sqrt{\Delta t} Z + \frac{1}{2}\sigma^2 S_t \Delta t (Z^2 - 1)$$
3. **GBM 闭式解**：该 SDE 的精确终值解。
   $$S_T = S_0 \exp\left((r - \frac{1}{2}\sigma^2)T + \sigma \sqrt{T} Z\right)$$

此外，我们考察了 **对偶变量法（Antithetic Variates）** 与 **控制变量法（Control Variates）** 两种方差缩减技术。

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy.stats import norm
from IPython.display import display

# Environment & Base Parameters
plt.style.use('ggplot')
np.random.seed(42) 

S0_base, E_base, T_base, sigma_base, r_base = 100.0, 100.0, 1.0, 0.20, 0.05
N_paths, M_steps = 100000, 252 

# Black-Scholes Benchmark & Payoffs
def bs_euro_call(S0, E, T, r, sigma):
    d1 = (np.log(S0 / E) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    return S0 * norm.cdf(d1) - E * np.exp(-r * T) * norm.cdf(d2)

def bs_bina_call(S0, E, T, r, sigma):
    d1 = (np.log(S0 / E) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    return np.exp(-r * T) * norm.cdf(d2)

def payoff_euro(ST, E): return np.maximum(ST - E, 0)
def payoff_bina(ST, E): return np.where(ST > E, 1.0, 0.0)

# Monte Carlo Engines
def simulate_paths(S0, T, r, sigma, N, M, method='closed'):
    dt = T / M; ST = np.full(N, S0)
    if method == 'closed':
        ST = S0 * np.exp((r - 0.5 * sigma**2) * T + sigma * np.sqrt(T) * np.random.standard_normal(N))
    elif method == 'euler':
        for _ in range(M): ST += r * ST * dt + sigma * ST * np.sqrt(dt) * np.random.standard_normal(N)
    elif method == 'milstein':
        for _ in range(M):
            Z = np.random.standard_normal(N)
            ST += r * ST * dt + sigma * ST * np.sqrt(dt) * Z + 0.5 * sigma**2 * ST * dt * (Z**2 - 1)
    return ST

def simulate_history_path(S0, T, r, sigma, N, M):
    dt = T / M; paths = np.zeros((M + 1, N)); paths[0] = S0
    for t in range(1, M + 1):
        paths[t] = paths[t-1] + r * paths[t-1] * dt + sigma * paths[t-1] * np.sqrt(dt) * np.random.standard_normal(N)
    return paths

# Pricing & Variance Reduction
def price_mc(ST, payoff_func, E, r, T):
    discounted_payoffs = np.exp(-r * T) * payoff_func(ST, E)
    return np.mean(discounted_payoffs), np.std(discounted_payoffs, ddof=1) / np.sqrt(len(ST))

def price_anti(S0, E, T, r, sigma, N, payoff_func):
    N_half = N // 2; Z = np.random.standard_normal(N_half)
    ST1 = S0 * np.exp((r - 0.5 * sigma**2) * T + sigma * np.sqrt(T) * Z)
    ST2 = S0 * np.exp((r - 0.5 * sigma**2) * T + sigma * np.sqrt(T) * (-Z))
    discounted = np.exp(-r * T) * 0.5 * (payoff_func(ST1, E) + payoff_func(ST2, E))
    return np.mean(discounted), np.std(discounted, ddof=1) / np.sqrt(N_half)

def price_cont_variate(S0, E, T, r, sigma, N, payoff_func):
    Z = np.random.standard_normal(N)
    ST = S0 * np.exp((r - 0.5 * sigma**2) * T + sigma * np.sqrt(T) * Z)
    Y = payoff_func(ST, E) * np.exp(-r * T); X = ST; EX = S0 * np.exp(r * T) 
    theta = np.cov(X, Y)[0, 1] / np.cov(X, Y)[0, 0]
    Y_cv = Y - theta * (X - EX)
    return np.mean(Y_cv), np.std(Y_cv, ddof=1) / np.sqrt(N)
```

### 2. 基础模型可视化：资产路径

```python

print("simulating asset paths!")
M_plot, N_plot = 252, 100
paths = simulate_history_path(S0_base, T_base, r_base, sigma_base, N_plot, M_plot)
time_grid = np.linspace(0, T_base, M_plot + 1)

plt.figure(figsize=(10, 5))
plt.plot(time_grid, paths, lw=1, alpha=0.6)
plt.axhline(E_base, color='black', linestyle='--', linewidth=2, label='Strike Price (E=100)')
plt.title(f'Monte Carlo Simulation: {N_plot} Simulated Asset Paths (GBM)', fontsize=14)
plt.xlabel('Time to Maturity (Years)'); plt.ylabel('Asset Price (S_t)')
plt.legend(); plt.tight_layout()
plt.show()
```

![图 1 - 基础模型可视化](/images/1.png)

### 3. 结果：价格与标准误对比

```python
def run_experiment(option_type):
    payoff_f = payoff_euro if option_type == 'European' else payoff_bina
    bs_price = bs_euro_call(S0_base, E_base, T_base, r_base, sigma_base) if option_type == 'European' else bs_bina_call(S0_base, E_base, T_base, r_base, sigma_base)
    results = []
    
    # Baseline
    ST_base = simulate_paths(S0_base, T_base, r_base, sigma_base, N_paths, M_steps, 'closed')
    p_base, se_base = price_mc(ST_base, payoff_f, E_base, r_base, T_base)
    var_base = se_base**2
    
    # run each method and collect results
    for method in ['euler', 'milstein', 'closed']:
        ST = simulate_paths(S0_base, T_base, r_base, sigma_base, N_paths, M_steps, method)
        p, se = price_mc(ST, payoff_f, E_base, r_base, T_base)
        # for standard method，VRR should be N/A or 1.0
        results.append((method.capitalize(), p, se, abs(p - bs_price), 1.0))
        
    # Caculate VRR
    p_anti, se_anti = price_anti(S0_base, E_base, T_base, r_base, sigma_base, N_paths, payoff_f)
    vrr_anti = var_base / (se_anti**2) 
    results.append(('Antithetic', p_anti, se_anti, abs(p_anti - bs_price), vrr_anti))
    
    p_cv, se_cv = price_cont_variate(S0_base, E_base, T_base, r_base, sigma_base, N_paths, payoff_f)
    vrr_cv = var_base / (se_cv**2)
    results.append(('Control Variate', p_cv, se_cv, abs(p_cv - bs_price), vrr_cv))
    
    # add VRR
    df = pd.DataFrame(results, columns=['Method', 'Price', 'Standard Error', 'Abs Error vs BS', 'VR Ratio (Multiplier)'])
    return df.set_index('Method'), bs_price

# PRINT RESULTS
df_euro, bs_euro = run_experiment('European')
df_binary, bs_binary = run_experiment('Binary')
print(f"hyy:European Call Options (BS Exact Price: {bs_euro:.4f})"); display(df_euro)
print(f"\n hyy: Binary Call Options (BS Exact Price: {bs_binary:.4f})"); display(df_binary)

# plot the diagram
fig, ax = plt.subplots(figsize=(10, 5))
x = np.arange(len(df_euro.index)); width = 0.35
rects1 = ax.bar(x - width/2, df_euro['Standard Error'], width, label='European Call', color='steelblue')
rects2 = ax.bar(x + width/2, df_binary['Standard Error'], width, label='Binary Call', color='darkorange')
ax.set_ylabel('Standard Error (SE)'); ax.set_title('Standard Error Comparison across Variance Reduction Methods')
ax.set_xticks(x); ax.set_xticklabels(df_euro.index, rotation=15); ax.legend()
plt.tight_layout(); plt.show()
```



![图 2 - 欧式与二元期权定价结果](/images/2.png)

![图 3 - 标准误对比](/images/3.png)

### 观察：方差缩减（VR）带来的效率提升

#### 这一部分可以从四点来理解：
第一，关于离散化误差与采样效率：从 Euler 切换到 Milstein 主要改善的是离散化偏差，但对 **标准误（SE）** 的影响很小。结果显示 Euler、Milstein 与闭式解三者的 SE 基本接近。这说明 SE 主要由样本量（$N$）与支付函数方差决定，而不是离散化格式本身。

第二，对偶变量法的表现：对偶变量法带来明显提升，欧式看涨的 **VR 比率约 1.99x**，二元看涨更高（约 **4.64x**）。通过构造负相关路径，它能抵消部分采样噪声，在相同计算预算下收窄置信区间。

第三，控制变量法（CV）的主导优势：在欧式看涨上，控制变量法效果最强，**VR 比率约 6.88x**。其核心是利用已知解析性质且与目标变量高度相关的控制变量（如标的终值）来显著降低剩余方差。

第四，支付函数敏感性：在本次实验中，对二元看涨而言，对偶变量法反而优于控制变量法（4.64 vs 2.45）。这表明 VR 技术效果对支付函数的**不连续性**与**凸性**高度敏感。

### 4. 收敛性与稳定性分析

```python
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

# Log-Log Convergence Analysis
Ns_list = [500, 1000, 2000, 5000, 10000, 20000]
repeats = 30  

anchor_error = 0

for method in ['euler', 'milstein', 'closed']:
    errs_mean = []
    for n in Ns_list:
        err_n = []
        for _ in range(repeats):
            ST = simulate_paths(S0_base, T_base, r_base, sigma_base, n, 252, method)
            p, _ = price_mc(ST, payoff_euro, E_base, r_base, T_base)
            err_n.append(abs(p - bs_euro))
        errs_mean.append(np.mean(err_n)) 
        
    if method == 'closed':
        anchor_error = errs_mean[0]
        
    ax1.plot(Ns_list, errs_mean, marker='o', label=method.capitalize())

# in order to make the reference line more visible, multiply the anchor_error by 2
ref_line = (anchor_error * 2) * (np.array(Ns_list) / Ns_list[0])**(-0.5)
ax1.plot(Ns_list, ref_line, 'k--', label='Theoretical $O(N^{-1/2})$')

ax1.set(xscale='log', yscale='log', title='Log-Log Convergence Analysis', xlabel='Number of Paths (N)', ylabel='Mean Absolute Error')
ax1.legend()

# Seed Stability
seed_prices = [price_mc(simulate_paths(S0_base, T_base, r_base, sigma_base, 10000, 1, 'closed'), payoff_euro, E_base, r_base, T_base)[0] for s in range(100)]
ax2.hist(seed_prices, bins=15, color='lightblue', edgecolor='black', alpha=0.8)
ax2.axvline(bs_euro, color='red', linestyle='--', linewidth=2, label='BS Exact Price')
ax2.axvline(np.mean(seed_prices), color='green', linestyle='-', linewidth=2, label='Monte Carlo Mean')
ax2.set(title='Monte Carlo Price Distribution (100 Seeds)', xlabel='Estimated Price', ylabel='Frequency')
ax2.legend()

plt.tight_layout()
plt.show()
np.random.seed(42) # reset back the seed
```

![图 4 - 收敛性与稳定性分析](/images/4.png)

### 观察
#### 第一张图说明了以下几点：
- 关于收敛速度与离散化偏差
1. 理论收敛阶（$O(N^{-1/2})$）：log-log 图显示三种数值方法的误差下降轨迹都与理论参考线基本平行，经验上验证了蒙特卡洛估计方差符合中心极限定理。
2. 离散化偏差：曲线之间的垂直间距揭示了时间离散误差。**Euler 方法**（一阶）绝对误差最大；**Milstein 方法**通过二阶 Itô 修正显著降低偏差；**闭式解**（精确 GBM）不存在时间离散偏差，剩余误差主要来自统计采样方差。
- 强收敛与弱收敛的权衡
1. 路径精度（强收敛）角度：Milstein 通过考虑波动率拖曳项（$1/2 \sigma^2 \dots$），使单条模拟路径更贴近“真实路径”，这对路径依赖产品（如美式、障碍期权）很关键。
2. 分布统计（弱收敛）角度：对于整体统计量（如此处均值绝对误差），Milstein 相对 Euler 的优势可能有限，因为二者弱收敛阶同为 $O(\Delta t)$。在只看终值期望时，Milstein 的非线性修正有时会让结果在 Euler 附近波动。
3. 实务选择：结果表明，若目标是简单欧式类期望定价，与其提升离散化复杂度，不如在标准 Euler 上结合方差缩减，往往更具计算效率。
#### 第二张图可得：
1. 100 个随机种子下的蒙特卡洛估计分布紧密围绕 Black-Scholes 精确值，样本均值（绿线）与解析基准（红线）高度一致，说明估计器无偏。
2. 对称钟形直方图从可视化上验证了中心极限定理，也说明了蒙特卡洛的固有噪声，因此方差缩减对于提升效率非常关键。

### 5. 敏感性分析（参数变化）

```python
import matplotlib.pyplot as plt
import numpy as np

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

#  Volatility Effect
volatilities = np.linspace(0.05, 0.50, 10)
euro_prices_vol = [price_mc(simulate_paths(S0_base, T_base, r_base, v, N_paths, 1, 'closed'), payoff_euro, E_base, r_base, T_base)[0] for v in volatilities]
binary_prices_vol = [price_mc(simulate_paths(S0_base, T_base, r_base, v, N_paths, 1, 'closed'), payoff_bina, E_base, r_base, T_base)[0] for v in volatilities]

ax1.plot(volatilities, euro_prices_vol, label='European Call', marker='o')
ax1.plot(volatilities, binary_prices_vol, label='Binary Call', marker='s')
# fix bug: fix the label for volatility with r and \sigma
ax1.set(title='Option Price vs Volatility', xlabel=r'Volatility ($\sigma$)', ylabel='Price')
ax1.legend()

# Strike Effect 
strikes = np.linspace(80, 120, 10)
binary_se_strike = [price_mc(simulate_paths(S0_base, T_base, r_base, sigma_base, N_paths, 1, 'closed'), payoff_bina, k, r_base, T_base)[1] for k in strikes]

ax2.plot(strikes, binary_se_strike, color='red', marker='^')
ax2.axvline(S0_base, color='black', linestyle='--', label='At-The-Money (S0=100)')
ax2.set(title='Binary Option SE vs Strike (Discontinuity Effect)', xlabel='Strike Price (E)', ylabel='Standard Error (SE)')
ax2.legend()

plt.tight_layout()
plt.show()
```

![图 5 - 敏感性分析](/images/5.png)

### 关于波动率敏感性图（Vega 分化）
- 敏感性分析显示出一个关键分化：随着隐含波动率上升，欧式看涨价格单调上升（正 Vega），而**平值（ATM）二元看涨**价格在本实验设置下下降（负向表现）。
- 对欧式期权而言，由于支付函数 $\max(S_T - E, 0)$ 的凸性，高不确定性带来的右尾扩张总体有利：上行收益不封顶、下行损失下限为 0。相反，ATM 二元期权支付上限固定为 1。波动率升高会把更多路径推向极端值，但上行额外空间被封顶，向下偏离却会完整损失支付，因此风险中性下实值概率被稀释，期望价值下降。

### 关于二元期权支付不连续性
- 二元期权的标准误（SE）在平值点（$E = S_0 = 100$）附近显著抬升。
- 原因是其支付函数高度不连续（Heaviside 阶跃函数）。当模拟终值 $S_T$ 非常接近执行价 $E$ 时，极小随机扰动就会导致支付在 0 与 1 之间翻转，从而显著放大统计方差，使标准蒙特卡洛在 ATM 二元期权上效率明显低于连续支付的欧式期权。


### 6. 观察与遇到的问题

#### 二元期权与欧式期权的差异：
- **观察：** 二元期权的标准误（SE）行为与欧式期权明显不同。二元期权在平值（ATM，$E=100$）附近方差会出现尖峰。
- **原因：** 这来自二元支付函数的强不连续性（从 0 到 1 的阶跃）。执行价附近路径的微小变动会引起支付结果的大幅跳变。

#### 方差缩减效率：
- **控制变量法：** 对欧式期权非常有效，方差缩减比（VRR）约为 7.0x（SE 约降低到原来的 $1/\sqrt{7}$）。其高效率来自 ATM 欧式支付 $\max(S_T - E, 0)$ 与连续控制变量 $S_T$ 之间较强的正相关（$\rho \approx 0.92$）。
- **遇到的问题：** 在二元期权上该效率显著下降。由于二元支付上限固定为 1，其与无界的 $S_T$ 线性相关性较弱，该控制变量对不连续数字支付的效果明显变差。


#### 收敛与离散化：
- Log-Log 分析显示经验误差符合理论 $O(N^{-1/2})$ 收敛率。
- Euler 的时间离散偏差最大，Milstein 通过 Itô 修正提高了精度。

## 7. 结论

 - 对于路径依赖型复杂衍生品，Euler 与 Milstein 仍是必要方法；但对路径无关的欧式与二元期权，**GBM 闭式终值法**由于完全消除了时间步进偏差，通常更优。

- 就方差缩减而言，基于标的终值 $S_T$ 的**控制变量法**在连续支付（欧式看涨）上效果非常强；但在不连续支付（二元看涨）上，线性关系减弱导致效率明显下降。

- 总结：数值方法不能“一套通吃”，应根据支付函数的数学结构（连续/不连续）进行针对性选择。

## 8. 参考文献
1. Hull, J. C. (2018). *Options, Futures, and Other Derivatives*. Pearson.
2. Glasserman, P. (2003). *Monte Carlo Methods in Financial Engineering*. Springer.
3. Higham, D. J. (2001). "An Algorithmic Introduction to Numerical Simulation of Stochastic Differential Equations". *SIAM Review*.

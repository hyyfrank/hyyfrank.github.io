---
title: "Pricing Options using Monte Carlo Simulation"
date: 2026-05-28T16:01:00+08:00
lastmod: 2026-05-28T16:01:00+08:00
draft: false
math: true
tags: ["quant", "monte-carlo", "options", "numerical-methods", "finance"]
categories: ["quant"]
---

# Pricing European and Binary Options using Monte Carlo Simulation

## 1. Introduction

This report investigates the pricing of European and Binary call options using Monte Carlo simulation under the risk-neutral framework. According to the Fundamental Theorem of Asset Pricing, the value of an option $V(S,t)$ is the expected value of its discounted payoff under the risk-neutral measure $\mathbb{Q}$:

$$V(S, t) = e^{-r(T-t)} \mathbb{E}^\mathbb{Q} [\text{Payoff}(S_T)]$$

We assume the underlying asset follows Geometric Brownian Motion (GBM) governed by the Stochastic Differential Equation (SDE):
$$dS_t = r S_t dt + \sigma S_t dW_t$$
where $r$ is the risk-free rate, $\sigma$ is the volatility, and $dW_t$ is a Wiener process.

To simulate the asset paths, we employ three numerical procedures:
1. **Euler-Maruyama Scheme**: A first-order discrete approximation.
   $$S_{t+\Delta t} = S_t + r S_t \Delta t + \sigma S_t \sqrt{\Delta t} Z$$
2. **Milstein Scheme**: A higher-order approximation including Itô's lemma expansion.
   $$S_{t+\Delta t} = S_t + r S_t \Delta t + \sigma S_t \sqrt{\Delta t} Z + \frac{1}{2}\sigma^2 S_t \Delta t (Z^2 - 1)$$
3. **Closed-form GBM Solution**: The exact solution to the SDE.
   $$S_T = S_0 \exp\left((r - \frac{1}{2}\sigma^2)T + \sigma \sqrt{T} Z\right)$$

Furthermore, we examine **Antithetic Variates** and **Control Variates** to reduce the variance.

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

### 2. Base Model Visualization: Asset Paths

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

![Figure 1 - Base Model Visualization](/images/1.png)

### 3. Results: Price & Standard Error Comparison

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



![Figure 2 - European and Binary Pricing Results](/images/2.png)

![Figure 3 - Standard Error Comparison](/images/3.png)

### Observation Efficiency Gain via Variance Reduction (VR)

#### I want to describe this in four part:
first of all, for the Discretization vs. Sampling Efficiency, While the transition from Euler to Milstein addresses discretization bias, it has a negligible impact on the **Standard Error (SE)**. The data shows that SE remains nearly constant across Euler, Milstein, and Closed-form paths. This confirms that SE is primarily a function of the sample size ($N$) and the underlying variance of the payoff, not the discretization scheme.

second, Performance of Antithetic Variates also need to check,  The Antithetic method provides a significant boost, with a **VR Ratio of ~1.99x** for European Calls and even higher **(~4.64x)** for Binary Calls. By introducing negative correlation between sample paths, it effectively "cancels out" a portion of the sampling noise, leading to a tighter confidence interval for the same computational budget.

third, for the Dominance of Control Variates (CV), The Control Variate technique is the clear winner for the European Call, yielding a **VR Ratio of ~6.88x**. By leveraging the known analytical solution of a correlated variable (the underlying asset or a similar instrument), CV drastically reduces the residual variance.

lastly is the Payoff Sensitivity, Interestingly, for Binary Call options, Antithetic Variates actually outperformed Control Variates in this specific run (VR Ratio 4.64 vs 2.45). This highlights that the effectiveness of VR techniques is highly sensitive to the **discontinuity** and **convexity** of the option's payoff profile.

### 4. Convergence & Stability Analysis

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

![Figure 4 - Convergence and Stability Analysis](/images/4.png)

### Observation
#### first image describe telling us:
- for the Convergence Rate and Discretization Bias
1. Theoretical Convergence ($O(N^{-1/2})$), The log-log plot demonstrates that all three numerical methods yield an error reduction trajectory strictly parallel to the theoretical reference line. This empirically confirms that the statistical variance of our Monte Carlo estimator perfectly follows the Central Limit Theorem.
2. Discretization Bias, The vertical spacing between the curves reveals the inherent time-discretization error. The **Euler scheme** (first-order) exhibits the highest absolute error. The **Milstein scheme** significantly mitigates this bias by incorporating the second-order Itô correction for volatility drag. The **Closed-form** solution (exact GBM) possesses zero discretization bias, with its residual error stemming purely from statistical sampling variance.
- Strong vs. Weak Convergence Trade-off
1. for the Path-wise Precision (Strong Convergence), The Milstein scheme is designed to reduce the "path-dependent" error. By accounting for the volatility drag ($1/2 \sigma^2 \dots$), it ensures each individual simulated trajectory stays closer to the "real" path. This is a crucial feature for path-dependent products (e.g., American or Barrier options).
2. as for Statistical Parity (Weak Convergence), For overall distributional statistics (like the Mean Absolute Error shown here), Milstein’s advantage over Euler is often Marginal. This is because both schemes share the same weak convergence order of $O(\Delta t)$. In some cases, the non-linear perturbations from the Milstein correction can even cause it to fluctuate near the Euler baseline when only the final expectation is considered.
3. Practical Selection, Our findings suggest that while Milstein is mathematically superior for path-wise accuracy, for simple European-style expectations, applying Variance Reduction techniques to a standard Euler scheme may be a more computationally efficient "feature" than increasing the complexity of the discretization itself.
#### second image, we can find below
1. The distribution of Monte Carlo estimates across 100 independent random seeds is tightly centered around the exact Black-Scholes price. The sample mean (green line) perfectly aligns with the analytical benchmark (red line), proving that our estimator is mathematically unbiased.
2. The symmetric, bell-shaped histogram visually verifies the Central Limit Theorem in action. It highlights the inherent noise of Monte Carlo methods, emphasizing why Variance Reduction techniques are vital to narrowing this spread without relying on computationally expensive increases in simulation paths.

### 5. Sensitivity Analysis (Varying Data)

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

![Figure 5 - Sensitivity Analysis](/images/5.png)

### For the Volatility Sensitivity Image (The Vega Divergence)
- The sensitivity analysis reveals a fundamental divergence: as implied volatility increases, the price of the European call increases monotonically (Positive Vega), whereas the price of the **At-The-Money (ATM) Binary call decreases** (Negative Vega).
- For European options, higher uncertainty is purely beneficial due to the convex payoff structure $\max(S_T - E, 0)$; the upside is unlimited while the downside is safely floored at zero. Conversely, for ATM Binary options, the payoff is strictly capped at $1$. Increased volatility pushes more simulated paths into extreme values. Since the upside is capped, the binary option gains no extra value from extremely high asset prices, but it suffers full loss from lower prices. Thus, higher volatility merely dilutes the risk-neutral probability of finishing in-the-money, reducing its expected value.

### For the The Discontinuity of Binary Options
- The standard error (SE) for Binary options peaks sharply when the option is exactly At-The-Money ($E = S_0 = 100$). 
- This is caused by the severe discontinuity in the binary payoff profile (a Heaviside step function). When the simulated asset price $S_T$ finishes infinitesimally close to the strike $E$, tiny random fluctuations dictate whether the payoff flips entirely between $1$ and $0$. This digital flip drastically inflates the statistical variance, rendering standard Monte Carlo methods highly inefficient for ATM binary options compared to continuous European payoffs.


### 6. Observations and Problem Encountered

#### The Nature of Binary Options vs European Options:
- **Observation:** The standard error (SE) for Binary options behaves very differently from European options. The variance for Binary options peaks sharply when the option is At-The-Money (ATM, $E=100$).
- **Reason:** This is due to the severe discontinuity in the binary payoff function (a step function jumping from 0 to 1). Small changes in simulated paths near the strike price cause massive fluctuations in payoff.

#### Variance Reduction Efficiency:
- **Control Variates:** Proved highly effective for European options, achieving a Variance Reduction Ratio (VRR) of approximately 7.0x (reducing the Standard Error by a factor of $\sqrt{7}$). This high efficiency stems from the strong positive correlation ($\rho \approx 0.92$) between the ATM European payoff $\max(S_T - E, 0)$ and the continuous control variate $S_T$.
- **Problem Encountered:** The efficiency drastically collapses for Binary options. Because the binary payoff is strictly capped at 1, its linear correlation with the unbounded underlying $S_T$ is exceedingly weak, rendering this specific control variate ineffective for discontinuous digital payoffs.


#### Convergence and Discretization:
- Log-Log analysis proves empirical error strictly follows the theoretical $O(N^{-1/2})$ convergence rate.
- Euler schemes showed the largest time-discretization bias. Milstein improved accuracy via Itô correction.

## 7. Conclusion

 - While Euler and Milstein schemes are essential for pricing path-dependent exotic derivatives, the **Closed-form GBM** is strictly superior for path-independent European and Binary options due to the complete elimination of time-stepping bias.

- for Variance Reduction Limits **Control Variates** utilizing the underlying asset $S_T$ proved exceptionally powerful for continuous payoffs (European Calls) due to the high linear correlation. However, their efficiency significantly deteriorates for discontinuous payoffs (Binary Calls), as the linear relationship between the unbounded underlying $S_T$ and the strictly capped binary payoff breaks down.

- Summary: The results demonstrate that numerical procedures cannot be applied uniformly. They must be explicitly tailored to the specific mathematical topography (e.g., continuity vs. discontinuity) of the derivative's payoff function.

## 8. References
1. Hull, J. C. (2018). *Options, Futures, and Other Derivatives*. Pearson.
2. Glasserman, P. (2003). *Monte Carlo Methods in Financial Engineering*. Springer.
3. Higham, D. J. (2001). "An Algorithmic Introduction to Numerical Simulation of Stochastic Differential Equations". *SIAM Review*.

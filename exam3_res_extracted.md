
## [Markdown cell 0]
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


## [Markdown cell 2]
### 2. Base Model Visualization: Asset Paths


## [Code cell 3 output]
```
simulating asset paths!
```


## [Markdown cell 4]
### 3. Results: Price & Standard Error Comparison


## [Code cell 5 output]
```
hyy:European Call Options (BS Exact Price: 10.4506)
```


## [Markdown cell 6]
### Observation Efficiency Gain via Variance Reduction (VR)

#### I want to describe this in four part:
first of all, for the Discretization vs. Sampling Efficiency, While the transition from Euler to Milstein addresses discretization bias, it has a negligible impact on the **Standard Error (SE)**. The data shows that SE remains nearly constant across Euler, Milstein, and Closed-form paths. This confirms that SE is primarily a function of the sample size ($N$) and the underlying variance of the payoff, not the discretization scheme.

second, Performance of Antithetic Variates also need to check,  The Antithetic method provides a significant boost, with a **VR Ratio of ~1.99x** for European Calls and even higher **(~4.64x)** for Binary Calls. By introducing negative correlation between sample paths, it effectively "cancels out" a portion of the sampling noise, leading to a tighter confidence interval for the same computational budget.

third, for the Dominance of Control Variates (CV), The Control Variate technique is the clear winner for the European Call, yielding a **VR Ratio of ~6.88x**. By leveraging the known analytical solution of a correlated variable (the underlying asset or a similar instrument), CV drastically reduces the residual variance.

lastly is the Payoff Sensitivity, Interestingly, for Binary Call options, Antithetic Variates actually outperformed Control Variates in this specific run (VR Ratio 4.64 vs 2.45). This highlights that the effectiveness of VR techniques is highly sensitive to the **discontinuity** and **convexity** of the option's payoff profile.


## [Markdown cell 7]
### 4. Convergence & Stability Analysis


## [Code cell 8 output]
```
<Figure size 1400x500 with 2 Axes>
```


## [Markdown cell 9]
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


## [Markdown cell 10]
### 5. Sensitivity Analysis (Varying Data)


## [Code cell 11 output]
```
<Figure size 1400x500 with 2 Axes>
```


## [Markdown cell 12]
### For the Volatility Sensitivity Image (The Vega Divergence)
- The sensitivity analysis reveals a fundamental divergence: as implied volatility increases, the price of the European call increases monotonically (Positive Vega), whereas the price of the **At-The-Money (ATM) Binary call decreases** (Negative Vega).
- For European options, higher uncertainty is purely beneficial due to the convex payoff structure $\max(S_T - E, 0)$; the upside is unlimited while the downside is safely floored at zero. Conversely, for ATM Binary options, the payoff is strictly capped at $1$. Increased volatility pushes more simulated paths into extreme values. Since the upside is capped, the binary option gains no extra value from extremely high asset prices, but it suffers full loss from lower prices. Thus, higher volatility merely dilutes the risk-neutral probability of finishing in-the-money, reducing its expected value.

### For the The Discontinuity of Binary Options
- The standard error (SE) for Binary options peaks sharply when the option is exactly At-The-Money ($E = S_0 = 100$). 
- This is caused by the severe discontinuity in the binary payoff profile (a Heaviside step function). When the simulated asset price $S_T$ finishes infinitesimally close to the strike $E$, tiny random fluctuations dictate whether the payoff flips entirely between $1$ and $0$. This digital flip drastically inflates the statistical variance, rendering standard Monte Carlo methods highly inefficient for ATM binary options compared to continuous European payoffs.


## [Markdown cell 13]
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


## [Markdown cell 0]
# VaR Backtesting
* most of the time, we assume daily return follow normal distribution and as the question say, Var is caculated at 99% confidence.


## [Markdown cell 1]
**Import Libraries**


## [Markdown cell 7]
**Load Data**


## [Code cell 8 output]
```
Date
2025-01-02    5868.5498
2025-01-03    5942.4702
2025-01-06    5975.3799
2025-01-07    5909.0298
2025-01-08    5918.2500
Name: ^GSPC, dtype: float64
```


## [Markdown cell 9]
**Data Operation**


## [Code cell 10 output]
```
Close  Rolling_Std  VaR_10D  Forward_10D  Breach
Date                                                            
2025-02-04  6037.8799       0.0089  -0.0657       0.0174       0
2025-02-05  6061.4800       0.0086  -0.0631       0.0092       0
2025-02-06  6083.5698       0.0085  -0.0628      -0.0116       0
2025-02-07  6025.9902       0.0084  -0.0620      -0.0071       0
2025-02-10  6066.4399       0.0085  -0.0627      -0.0185       0
```


## [Markdown cell 11]
## (a) VaR Breach Statistics


## [Code cell 12 output]
```
Total Comparisons: 229 Number of Breaches: 10 Breach Percentage: 4.366812227074235 %, Expected Breaches: 2.290000000000002
```


## [Markdown cell 13]
## (b) Visualization

Plot showing VaR breaches (marked with crosses)


## [Code cell 14 output]
```
<Figure size 1200x800 with 3 Axes>
```


## [Markdown cell 15]
## (c) Traffic-Light Zones


## [Code cell 16 output]
```
5.0
10.0
Breaches: 10 Zone: YELLOW
```


## [Code cell 17 output]
```
Period: 2025-02-04 to 2025-12-31, Total Comparisons: 229, Breach Count: 10, Breach Rate: 4.366812227074235%, Traffic Light Zone: YELLOW
```

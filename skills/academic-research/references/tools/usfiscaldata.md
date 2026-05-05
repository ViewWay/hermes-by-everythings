---
name: usfiscaldata
description: US fiscal and economic data access — FRED API, BEA, Census Bureau, and economic indicator retrieval
domain: Economics / Data
install: pip install fredapi pandas-datareader
---

# US Fiscal and Economic Data Access

## Overview

Multiple US government agencies provide free APIs for accessing fiscal, economic, and demographic data. Key sources include the Federal Reserve Economic Data (FRED), Bureau of Economic Analysis (BEA), Census Bureau, and Bureau of Labor Statistics (BLS). These APIs enable programmatic retrieval of time series data for economic research.

## When to Use

- Retrieving macroeconomic indicators (GDP, CPI, unemployment) for research
- Building economic models with historical time series data
- Analyzing federal spending, revenue, and budget data
- Accessing demographic and survey data from the Census Bureau
- Replicating published economic analyses

## Quick Start

```python
# FRED API — Federal Reserve Economic Data
from fredapi import Fred

fred = Fred(api_key="your_api_key_here")  # Get from https://fred.stlouisfed.org/docs/api/api_key.html

# Retrieve GDP (Quarterly, Billions of Dollars)
gdp = fred.get_series("GDP", observation_start="2000-01-01")
print(gdp.tail())

# Retrieve unemployment rate (Monthly, Percent)
unemployment = fred.get_series("UNRATE", observation_start="2020-01-01")

# Retrieve CPI (Consumer Price Index, Monthly)
cpi = fred.get_series("CPIAUCSL", observation_start="2020-01-01")
```

```python
# pandas-datareader — multi-source data access
import pandas_datareader as pdr
from datetime import datetime

# FRED via pandas-datareader
gdp = pdr.data.DataReader("GDP", "fred", start="2000-01-01")
inflation = pdr.data.DataReader("CPIAUCSL", "fred", start="2020-01-01")

# Fama-French factors (via pandas-datareader)
ff = pdr.data.DataReader("F-F_Research_Data_Factors", "famafrench", start="2010-01-01")
```

## Core Capabilities

### 1. FRED API — Comprehensive Economic Data

FRED hosts 800,000+ time series from 100+ sources.

```python
from fredapi import Fred
import pandas as pd

fred = Fred(api_key="your_key")

# Key macroeconomic indicators
indicators = {
    "GDP": "Gross Domestic Product (Quarterly)",
    "GNP": "Gross National Product",
    "UNRATE": "Unemployment Rate (Monthly)",
    "CPIAUCSL": "Consumer Price Index (CPI)",
    "FEDFUNDS": "Federal Funds Rate",
    "DGS10": "10-Year Treasury Yield",
    "PAYEMS": "Nonfarm Payrolls",
    "HOUST": "Housing Starts",
    "RSAFS": "Retail Sales",
    "M2SL": "M2 Money Supply",
}

# Fetch multiple series into a DataFrame
data = pd.DataFrame()
for series_id, description in indicators.items():
    data[series_id] = fred.get_series(series_id, observation_start="2015-01-01")

# Search for series by keyword
results = fred.search("real GDP")
print(results[["id", "title", "frequency", "units"]].head(10))

# Get series metadata
info = fred.get_series_info("GDP")
print(f"Title: {info['title']}, Frequency: {info['frequency']}, Units: {info['units']}")
```

### 2. BEA Data — National Income and Product Accounts

```python
# BEA API (via requests)
import requests

BEA_API_KEY = "your_bea_key"  # Get from https://apps.bea.gov/api/signup/

# GDP by industry (annual)
url = "https://apps.bea.gov/api/data/"
params = {
    "UserID": BEA_API_KEY,
    "method": "GetData",
    "datasetname": "NIPA",
    "TableName": "T10105",  # Gross Domestic Product
    "Frequency": "A",
    "Year": "2020,2021,2022,2023",
    "ResultFormat": "JSON",
}
response = requests.get(url, params=params)
gdp_data = response.json()

# Parse into DataFrame
import pandas as pd
records = gdp_data["BEAAPI"]["Results"]["Data"]
df = pd.DataFrame(records)
print(df[["LineDescription", "DataValue", "TimePeriod"]].head())
```

### 3. Census Bureau Data

```python
# Census API
import requests

CENSUS_KEY = "your_census_key"  # Get from https://api.census.gov/data/key_signup.html

# American Community Survey (ACS) — median income by state
url = "https://api.census.gov/data/2022/acs/acs5"
params = {
    "get": "NAME,B19013_001E",  # Name, Median household income
    "for": "state:*",
    "key": CENSUS_KEY,
}
response = requests.get(url, params=params)
data = response.json()
df = pd.DataFrame(data[1:], columns=data[0])
df["B19013_001E"] = pd.to_numeric(df["B19013_001E"])
print(df.sort_values("B19013_001E", ascending=False).head(10))

# Population estimates
url = "https://api.census.gov/data/timeseries/eits/epop"
params = {"get": "DATE,EPOP,EPOP_CY,EPOP_YR", "key": CENSUS_KEY}
```

## Common Academic Workflow

### Building an Economic Dataset for Research

```python
"""Download and prepare economic data for a research paper."""
from fredapi import Fred
import pandas as pd

fred = Fred(api_key="your_key")
start = "1990-01-01"
end = "2024-01-01"

# Download core indicators
series_map = {
    "gdp": "GDP",
    "unemployment": "UNRATE",
    "inflation_cpi": "CPIAUCSL",
    "fed_rate": "FEDFUNDS",
    "10yr_treasury": "DGS10",
    "real_gdp": "GDPC1",
    "m2_money": "M2SL",
}

df = pd.DataFrame()
for name, series_id in series_map.items():
    df[name] = fred.get_series(series_id, observation_start=start, observation_end=end)

# Resample to monthly frequency (GDP is quarterly, forward-fill)
df = df.resample("MS").ffill()

# Compute derived series
df["inflation_yoy"] = df["inflation_cpi"].pct_change(12) * 100  # Year-over-year CPI change
df["yield_spread"] = df["10yr_treasury"] - df["fed_rate"]         # Term spread

# Save for analysis
df.to_csv("data/economic_indicators.csv")
df.describe().to_latex("tables/economic_summary.tex", float_format="%.2f")
print(f"Dataset: {df.shape[0]} monthly observations, {df.shape[1]} variables")
```

## Best Practices

1. **Cache API responses**: Rate limits exist (FRED: 120 requests/min); save data locally after first retrieval.
2. **Document data sources**: Record series IDs, retrieval dates, and API versions for reproducibility.
3. **Handle missing data**: Economic series have publication lags and revisions; check for NaN values.
4. **Seasonal adjustment**: Use seasonally adjusted series (`...SA`) for trend analysis when available.
5. **Respect rate limits**: Add `time.sleep(0.5)` between bulk requests; use bulk download endpoints when available.

## Common Pitfalls

1. **Real vs. nominal values**: GDP is nominal by default; use "GDPC1" for real (inflation-adjusted) GDP.
2. **Frequency mismatches**: GDP is quarterly, CPI is monthly — handle resampling explicitly.
3. **Data revisions**: Economic data is often revised; record the vintage/date of retrieval.
4. **API key exposure**: Never commit API keys to version control; use environment variables.

## Integration with HBE

- Use with `references/tools/pandas.md` for data manipulation and analysis
- Pair with `references/tools/matplotlib.md` for economic time series visualization
- Supports `references/tools/statsmodels.md` for econometric modeling
- Combine with `references/tools/statsmodels.md` or `references/tools/linearmodels.md` for regression analysis

## Resources

- FRED API documentation: https://fred.stlouisfed.org/docs/api/fred/
- FRED API key signup: https://fred.stlouisfed.org/docs/api/api_key.html
- BEA API documentation: https://apps.bea.gov/api/data/
- Census API documentation: https://api.census.gov/data.html
- pandas-datareader: https://pandas-datareader.readthedocs.io/

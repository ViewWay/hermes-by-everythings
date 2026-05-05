# Scientific Tool Registry / 科研工具注册表

Curated tool recommendations mapped to research stages and disciplines.
精选科研工具推荐，按研究阶段和学科映射。

> **Coverage / 覆盖范围**: 100+ tools across 12 disciplines — CS, ECE, Physics, Data Science, Biology, Chemistry, Engineering, Medicine, Social Science, Economics, Geoscience, Mathematics.
> 12 学科 100+ 工具：计算机、电子信息、物理、数据科学、生物、化学、工程、医学、社科、经济、地学、数学。

> **Maintenance / 维护**: Single-file registry. Update when major version breaks occur.
> 单文件注册表，大版本变化时更新即可。

## How to Use / 使用方法

```
Research Stage → Your Discipline → Recommended Tool → pip install
研究阶段      → 你的学科       → 推荐工具          → 安装命令
```

---

## Stage 1: Data Acquisition / 数据获取

### Universal / 通用

| Tool | pip install | Use When | Discipline |
|------|-----------|----------|------------|
| requests | `pip install requests` | REST API, DOI, HTTP | All 全学科 |
| pandas | `pip install pandas` | CSV/Excel/JSON/SQL | All 全学科 |
| polars | `pip install polars` | Large data (>1GB), fast I/O | All 全学科 |
| pyarrow | `pip install pyarrow` | Parquet/Arrow format | All 全学科 |
| openpyxl | `pip install openpyxl` | Excel .xlsx read/write | All 全学科 |
| h5py | `pip install h5py` | HDF5 scientific data | All 全学科 |
| datasets | `pip install datasets` | HuggingFace datasets | CS/AI |

### Computer Science / 计算机科学

| Tool | pip install | Use When |
|------|-----------|----------|
| torch | `pip install torch` | PyTorch deep learning |
| tensorflow | `pip install tensorflow` | TensorFlow models |
| jax | `pip install jax` | High-performance numerical computing |
| opencv-python | `pip install opencv-python` | Computer vision, image I/O |
| torchvision | `pip install torchvision` | Image datasets, transforms, models |
| nltk | `pip install nltk` | NLP datasets, tokenizers |
| spacy | `pip install spacy` | Industrial NLP pipeline |

### Electronic & Information Engineering / 电子信息

| Tool | pip install | Use When |
|------|-----------|----------|
| numpy | `pip install numpy` | Signal/array processing foundation |
| scipy | `pip install scipy` | FFT, filter design, signal processing |
| scikit-rf | `pip install scikit-rf` | RF/microwave network analysis |
| pyvisa | `pip install pyvisa` | Instrument control (oscilloscope, spectrum analyzer) |
| pyserial | `pip install pyserial` | Serial communication with hardware |
| ltspyce | `pip install ltspyce` | LTspice simulation data read |
| control | `pip install control` | Control system analysis & design |
| sympy | `pip install sympy` | Symbolic circuit/signal analysis |
| migen | `pip install migen` | FPGA design (VHDL/Verilog generation) |

### Physics / 物理学

| Tool | pip install | Use When |
|------|-----------|----------|
| astropy | `pip install astropy` | Astronomical data, FITS, coordinates, units |
| healpy | `pip install healpy` | Spherical harmonics, CMB, sky maps |
| uproot | `pip install uproot` | ROOT files (particle physics) |
| lmfit | `pip install lmfit` | Curve fitting, model fitting |
| uncertainties | `pip install uncertainties` | Error propagation calculations |
| numba | `pip install numba` | JIT compilation for physics simulations |
| quimb | `pip install quimb` | Tensor network computations |
| pymatgen | `pip install pymatgen` | Crystal structures, Materials Project API |
| ase | `pip install ase` | Atomic simulation environment, DFT workflows |
| openmm | `pip install openmm` | Molecular dynamics simulation |
| mdanalysis | `pip install mdanalysis` | MD trajectory analysis |

### Data Science / 数据科学

| Tool | pip install | Use When |
|------|-----------|----------|
| sqlalchemy | `pip install sqlalchemy` | Database ORM & queries |
| httpx | `pip install httpx` | Async HTTP client |
| scrapy | `pip install scrapy` | Web scraping at scale |
| beautifulsoup4 | `pip install beautifulsoup4` | HTML/XML parsing |
| petl | `pip install petl` | ETL pipelines |

### Biology & Bioinformatics / 生物与生物信息

| Tool | pip install | Use When |
|------|-----------|----------|
| biopython | `pip install biopython` | NCBI (PubMed, Gene, Nucleotide), sequence analysis |
| bioservices | `pip install bioservices` | ChEMBL, KEGG, UniProt, Reactome (~40 services) |
| gget | `pip install gget` | Ensembl, UniProt, AlphaFold, COSMIC (20+ databases) |
| scanpy | `pip install scanpy` | Single-cell RNA-seq, Cellxgene |
| pysam | `pip install pysam` | VCF/BAM/SAM/CRAM parsing |
| anndata | `pip install anndata` | Annotated data matrices (single-cell) |
| pydeseq2 | `pip install pydeseq2` | Differential expression analysis |
| scvi-tools | `pip install scvi-tools` | Single-cell probabilistic models |
| arboreto | `pip install arboreto` | Gene regulatory network inference |

### Chemistry & Drug Discovery / 化学与药物发现

| Tool | pip install | Use When |
|------|-----------|----------|
| rdkit | `pip install rdkit` | Molecular manipulation, SMILES, fingerprints |
| datamol | `pip install datamol` | High-level RDKit wrappers, data curation |
| medchem | `pip install medchem` | Drug-likeness, ADMET estimation |
| molfeat | `pip install molfeat` | Molecular descriptors and fingerprints |
| deepchem | `pip install deepchem` | Molecular property prediction, graph models |
| diffdock | `pip install diffdock` | Molecular docking |
| openbabel | `pip install openbabel` | Chemical format conversion |
| matchms | `pip install matchms` | Mass spectrometry spectrum processing |
| pyopenms | `pip install pyopenms` | LC-MS/MS proteomics pipeline |

### Engineering (Broad) / 工程（综合）

| Tool | pip install | Use When |
|------|-----------|----------|
| scipy.signal | (scipy) | Signal processing, filter design |
| control | `pip install control` | Control systems (Bode, Nyquist, PID) |
| sympy | `pip install sympy` | Symbolic mechanics, structural analysis |
| simpy | `pip install simpy` | Discrete-event simulation |
| pyomo | `pip install pyomo` | Mathematical optimization (LP, MILP, NLP) |
| pymoo | `pip install pymoo` | Multi-objective optimization |
| cadquery | `pip install cadquery` | Parametric 3D CAD modeling |
| fluids | `pip install fluids` | Fluid dynamics engineering calculations |
| cantera | `pip install cantera` | Chemical kinetics, thermodynamics |
| fenics-dolfinx | `pip install fenics-dolfinx` | Finite element method (FEM) PDE solver |
| pydy | `pip install pydy` | Multibody dynamics |
| keras | `pip install keras` | Rapid deep learning prototyping |

### Medicine & Healthcare / 医学与卫生

| Tool | pip install | Use When |
|------|-----------|----------|
| pydicom | `pip install pydicom` | DICOM medical image handling |
| monai | `pip install monai` | Medical image deep learning |
| pyhealth | `pip install pyhealth` | EHR/clinical prediction |
| neurokit2 | `pip install neurokit2` | ECG/EEG/EDA physiological signals |
| scikit-survival | `pip install scikit-survival` | Survival analysis |
| lifelines | `pip install lifelines` | Survival analysis (Kaplan-Meier, Cox) |
| histolab | `pip install histolab` | Whole-slide image analysis |
| pathml | `pip install pathml` | Computational pathology |

### Social Science & Economics / 社科与经济

| Tool | pip install | Use When |
|------|-----------|----------|
| fredapi | `pip install fredapi` | Federal Reserve economic data |
| pandas-datareader | `pip install pandas-datareader` | World Bank, OECD, FRED |
| wbgapi | `pip install wbgapi` | World Bank Development Indicators |
| linearmodels | `pip install linearmodels` | Panel data, IV, DID |
| statsapi | `pip install statsapi` | Sports statistics (baseball) |
| survey | (via rpy2) | Survey-weighted analysis |

### Geoscience & Environment / 地学与环境

| Tool | pip install | Use When |
|------|-----------|----------|
| geopandas | `pip install geopandas` | Geospatial vector data |
| rasterio | `pip install rasterio` | Geospatial raster data (GeoTIFF) |
| xarray | `pip install xarray` | Multi-dimensional geoscience data |
| cartopy | `pip install cartopy` | Geospatial map projections |
| shapely | `pip install shapely` | Geometry operations |
| netcdf4 | `pip install netcdf4` | NetCDF climate/weather data |
| climetlab | `pip install climetlab` | ECMWF climate data access |
| obspy | `pip install obspy` | Seismology data processing |
| pygmt | `pip install pygmt` | GMT geophysics mapping |

### Mathematics & Statistics / 数学与统计

| Tool | pip install | Use When |
|------|-----------|----------|
| sympy | `pip install sympy` | Symbolic math, algebra, calculus |
| numpy | `pip install numpy` | Linear algebra, arrays |
| scipy | `pip install scipy` | Optimization, integration, interpolation |
| statsmodels | `pip install statsmodels` | Regression, ANOVA, time series |
| pymc | `pip install pymc` | Bayesian inference |
| aesara/pytensor | `pip install pytensor` | Symbolic numerical computation |
| mpmath | `pip install mpmath` | Arbitrary precision arithmetic |
| sagemath | (system) | Full computer algebra system |
| numba | `pip install numba` | JIT for numerical kernels |

---

## Stage 2: Data Processing & Cleaning / 数据处理与清洗

### Universal / 通用

| Tool | pip install | Use When | Discipline |
|------|-----------|----------|------------|
| pandas | `pip install pandas` | Tabular data manipulation | All 全学科 |
| polars | `pip install polars` | Large data, lazy evaluation | All 全学科 |
| dask | `pip install dask` | Out-of-core (>RAM) | All 全学科 |
| numpy | `pip install numpy` | Arrays, linear algebra | All 全学科 |
| scipy | `pip install scipy` | Scientific computing | All 全学科 |
| missingno | `pip install missingno` | Missing data visualization | All 全学科 |
| cleanlab | `pip install cleanlab` | Label noise detection & correction | ML/AI |

### Domain-Specific / 领域专用

| Tool | pip install | Use When | Discipline |
|------|-----------|----------|------------|
| scanpy | `pip install scanpy` | Single-cell QC, filtering, normalization | Bio 生物 |
| rdkit | `pip install rdkit` | Molecular standardization, salt stripping | Chem 化学 |
| obspy | `pip install obspy` | Seismogram filtering, decimation | Geoscience 地学 |
| control | `pip install control` | Signal filtering for control systems | ECE 电子信息 |
| astropy | `pip install astropy` | Astronomical unit conversion, time systems | Physics 物理 |
| geopandas | `pip install geopandas` | Spatial joins, CRS transformations | Geoscience 地学 |
| pydicom | `pip install pydicom` | DICOM tag manipulation | Medicine 医学 |
| cadquery | `pip install cadquery` | 3D geometry boolean operations | Engineering 工程 |

---

## Stage 3: Exploratory Data Analysis / 探索性数据分析

### Universal / 通用

| Tool | pip install | Use When | Discipline |
|------|-----------|----------|------------|
| matplotlib | `pip install matplotlib` | Publication figures (the standard) | All 全学科 |
| seaborn | `pip install seaborn` | Statistical plots (built on matplotlib) | All 全学科 |
| plotly | `pip install plotly` | Interactive visualizations | All 全学科 |
| ydata-profiling | `pip install ydata-profiling` | Automated EDA reports | All 全学科 |
| scipy.stats | (scipy) | Statistical tests | All 全学科 |
| statsmodels | `pip install statsmodels` | Detailed statistical modeling | All 全学科 |
| networkx | `pip install networkx` | Graph/network analysis | All 全学科 |

### Domain-Specific Visualization / 领域专用可视化

| Tool | pip install | Use When | Discipline |
|------|-----------|----------|------------|
| cartopy | `pip install cartopy` | Map projections, geographic plots | Geoscience 地学 |
| healpy | `pip install healpy` | All-sky maps, Mollweide projections | Physics 物理 |
| mayavi | `pip install mayavi` | 3D scalar/vector field visualization | Physics/Engineering |
| pyvista | `pip install pyvista` | 3D mesh visualization (FEM, CFD) | Engineering 工程 |
| ngview | `pip install ngview` | Neuroimaging 3D brain visualization | Neuroscience |
| nilearn | `pip install nilearn` | fMRI brain statistical maps | Neuroscience |
| proplot | `pip install proplot` | Publication-quality climate/science plots | Geoscience/Physics |
| hvplot | `pip install hvplot` | Interactive scientific exploration | All 全学科 |

---

## Stage 4: Modeling & Analysis / 建模与分析

### Computer Science & AI / 计算机科学与人工智能

| Tool | pip install | Use When |
|------|-----------|----------|
| scikit-learn | `pip install scikit-learn` | Classical ML (RF, SVM, clustering) — start here |
| pytorch-lightning | `pip install pytorch-lightning` | Deep learning training pipeline |
| transformers | `pip install transformers` | NLP, LLM fine-tuning |
| torch-geometric | `pip install torch-geometric` | Graph neural networks |
| stable-baselines3 | `pip install stable-baselines3` | Reinforcement learning |
| shap | `pip install shap` | Model interpretability |
| umap-learn | `pip install umap-learn` | Dimensionality reduction |
| timm | `pip install timm` | Pretrained vision models |
| accelerate | `pip install accelerate` | Distributed training |
| wandb | `pip install wandb` | Experiment tracking |
| optuna | `pip install optuna` | Hyperparameter optimization |
| hydra-core | `pip install hydra-core` | Configuration management |

### Electronic & Information Engineering / 电子信息

| Tool | pip install | Use When |
|------|-----------|----------|
| scipy.signal | (scipy) | FFT, FIR/IIR filter design, spectral analysis |
| control | `pip install control` | Transfer functions, Bode/Nyquist, state-space, PID |
| pydtmc | `pip install pydtmc` | Markov chain modeling |
| hmmlearn | `pip install hmmlearn` | Hidden Markov models (speech, communication) |
| pymodulation | `pip install pymodulation` | Digital modulation simulation |
| commpy | `pip install commpy` | Digital communications (channel coding, modulation) |
| numpy-financial | `pip install numpy-financial` | Financial/economic calculations |

### Physics / 物理学

| Tool | pip install | Use When |
|------|-----------|----------|
| lmfit | `pip install lmfit` | Nonlinear curve fitting, parameter bounds |
| scipy.optimize | (scipy) | Optimization, root finding, ODE solvers |
| uncertainties | `pip install uncertainties` | Error propagation in calculations |
| ase | `pip install ase` | DFT, molecular dynamics setup |
| openmm | `pip install openmm` | Molecular dynamics (GPU-accelerated) |
| pymatgen | `pip install pymatgen` | Materials analysis, phase diagrams |
| pennylane | `pip install pennylane` | Quantum computing, VQE, QML |
| qiskit | `pip install qiskit` | Quantum circuits, algorithms |
| qutip | `pip install qutip` | Quantum optics, open quantum systems |
| fenics-dolfinx | `pip install fenics-dolfinx` | PDE solving (FEM) |
| dedalus | `pip install dedalus` | PDE solving (spectral methods) |
| numba | `pip install numba` | JIT for Monte Carlo / lattice simulations |

### Data Science & Statistics / 数据科学与统计

| Tool | pip install | Use When |
|------|-----------|----------|
| statsmodels | `pip install statsmodels` | Regression, ANOVA, ARIMA, VAR |
| pymc | `pip install pymc` | Bayesian inference, hierarchical models |
| scikit-learn | `pip install scikit-learn` | ML pipeline, cross-validation |
| shap | `pip install shap` | Model explainability |
| linearmodels | `pip install linearmodels` | Panel data, IV, DID |
| timesfm | `pip install timesfm` | Zero-shot time series forecasting |
| aeon | `pip install aeon` | Time series classification/regression |
| prophet | `pip install prophet` | Time series forecasting (seasonality) |
| causalml | `pip install causalml` | Causal inference (uplift modeling) |
| statspai | `pip install statspai` | Causal inference (900+ functions) |
| optuna | `pip install optuna` | Hyperparameter search |

### Biology & Bioinformatics / 生物

| Tool | pip install | Use When |
|------|-----------|----------|
| scanpy + scvi-tools | `pip install scvi-tools` | Single-cell batch correction, embedding |
| biopython | `pip install biopython` | Sequence alignment, phylogenetics |
| pydeseq2 | `pip install pydeseq2` | Differential expression |
| arboreto | `pip install arboreto` | Gene regulatory networks |
| gseapy | `pip install gseapy` | Gene set enrichment analysis |
| networkx | `pip install networkx` | Protein interaction networks |

### Chemistry / 化学

| Tool | pip install | Use When |
|------|-----------|----------|
| rdkit | `pip install rdkit` | Molecular manipulation & analysis |
| deepchem | `pip install deepchem` | Molecular property prediction |
| diffdock | `pip install diffdock` | Molecular docking |
| molfeat | `pip install molfeat` | Molecular fingerprints/descriptors |
| torchdrug | `pip install torchdrug` | Drug discovery deep learning |
| cantera | `pip install cantera` | Chemical kinetics, combustion |
| pymatgen | `pip install pymatgen` | Materials chemistry |

### Engineering (Broad) / 工程（综合）

| Tool | pip install | Use When |
|------|-----------|----------|
| scipy.optimize | (scipy) | Optimization problems |
| pyomo | `pip install pyomo` | Mathematical programming (LP, MILP, NLP) |
| pymoo | `pip install pymoo` | Multi-objective optimization (NSGA-II) |
| simpy | `pip install simpy` | Discrete-event simulation |
| control | `pip install control` | Control system design & analysis |
| fenics-dolfinx | `pip install fenics-dolfinx` | FEM for structural/thermal/fluid analysis |
| cantera | `pip install cantera` | Chemical engineering thermodynamics |
| fluids | `pip install fluids` | Fluid mechanics calculations |
| pydy | `pip install pydy` | Multibody dynamics |
| robel | — | Robotics simulation |
| pinocchio | `pip install pin` | Rigid body dynamics (robotics) |

### Medicine & Healthcare / 医学

| Tool | pip install | Use When |
|------|-----------|----------|
| monai | `pip install monai` | Medical image segmentation/classification |
| pyhealth | `pip install pyhealth` | Clinical prediction models |
| scikit-survival | `pip install scikit-survival` | Survival analysis |
| lifelines | `pip install lifelines` | Kaplan-Meier, Cox regression |
| neurokit2 | `pip install neurokit2` | ECG/EEG/PPG processing |
| statspai | `pip install statspai` | Causal inference for clinical studies |

---

## Stage 5: Visualization for Publication / 发表级可视化

### Universal / 通用

| Tool | pip install | Use When | Discipline |
|------|-----------|----------|------------|
| matplotlib | `pip install matplotlib` | Full control, publication standard | All 全学科 |
| seaborn | `pip install seaborn` | Statistical plots, less code | All 全学科 |
| tikzplotlib | `pip install tikzplotlib` | matplotlib → TikZ for LaTeX | All 全学科 |
| pgfplots | (LaTeX package) | Native LaTeX plots | All 全学科 |
| plotnine | `pip install plotnine` | ggplot2 syntax in Python | All 全学科 |
| adjustText | `pip install adjusttext` | Auto-adjust label positions | All 全学科 |
| SciencePlots | `pip install SciencePlots` | Nature/Science/IEEE style sheets | All 全学科 |

### Domain-Specific / 领域专用

| Tool | pip install | Use When | Discipline |
|------|-----------|----------|------------|
| cartopy | `pip install cartopy` | Maps, geographic projections | Geoscience 地学 |
| pyvista | `pip install pyvista` | 3D FEM/CFD mesh visualization | Engineering 工程 |
| mayavi | `pip install mayavi` | 3D scalar/vector fields | Physics/Engineering |
| nilearn | `pip install nilearn` | Brain activation maps | Neuroscience |
| napari | `pip install napari` | Multi-dimensional image viewer | Bio/Medicine |
| ase.visualize | `pip install ase` | Atomic structure visualization | Chemistry/Physics |
| pychemotion | — | Reaction schemes | Chemistry |
| schemdraw | `pip install schemdraw` | Circuit/electronic diagrams | ECE 电子信息 |
| blockdiag | `pip install blockdiag` | Block diagrams (systems, control) | Engineering |

---

## Stage 6: Writing & Formatting / 写作与排版

| Tool | pip install | Use When | Discipline |
|------|-----------|----------|------------|
| bibtexparser | `pip install bibtexparser` | BibTeX manipulation | All 全学科 |
| citeproc-py | `pip install citeproc-py` | Citation processing | All 全学科 |
| pyzotero | `pip install pyzotero` | Zotero API reference management | All 全学科 |
| python-docx | `pip install python-docx` | Word document generation | All 全学科 |
| pandoc (system) | system install | Format conversion (md↔tex↔docx) | All 全学科 |

---

## Tool Selection Decision Tree / 工具选择决策树

```
What is your discipline? / 你的学科是？
│
├── 计算机科学 CS/AI
│   ├── Classical ML → scikit-learn
│   ├── Deep Learning → pytorch-lightning + wandb
│   ├── NLP/LLM → transformers + accelerate
│   ├── Computer Vision → timm + opencv
│   ├── Graph ML → torch-geometric
│   ├── Reinforcement Learning → stable-baselines3
│   └── Hyperparameter → optuna + hydra
│
├── 电子信息 ECE
│   ├── Signal Processing → scipy.signal
│   ├── RF/Microwave → scikit-rf
│   ├── Control Systems → control
│   ├── Instrument Control → pyvisa + pyserial
│   ├── FPGA Design → migen
│   ├── Communications → commpy
│   └── Circuit Diagrams → schemdraw
│
├── 物理学 Physics
│   ├── Curve Fitting → lmfit
│   ├── Error Propagation → uncertainties
│   ├── Particle Physics → uproot (ROOT files)
│   ├── Astrophysics → astropy + healpy
│   ├── Materials → pymatgen + ase
│   ├── Molecular Dynamics → openmm + mdanalysis
│   ├── Quantum Computing → pennylane / qiskit / qutip
│   ├── PDE Solving → fenics-dolfinx / dedalus
│   └── Monte Carlo → numba (JIT acceleration)
│
├── 数据科学 Data Science
│   ├── General Stats → statsmodels + scipy
│   ├── Bayesian → pymc
│   ├── Time Series → timesfm / aeon / prophet
│   ├── Causal Inference → statspai / causalml
│   ├── Explainability → shap
│   ├── Optimization → optuna
│   └── ETL → petl + dask
│
├── 生物 Biology
│   ├── Genomics → biopython + pysam
│   ├── Single-cell → scanpy + scvi-tools
│   ├── Differential Expression → pydeseq2
│   ├── Gene Networks → arboreto
│   ├── Enrichment → gseapy
│   └── Protein Structures → gget alphafold
│
├── 化学 Chemistry
│   ├── Molecular Manipulation → rdkit + datamol
│   ├── Property Prediction → deepchem
│   ├── Docking → diffdock
│   ├── Descriptors → molfeat
│   ├── Kinetics/Thermo → cantera
│   └── Mass Spectrometry → matchms / pyopenms
│
├── 工程 Engineering
│   ├── Control Systems → control
│   ├── Optimization → pyomo / pymoo
│   ├── FEM/CFD → fenics-dolfinx
│   ├── Simulation → simpy
│   ├── Fluid Dynamics → fluids
│   ├── Chemical Engineering → cantera
│   ├── Multibody Dynamics → pydy / pinocchio
│   └── 3D Modeling → cadquery + pyvista
│
├── 医学 Medicine
│   ├── Medical Imaging → monai + pydicom
│   ├── EHR/Clinical → pyhealth
│   ├── Survival Analysis → scikit-survival / lifelines
│   ├── Physiology Signals → neurokit2
│   ├── Pathology → histolab / pathml
│   └── Causal (clinical) → statspai
│
├── 社科/经济 Social Science/Economics
│   ├── Panel Data → linearmodels
│   ├── Economic Data → fredapi + wbgapi
│   ├── Causal Inference → statspai / causalml
│   └── Survey Analysis → (R survey package via rpy2)
│
├── 地学 Geoscience
│   ├── Spatial Vector → geopandas
│   ├── Spatial Raster → rasterio
│   ├── Climate Data → xarray + netcdf4
│   ├── Maps → cartopy + pygmt
│   └── Seismology → obspy
│
└── 数学 Mathematics
    ├── Symbolic → sympy
    ├── Numerical → numpy + scipy
    ├── Bayesian → pymc
    ├── Arbitrary Precision → mpmath
    └── Computer Algebra → sagemath (system)
```

## Integration / 集成

This registry is referenced by:
- `references/data-processing-guide.md` — Stage-specific tool recommendations
- `references/deep-reading-guide.md` — Paper analysis tools
- `workflows/experiment-design.md` — Experiment tool selection
- `references/causal-inference-guide.md` — Causal inference tools
- Every methodology reference includes a "Recommended Tools" section pointing here

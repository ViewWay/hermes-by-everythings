---
name: xlsx
description: Read and write Excel .xlsx files — cell formatting, charts, formulas, and pandas integration
domain: Data I/O
install: pip install openpyxl
---

# openpyxl (xlsx) — Excel File I/O / Excel 文件读写

openpyxl reads and writes Excel .xlsx files with full support for cell formatting, formulas, charts, conditional formatting, and pandas integration.

## When to Use / 适用场景

- Reading experimental data stored in Excel spreadsheets
- Writing result tables with formatting for supplementary materials
- Automating report generation with charts
- Converting between CSV/TSV and Excel formats

## Quick Start / 快速开始

```python
import openpyxl

# Read workbook
wb = openpyxl.load_workbook("data.xlsx")
ws = wb.active

# Access cells
for row in ws.iter_rows(min_row=2, values_only=True):
    print(row)

# Write workbook
wb = openpyxl.Workbook()
ws = wb.active
ws["A1"] = "Gene"
ws["B1"] = "log2FC"
ws["C1"] = "padj"
for i, (gene, fc, p) in enumerate(data):
    ws.cell(row=i+2, column=1, value=gene)
    ws.cell(row=i+2, column=2, value=fc)
    ws.cell(row=i+2, column=3, value=p)
wb.save("results.xlsx")

# With pandas
import pandas as pd
df = pd.read_excel("data.xlsx", engine="openpyxl")
df.to_excel("output.xlsx", engine="openpyxl", index=False)
```

## Core Capabilities / 核心能力

### 1. Reading Workbooks / 读取工作簿

```python
import openpyxl

wb = openpyxl.load_workbook("data.xlsx", data_only=True)  # data_only evaluates formulas
print(wb.sheetnames)

ws = wb["Sheet1"]
# Cell access
cell = ws["A1"]          # A1 notation
cell = ws.cell(row=1, column=1)  # Row/Column notation
print(cell.value, cell.data_type)

# Iterate rows
for row in ws.iter_rows(min_row=2, max_row=100, values_only=True):
    print(row)

# Iterate columns
for col in ws.iter_cols(min_col=1, max_col=5, values_only=True):
    print(col)

# Read specific range
for row in ws["A1:C10"]:
    for cell in row:
        print(cell.value)
```

### 2. Writing with Formatting / 带格式写入

```python
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

wb = openpyxl.Workbook()
ws = wb.active

# Header styling
header_font = Font(bold=True, size=12)
header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
header_font_white = Font(bold=True, size=11, color="FFFFFF")
thin_border = Border(
    left=Side(style="thin"), right=Side(style="thin"),
    top=Side(style="thin"), bottom=Side(style="thin")
)

headers = ["Gene", "log2FC", "padj", "Significant"]
for col, header in enumerate(headers, 1):
    cell = ws.cell(row=1, column=col, value=header)
    cell.font = header_font_white
    cell.fill = header_fill
    cell.alignment = Alignment(horizontal="center")
    cell.border = thin_border

# Data rows with conditional formatting
for i, row_data in enumerate(results, 2):
    for j, val in enumerate(row_data, 1):
        cell = ws.cell(row=i, column=j, value=val)
        cell.border = thin_border
        if j == 4 and val == "Yes":
            cell.fill = PatternFill(start_color="C6EFCE", end_color="C6EFCE", fill_type="solid")

# Auto-width columns
for col in range(1, len(headers) + 1):
    ws.column_dimensions[get_column_letter(col)].width = 15

wb.save("formatted_results.xlsx")
```

### 3. Charts / 图表

```python
from openpyxl.chart import BarChart, LineChart, Reference

wb = openpyxl.Workbook()
ws = wb.active

# Add data
ws.append(["Method", "Accuracy", "F1"])
for row in benchmark_data:
    ws.append(row)

# Create bar chart
chart = BarChart()
chart.title = "Model Comparison"
chart.x_axis.title = "Method"
chart.y_axis.title = "Score"
data = Reference(ws, min_col=2, min_row=1, max_col=3, max_row=len(benchmark_data) + 1)
cats = Reference(ws, min_col=1, min_row=2, max_row=len(benchmark_data) + 1)
chart.add_data(data, titles_from_data=True)
chart.set_categories(cats)
ws.add_chart(chart, "E2")

wb.save("results_with_chart.xlsx")
```

### 4. Formulas and Data Validation / 公式与数据验证

```python
import openpyxl

wb = openpyxl.Workbook()
ws = wb.active

# Write data
ws["A1"] = 10
ws["B1"] = 20
ws["C1"] = "=A1+B1"  # Formula

# Data validation
from openpyxl.worksheet.datavalidation import DataValidation
dv = DataValidation(type="list", formula1='"Yes,No,Maybe"')
ws.add_data_validation(dv)
dv.add("D2:D100")

wb.save("formulas.xlsx")
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Export DE Results to Formatted Excel / 导出 DE 结果到格式化 Excel

```python
import openpyxl
from openpyxl.styles import Font, PatternFill, Border, Side
from openpyxl.utils import get_column_letter
import pandas as pd

df = pd.read_csv("de_results.csv")

wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Differential Expression"

# Headers
headers = list(df.columns)
header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
for col, h in enumerate(headers, 1):
    cell = ws.cell(row=1, column=col, value=h)
    cell.font = Font(bold=True, color="FFFFFF")
    cell.fill = header_fill

# Data
sig_fill = PatternFill(start_color="C6EFCE", end_color="C6EFCE", fill_type="solid")
for i, row in df.iterrows():
    for j, val in enumerate(row, 1):
        ws.cell(row=i+2, column=j, value=val)
    if row.get("padj", 1) < 0.05:
        for j in range(1, len(headers) + 1):
            ws.cell(row=i+2, column=j).fill = sig_fill

# Auto-width
for col in range(1, len(headers) + 1):
    max_len = max(len(str(ws.cell(row=r, column=col).value or "")) for r in range(1, min(50, len(df)+2)))
    ws.column_dimensions[get_column_letter(col)].width = min(max_len + 2, 30)

wb.save("DE_results_formatted.xlsx")
```

## Best Practices / 最佳实践

- Use `data_only=True` when reading files with formulas to get computed values
- Use pandas for bulk data operations, openpyxl for formatting
- Set `ws.column_dimensions` for readable column widths
- Use conditional formatting for highlighting significant results

## Common Pitfalls / 常见陷阱

- **Formulas**: Without `data_only=True`, formula cells return the formula string, not the result
- **Large files**: openpyxl is slow for files >100K rows; use pandas `read_excel` instead
- **Date handling**: Excel stores dates as numbers; use `openpyxl.utils.datetime.from_excel()`
- **Memory**: `load_workbook(read_only=True)` for large files

## Integration with HBE / 与 HBE 集成

- Export results from `references/tools/pandas.md` dataframes to formatted Excel
- Use in `workflows/paper-writing.md` for supplementary material preparation
- Pair with `references/tools/matplotlib.md` for chart generation

## Resources / 资源

- Documentation: https://openpyxl.readthedocs.io/
- Tutorial: https://openpyxl.readthedocs.io/en/stable/tutorial.html

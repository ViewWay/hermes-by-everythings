---
name: clinical-reports
description: Clinical report generation — automated medical report writing from structured data, imaging findings, and model predictions
domain: Medicine / Reporting
install: pip install jinja2 fpdf2 python-docx
---

# clinical-reports — Clinical Report Generation

Provides patterns for programmatically generating clinical reports from structured data sources including imaging findings, laboratory results, and AI model predictions. Supports PDF, DOCX, and HTML output formats with templates for radiology reports, pathology summaries, and structured clinical notes.

## When to Use

- Generating radiology reports from DICOM metadata and AI model outputs
- Creating structured pathology reports from image analysis pipelines
- Automating clinical trial summary reports from EHR data extracts
- Building batch report generation for large imaging studies
- Creating standardized report templates with dynamic content insertion

## Quick Start

```python
from jinja2 import Template
from fpdf import FPDF

# Define report template
template_str = """
CLINICAL IMAGING REPORT
=======================
Patient ID: {{ patient_id }}
Study Date: {{ study_date }}
Modality: {{ modality }}

FINDINGS:
{% for finding in findings %}
  - {{ finding.location }}: {{ finding.description }}
    Severity: {{ finding.severity }} (confidence: {{ finding.confidence }}%)
{% endfor %}

IMPRESSION:
{{ impression }}

Signed: Radiology AI Assistant | Generated: {{ generated_at }}
"""

# Populate with data
report_data = {
    "patient_id": "PT-2024-00142",
    "study_date": "2024-03-15",
    "modality": "CT Chest",
    "findings": [
        {"location": "Right upper lobe", "description": "8mm nodule, spiculated margins",
         "severity": "Concerning", "confidence": 87},
        {"location": "Left lower lobe", "description": "2mm granuloma, stable",
         "severity": "Benign", "confidence": 95},
    ],
    "impression": "1. Right upper lobe nodule (8mm) with spiculated margins - recommend follow-up CT in 3 months (Lung-RADS 4A).\n2. Left lower lobe granuloma, likely benign - no follow-up needed.",
    "generated_at": "2024-03-15T14:32:00Z",
}

template = Template(template_str)
report_text = template.render(**report_data)
print(report_text)
```

## Core Capabilities

### 1. PDF Report Generation with fpdf2

```python
from fpdf import FPDF

class ClinicalReport(FPDF):
    def header(self):
        self.set_font("Helvetica", "B", 14)
        self.cell(0, 10, "INSTITUTIONAL RADIOLOGY REPORT", ln=True, align="C")
        self.set_font("Helvetica", "", 8)
        self.cell(0, 5, "CONFIDENTIAL - For Clinical Use Only", ln=True, align="C")
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")

    def section(self, title):
        self.set_font("Helvetica", "B", 11)
        self.set_fill_color(240, 240, 240)
        self.cell(0, 7, title, ln=True, fill=True)
        self.ln(2)

    def body_text(self, text):
        self.set_font("Helvetica", "", 10)
        self.multi_cell(0, 5, text)
        self.ln(2)

pdf = ClinicalReport()
pdf.alias_nb_pages()
pdf.add_page()

# Patient info table
pdf.set_font("Helvetica", "", 9)
fields = [("Patient ID:", "PT-2024-00142"), ("DOB:", "1958-06-12"),
          ("Study:", "CT Chest w/ Contrast"), ("Date:", "2024-03-15")]
for label, value in fields:
    pdf.cell(40, 6, label, border=0)
    pdf.cell(0, 6, value, ln=True)

pdf.ln(5)
pdf.section("FINDINGS")
pdf.body_text("1. Right upper lobe: 8mm spiculated nodule (Lung-RADS 4A).\n"
              "2. Left lower lobe: 2mm stable granuloma.\n"
              "3. No pleural effusion. No mediastinal lymphadenopathy.")

pdf.section("IMPRESSION")
pdf.body_text("Indeterminate right upper lobe nodule. Recommend follow-up CT in 3 months.")

pdf.output("radiology_report.pdf")
```

### 2. DOCX Report with python-docx

```python
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

doc = Document()

# Title
title = doc.add_heading("Pathology Report", level=0)
title.alignment = WD_ALIGN_PARAGRAPH.CENTER

# Patient metadata table
table = doc.add_table(rows=4, cols=2, style="Light Grid Accent 1")
table.alignment = WD_TABLE_ALIGNMENT.CENTER
metadata = [
    ("Patient ID", "PT-2024-00142"), ("Accession", "ACC-98432"),
    ("Specimen", "Core needle biopsy - breast"), ("Date", "2024-03-15"),
]
for i, (label, value) in enumerate(metadata):
    table.rows[i].cells[0].text = label
    table.rows[i].cells[1].text = value

doc.add_paragraph()
doc.add_heading("Diagnosis", level=1)
p = doc.add_paragraph()
p.add_run("Invasive ductal carcinoma, ").bold = True
p.add_run("Nottingham grade 2, ER positive (90%), PR positive (75%), HER2 negative (1+).")

doc.add_heading("Molecular Markers", level=2)
marker_table = doc.add_table(rows=4, cols=3, style="Light Grid Accent 1")
for i, row_data in enumerate([
    ["Marker", "Result", "Interpretation"],
    ["ER", "90%", "Positive"],
    ["PR", "75%", "Positive"],
    ["HER2", "1+", "Negative"],
]):
    for j, cell_text in enumerate(row_data):
        marker_table.rows[i].cells[j].text = cell_text

doc.save("pathology_report.docx")
```

### 3. Batch Report Generation from Analysis Results

```python
import pandas as pd
from jinja2 import Template
from pathlib import Path
from datetime import datetime

# Load analysis results from ML pipeline
results_df = pd.read_csv("analysis_results.csv")  # columns: patient_id, findings, risk_score, recommendation

report_template = Template("""
CLINICAL SCREENING REPORT
=========================
Patient: {{ patient_id }}
Report Date: {{ report_date }}

SUMMARY
-------
Overall Risk Score: {{ risk_score }}/100
Classification: {{ classification }}
Recommendation: {{ recommendation }}

DETAILED FINDINGS
-----------------
{% for f in findings %}
{{ loop.index }}. {{ f }}
{% endfor %}

---
Generated by AI Screening Pipeline v2.1 | {{ report_date }}
""")

def generate_reports(results_df, output_dir="reports/"):
    Path(output_dir).mkdir(exist_ok=True)
    for _, row in results_df.iterrows():
        classification = "HIGH RISK" if row["risk_score"] >= 70 else (
                         "MODERATE" if row["risk_score"] >= 30 else "LOW RISK")
        report = report_template.render(
            patient_id=row["patient_id"],
            report_date=datetime.now().strftime("%Y-%m-%d %H:%M"),
            risk_score=int(row["risk_score"]),
            classification=classification,
            recommendation=row["recommendation"],
            findings=row["findings"].split(";"),
        )
        with open(f"{output_dir}/report_{row['patient_id']}.txt", "w") as f:
            f.write(report)

generate_reports(results_df)
print(f"Generated {len(results_df)} reports")
```

## Common Academic Workflow: Radiology AI Report Pipeline

```python
# Full pipeline: DICOM -> AI model -> structured report
import pydicom
import numpy as np

# 1. Read DICOM metadata
ds = pydicom.dcmread("ct_chest.dcm")
patient_info = {
    "patient_id": ds.PatientID,
    "study_date": ds.StudyDate,
    "modality": ds.Modality,
}

# 2. Run AI model (example)
# predictions = model.predict(ds.pixel_array)
# findings = postprocess(predictions)

# 3. Generate report
report_text = Template("...").render(**patient_info, findings=findings)
```

## Best Practices

1. Always include patient identifiers, study metadata, and generation timestamps for traceability
2. Use standardized terminology (RadLex, SNOMED CT) for finding descriptions
3. Include confidence scores and model version in AI-generated reports for transparency
4. Implement a human-review step before finalizing AI-generated clinical reports
5. Follow institutional report templates and formatting requirements

## Common Pitfalls

1. **Missing PHI redaction**: Ensure patient names and SSNs are not included in research report outputs
2. **Inconsistent terminology**: Free-text findings from different models may use inconsistent language
3. **Template injection**: Sanitize user-provided data before inserting into Jinja2 templates
4. **Encoding issues**: PDF generation may fail with non-ASCII characters; use UTF-8 explicitly

## Integration with HBE

- Use with `references/tools/pydicom.md` for DICOM metadata extraction
- Pair with `references/tools/docx.md` for Word document generation
- Combine with `references/tools/clinical-decision-support.md` for AI predictions
- Supports `references/tool-registry.md` clinical informatics tool chain

## Resources

- Jinja2: https://jinja.palletsprojects.com/
- fpdf2: https://py-pdf.github.io/fpdf2/
- python-docx: https://python-docx.readthedocs.io/
- RadLex Terminology: https://radlex.org/

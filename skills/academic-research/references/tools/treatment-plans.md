---
name: treatment-plans
description: Clinical treatment planning — evidence-based treatment recommendation and decision support using structured clinical protocols
domain: Medicine / Clinical
install: pip install treatment-plans 2>/dev/null || echo "See documentation"
---

# treatment-plans — Clinical Treatment Planning

Provides a structured framework for generating evidence-based clinical treatment plans. Encodes clinical guidelines, drug interaction checks, and protocol-based recommendation engines that support clinicians in creating personalized treatment strategies.

## When to Use

- Building clinical decision support systems that recommend treatment protocols
- Encoding clinical practice guidelines as executable rule sets
- Generating personalized treatment plans from patient phenotypes and genotypes
- Validating treatment plans against drug-drug interaction databases
- Supporting clinical trial arm assignment based on eligibility criteria

## Quick Start

```python
from treatment_plans import ProtocolEngine, PatientProfile, TreatmentPlan

# Define a patient profile
patient = PatientProfile(
    age=62,
    sex="M",
    weight_kg=82,
    diagnoses=["NSCLC", "stage_IIIA"],
    biomarkers={"EGFR": "wild_type", "PD_L1": "high"},
    comorbidities=["hypertension", "type2_diabetes"],
    medications=["metformin", "lisinopril"],
    ecog_status=1,
    creatinine_clearance=75,  # mL/min
)

# Initialize protocol engine with guidelines
engine = ProtocolEngine(guideline_source="nccn_nslclc_v4.2024")

# Generate treatment recommendations
recommendations = engine.recommend(patient, top_k=3)
for rec in recommendations:
    print(f"Regimen: {rec.regimen_name}")
    print(f"  Evidence level: {rec.evidence_level}")
    print(f"  Contraindications: {rec.contraindications}")
    print(f"  Expected benefit: {rec.expected_benefit}")
```

## Core Capabilities

### 1. Protocol Encoding and Rule Engine

```python
from treatment_plans import ProtocolEngine, Rule, Condition

# Define custom eligibility rules
engine = ProtocolEngine()

engine.add_rule(Rule(
    name="platinum_eligibility",
    conditions=[
        Condition(field="ecog_status", operator="<=", value=2),
        Condition(field="creatinine_clearance", operator=">=", value=60),
    ],
    action="allow_platinum_doublet"
))

engine.add_rule(Rule(
    name="immunotherapy_eligibility",
    conditions=[
        Condition(field="PD_L1", operator="in", value=["high", "medium"]),
        Condition(field="ecog_status", operator="<=", value=1),
    ],
    action="add_pembrolizumab"
))

# Evaluate rules against a patient
patient = PatientProfile(ecog_status=1, PD_L1="high", creatinine_clearance=70)
actions = engine.evaluate(patient)
print(f"Approved actions: {actions}")
```

### 2. Drug Interaction Checking

```python
from treatment_plans import InteractionChecker, Medication

checker = InteractionChecker(source="drugs.com")

# Check interactions for a proposed regimen
proposed = [
    Medication(name="carboplatin", dose="AUC=5", route="IV"),
    Medication(name="pemetrexed", dose="500mg/m2", route="IV"),
    Medication(name="pembrolizumab", dose="200mg", route="IV"),
]

# Include patient's existing medications
existing = [
    Medication(name="metformin", dose="1000mg", route="PO"),
    Medication(name="lisinopril", dose="10mg", route="PO"),
]

interactions = checker.check(proposed + existing)
for ixn in interactions:
    print(f"Severity: {ixn.severity} | {ixn.drug1} + {ixn.drug2}")
    print(f"  Description: {ixn.description}")
    print(f"  Management: {ixn.management}")
```

### 3. Dose Calculation and Adjustment

```python
from treatment_plans import DoseCalculator, RenalAdjustment

# Calculate dose based on body surface area
calculator = DoseCalculator()
bsa_dose = calculator.by_bsa(drug="carboplatin", target_dose="AUC=5",
                              weight_kg=82, height_cm=178, age=62,
                              creatinine=1.1)  # Calvert formula

print(f"Carboplatin dose: {bsa_dose:.0f} mg")

# Apply renal dose adjustments
adjusted = RenalAdjustment.adjust(
    drug="cisplatin",
    standard_dose=100,
    crcl=55,  # mL/min
    adjustment_table="KDIGO_2023"
)
print(f"Adjusted cisplatin: {adjusted:.0f} mg (standard: 100 mg)")
```

## Common Academic Workflow: Clinical Trial Eligibility Screening

```python
from treatment_plans import ProtocolEngine, PatientProfile, EligibilityResult
import pandas as pd

# Load patient cohort
patients_df = pd.read_csv("cohort_demographics.csv")

# Define trial eligibility criteria
engine = ProtocolEngine()
engine.load_trial_protocol("NCT04267948")

eligible_patients = []
for _, row in patients_df.iterrows():
    patient = PatientProfile(
        age=row["age"], sex=row["sex"],
        diagnoses=row["diagnoses"].split(";"),
        biomarkers=dict(kv.split(":") for kv in row["biomarkers"].split(";")),
        ecog_status=row["ecog"],
        creatinine_clearance=row["crcl"],
        liver_function=row["ast"],
    )
    result = engine.check_eligibility(patient, trial_id="NCT04267948")
    if result.eligible:
        eligible_patients.append({
            "patient_id": row["patient_id"],
            "matched_criteria": result.matched_criteria,
            "warnings": result.warnings,
        })

print(f"Screened {len(patients_df)} patients, {len(eligible_patients)} eligible")
eligibility_df = pd.DataFrame(eligible_patients)
eligibility_df.to_csv("eligible_patients_NCT04267948.csv", index=False)
```

## Best Practices

1. Always include a clinician-in-the-loop review step before finalizing any treatment plan
2. Version-control your guideline sources and track which NCCN/ESMO guideline version is loaded
3. Log all rule evaluations for audit trails and reproducibility
4. Validate dose calculations against established nomograms and calculators (e.g., CKD-EPI)
5. Store treatment plans in structured formats (FHIR PlanDefinition or HL7 CDS Hooks)

## Common Pitfalls

1. **Stale guidelines**: Clinical guidelines update frequently; always verify guideline version currency
2. **Missing contraindications**: Rule engines cannot capture all clinical nuance; rare contraindications may be missed
3. **Off-label use**: Ensure the system distinguishes between FDA-approved and off-label indications
4. **BMI and weight errors**: Verify patient weight/height units (kg vs lbs, cm vs inches) before dose calculations

## Integration with HBE

- Use within `workflows/experiment-design.md` for clinical study design
- Pair with `references/tools/clinical-decision-support.md` for AI-enhanced recommendations
- Combine with `references/tools/pandas.md` for cohort data processing
- Supports `references/tool-registry.md` clinical informatics tool chain

## Resources

- Documentation: https://treatment-plans.readthedocs.io/
- NCCN Guidelines: https://www.nccn.org/
- FHIR PlanDefinition: https://hl7.org/fhir/plandefinition.html

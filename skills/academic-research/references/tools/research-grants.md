---
name: research-grants
description: Grant proposal writing methodology — structured approach to research funding applications with templates and best practices
domain: Research / Funding
install: pip install 2>/dev/null || echo "No package required — this is a methodology reference"
---

# research-grants — Grant Proposal Writing Methodology

## Overview

Research grants provides a structured methodology for writing competitive grant proposals. It covers proposal anatomy (specific aims, background, significance, approach), budget planning, timeline construction, review criteria alignment (NIH, NSF, ERC), and common templates. Designed for researchers preparing R01, R21, CAREER, ERC Starting/Consolidator, and similar proposals.

## When to Use

- Preparing a grant proposal for the first time and needing structure
- Refining an existing proposal to better align with review criteria
- Building a budget justification and project timeline
- Translating research plans into compelling "broader impacts" or "significance" sections
- Preparing resubmissions after initial review

## Quick Start

```python
# Grant proposal outline generator
proposal_structure = {
    "1. Specific Aims (1 page)": {
        "purpose": "State what you will accomplish and why it matters",
        "structure": [
            "1-2 sentences: broad significance of the problem",
            "1 paragraph: state of the field and critical gap",
            "2-3 paragraphs: your approach, innovation, and expected outcomes",
            "1 paragraph: impact and long-term vision",
        ],
        "tip": "Write this section LAST — it should summarize the entire proposal",
    },
    "2. Research Strategy (6-12 pages)": {
        "subsections": {
            "A. Significance": "Why is this problem important? What gap will you fill?",
            "B. Innovation": "What is new? How does it challenge current paradigms?",
            "C. Approach": "How will you do it? Preliminary data, methods, pitfalls.",
        },
    },
    "3. Budget and Justification": "Direct costs, personnel, equipment, travel",
    "4. Timeline / Milestones": "Gantt-style with deliverables per year",
    "5. Biosketch and Environment": "PI qualifications, institutional resources",
}

for section, details in proposal_structure.items():
    print(f"\n{section}")
    if isinstance(details, dict):
        for k, v in details.items():
            print(f"  {k}: {v}")
    else:
        print(f"  {details}")
```

## Core Capabilities

### 1. Proposal Structure Templates

```python
def generate_specific_aims(aims_list, significance_one_liner, long_term_vision):
    """Generate a structured Specific Aims page."""
    page = []
    page.append(significance_one_liner)
    page.append("")
    page.append(f"Long-term goal: {long_term_vision}")
    page.append("")
    page.append(f"The overall objective of this proposal is to {aims_list[0]['goal']}. "
                f"Our central hypothesis is that {aims_list[0]['hypothesis']}. "
                f"We plan to test this hypothesis by pursuing the following specific aims:")
    page.append("")

    for i, aim in enumerate(aims_list, 1):
        page.append(f"Aim {i}: {aim['title']}")
        page.append(f"  Rationale: {aim['rationale']}")
        page.append(f"  Approach: {aim['approach']}")
        page.append(f"  Expected outcome: {aim['expected_outcome']}")
        page.append(f"  Milestone: {aim['milestone']}")
        page.append("")

    page.append("Upon completion, this work will [impact statement]. "
                "This is significant because [significance].")
    return "\n".join(page)

aims = [
    {
        "goal": "develop a novel framework for adaptive experimental design in biology",
        "hypothesis": "Bayesian optimization can reduce experimental cost by 50% while maintaining statistical power",
        "title": "Establish a Bayesian optimization framework for multi-objective biological experiments",
        "rationale": "Current DOE methods require 3-5x more experiments than theoretically necessary",
        "approach": "We will develop a multi-objective GP-based optimizer with biological constraint handling",
        "expected_outcome": "A validated software tool that reduces experimental costs by 50%+",
        "milestone": "Year 1: Prototype on 3 benchmark problems; Year 2: Validation on 2 wet-lab campaigns",
    },
]
print(generate_specific_aims(aims,
    significance_one_liner="Biological experiments cost $50B/year globally, yet most experimental designs are suboptimal.",
    long_term_vision="make every biological experiment as efficient as theoretically possible through AI-driven design",
))
```

### 2. Budget Planning

```python
def generate_budget_template(years=3, senior_personnel=1, postdocs=1,
                             grad_students=2, percent_effort=None):
    """Generate a structured budget table."""
    if percent_effort is None:
        percent_effort = {"PI": 20, "postdoc": 100, "grad": 50}

    budget = []
    budget.append(f"{'Category':<30} {'Year 1':>10} {'Year 2':>10} {'Year 3':>10} {'Total':>10}")
    budget.append("-" * 72)

    # Personnel
    pi_salary = 120000 * percent_effort["PI"] / 100
    postdoc_salary = 65000 * percent_effort["postdoc"] / 100
    grad_salary = 35000 * percent_effort["grad"] / 100

    personnel_y1 = pi_salary + postdoc_salary + grad_salary * grad_students
    personnel_y23 = personnel_y1 * 1.03  # 3% raise
    personnel_total = personnel_y1 + personnel_y23 * 2
    budget.append(f"{'  Senior Personnel (PI)':<30} ${pi_salary:>9,.0f} ${pi_salary*1.03:>9,.0f} ${pi_salary*1.03**2:>9,.0f} ${personnel_total:>9,.0f}")

    # Fringe benefits (typically 28-35% of salary)
    fringe_rate = 0.30
    fringe_total = personnel_total * fringe_rate
    budget.append(f"{'  Fringe Benefits (30%)':<30} ${personnel_y1*fringe_rate:>9,.0f} ${personnel_y23*fringe_rate:>9,.0f} ${personnel_y23*fringe_rate:>9,.0f} ${fringe_total:>9,.0f}")

    # Equipment, supplies, travel, other
    supplies = 15000
    travel = 5000
    other = 8000  # publications, cloud computing
    budget.append(f"{'  Supplies':<30} ${supplies:>9,} ${supplies:>9,} ${supplies:>9,} ${supplies*3:>9,}")
    budget.append(f"{'  Travel':<30} ${travel:>9,} ${travel:>9,} ${travel:>9,} ${travel*3:>9,}")
    budget.append(f"{'  Other (cloud, publications)':<30} ${other:>9,} ${other:>9,} ${other:>9,} ${other*3:>9,}")

    budget.append("-" * 72)
    total_direct = personnel_total + fringe_total + (supplies + travel + other) * 3
    budget.append(f"{'TOTAL DIRECT COSTS':<30} {'':>10} {'':>10} {'':>10} ${total_direct:>9,.0f}")

    return "\n".join(budget)

print(generate_budget_template(years=3))
```

### 3. Review Criteria Alignment

```python
def nih_review_criteria_checklist(proposal_sections):
    """Check proposal against NIH review criteria."""
    criteria = {
        "Significance": {
            "weight": "High",
            "checks": [
                "Does the project address an important problem?",
                "Is there a critical gap in knowledge?",
                "Will the results change current practice or understanding?",
                "Are the patients/population affected clearly defined?",
            ],
        },
        "Investigator": {
            "weight": "High",
            "checks": [
                "Are the PI and team appropriately trained and experienced?",
                "Is there evidence of productivity (publications, prior funding)?",
                "Are the roles of each team member clearly defined?",
            ],
        },
        "Innovation": {
            "weight": "High",
            "checks": [
                "Does the project challenge existing paradigms?",
                "Is the approach novel or does it use new technologies?",
                "Are new concepts, methods, or tools being developed?",
            ],
        },
        "Approach": {
            "weight": "High",
            "checks": [
                "Are the overall strategy and methodology well-reasoned?",
                "Are potential pitfalls identified with alternative approaches?",
                "Is there sufficient preliminary data?",
                "Are statistical methods and power calculations included?",
            ],
        },
        "Environment": {
            "weight": "Moderate",
            "checks": [
                "Does the institution have adequate facilities and resources?",
                "Is there evidence of institutional commitment?",
            ],
        },
    }

    for criterion, details in criteria.items():
        print(f"\n{criterion} (Weight: {details['weight']})")
        for check in details["checks"]:
            status = "[ ]"
            print(f"  {status} {check}")

    return criteria

nih_review_criteria_checklist({})
```

## Common Academic Workflow

### Complete Grant Proposal Development

```python
def proposal_checklist():
    """Master checklist for a competitive grant proposal."""
    tasks = [
        ("Preparation", [
            "Read program announcement and review criteria carefully",
            "Contact program officer to discuss fit and get feedback",
            "Review 3-5 recently funded proposals in the same program",
            "Assemble team and define roles/responsibilities",
        ]),
        ("Writing", [
            "Write Specific Aims (1 page) — write LAST",
            "Draft Significance section with clear gap statement",
            "Draft Innovation section highlighting novelty",
            "Draft Approach with preliminary data, methods, and alternatives",
            "Include statistical power analysis for key experiments",
            "Write human subjects / animal use sections if applicable",
            "Write Broader Impacts / Intellectual Merit (NSF) or Diversity (NIH)",
        ]),
        ("Budget", [
            "Build detailed budget with justification for each line item",
            "Check institutional F&A (indirect cost) rate agreement",
            "Ensure budget matches the proposed work (no obvious gaps)",
        ]),
        ("Review", [
            "Internal review by 2-3 colleagues in the field",
            "Check page limits, font size, formatting requirements",
            "Verify all required forms (biosketch, current/pending support, etc.)",
            "Submit 5+ days before deadline to allow for technical issues",
        ]),
    ]

    for phase, items in tasks:
        print(f"\n=== {phase} ===")
        for item in items:
            print(f"  [ ] {item}")

proposal_checklist()
```

## Best Practices

1. **Start with the aims page**: Draft your Specific Aims early and refine it throughout the writing process. Reviewers read this first and form initial impressions.
2. **Show, do not just tell**: Use preliminary data to demonstrate feasibility. Even 1-2 figures of pilot data dramatically strengthen the proposal.
3. **Address weaknesses proactively**: If you identify a potential weakness, address it directly with mitigation strategies. Reviewers will find it anyway.
4. **Follow the review criteria exactly**: Structure your proposal around the stated criteria. Use their exact terminology.
5. **Get internal reviews early**: Ask colleagues to review at least 2 weeks before the deadline. Incorporate feedback and revise.

## Common Pitfalls

1. **Too ambitious**: Proposing too many aims or too much work signals poor planning. Focus on 2-3 achievable aims with clear milestones.
2. **Vague significance**: Failing to clearly state why the work matters is the most common weakness. Lead with the problem, not the solution.
3. **No preliminary data**: Reviewers are skeptical of untested approaches. Include at least proof-of-concept results.
4. **Ignoring page limits**: Proposals over the limit are returned without review. Budget formatting time as part of your timeline.
5. **Late submission**: Technical glitches are common on deadline days. Submit at least 48 hours early.

## Integration with HBE

- Use `references/literature-review.md` to establish the knowledge gap for significance section
- Combine with `references/research-lookup.md` to demonstrate trending importance of the topic
- Feed into `references/scientific-writing.md` for clear, persuasive prose
- Supports `references/citation-management.md` for maintaining reference lists

## Resources

- NIH Grants and Funding: https://grants.nih.gov/
- NSF Proposal & Award Policies: https://nsf.gov/pubs/policydocs/pappg24_1/pappg_1.jsp
- ERC Grants: https://erc.europa.eu/apply-grant
- NIH R01 Sample Applications: https://grants.nih.gov/grants/funding/r01.htm
- NIAID Grant Writing Tips: https://www.niaid.nih.gov/grants-contracts/write-grant

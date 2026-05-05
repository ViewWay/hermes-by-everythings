---
name: opentrons-integration
description: Opentrons robot integration — automated liquid handling protocols for lab automation using Python API
domain: Biology / Lab Automation
install: pip install opentrons
---

# Opentrons Integration

Opentrons is an open-source liquid handling robot platform for life science labs. Its Python API allows researchers to define, simulate, and execute automated pipetting protocols on OT-2 and Flex robots, enabling reproducible high-throughput experiments in molecular biology, genomics, and drug discovery.

## When to Use

- Automating repetitive pipetting tasks (serial dilutions, plate setups, PCR prep)
- Building high-throughput screening protocols (96-well, 384-well plates)
- Ensuring reproducibility across experiments with codified protocols
- Integrating lab automation into computational biology pipelines
- Setting up cherrypicking, pooling, or normalization workflows
- Replacing manual liquid handling in genomics workflows (library prep, NGS)

## Quick Start

```python
from opentrons import protocol_api

metadata = {
    "apiLevel": "2.13",
    "protocolName": "Basic Transfer"
}

def run(protocol: protocol_api.ProtocolContext):
    # Labware setup
    tiprack = protocol.load_labware("opentrons_96_tiprack_300ul", "1")
    plate = protocol.load_labware("nest_96_wellplate_200ul_flat", "2")
    reservoir = protocol.load_labware("nest_12_reservoir_15ml", "3")

    # Pipette setup
    pipette = protocol.load_instrument(
        "p300_single_gen2", "right", tip_racks=[tiprack]
    )

    # Transfer 100uL from reservoir column 1 to plate row A
    pipette.transfer(
        100,
        reservoir.wells_by_name()["A1"],
        plate.wells_by_name()["A1"],
        new_tip="once"
    )
```

## Core Capabilities

### 1. Protocol Builder and Labware Loading

Opentrons supports a wide catalog of labware. Custom labware definitions can be created for non-standard plates and tubes.

```python
def run(protocol: protocol_api.ProtocolContext):
    # Load standard labware
    tiprack_300 = protocol.load_labware("opentrons_96_tiprack_300ul", "1")
    tiprack_20 = protocol.load_labware("opentrons_96_tiprack_20ul", "4")
    source_plate = protocol.load_labware("corning_96_wellplate_360ul_flat", "2")
    dest_plate = protocol.load_labware("biorad_96_wellplate_200ul_pcr", "5")

    # Load pipettes
    p300 = protocol.load_instrument("p300_single_gen2", "left", tip_racks=[tiprack_300])
    p20 = protocol.load_instrument("p20_single_gen2", "right", tip_racks=[tiprack_20])
```

### 2. Transfer Operations and Mixing

Perform column transfers, plate replications, and liquid mixing with fine-grained control.

```python
def transfer_plate_replication(pipette, source, dest, volume):
    """Replicate an entire plate from source to destination."""
    for src_well, dst_well in zip(source.wells(), dest.wells()):
        pipette.transfer(
            volume,
            src_well,
            dst_well,
            mix_after=(3, volume * 0.5),  # Mix 3 times at half volume
            new_tip="always"               # Fresh tip for each transfer
        )

# Serial dilution across a row
def serial_dilution(pipette, plate, start_well, num_steps, dilution_factor):
    """Perform a serial dilution across wells in a row."""
    wells = plate.rows()[0]  # Get first row
    for i in range(num_steps):
        src = wells[start_well + i]
        dst = wells[start_well + i + 1]
        transfer_vol = 100 / dilution_factor
        pipette.transfer(transfer_vol, src, dst, mix_after=(3, transfer_vol * 0.8))
```

### 3. Multi-Channel Pipetting and Tip Management

Multi-channel pipettes accelerate column-wise operations. Tip tracking prevents cross-contamination.

```python
def run(protocol: protocol_api.ProtocolContext):
    tiprack = protocol.load_labware("opentrons_96_tiprack_300ul", "1")
    source = protocol.load_labware("nest_96_wellplate_200ul_flat", "2")
    dest = protocol.load_labware("nest_96_wellplate_200ul_flat", "3")

    # Multi-channel pipette for column-wise transfers
    m300 = protocol.load_instrument("p300_multi_gen2", "left", tip_racks=[tiprack])

    # Transfer entire columns at once (8 wells per step)
    for src_col, dst_col in zip(source.columns(), dest.columns()):
        m300.transfer(50, src_col, dst_col, new_tip="once")
```

## Common Academic Workflow

### Workflow: High-Throughput qPCR Plate Setup

```python
metadata = {"apiLevel": "2.13", "protocolName": "qPCR Plate Setup"}

def run(protocol: protocol_api.ProtocolContext):
    tiprack = protocol.load_labware("opentrons_96_tiprack_300ul", "1")
    template_plate = protocol.load_labware("nest_96_wellplate_200ul_flat", "2")
    mastermix_reservoir = protocol.load_labware("nest_12_reservoir_15ml", "3")
    qPCR_plate = protocol.load_labware("biorad_96_wellplate_200ul_pcr", "5")

    p20 = protocol.load_instrument("p20_single_gen2", "right", tip_racks=[tiprack])

    # Step 1: Dispense master mix into all wells
    p20.transfer(
        15,  # 15uL master mix per well
        mastermix_reservoir.wells_by_name()["A1"],
        qPCR_plate.wells(),
        new_tip="once"
    )

    # Step 2: Transfer 5uL template from source to qPCR plate
    for src_well, dst_well in zip(template_plate.wells(), qPCR_plate.wells()):
        p20.transfer(5, src_well, dst_well, mix_after=(2, 8), new_tip="always")
```

## Best Practices

1. **Always simulate before running** — use the Opentrons Protocol Designer or `opentrons simulate` CLI to verify protocol logic.
2. **Specify API level** — always set `metadata["apiLevel"]` to the version matching your robot firmware to avoid compatibility issues.
3. **Use `new_tip="always"` for biological samples** — prevents cross-contamination between wells.
4. **Calibrate pipettes regularly** — automated protocols amplify calibration errors across hundreds of wells.
5. **Version-control protocols** — store `.py` protocol files in git alongside analysis scripts for full reproducibility.

## Common Pitfalls

1. **Labware offset errors**: If custom labware is used, offsets must be calibrated on the robot. Uncalibrated labware leads to missed wells.
2. **Insufficient tip volume**: Using a P300 tip for a P20 pipette or vice versa causes errors. Match tip rack to pipette model.
3. **Air gap and blow-out**: For viscous liquids, enable `blow_out=True` and consider adding air gaps with `pipette.air_gap(10)`.
4. **Deck slot conflicts**: Each labware must occupy a unique deck slot. Refer to the OT-2/Flex deck maps for slot assignments.

## Integration with HBE

- Use within `workflows/experiment-design.md` to generate Opentrons protocols from experimental plans.
- Pair with `references/tools/pandas.md` to convert plate layout spreadsheets into protocol source/destination mappings.
- Combine with `references/tools/benchling-integration.md` to log automated protocol runs in an ELN.

## Resources

- Opentrons Python API Docs: https://docs.opentrons.com/v2/
- Protocol Designer (Web UI): https://designer.opentrons.com/
- Labware Library: https://labware.opentrons.com/
- Opentrons GitHub: https://github.com/Opentrons/opentrons

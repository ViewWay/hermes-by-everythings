---
name: astropy
description: Astronomy and astrophysics library. Use for coordinate transformations, time handling, FITS file I/O, units, cosmology calculations, and observational astronomy.
domain: physics
install: pip install astropy
---

# Astropy: Astronomy & Astrophysics

## Overview

Astropy is the core Python library for astronomy — units/quantities, coordinate systems, FITS I/O, time calculations, cosmology models, and astrophysical constants.

## When to Use

- Reading/writing FITS astronomical data
- Coordinate transformations (ICRS, Galactic, AltAz)
- Time and date handling (JD, MJD, UTC)
- Physical units with automatic conversion
- Cosmological distance calculations
- Photometric and spectroscopic data

## Quick Start

```python
from astropy import units as u
from astropy.coordinates import SkyCoord, EarthLocation, AltAz
from astropy.time import Time
from astropy.io import fits

# Units with auto-conversion
d = 100 * u.lightyear; d.to(u.parsec)           # 30.7 pc
E = 5 * u.keV; E.to(u.erg)                       # 8.01e-09 erg

# Coordinates
coord = SkyCoord(ra=10.6847*u.deg, dec=41.2687*u.deg, frame='icrs')
coord.galactic                                    # Galactic coordinates

# FITS I/O
hdul = fits.open('data.fits')
data = hdul[0].data
header = hdul[0].header
hdul.writeto('output.fits', overwrite=True)
```

## Core Capabilities

### 1. Cosmological Calculations

```python
from astropy.cosmology import Planck18 as cosmo

z = 0.5
d_L = cosmo.luminosity_distance(z)     # Luminosity distance
d_C = cosmo.comoving_distance(z)        # Comoving distance
age = cosmo.age(z)                      # Age of universe at z
print(f'z={z}: d_L={d_L}, age={age}')
```

### 2. FITS File Handling

```python
from astropy.io import fits

# Read
with fits.open('image.fits') as hdul:
    data = hdul[0].data
    header = hdul[0].header
    print(header['EXPTIME'])

# Write new FITS
hdu = fits.PrimaryHDU(data, header)
hdu.writeto('output.fits', overwrite=True)
```

## Best Practices

1. **Always use units**: Prevents unit conversion errors
2. **Use `with fits.open()`**: Ensures file handles are closed
3. **Specify cosmology**: Planck18 is current best-fit

## Integration with HBE

- Physics/astrophysics tool in `references/tool-registry.md`
- Supports research data pipelines in physics

## Resources

- Documentation: https://docs.astropy.org/
- Astropy Collaboration (2013, 2018, 2022) — A&A papers

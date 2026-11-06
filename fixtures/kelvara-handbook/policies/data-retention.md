---
type: Policy
title: Data retention policy
description: Current retention periods for raw ECG recordings and quality records, and how deletion is confirmed to hospitals.
tags: [policy, data-protection, retention, gdpr]
status: stable
doc_id: POL-007
revision: 3
owner: "role:dpo"
review_due: "2027-03-31"
regulatory_refs: ["GDPR Art. 5(1)(e)", "GDPR Art. 28", "MDR Art. 10(8)"]
generated: { by: "human:fixture", at: "2026-10-01T09:00:00Z" }
sources:
  - id: s1
    resource: "src:qrb-2025-03"
    title: "Quality review board minutes, March 2025"
---

# Data retention policy

This policy replaces the [2024 data retention policy](/policies/data-retention-2024.md).[^s1]
Kelvara processes recordings on behalf of hospitals: where a hospital's data processing agreement sets
a shorter period, the hospital's period applies.[^s1]

## Raw ECG recordings

Raw recordings are kept for **30 days** after the cardiologist signs the report, then deleted from
[Ardoise Cloud](/suppliers/ardoise-cloud.md), backups included.[^s1] The signed report itself is kept
in the hospital's record system, not by Kelvara.

## Exceptions

- Recordings linked to an open complaint or vigilance case stay on legal hold until the case is closed.[^s1]
- Recordings used in the [Kelvara Rhythm](../products/kelvara-rhythm.md) clinical evaluation are kept
  pseudonymised, under the clinical evaluation plan.[^s1]

## Deletion certificates

Hospitals receive a deletion certificate within 5 working days of a deletion request.[^s1]

## Quality records

Complaint, CAPA and vigilance records are kept for 10 years after the last unit of the device version
is placed on the market.[^s1]

[^s1]: Quality review board minutes, March 2025, item 4.

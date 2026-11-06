---
type: Policy
title: Patient-data access policy
description: Who may see which patient data, how every access is logged, and the limits on emergency (break-glass) access.
tags: [policy, security, data-protection, hds]
status: stable
doc_id: POL-004
revision: 5
owner: "role:dpo"
review_due: "2027-01-31"
regulatory_refs: ["GDPR Art. 32", "ISO/IEC 27001 A.5.15", "HDS"]
generated: { by: "human:fixture", at: "2026-10-01T09:00:00Z" }
sources:
  - id: s1
    resource: "src:isms-manual-v3"
    title: "Information security manual v3"
---

# Patient-data access policy

## Access by role

| Role | Patient data visible |
| --- | --- |
| Cardiac technician | ECG recordings and the hospital's exam number |
| Hospital cardiologist | Recordings, reports and patient identity |
| Support engineer | None by default; break-glass only |

These rules apply at the [Elmhaven monitoring centre](../sites/elmhaven-monitoring-centre.md), at the
[Thornfield backup centre](/sites/thornfield-backup-centre.md) and in the
[Ardoise Cloud](/suppliers/ardoise-cloud.md) environment.[^s1]

## Logging

Every access to patient data is logged with the user, the time and the record opened. Logs are kept
for 3 years and reviewed monthly by the DPO.[^s1]

## Break-glass access

A support engineer may open patient data in an emergency, with a ticket number, for up to 30 minutes.
Beyond 30 minutes the session is cut and the [DPO](/people/dpo.md) reviews it within 24 hours; the
[PRRC](/people/prrc.md) is told when the access was linked to a device incident.[^s1]

[^s1]: Information security manual v3, chapter 6.

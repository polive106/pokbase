---
type: Customer
title: Valmoor University Hospital
description: Kelvara's largest hospital customer - two cardiology units on Kelvara Rhythm and Kelvara Suivi, with a DPA that sets a shorter 20-day retention.
tags: [customer, hospital, contract]
status: stable
generated: { by: "human:fixture", at: "2026-11-06T09:00:00Z" }
sources:
  - id: s1
    resource: "src:contract-valmoor-2025"
    title: "Valmoor University Hospital services agreement and DPA, 2025"
---

# Valmoor University Hospital

Valmoor University Hospital (fictional) is Kelvara's largest customer. Its two cardiology units have used
[Kelvara Rhythm](/products/kelvara-rhythm.md) since September 2025, and it offers
[Kelvara Suivi](/products/kelvara-suivi.md) to its patients.[^s1]

## Contract

- Services agreement for 3 years, until 31 August 2028.[^s1]
- About 300 exams a month, reviewed at the [Elmhaven monitoring centre](/sites/elmhaven-monitoring-centre.md).[^s1]
- Valmoor is the pilot hospital for new releases under the
  [software release procedure](/policies/software-release.md).[^s1]

## Data protection

- Valmoor is the controller; Kelvara is its processor.[^s1]
- **Its DPA sets a retention of 20 days** for raw ECG recordings after the report is signed, shorter
  than Kelvara's standard period. Under the [data retention policy](/policies/data-retention.md), the
  hospital's shorter period applies.[^s1]

## Contacts (roles)

- Head of cardiology: clinical owner of the service.
- CLMV (local matériovigilance correspondent): receives a copy of every initial incident report summary
  (see [ANSM matériovigilance](/regulations/ansm-materiovigilance.md)).
- Hospital DPO: receives breach notices within 24 hours (see the
  [incident and vigilance playbook](/playbooks/incident-vigilance.md)).

[^s1]: Valmoor University Hospital services agreement and DPA, 2025.

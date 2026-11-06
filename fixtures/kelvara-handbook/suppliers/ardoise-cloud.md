---
type: Supplier
title: Ardoise Cloud
description: HDS-certified hosting provider for all Kelvara patient data; a subprocessor under every hospital data processing agreement.
tags: [supplier, hosting, hds, subprocessor]
status: stable
generated: { by: "human:fixture", at: "2026-10-01T09:00:00Z" }
sources:
  - id: s1
    resource: "src:contract-ardoise-2025"
    title: "Ardoise Cloud hosting agreement 2025"
  - id: s2
    resource: "src:dpa-ardoise-2025"
    title: "Ardoise Cloud data processing agreement 2025"
---

# Ardoise Cloud

Ardoise Cloud hosts all Kelvara patient data, for [Kelvara Rhythm](/products/kelvara-rhythm.md) and
[Kelvara Suivi](/products/kelvara-suivi.md), in two data centres in France. It is certified HDS
(Hébergeur de Données de Santé) and ISO/IEC 27001.[^s1] Its certificate must be under the HDS v2
referential (see [HDS certification](/regulations/hds-certification.md)).

## Service levels

- Availability target: 99.9% per month, measured by Kelvara's own monitoring.[^s1]
- Service credit: 5% of the monthly fee for each 0.1 point below the target.[^s1]
- Backups every 15 minutes, deleted with the data under the
  [data retention policy](../policies/data-retention.md); restore within 4 hours.[^s1]
- Support desk: 06:00–22:00 (Paris time), every day.[^s1]

## Data protection

- Ardoise is a subprocessor in every hospital DPA. It must tell Kelvara within 12 hours of becoming
  aware of a breach affecting Kelvara data.[^s2]
- Its built-in SMS relay sends the Kelvara Suivi reminders to patients.[^s1]

Outages and breaches are handled with the [incident and vigilance playbook](/playbooks/incident-vigilance.md).
Ardoise is reviewed every year under the [supplier management procedure](/policies/supplier-management.md).

[^s1]: Ardoise Cloud hosting agreement 2025, schedule B.
[^s2]: Ardoise Cloud data processing agreement 2025, schedule 2.

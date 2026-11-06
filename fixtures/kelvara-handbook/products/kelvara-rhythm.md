---
type: Product
title: Kelvara Rhythm
description: Class IIa software medical device that flags suspected atrial fibrillation in single-lead patch ECGs for cardiologist review.
tags: [product, medical-device, mdr, samd]
status: stable
regulatory_refs: ["MDR Annex VIII rule 11", "IEC 62304 class B", "ISO 14971"]
generated: { by: "human:fixture", at: "2026-10-01T09:00:00Z" }
sources:
  - id: s1
    resource: "src:techfile-rhythm-2-4"
    title: "Kelvara Rhythm technical documentation, v2.4"
---

# Kelvara Rhythm

Kelvara Rhythm is software that analyses single-lead ECG recordings from a wearable patch and flags
suspected atrial fibrillation (AF) episodes for review by a cardiologist. It is a class IIa medical
device under MDR Annex VIII rule 11, CE-marked since June 2025 with a certificate from the notified
body Norvane Certification. Its software safety class under IEC 62304 is B.[^s1]

## Modules

Three modules make up the product: **Rhythm Capture** (patch pairing and upload), **Rhythm Review**
(technician triage) and **Rhythm Report** (cardiologist sign-off).[^s1] The current release is 2.4;
see the [release history](/products/rhythm-release-history.md).

## Intended use and limits

- Adults with suspected paroxysmal AF, for exams of up to 7 days.[^s1]
- Not for real-time monitoring, and not for patients with an implanted pacemaker or defibrillator.[^s1]
- Every AF flag is confirmed by a cardiologist; the software never makes a diagnosis on its own.[^s1]
- In the 2025 clinical evaluation, sensitivity for AF episodes of 30 seconds or more was 95.1% and
  specificity 97.3%.[^s1]

Recordings come from the [Linnet Medical](/suppliers/linnet-medical.md) patch, the only patch validated
with Rhythm, and are hosted by [Ardoise Cloud](../suppliers/ardoise-cloud.md). Every change is assessed
against the [significant change](/glossary/significant-change.md) definition and released under the
[software release procedure](/policies/software-release.md). Problems in the field follow the
[incident and vigilance playbook](../playbooks/incident-vigilance.md), and the
[post-market surveillance plan](/plans/post-market-surveillance.md) tracks performance over time.
Rhythm is not yet reimbursed: see [remote monitoring reimbursement](/regulations/telesurveillance-latm.md)
and [PECAN](../regulations/pecan.md) for the market-access plan.

[^s1]: Kelvara Rhythm technical documentation, v2.4, sections 1–3.

---
type: Policy
title: Supplier management procedure
description: How Kelvara selects, approves, audits and reviews its suppliers and subprocessors, and the approved supplier list.
tags: [procedure, quality, suppliers, iso-13485, gdpr]
status: stable
doc_id: SOP-009
revision: 5
owner: "role:prrc"
review_due: "2027-03-31"
regulatory_refs: ["ISO 13485 7.4", "GDPR Art. 28"]
generated: { by: "human:fixture", at: "2026-11-06T09:00:00Z" }
sources:
  - id: s1
    resource: "src:qms-sop-009-v5"
    title: "SOP-009 Supplier management, v5"
---

# Supplier management procedure

## Classes of supplier

| Class | Examples | Controls |
| --- | --- | --- |
| Critical | [Linnet Medical](/suppliers/linnet-medical.md) (patch), [Ardoise Cloud](/suppliers/ardoise-cloud.md) (hosting) | Quality agreement, audit every 2 years, annual review |
| Subprocessor | Any supplier that receives personal data, including Ardoise Cloud | DPA, DPO review, HDS certificate if it stores health data, customers told 30 days before first use |
| Standard | Office and IT services with no patient data | Annual review only |

A supplier can be in two classes; the stricter controls apply.[^s1]

## Approval

- A new critical supplier or subprocessor is approved by the [PRRC](/people/prrc.md) and, for any
  personal data, the [DPO](/people/dpo.md), before the first order.[^s1]
- A subprocessor that stores health data must hold a valid HDS certificate under the v2 referential
  (see [HDS certification](/regulations/hds-certification.md)).[^s1]

## Monitoring

- **Annual review** of every supplier: quality issues, SCARs, certificates still valid, contract and DPA
  up to date.[^s1]
- **Supplier corrective action requests (SCAR):** answered within 30 days; two SCARs in one year trigger
  an extra audit.[^s1]
- The approved supplier list is kept by the quality team and checked at every surveillance audit.[^s1]

[^s1]: SOP-009 Supplier management, v5, sections 2–6.

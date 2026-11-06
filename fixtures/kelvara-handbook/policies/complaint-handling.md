---
type: Policy
title: Complaint handling procedure
description: How complaints about Kelvara Rhythm are received, logged, assessed for vigilance, investigated and closed, with the deadlines for each step.
tags: [procedure, quality, complaints, iso-13485]
status: stable
doc_id: SOP-018
revision: 4
owner: "role:vigilance-officer"
review_due: "2027-04-30"
regulatory_refs: ["ISO 13485 8.2.2", "MDR Art. 10(9)"]
generated: { by: "human:fixture", at: "2026-11-06T09:00:00Z" }
sources:
  - id: s1
    resource: "src:qms-sop-018-v4"
    title: "SOP-018 Complaint handling, v4"
---

# Complaint handling procedure

Any Kelvara employee who receives a complaint about [Kelvara Rhythm](/products/kelvara-rhythm.md),
whatever the channel (phone, e-mail, the support portal, a hospital's CLMV), logs it as a complaint
ticket. A complaint is never handled informally, even when it looks trivial.[^s1]

## Deadlines

| Step | Deadline | Who |
| --- | --- | --- |
| Log the complaint | Within 1 hour of receipt | Whoever received it |
| Acknowledge to the hospital | Within 2 working days | Support |
| Vigilance assessment (is it an incident?) | Within 1 working day | [Vigilance officer](/people/vigilance-officer.md) |
| Investigation and root cause | Within 30 days (target) | Engineering |
| Closure, with the answer to the hospital | Within 60 days (target) | Vigilance officer |

When the vigilance assessment finds a possible incident, the ticket moves straight to the
[incident and vigilance playbook](/playbooks/incident-vigilance.md) and its legal deadlines, which
always win over the targets above.[^s1]

## Rules

- No patient identifiers in the ticket: use the hospital's exam number.[^s1]
- A complaint may be closed without a CAPA only if the investigation shows no product deficiency; the
  reason is recorded.[^s1]
- Complaint records are kept as quality records (see the [data retention policy](/policies/data-retention.md)).
- Every month, complaint counts by category feed the [post-market surveillance plan](/plans/post-market-surveillance.md).

[^s1]: SOP-018 Complaint handling, v4, sections 3–6.

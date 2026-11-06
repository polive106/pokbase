---
type: Playbook
title: Data subject requests playbook
description: How Kelvara handles GDPR requests (access, erasure, rectification) as processor for hospitals and as controller for Kelvara Suivi.
tags: [playbook, gdpr, data-protection]
status: stable
doc_id: SOP-024
revision: 1
owner: "role:dpo"
review_due: "2027-05-31"
regulatory_refs: ["GDPR Art. 12", "GDPR Art. 15", "GDPR Art. 16", "GDPR Art. 17", "GDPR Art. 28(3)(e)"]
generated: { by: "human:fixture", at: "2026-11-06T09:00:00Z" }
sources:
  - id: s1
    resource: "src:qms-sop-024-v1"
    title: "SOP-024 Data subject requests, v1"
---

# Data subject requests playbook

A data subject request is any request from a person to exercise their GDPR rights: access, rectification,
erasure, restriction, portability or objection. The [DPO](/people/dpo.md) owns this process.[^s1]

## Who answers

- **Kelvara Rhythm data:** the hospital is the controller. Kelvara never answers the patient directly: it
  forwards the request to the hospital within **2 working days** and helps the hospital answer (GDPR
  Article 28(3)(e)).[^s1]
- **Kelvara Suivi accounts:** Kelvara is the controller and answers itself.[^s1]

## Deadline

The controller answers without undue delay and **within one month** of receipt. The deadline can be
extended by **two further months** for complex or numerous requests; the person is told of the extension
and why within the first month (GDPR Article 12(3)).[^s1]

## Steps (Kelvara Suivi)

1. Log the request in the data-protection register, without health details in the summary.[^s1]
2. Verify the requester's identity through the app account; never ask for more than is needed.[^s1]
3. Collect the data or perform the action, then answer in the language of the request.[^s1]
4. For erasure, check first whether a legal hold applies (an open complaint or vigilance case under the
   [data retention policy](/policies/data-retention.md)); if it does, explain the restriction instead.[^s1]

[^s1]: SOP-024 Data subject requests, v1, sections 2–5.

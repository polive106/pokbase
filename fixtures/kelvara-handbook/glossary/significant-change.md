---
type: Term
title: Significant change
description: Draft definition of a significant change to Kelvara Rhythm - the changes that need notified body review before release.
tags: [glossary, regulatory, change-control]
status: draft
doc_id: SOP-012-A
revision: 1
owner: "role:prrc"
generated: { by: "human:fixture", at: "2026-10-01T09:00:00Z" }
sources:
  - id: s1
    resource: "src:sop-012-v4"
    title: "SOP-012 Change control, v4"
---

# Significant change

*Draft definition, pending quality review board approval.*

A change to [Kelvara Rhythm](/products/kelvara-rhythm.md) is significant when any of these holds:[^s1]

- it changes the intended purpose, the patient population or the indications;
- it replaces the AF detection model with a different architecture, or it moves sensitivity or
  specificity by more than 1 percentage point on the reference dataset;
- it moves any software item into IEC 62304 class C.

A significant change is submitted to the notified body, Norvane Certification, and is not released
before its approval. Other changes are recorded in the change record and reviewed at the next
surveillance audit. The [PRRC](../people/prrc.md) signs off the classification of every change, and a
change made during an incident still follows this definition (see the
[incident and vigilance playbook](/playbooks/incident-vigilance.md)). The release itself follows the
[software release procedure](/policies/software-release.md).

[^s1]: SOP-012 Change control, v4, annex A.

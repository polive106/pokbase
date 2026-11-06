---
type: Term
title: Serious incident
description: The MDR definition of a serious incident, with Kelvara Rhythm examples of what does and does not qualify.
tags: [glossary, vigilance, mdr]
status: stable
regulatory_refs: ["MDR Art. 2(64)", "MDR Art. 2(65)"]
generated: { by: "human:fixture", at: "2026-11-06T09:00:00Z" }
sources:
  - id: s1
    resource: "src:qms-sop-021-v6"
    title: "SOP-021 Vigilance and incident management, v6"
---

# Serious incident

Under MDR Article 2(65), a **serious incident** is any incident that directly or indirectly led, might
have led or might lead to any of the following:[^s1]

- the death of a patient, user or other person;
- the temporary or permanent serious deterioration of a person's state of health;
- a serious public health threat.

An **incident** (Article 2(64)) is broader: any malfunction or deterioration in the characteristics or
performance of a device, including use error due to its design, inadequate information supplied with
it, and undesirable side-effects.[^s1]

## Kelvara Rhythm examples

| Event | Serious incident? |
| --- | --- |
| A missed AF episode, and the patient later has a stroke | Yes |
| An urgent alert shown 3 hours late, with no harm, but harm was possible | Yes (might have led to deterioration) |
| A false AF flag, corrected by the cardiologist before the report | No: an incident to record and trend |
| The app is unavailable for 20 minutes, no exam affected | No: not an incident; record it as an outage |

Reportability is decided by the [PRRC](/people/prrc.md) under the
[incident and vigilance playbook](/playbooks/incident-vigilance.md).[^s1]

[^s1]: SOP-021 Vigilance and incident management, v6, section 2.

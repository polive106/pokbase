---
type: Regulation
title: MDR transition and EUDAMED
description: EU MDR 2017/745 transition deadlines after Regulation 2023/607, EUDAMED roll-out, and what they mean for Kelvara Rhythm.
tags: [regulatory, mdr, eudamed, eu]
status: stable
doc_id: REG-001
revision: 1
owner: "role:prrc"
review_due: "2027-03-31"
verified: "2026-11-05"
regulatory_refs: ["Regulation (EU) 2017/745", "Regulation (EU) 2023/607", "Regulation (EU) 2024/1860"]
generated: { by: "human:fixture", at: "2026-11-05T09:00:00Z" }
sources:
  - id: s1
    resource: "src:eur-lex-2023-607"
    title: "Regulation (EU) 2023/607 amending the MDR transitional provisions"
    url: "https://eur-lex.europa.eu/eli/reg/2023/607/oj"
  - id: s2
    resource: "src:eur-lex-2024-1860"
    title: "Regulation (EU) 2024/1860 (gradual roll-out of EUDAMED)"
    url: "https://eur-lex.europa.eu/eli/reg/2024/1860/oj"
  - id: s3
    resource: "src:ansm-mir-2026"
    title: "ANSM, declaring as a manufacturer (MIR form), 2026"
    url: "https://ansm.sante.fr/documents/reference/declarer-un-effet-indesirable/comment-declarer-si-vous-etes-fabricant-ou-distributeur-de-dispositifs-medicaux"
---

# MDR transition and EUDAMED

## Transition deadlines

Regulation (EU) 2023/607 extended the MDR transition period and removed the "sell-off" end date.[^s1]
Devices still covered by a certificate under the old directives may stay on the market until:

- **31 December 2027** for class III and implantable class IIb devices;
- **31 December 2028** for the other class IIb devices, and for class IIa, Im and Is devices.

The extension is conditional: a quality system to the MDR, an application lodged with a notified body,
and no significant change to the design or intended purpose.[^s1]

**Kelvara Rhythm is not affected:** it was certified directly under the MDR in June 2025 and has no
legacy directive certificate. Its changes still follow the [significant change](/glossary/significant-change.md)
definition.

## EUDAMED

Regulation (EU) 2024/1860 lets EUDAMED become mandatory module by module, each module applying a fixed
time after the Commission announces it is functional.[^s2] Secondary sources disagree on the dates
(device registration around 2026, vigilance possibly not before the end of 2028), so the PRRC tracks
the Commission's notices rather than a fixed calendar.

Until the vigilance module is mandatory, serious incidents in France are reported to the ANSM on the
MIR form; the ANSM states that MIR format 7.3.1 applies from 1 May 2026.[^s3] See
[ANSM matériovigilance](ansm-materiovigilance.md) and the
[incident and vigilance playbook](/playbooks/incident-vigilance.md).

[^s1]: Regulation (EU) 2023/607, Article 1.
[^s2]: Regulation (EU) 2024/1860, Article 1 (amending MDR Article 123).
[^s3]: ANSM, page on declaring as a manufacturer, updated 2026.

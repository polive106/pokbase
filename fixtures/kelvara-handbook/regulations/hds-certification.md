---
type: Regulation
title: HDS certification
description: French certification for hosts of health data - referential v2.0, EEA storage and sovereignty requirements, and the 16 May 2026 switchover.
tags: [regulatory, hds, hosting, france, security]
status: stable
doc_id: REG-003
revision: 1
owner: "role:head-of-it-operations"
review_due: "2027-01-31"
verified: "2026-11-05"
regulatory_refs: ["CSP L. 1111-8", "Arrêté du 26 avril 2024 (HDS referential v2.0)"]
generated: { by: "human:fixture", at: "2026-11-05T09:00:00Z" }
sources:
  - id: s1
    resource: "src:ans-hds-jo-2024"
    title: "ANS, publication au Journal officiel du référentiel de certification HDS"
    url: "https://esante.gouv.fr/espace-presse/publication-au-journal-officiel-du-referentiel-de-certification-hds-souverainete-des-donnees-et-ameliorations-du-referentiel"
  - id: s2
    resource: "src:ans-hds-faq-transition"
    title: "ANS FAQ, transition to the new version of the HDS referential"
    url: "https://esante.gouv.fr/faq/comment-sorganise-la-transition-avec-la-nouvelle-version-du-referentiel"
---

# HDS certification

Anyone who hosts personal health data on behalf of a hospital, a health professional or a patient in
France must be certified *Hébergeur de Données de Santé* (HDS).[^s1] Our host,
[Ardoise Cloud](/suppliers/ardoise-cloud.md), is HDS-certified; Kelvara itself is not a host.

## Referential v2.0

- Version 2.0 of the HDS referential was approved by an arrêté of 26 April 2024 and published in the
  Journal officiel on 16 May 2024.[^s1]
- It adds sovereignty requirements (requirements 28 to 31): health data must be stored in the European
  Economic Area, by the host and its subcontractors, and the contract must state any possible access
  from outside the EEA and the associated risks; the host publishes this information.[^s1]

## Transition

- Since 16 November 2024, new certifications are assessed against v2.0.[^s2]
- From **16 May 2026**, every valid HDS certificate attests conformity to v2 only; hosts certified under
  v1.1 had to migrate by then.[^s2]

## What this means for Kelvara

- Ardoise Cloud must show a **v2** certificate at each annual supplier review, and its list of non-EEA
  access must be in the hosting agreement (see the [supplier management procedure](/policies/supplier-management.md)).
- Any new subprocessor that stores patient data (for example an SMS gateway holding phone numbers) needs
  its own HDS certificate before first use.
- Storing data in the EEA does not by itself remove exposure to non-EU laws such as the US CLOUD Act;
  the [DPO](/people/dpo.md) assesses this in the DPIA.

[^s1]: ANS press release on the HDS referential v2.0, May 2024.
[^s2]: ANS FAQ on the transition to the new HDS referential.

---
type: Regulation
title: National health identity (INS)
description: The obligation, since 2021, to reference health data with a qualified INS - RNIV identity checks, the INSi teleservice, INS referential v2.1.
tags: [regulatory, ins, identity, france]
status: stable
doc_id: REG-007
revision: 1
owner: "role:head-of-engineering"
review_due: "2027-03-31"
verified: "2026-11-05"
regulatory_refs: ["CSP L. 1111-8-1", "INS referential v2.1 (ANS, December 2024)", "RNIV"]
generated: { by: "human:fixture", at: "2026-11-05T09:00:00Z" }
sources:
  - id: s1
    resource: "src:ans-referentiel-ins"
    title: "ANS, Référentiel INS"
    url: "https://esante.gouv.fr/produits-services/referentiel-ins"
  - id: s2
    resource: "src:ans-ins-v2-1"
    title: "ANS, Référentiel Identité Nationale de Santé v2.1"
    url: "https://industriels.esante.gouv.fr/sites/default/files/media/document/ANS_Referentiel_Identite-Nationaled-de-Sante_V2.1.pdf"
---

# National health identity (INS)

Since **1 January 2021**, health data in France must be referenced with the national health identity
(*Identité nationale de santé*, INS).[^s1]

## Qualified INS

An INS can be used for referencing only when it is **qualified**. Two conditions must both hold:[^s1]

1. the patient's identity has been checked against the national identity-vigilance referential (RNIV);
2. the INS has been retrieved or checked through the **INSi teleservice**, run by the national health
   insurance (Assurance maladie), which is used with a CPx card or a software certificate.

The INS number may be passed on only when the identity is qualified. The current version of the INS
referential is v2.1, published by the ANS in December 2024.[^s2]

## What this means for Kelvara

- Kelvara Rhythm does not call the INSi teleservice: the qualified INS and identity traits come from the
  hospital's patient record, and the hospital stays responsible for identity vigilance.
- Kelvara Rhythm keeps the identity status (qualified or not) and never replaces a qualified INS with a
  manual entry.
- The INS identifies a patient: it stays inside Kelvara Rhythm and never appears in a ticket, a page of
  this KB or a message (see the [patient-data access policy](/policies/patient-data-access.md)).

[^s1]: ANS, INS referential.
[^s2]: ANS, national health identity referential v2.1.

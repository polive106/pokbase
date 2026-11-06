---
type: Regulation
title: Ségur du numérique en santé
description: France's national programme that references and funds health software (waves 1 and 2), and its building blocks - INS, MSSanté, DMP, Pro Santé Connect.
tags: [regulatory, segur, interoperability, ans, france]
status: stable
doc_id: REG-006
revision: 1
owner: "role:head-of-engineering"
review_due: "2027-03-31"
verified: "2026-11-05"
generated: { by: "human:fixture", at: "2026-11-05T09:00:00Z" }
sources:
  - id: s1
    resource: "src:ans-segur-vague2-referencement"
    title: "ANS, La procédure de référencement de la vague 2 du Ségur"
    url: "https://esante.gouv.fr/ens/segur-numerique-sante/vague-2/referencement"
  - id: s2
    resource: "src:ans-dmn-referentiel"
    title: "ANS, Dispositifs médicaux numériques (DMN) - interoperability and security référentiel"
    url: "https://esante.gouv.fr/produits-services/dispositifs-medicaux-numeriques"
---

# Ségur du numérique en santé

The Ségur du numérique en santé is the national programme that funds upgrades to health software so
that it shares data securely. Software vendors get their products **referenced** by the ANS, per
software category (*couloir*: hospital patient record, GP practice software, and so on) and per **wave**
(wave 1, then wave 2), against a referencing specification (DSR).[^s1]

## The building blocks

Wave 2 requirements are organised around:

- the **INS**, the national health identity (see [INS](ins.md));
- **MSSanté**, the secure health messaging system;
- feeding and reading the **DMP** through **Mon espace santé**, with patient consent management;
- **Pro Santé Connect** (PSC), authentication of health professionals, with an authorisation in the
  PSC trust space;
- the **e-prescription**, for the categories concerned.[^s1]

The procedure runs in three phases, starting with the filing and review of an administrative file.[^s1]

## Kelvara's position

- Kelvara Rhythm fits none of the Ségur software categories: it is neither a patient record nor
  practice software. Kelvara is therefore not "Ségur-referenced".
- The same building blocks (INS, Pro Santé Connect, the health directory) are required by the ANS
  interoperability and security référentiel for digital medical devices, which reimbursement needs
  (see [remote monitoring reimbursement](/regulations/telesurveillance-latm.md)).[^s2]
- Customer hospitals run Ségur-referenced software: Kelvara Rhythm receives the INS from their patient
  record and sends the signed reports back to it.

[^s1]: ANS, wave 2 Ségur referencing procedure.
[^s2]: ANS, page on digital medical devices.

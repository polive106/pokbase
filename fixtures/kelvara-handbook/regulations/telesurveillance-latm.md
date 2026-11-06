---
type: Regulation
title: Remote monitoring reimbursement (télésurveillance, LATM)
description: How remote medical monitoring is reimbursed in France since 2023 - the LATM list, operator and technical fees, and the ANS conformity certificate.
tags: [regulatory, reimbursement, telesurveillance, france, market-access]
status: stable
doc_id: REG-004
revision: 1
owner: "role:market-access-lead"
review_due: "2027-02-28"
verified: "2026-11-05"
regulatory_refs: ["LFSS 2022 art. 36 (loi n° 2021-1754)", "Décret n° 2022-1767", "Arrêté du 22 juin 2023 (LATM)"]
generated: { by: "human:fixture", at: "2026-11-05T09:00:00Z" }
sources:
  - id: s1
    resource: "src:gnius-remote-monitoring"
    title: "G_NIUS (ANS), Remote monitoring reimbursement"
    url: "https://gnius.esante.gouv.fr/en/financing/reimbursement-profiles/remote-monitoring-reimbursement"
  - id: s2
    resource: "src:ans-dmn-referentiel"
    title: "ANS, Dispositifs médicaux numériques (DMN) - interoperability and security référentiel"
    url: "https://esante.gouv.fr/produits-services/dispositifs-medicaux-numeriques"
---

# Remote monitoring reimbursement (télésurveillance, LATM)

## The framework

- Remote medical monitoring (*télésurveillance médicale*) left the ETAPES experiment and entered the
  ordinary reimbursement system (*droit commun*) on 1 July 2023, under article 36 of the 2022 social
  security financing law and decree n° 2022-1767.[^s1]
- An activity is reimbursed only if it is on the **LATM** (*liste des activités de télésurveillance
  médicale*). The first indications listed (arrêté of 22 June 2023) were heart failure, kidney failure,
  respiratory failure and diabetes.[^s1]
- The **operator** is a doctor, or a team of health professionals including at least one doctor; it
  declares itself to the regional health agency (ARS).[^s1]
- Two fees: a monthly **operator fee** (*forfait opérateur*, two levels by intensity of follow-up) paid
  to the operator, and a **technical fee** (*forfait technique*) paid to the *exploitant* of the device.[^s1]

## The ANS certificate

A digital medical device must hold an **ANS certificate of conformity to the interoperability and
security référentiel for digital medical devices (DMN)** before it can be listed on the LATM (or the
LPPR). The référentiel covers the national health identity ([INS](/regulations/ins.md)), Pro Santé
Connect, the health directory, data portability and health-data protection.[^s2]

## Kelvara's position

- Detection of atrial fibrillation is not one of the first LATM indications, so Kelvara Rhythm is not
  reimbursed as remote monitoring today; hospitals pay for it from their own budget.
- The market-access plan is to apply for [PECAN](pecan.md) first, then for an LATM listing, which
  needs the ANS certificate. Kelvara would be the *exploitant*; the hospital cardiology team would be
  the operator.

[^s1]: G_NIUS (ANS), remote monitoring reimbursement profile.
[^s2]: ANS, page on digital medical devices and the DMN référentiel.

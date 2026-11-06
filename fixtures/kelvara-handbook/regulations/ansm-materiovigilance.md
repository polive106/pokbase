---
type: Regulation
title: ANSM matériovigilance
description: How serious incidents with medical devices are reported in France - the ANSM, hospital local correspondents, and the manufacturer's duty.
tags: [regulatory, vigilance, ansm, france]
status: stable
doc_id: REG-002
revision: 1
owner: "role:vigilance-officer"
review_due: "2027-03-31"
verified: "2026-11-05"
regulatory_refs: ["MDR Art. 87", "CSP L. 5212-2 to L. 5212-3", "CSP R. 5212-1 to R. 5212-35"]
generated: { by: "human:fixture", at: "2026-11-05T09:00:00Z" }
sources:
  - id: s1
    resource: "src:ansm-declarer-fabricant"
    title: "ANSM, Comment déclarer si vous êtes fabricant ou distributeur de dispositifs médicaux"
    url: "https://ansm.sante.fr/documents/reference/declarer-un-effet-indesirable/comment-declarer-si-vous-etes-fabricant-ou-distributeur-de-dispositifs-medicaux"
  - id: s2
    resource: "src:vidal-materiovigilance"
    title: "Vidal, Matériovigilance : définition et modalités de déclaration"
    url: "https://www.vidal.fr/infos-pratiques/materiovigilance-definition-et-modalites-de-declaration-id15184.html"
---

# ANSM matériovigilance

The **ANSM** (Agence nationale de sécurité du médicament et des produits de santé) is the French
competent authority for medical device vigilance.[^s1]

## Two reporting channels

- **The manufacturer** (Kelvara, for Kelvara Rhythm) must report every serious incident to the ANSM
  under MDR Article 87, on the manufacturer incident report (MIR) form, within the deadlines in the
  [incident and vigilance playbook](/playbooks/incident-vigilance.md).[^s1]
- **Each hospital** appoints a *correspondant local de matériovigilance* (CLMV), the local
  matériovigilance correspondent. Staff who witness an incident report it to the CLMV, and the CLMV
  reports to the ANSM and/or the manufacturer. The role is set by the Code de la santé publique
  (articles L. 5212-2 to L. 5212-3 and R. 5212-1 to R. 5212-35).[^s2]

## What this means for Kelvara

- A complaint can reach us from a hospital's CLMV, who may already have reported it to the ANSM. The
  awareness date is still the day Kelvara first heard of it, and our own MIR is still due.
- The [vigilance officer](/people/vigilance-officer.md) keeps the CLMV contact of every customer
  hospital in its customer page (for example [Valmoor University Hospital](/customers/valmoor-university-hospital.md))
  and copies the CLMV on the summary of our initial report.
- Patch defects are the patch manufacturer's report ([Linnet Medical](/suppliers/linnet-medical.md)).

[^s1]: ANSM, declaring as a manufacturer of medical devices.
[^s2]: Vidal, matériovigilance: definition and reporting.

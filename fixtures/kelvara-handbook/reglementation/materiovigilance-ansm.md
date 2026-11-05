---
type: Regulation
title: Matériovigilance ANSM
description: Déclaration des incidents graves liés aux dispositifs médicaux en France - l'ANSM, les correspondants locaux des hôpitaux et l'obligation du fabricant.
tags: [reglementaire, vigilance, ansm, france]
status: stable
lang: fr
doc_id: REG-002
revision: 1
owner: "role:vigilance-officer"
review_due: "2027-03-31"
verified: "2026-11-05"
regulatory_refs: ["MDR art. 87", "CSP L. 5212-2 à L. 5212-3", "CSP R. 5212-1 à R. 5212-35"]
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

# Matériovigilance ANSM

L'**ANSM** (Agence nationale de sécurité du médicament et des produits de santé) est l'autorité
compétente française pour la vigilance des dispositifs médicaux.[^s1]

## Deux circuits de déclaration

- **Le fabricant** (Kelvara, pour Kelvara Rhythm) déclare tout incident grave à l'ANSM au titre de
  l'article 87 du MDR, sur le formulaire MIR (*manufacturer incident report*), dans les délais du
  [playbook incidents et vigilance](/playbooks/incident-vigilance.md).[^s1]
- **Chaque établissement de santé** désigne un *correspondant local de matériovigilance* (CLMV). Le
  témoin d'un incident le signale au CLMV, qui déclare à l'ANSM et/ou au fabricant. Ce rôle est fixé
  par le Code de la santé publique (articles L. 5212-2 à L. 5212-3 et R. 5212-1 à R. 5212-35).[^s2]

## Conséquences pour Kelvara

- Une réclamation peut nous arriver par le CLMV d'un hôpital, qui a parfois déjà déclaré à l'ANSM. La
  date de prise de connaissance reste le jour où Kelvara en a entendu parler, et notre propre MIR reste
  dû.
- Le responsable vigilance tient à jour le contact CLMV de chaque hôpital client et met le CLMV en copie
  du résumé de notre déclaration initiale.
- Les défauts du patch relèvent du fabricant du patch ([Linnet Medical](/suppliers/linnet-medical.md)).

[^s1]: ANSM, déclaration par un fabricant de dispositifs médicaux.
[^s2]: Vidal, matériovigilance : définition et modalités de déclaration.

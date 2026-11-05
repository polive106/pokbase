---
type: Regulation
title: Référentiels santé de la CNIL
description: Les référentiels de la CNIL pour les traitements de données de santé - hors recherche, méthodologie de référence MR-004, entrepôts de données de santé.
tags: [reglementaire, cnil, rgpd, donnees-sante, france]
status: stable
lang: fr
doc_id: REG-008
revision: 1
owner: "role:dpo"
review_due: "2027-03-31"
verified: "2026-11-05"
regulatory_refs: ["RGPD art. 9", "Délibération CNIL n° 2018-155 (MR-004)", "Délibération CNIL n° 2021-118 (entrepôts)"]
generated: { by: "human:fixture", at: "2026-11-05T09:00:00Z" }
sources:
  - id: s1
    resource: "src:cnil-referentiels-sante"
    title: "CNIL, Traitements de données dans le domaine de la santé : les référentiels pour simplifier vos démarches"
    url: "https://www.cnil.fr/fr/les-referentiels-et-methodologies-de-reference-sante"
  - id: s2
    resource: "src:cnil-referentiel-entrepot"
    title: "CNIL, Référentiel relatif aux entrepôts de données de santé"
    url: "https://www.cnil.fr/sites/cnil/files/atoms/files/referentiel_entrepot.pdf"
---

# Référentiels santé de la CNIL

La CNIL publie des référentiels qui simplifient les formalités pour les traitements de données de
santé. Un traitement strictement conforme fait l'objet d'une déclaration (ou d'un engagement) de
conformité au lieu d'une demande d'autorisation.[^s1]

## Les trois familles

- **Hors recherche :** par exemple le référentiel sur les vigilances sanitaires et le référentiel sur
  les durées de conservation dans le domaine de la santé.[^s1]
- **Recherche n'impliquant pas la personne humaine :** la méthodologie de référence **MR-004**
  (délibération n° 2018-155 du 3 mai 2018), pour les études et évaluations sur données existantes ; le
  responsable de traitement prend un engagement de conformité.[^s1]
- **Entrepôts de données de santé :** un référentiel distinct (délibération n° 2021-118 du
  7 octobre 2021), réservé aux entrepôts fondés sur une mission d'intérêt public (article 6.1.e du
  RGPD) ; les entrepôts de sociétés privées fondés sur l'intérêt légitime en sont exclus.[^s2]

## Conséquences pour Kelvara

- Pour Kelvara Rhythm, l'hôpital est responsable de traitement et Kelvara sous-traitant : les
  formalités CNIL des soins relèvent de l'hôpital.
- La réutilisation d'enregistrements pseudonymisés pour l'évaluation clinique (voir la
  [politique de conservation des données](/policies/data-retention.md)) est une recherche
  n'impliquant pas la personne humaine : elle relève de la MR-004, avec information des patients.
- Kelvara, société privée, ne peut pas constituer d'entrepôt de données de santé sous le référentiel
  entrepôt ; tout projet d'entrepôt passe par une demande d'autorisation, après avis du DPO.

[^s1]: CNIL, référentiels et méthodologies de référence en santé.
[^s2]: CNIL, référentiel relatif aux entrepôts de données de santé.

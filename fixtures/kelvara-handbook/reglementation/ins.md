---
type: Regulation
title: Identité nationale de santé (INS)
description: Obligation de référencer les données de santé avec l'INS qualifiée depuis 2021 - vérification RNIV, téléservice INSi, référentiel INS v2.1.
tags: [reglementaire, ins, identitovigilance, france]
status: stable
lang: fr
doc_id: REG-007
revision: 1
owner: "role:head-of-engineering"
review_due: "2027-03-31"
verified: "2026-11-05"
regulatory_refs: ["CSP L. 1111-8-1", "Référentiel INS v2.1 (ANS, décembre 2024)", "RNIV"]
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

# Identité nationale de santé (INS)

Depuis le **1er janvier 2021**, les données de santé doivent être référencées avec l'identité nationale
de santé (INS).[^s1]

## INS qualifiée

Une INS ne sert au référencement que si elle est **qualifiée**. Deux conditions cumulatives :[^s1]

1. l'identité du patient a été vérifiée selon le référentiel national d'identitovigilance (RNIV) ;
2. l'INS a été récupérée ou vérifiée via le **téléservice INSi**, exploité par l'Assurance maladie, qui
   s'utilise avec une carte CPx ou un certificat logiciel.

Le matricule INS ne peut être transmis que si l'identité est qualifiée. La version en vigueur du
référentiel INS est la v2.1, publiée par l'ANS en décembre 2024.[^s2]

## Conséquences pour Kelvara

- Kelvara Rhythm n'appelle pas le téléservice INSi : l'INS qualifiée et les traits d'identité arrivent
  du dossier patient de l'hôpital, qui reste responsable de l'identitovigilance.
- Kelvara Rhythm conserve le statut de l'identité (qualifiée ou non) et ne remplace jamais une INS
  qualifiée par une saisie manuelle.
- L'INS est une donnée de santé identifiante : elle reste dans Kelvara Rhythm et ne figure jamais dans
  un ticket, une page de cette base ou un message (voir la
  [politique d'accès aux données patients](/policies/patient-data-access.md)).

[^s1]: ANS, référentiel INS.
[^s2]: ANS, référentiel Identité nationale de santé v2.1.

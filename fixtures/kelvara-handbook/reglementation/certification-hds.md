---
type: Regulation
title: Certification HDS
description: Certification des hébergeurs de données de santé - référentiel v2.0, stockage dans l'EEE, exigences de souveraineté et bascule du 16 mai 2026.
tags: [reglementaire, hds, hebergement, france, securite]
status: stable
lang: fr
doc_id: REG-003
revision: 1
owner: "role:head-of-it-operations"
review_due: "2027-01-31"
verified: "2026-11-05"
regulatory_refs: ["CSP L. 1111-8", "Arrêté du 26 avril 2024 (référentiel HDS v2.0)"]
generated: { by: "human:fixture", at: "2026-11-05T09:00:00Z" }
sources:
  - id: s1
    resource: "src:ans-hds-jo-2024"
    title: "ANS, publication au Journal officiel du référentiel de certification HDS"
    url: "https://esante.gouv.fr/espace-presse/publication-au-journal-officiel-du-referentiel-de-certification-hds-souverainete-des-donnees-et-ameliorations-du-referentiel"
  - id: s2
    resource: "src:ans-hds-faq-transition"
    title: "ANS, FAQ : comment s'organise la transition avec la nouvelle version du référentiel"
    url: "https://esante.gouv.fr/faq/comment-sorganise-la-transition-avec-la-nouvelle-version-du-referentiel"
---

# Certification HDS

Quiconque héberge des données de santé à caractère personnel pour le compte d'un établissement, d'un
professionnel ou d'un patient en France doit être certifié *Hébergeur de Données de Santé* (HDS).[^s1]
Notre hébergeur, [Ardoise Cloud](/suppliers/ardoise-cloud.md), est certifié HDS ; Kelvara n'est pas
elle-même hébergeur.

## Référentiel v2.0

- La version 2.0 du référentiel HDS a été approuvée par arrêté du 26 avril 2024 et publiée au Journal
  officiel le 16 mai 2024.[^s1]
- Elle ajoute des exigences de souveraineté (exigences 28 à 31) : les données de santé sont stockées
  dans l'Espace économique européen, par l'hébergeur comme par ses sous-traitants, et le contrat indique
  les accès possibles depuis un pays hors EEE et les risques associés ; l'hébergeur rend cette
  information publique.[^s1]

## Transition

- Depuis le 16 novembre 2024, les nouvelles certifications sont évaluées selon la v2.0.[^s2]
- À partir du **16 mai 2026**, tout certificat HDS valide atteste uniquement de la conformité à la v2 ;
  les hébergeurs certifiés en v1.1 devaient avoir migré à cette date.[^s2]

## Conséquences pour Kelvara

- Ardoise Cloud présente un certificat **v2** à chaque revue fournisseur annuelle, et la liste des accès
  hors EEE figure dans le contrat d'hébergement.
- Tout nouveau sous-traitant qui stocke des données de patients (par exemple une passerelle SMS qui
  conserve des numéros de téléphone) doit être certifié HDS avant la première utilisation.
- Le stockage dans l'EEE ne supprime pas à lui seul l'exposition à des lois extra-européennes comme le
  CLOUD Act américain ; le DPO l'évalue dans l'analyse d'impact (AIPD).

[^s1]: ANS, communiqué sur la publication du référentiel HDS v2.0, mai 2024.
[^s2]: ANS, FAQ sur la transition vers la nouvelle version du référentiel HDS.

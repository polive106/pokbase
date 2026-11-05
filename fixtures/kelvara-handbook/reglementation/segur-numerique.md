---
type: Regulation
title: Ségur du numérique en santé
description: Programme national de référencement et de financement des logiciels de santé (vagues 1 et 2) et ses briques socles - INS, MSSanté, DMP, Pro Santé Connect.
tags: [reglementaire, segur, interoperabilite, ans, france]
status: stable
lang: fr
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
    title: "ANS, Dispositifs médicaux numériques (DMN) : référentiel d'interopérabilité et de sécurité"
    url: "https://esante.gouv.fr/produits-services/dispositifs-medicaux-numeriques"
---

# Ségur du numérique en santé

Le Ségur du numérique en santé est le programme national qui finance la mise à niveau des logiciels de
santé pour qu'ils partagent les données de façon sécurisée. Les éditeurs font **référencer** leurs
logiciels par l'ANS, par « couloir » (dossier patient informatisé hospitalier, logiciel de médecin de
ville, etc.) et par **vague** (vague 1, puis vague 2), selon un dossier de spécifications de
référencement (DSR).[^s1]

## Les briques socles

Les exigences de la vague 2 s'articulent autour de :

- l'**INS**, l'identité nationale de santé (voir [INS](ins.md)) ;
- **MSSanté**, la messagerie sécurisée de santé ;
- l'alimentation et la consultation du **DMP** via **Mon espace santé**, avec gestion du consentement du
  patient ;
- **Pro Santé Connect** (PSC), l'authentification des professionnels, avec une habilitation dans
  l'Espace de confiance PSC ;
- l'**ordonnance numérique**, pour les couloirs concernés.[^s1]

La procédure se déroule en trois phases, à commencer par le dépôt et l'instruction d'un dossier
administratif.[^s1]

## Position de Kelvara

- Kelvara Rhythm n'entre dans aucun couloir du Ségur : ce n'est ni un dossier patient ni un logiciel de
  cabinet. Kelvara n'est donc pas « référencée Ségur ».
- Mais les mêmes briques (INS, Pro Santé Connect, annuaire santé) sont exigées par le référentiel
  d'interopérabilité et de sécurité des DMN de l'ANS, indispensable pour un remboursement (voir
  [télésurveillance et LATM](/reglementation/telesurveillance-latm.md)).[^s2]
- Les hôpitaux clients, eux, sont équipés de logiciels référencés Ségur : Kelvara Rhythm reçoit l'INS
  depuis leur dossier patient et leur renvoie les comptes rendus signés.

[^s1]: ANS, procédure de référencement de la vague 2 du Ségur.
[^s2]: ANS, page sur les dispositifs médicaux numériques.

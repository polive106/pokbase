---
type: Regulation
title: Télésurveillance et LATM
description: Remboursement de la télésurveillance médicale en droit commun depuis 2023 - liste LATM, forfaits opérateur et technique, certificat de conformité de l'ANS.
tags: [reglementaire, remboursement, telesurveillance, france, acces-marche]
status: stable
lang: fr
doc_id: REG-004
revision: 1
owner: "role:market-access-lead"
review_due: "2027-02-28"
verified: "2026-11-05"
regulatory_refs: ["LFSS 2022 art. 36 (loi n° 2021-1754)", "Décret n° 2022-1767", "Arrêté du 22 juin 2023 (LATM)"]
generated: { by: "human:fixture", at: "2026-11-05T09:00:00Z" }
sources:
  - id: s1
    resource: "src:gnius-telesurveillance"
    title: "G_NIUS (ANS), fiche remboursement de la télésurveillance"
    url: "https://gnius.esante.gouv.fr/en/financing/reimbursement-profiles/remote-monitoring-reimbursement"
  - id: s2
    resource: "src:ans-dmn-referentiel"
    title: "ANS, Dispositifs médicaux numériques (DMN) : référentiel d'interopérabilité et de sécurité"
    url: "https://esante.gouv.fr/produits-services/dispositifs-medicaux-numeriques"
---

# Télésurveillance et LATM

## Le cadre

- La télésurveillance médicale est sortie de l'expérimentation ETAPES et entrée dans le droit commun du
  remboursement le 1er juillet 2023, en application de l'article 36 de la LFSS 2022 et du décret
  n° 2022-1767.[^s1]
- Une activité n'est remboursée que si elle figure sur la **LATM** (liste des activités de
  télésurveillance médicale). Les premières indications inscrites (arrêté du 22 juin 2023) sont
  l'insuffisance cardiaque, l'insuffisance rénale, l'insuffisance respiratoire et le diabète.[^s1]
- L'**opérateur** est un médecin, ou une équipe de professionnels de santé comprenant au moins un
  médecin ; il se déclare auprès de l'ARS.[^s1]
- Deux forfaits : un **forfait opérateur** mensuel (deux niveaux selon l'intensité du suivi) versé à
  l'opérateur, et un **forfait technique** versé à l'*exploitant* du dispositif.[^s1]

## Le certificat de l'ANS

Un dispositif médical numérique doit obtenir un **certificat de conformité de l'ANS au référentiel
d'interopérabilité et de sécurité des DMN** avant son inscription sur la LATM (ou la LPPR). Le
référentiel couvre notamment l'[identité nationale de santé](/reglementation/ins.md), Pro Santé
Connect, l'annuaire santé, la portabilité et la protection des données de santé.[^s2]

## Position de Kelvara

- La détection de la fibrillation atriale ne fait pas partie des premières indications de la LATM :
  Kelvara Rhythm n'est donc pas remboursé au titre de la télésurveillance aujourd'hui, et les hôpitaux
  le financent sur leur budget propre.
- Le plan d'accès au marché prévoit une demande de [PECAN](pecan.md), puis une inscription sur la
  LATM, qui exige le certificat de l'ANS. Kelvara serait l'*exploitant* ; l'équipe de cardiologie de
  l'hôpital serait l'opérateur.

[^s1]: G_NIUS (ANS), fiche remboursement de la télésurveillance.
[^s2]: ANS, page sur les dispositifs médicaux numériques et le référentiel DMN.

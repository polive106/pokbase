---
type: Product
title: Kelvara Rhythm
description: Logiciel dispositif médical de classe IIa qui signale les épisodes suspects de fibrillation atriale dans les ECG mono-piste d'un patch, pour relecture par un cardiologue.
tags: [produit, dispositif-medical, mdr, logiciel-dm]
status: stable
lang: fr
regulatory_refs: ["MDR annexe VIII règle 11", "IEC 62304 classe B", "ISO 14971"]
generated: { by: "human:fixture", at: "2026-10-01T09:00:00Z" }
sources:
  - id: s1
    resource: "src:techfile-rhythm-2-4"
    title: "Documentation technique Kelvara Rhythm, v2.4"
---

# Kelvara Rhythm

Kelvara Rhythm est un logiciel qui analyse les enregistrements ECG mono-piste d'un patch porté par le
patient et signale les épisodes suspects de fibrillation atriale (FA) pour relecture par un
cardiologue. C'est un dispositif médical de classe IIa selon la règle 11 de l'annexe VIII du MDR,
marqué CE depuis juin 2025 avec un certificat de l'organisme notifié Norvane Certification. Sa classe
de sécurité logicielle selon l'IEC 62304 est B.[^s1]

## Modules

Le produit comprend trois modules : **Rhythm Capture** (appairage du patch et envoi des données),
**Rhythm Review** (tri par les techniciens) et **Rhythm Report** (signature par le cardiologue).[^s1]
La version actuelle est la 2.4.

## Destination et limites

- Adultes avec suspicion de FA paroxystique, pour des examens de 7 jours au plus.[^s1]
- Pas pour la surveillance en temps réel, ni pour les patients porteurs d'un stimulateur ou d'un
  défibrillateur implanté.[^s1]
- Chaque signalement de FA est confirmé par un cardiologue ; le logiciel ne pose jamais de diagnostic
  seul.[^s1]
- Dans l'évaluation clinique de 2025, la sensibilité pour les épisodes de FA de 30 secondes ou plus
  était de 95,1 % et la spécificité de 97,3 %.[^s1]

Les enregistrements proviennent du patch [Linnet Medical](/suppliers/linnet-medical.md), seul patch
validé avec Rhythm, et sont hébergés par [Ardoise Cloud](../suppliers/ardoise-cloud.md). Chaque
évolution est évaluée selon la définition de la [modification significative](/glossary/significant-change.md)
avant sa mise en production, et les problèmes sur le terrain suivent le
[playbook incidents et vigilance](../playbooks/incident-vigilance.md). Le produit n'est pas encore
remboursé : voir [télésurveillance et LATM](/reglementation/telesurveillance-latm.md) et
[PECAN](../reglementation/pecan.md) pour le plan d'accès au marché.

[^s1]: Documentation technique Kelvara Rhythm, v2.4, sections 1–3.

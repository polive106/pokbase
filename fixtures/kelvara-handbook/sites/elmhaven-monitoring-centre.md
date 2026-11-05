---
type: Site
title: Centre de surveillance d'Elmhaven
description: Principal centre de lecture ECG à distance de Kelvara, où des techniciens certifiés trient les enregistrements Kelvara Rhythm des hôpitaux clients.
tags: [operations, surveillance, site]
status: stable
lang: fr
generated: { by: "human:fixture", at: "2026-10-01T09:00:00Z" }
sources:
  - id: s1
    resource: "src:ops-memo-014"
    title: "Note d'exploitation n° 14"
  - id: s2
    resource: "src:site-audit-2025"
    title: "Audit de sécurité du site 2025"
---

# Centre de surveillance d'Elmhaven

Le centre de surveillance d'Elmhaven est le principal site de lecture ECG à distance de Kelvara Health.
Ouvert en 2023, il lit les enregistrements de tous les hôpitaux sous contrat de la région nord.[^s2]

## Installations

- 14 postes de lecture, dont 6 habilités au tri des alertes urgentes.[^s2]
- Salle de lecture à accès par badge ; les écrans sont tournés vers l'intérieur et se verrouillent après
  5 minutes d'inactivité.[^s2]
- Présence des techniciens : 7 h – 23 h, sept jours sur sept. La nuit, les alertes urgentes sont
  transmises directement au cardiologue d'astreinte de l'hôpital.[^s1]

## Fonctionnement

Aucune donnée patient n'est stockée sur les postes de lecture : les enregistrements restent dans
l'environnement certifié HDS d'[Ardoise Cloud](/suppliers/ardoise-cloud.md), selon la
[politique d'accès aux données patients](/policies/patient-data-access.md). Les nouveaux kits de patch
de [Linnet Medical](../suppliers/linnet-medical.md) sont réceptionnés en salle de réception 3, puis
expédiés aux hôpitaux.[^s1] En cas de suspicion de problème sur le dispositif ou de violation de
données, le personnel suit le [playbook incidents et vigilance](/playbooks/incident-vigilance.md).
Quand la file de lecture dépasse 90 % de la capacité, le surplus part vers le
[centre de secours de Thornfield](thornfield-backup-centre.md).

Les obligations réglementaires du site sont supervisées par la [PRRC](/people/prrc.md).

[^s1]: Note d'exploitation n° 14, section 2.
[^s2]: Audit de sécurité du site 2025, pages 3–4.

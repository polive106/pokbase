---
type: Policy
title: Politique d'accès aux données patients
description: Qui peut voir quelles données patients, comment chaque accès est tracé, et les limites de l'accès d'urgence (bris de glace).
tags: [politique, securite, protection-des-donnees, hds]
status: stable
lang: fr
doc_id: POL-004
revision: 5
owner: "role:dpo"
review_due: "2027-01-31"
regulatory_refs: ["RGPD art. 32", "ISO/IEC 27001 A.5.15", "HDS"]
generated: { by: "human:fixture", at: "2026-10-01T09:00:00Z" }
sources:
  - id: s1
    resource: "src:isms-manual-v3"
    title: "Manuel de sécurité de l'information v3"
---

# Politique d'accès aux données patients

## Accès par rôle

| Rôle | Données patients visibles |
| --- | --- |
| Technicien en cardiologie | Enregistrements ECG et numéro d'examen de l'hôpital |
| Cardiologue de l'hôpital | Enregistrements, comptes rendus et identité du patient |
| Ingénieur support | Aucune par défaut ; bris de glace uniquement |

Ces règles s'appliquent au [centre de surveillance d'Elmhaven](../sites/elmhaven-monitoring-centre.md),
au [centre de secours de Thornfield](/sites/thornfield-backup-centre.md) et dans l'environnement
[Ardoise Cloud](/suppliers/ardoise-cloud.md).[^s1]

## Traçabilité

Chaque accès à des données patients est tracé avec l'utilisateur, l'heure et le dossier ouvert. Les
traces sont conservées 3 ans et revues chaque mois par le DPO.[^s1]

## Accès d'urgence (bris de glace)

Un ingénieur support peut ouvrir des données patients en urgence, avec un numéro de ticket, pendant
30 minutes au plus. Au-delà de 30 minutes, la session est coupée et le DPO l'examine dans les 24 heures ;
la [PRRC](/people/prrc.md) est prévenue si l'accès était lié à un incident sur le dispositif.[^s1]

[^s1]: Manuel de sécurité de l'information v3, chapitre 6.

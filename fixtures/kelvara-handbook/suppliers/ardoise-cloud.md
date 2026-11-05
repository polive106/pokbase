---
type: Supplier
title: Ardoise Cloud
description: Hébergeur certifié HDS de toutes les données patients de Kelvara ; sous-traitant ultérieur dans chaque contrat de sous-traitance (DPA) avec les hôpitaux.
tags: [fournisseur, hebergement, hds, sous-traitant]
status: stable
lang: fr
generated: { by: "human:fixture", at: "2026-10-01T09:00:00Z" }
sources:
  - id: s1
    resource: "src:contract-ardoise-2025"
    title: "Contrat d'hébergement Ardoise Cloud 2025"
  - id: s2
    resource: "src:dpa-ardoise-2025"
    title: "Accord de sous-traitance des données Ardoise Cloud 2025"
---

# Ardoise Cloud

Ardoise Cloud héberge toutes les données patients de Kelvara, pour [Kelvara Rhythm](/products/kelvara-rhythm.md)
et [Kelvara Suivi](/products/kelvara-suivi.md), dans deux centres de données en France. Il est certifié
HDS (Hébergeur de Données de Santé) et ISO/IEC 27001.[^s1] Son certificat doit relever du référentiel
HDS v2 (voir [certification HDS](/reglementation/certification-hds.md)).

## Niveaux de service

- Disponibilité visée : 99,9 % par mois, mesurée par la supervision de Kelvara.[^s1]
- Pénalité (crédit de service) : 5 % de la redevance mensuelle par tranche de 0,1 point sous l'objectif.[^s1]
- Sauvegardes toutes les 15 minutes, supprimées avec les données selon la
  [politique de conservation des données](../policies/data-retention.md) ; restauration en 4 heures.[^s1]
- Support : 6 h – 22 h (heure de Paris), tous les jours.[^s1]

## Protection des données

- Ardoise est sous-traitant ultérieur dans chaque DPA hospitalier. Il doit prévenir Kelvara dans les
  12 heures après avoir pris connaissance d'une violation touchant les données de Kelvara.[^s2]
- Son relais SMS intégré envoie aux patients les rappels de Kelvara Suivi.[^s1]

Les pannes et violations sont traitées selon le [playbook incidents et vigilance](/playbooks/incident-vigilance.md).

[^s1]: Contrat d'hébergement Ardoise Cloud 2025, annexe B.
[^s2]: Accord de sous-traitance des données Ardoise Cloud 2025, annexe 2.

---
type: Policy
title: Politique de conservation des données
description: Durées de conservation en vigueur des enregistrements ECG bruts et des enregistrements qualité, et confirmation des suppressions aux hôpitaux.
tags: [politique, protection-des-donnees, conservation, rgpd]
status: stable
lang: fr
doc_id: POL-007
revision: 3
owner: "role:dpo"
review_due: "2027-03-31"
regulatory_refs: ["RGPD art. 5(1)(e)", "RGPD art. 28", "MDR art. 10(8)"]
generated: { by: "human:fixture", at: "2026-10-01T09:00:00Z" }
sources:
  - id: s1
    resource: "src:qrb-2025-03"
    title: "Compte rendu du comité qualité, mars 2025"
---

# Politique de conservation des données

Cette politique remplace la [politique de conservation des données de 2024](/policies/data-retention-2024.md).[^s1]
Kelvara traite les enregistrements pour le compte des hôpitaux : lorsque le contrat de sous-traitance
d'un hôpital fixe une durée plus courte, c'est la durée de l'hôpital qui s'applique.[^s1]

## Enregistrements ECG bruts

Les enregistrements bruts sont conservés **30 jours** après la signature du compte rendu par le
cardiologue, puis supprimés d'[Ardoise Cloud](/suppliers/ardoise-cloud.md), sauvegardes comprises.[^s1]
Le compte rendu signé est conservé dans le système d'information de l'hôpital, pas par Kelvara.

## Exceptions

- Les enregistrements liés à une réclamation ou à un dossier de vigilance ouvert sont gelés
  (conservation conservatoire) jusqu'à la clôture du dossier.[^s1]
- Les enregistrements utilisés dans l'évaluation clinique de [Kelvara Rhythm](../products/kelvara-rhythm.md)
  sont conservés sous forme pseudonymisée, selon le plan d'évaluation clinique.[^s1]

## Certificats de suppression

Les hôpitaux reçoivent un certificat de suppression dans les 5 jours ouvrés suivant une demande de
suppression.[^s1]

## Enregistrements qualité

Les dossiers de réclamation, de CAPA et de vigilance sont conservés 10 ans après la mise sur le marché
de la dernière unité de la version du dispositif.[^s1]

[^s1]: Compte rendu du comité qualité, mars 2025, point 4.

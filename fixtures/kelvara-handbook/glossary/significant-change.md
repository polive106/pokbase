---
type: Term
title: Modification significative
description: Projet de définition d'une modification significative de Kelvara Rhythm - les changements qui exigent l'examen de l'organisme notifié avant mise en production.
tags: [glossaire, reglementaire, maitrise-des-modifications]
status: draft
lang: fr
doc_id: SOP-012-A
revision: 1
owner: "role:prrc"
generated: { by: "human:fixture", at: "2026-10-01T09:00:00Z" }
sources:
  - id: s1
    resource: "src:sop-012-v4"
    title: "SOP-012 Maîtrise des modifications, v4"
---

# Modification significative

*Projet de définition, en attente d'approbation par le comité qualité.*

Une modification de [Kelvara Rhythm](/products/kelvara-rhythm.md) est significative dès que l'une de
ces conditions est remplie :[^s1]

- elle change la destination, la population de patients ou les indications ;
- elle remplace le modèle de détection de la FA par une architecture différente, ou elle fait varier la
  sensibilité ou la spécificité de plus de 1 point de pourcentage sur le jeu de données de référence ;
- elle fait passer un élément logiciel en classe C de l'IEC 62304.

Une modification significative est soumise à l'organisme notifié, Norvane Certification, et n'est pas
mise en production avant son accord. Les autres modifications sont consignées dans le registre des
modifications et revues au prochain audit de surveillance. La [PRRC](../people/prrc.md) valide le
classement de chaque modification, et une modification faite pendant un incident suit aussi cette
définition (voir le [playbook incidents et vigilance](/playbooks/incident-vigilance.md)).

[^s1]: SOP-012 Maîtrise des modifications, v4, annexe A.

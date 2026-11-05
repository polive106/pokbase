---
type: Regulation
title: Transition MDR et EUDAMED
description: Échéances de transition du règlement (UE) 2017/745 après le règlement 2023/607, déploiement d'EUDAMED, et conséquences pour Kelvara Rhythm.
tags: [reglementaire, mdr, eudamed, ue]
status: stable
lang: fr
doc_id: REG-001
revision: 1
owner: "role:prrc"
review_due: "2027-03-31"
verified: "2026-11-05"
regulatory_refs: ["Règlement (UE) 2017/745", "Règlement (UE) 2023/607", "Règlement (UE) 2024/1860"]
generated: { by: "human:fixture", at: "2026-11-05T09:00:00Z" }
sources:
  - id: s1
    resource: "src:eur-lex-2023-607"
    title: "Règlement (UE) 2023/607 modifiant les dispositions transitoires du MDR"
    url: "https://eur-lex.europa.eu/eli/reg/2023/607/oj"
  - id: s2
    resource: "src:eur-lex-2024-1860"
    title: "Règlement (UE) 2024/1860 (déploiement progressif d'EUDAMED)"
    url: "https://eur-lex.europa.eu/eli/reg/2024/1860/oj"
  - id: s3
    resource: "src:ansm-mir-2026"
    title: "ANSM, page de déclaration des fabricants (formulaire MIR), 2026"
    url: "https://ansm.sante.fr/documents/reference/declarer-un-effet-indesirable/comment-declarer-si-vous-etes-fabricant-ou-distributeur-de-dispositifs-medicaux"
---

# Transition MDR et EUDAMED

## Échéances de transition

Le règlement (UE) 2023/607 a prolongé la période de transition du MDR et supprimé la date limite
d'écoulement des stocks (*sell-off*).[^s1] Les dispositifs encore couverts par un certificat délivré
sous les anciennes directives peuvent rester sur le marché jusqu'au :

- **31 décembre 2027** pour les dispositifs de classe III et les implantables de classe IIb ;
- **31 décembre 2028** pour les autres dispositifs de classe IIb et pour les classes IIa, Im et Is.

La prolongation est conditionnelle : système qualité conforme au MDR, demande déposée auprès d'un
organisme notifié, aucune modification significative de la conception ou de la destination.[^s1]

**Kelvara Rhythm n'est pas concerné :** il a été certifié directement selon le MDR en juin 2025 et n'a
aucun certificat hérité des directives. Ses évolutions suivent toujours la définition de la
[modification significative](/glossary/significant-change.md).

## EUDAMED

Le règlement (UE) 2024/1860 rend EUDAMED obligatoire module par module, chaque module s'appliquant un
délai fixe après l'avis de la Commission confirmant qu'il est fonctionnel.[^s2] Les sources secondaires
divergent sur les dates (enregistrement des dispositifs vers 2026, vigilance peut-être pas avant fin
2028) : le PRRC suit donc les avis de la Commission plutôt qu'un calendrier figé.

Tant que le module vigilance n'est pas obligatoire, les incidents graves survenus en France sont
déclarés à l'ANSM sur le formulaire MIR ; selon l'ANSM, le format MIR 7.3.1 s'applique depuis le
1er mai 2026.[^s3] Voir la [matériovigilance ANSM](materiovigilance-ansm.md) et le
[playbook incidents et vigilance](/playbooks/incident-vigilance.md).

[^s1]: Règlement (UE) 2023/607, article 1.
[^s2]: Règlement (UE) 2024/1860, article 1 (modifiant l'article 123 du MDR).
[^s3]: ANSM, page « Comment déclarer si vous êtes fabricant », mise à jour 2026.

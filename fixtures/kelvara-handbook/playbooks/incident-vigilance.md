---
type: Playbook
title: Playbook incidents et vigilance
description: Traitement pas à pas des problèmes sur le dispositif, des incidents graves et des violations de données personnelles, de la première alerte à la déclaration réglementaire.
tags: [playbook, vigilance, mdr, rgpd, incidents]
status: stable
lang: fr
doc_id: SOP-021
revision: 6
owner: "role:prrc"
review_due: "2027-06-30"
regulatory_refs: ["MDR art. 87", "MDR art. 88", "MDR art. 89", "RGPD art. 33", "RGPD art. 34", "ISO 13485 8.2.2"]
generated: { by: "human:fixture", at: "2026-10-01T09:00:00Z" }
sources:
  - id: s1
    resource: "src:qms-sop-021-v6"
    title: "SOP-021 Vigilance et gestion des incidents, v6"
  - id: s2
    resource: "src:dpa-ardoise-2025"
    title: "Accord de sous-traitance des données Ardoise Cloud 2025"
  - id: s3
    resource: "src:contract-ardoise-2025"
    title: "Contrat d'hébergement Ardoise Cloud 2025"
---

# Playbook incidents et vigilance

Ce playbook décrit ce que fait le personnel de Kelvara lorsqu'un problème a pu survenir avec
[Kelvara Rhythm](/products/kelvara-rhythm.md) ou avec les données patients qu'il traite : une
réclamation d'un hôpital, un technicien qui remarque une alerte manquée ou erronée, une panne chez
[Ardoise Cloud](/suppliers/ardoise-cloud.md), un patch défectueux de
[Linnet Medical](/suppliers/linnet-medical.md), ou une suspicion de violation de données personnelles.
Il s'adresse aux ingénieurs support, aux techniciens référents du
[centre de surveillance d'Elmhaven](/sites/elmhaven-monitoring-centre.md), au responsable vigilance, au
délégué à la protection des données (DPO) et à la [PRRC](/people/prrc.md). C'est la référence pour toute
déclaration réglementaire faite par Kelvara.[^s1]

## 1. Définitions

Une **réclamation** est toute communication écrite, électronique ou orale qui allègue une déficience de
l'identité, de la qualité, de la durabilité, de la fiabilité, de l'utilisabilité, de la sécurité ou des
performances d'un dispositif après sa mise à disposition. Chaque réclamation est évaluée au titre de la
vigilance, même quand l'hôpital la présente comme une simple question.[^s1]

Un **incident** est tout dysfonctionnement ou toute altération des caractéristiques ou des performances
du dispositif, y compris une erreur d'utilisation due à sa conception, toute insuffisance des
informations fournies avec lui, et tout effet secondaire indésirable.

Un **incident grave** est un incident qui a entraîné, aurait pu entraîner ou pourrait entraîner,
directement ou indirectement, le décès d'un patient, d'un utilisateur ou d'une autre personne ; la
dégradation grave, temporaire ou permanente, de l'état de santé d'une personne ; ou une menace grave
pour la santé publique. Pour Kelvara Rhythm, l'incident grave typique est un épisode de FA manqué ou
une alerte urgente tardive qui a entraîné, ou aurait pu entraîner, un AVC parce que le traitement a
commencé trop tard.

Une **violation de données personnelles** est une violation de la sécurité entraînant, de manière
accidentelle ou illicite, la destruction, la perte, l'altération, la divulgation non autorisée de
données personnelles, ou l'accès non autorisé à ces données.

La **date de prise de connaissance** est le jour où un salarié de Kelvara, quel qu'il soit et quelle
que soit la manière, apprend l'événement pour la première fois. Tous les délais de déclaration courent
à partir de cette date, et non du jour où le ticket parvient au responsable vigilance.[^s1]

## 2. Rôles

L'**ingénieur support** ou le **technicien** qui apprend l'événement ouvre le ticket. Il ne décide pas
si l'événement doit être déclaré ; son rôle est de consigner ce qu'on lui a dit, quand et par qui.

Le **technicien référent** de garde pilote la réponse immédiate pour la sécurité des patients au centre
de surveillance : relecture des enregistrements concernés et appel du cardiologue d'astreinte de
l'hôpital quand un patient peut être en danger maintenant.

Le **responsable vigilance** porte le ticket du tri à la clôture, rassemble les faits, rédige les
déclarations et tient le dossier d'incident complet.

Le **DPO** porte toute suspicion de violation de données personnelles, décide si elle doit être
notifiée, et est la seule personne qui contacte une autorité de contrôle.

La **PRRC** décide si un incident est un incident grave qui doit être déclaré, signe chaque déclaration
d'incident du fabricant et chaque avis de sécurité, et décide des mesures correctives de sécurité. La
PRRC est un rôle, pas une personne ; en son absence, la PRRC suppléante agit avec la même autorité.[^s1]

## 3. Première alerte

1. Quiconque apprend l'événement ouvre un ticket d'incident dans l'heure, pendant ou en dehors des
   heures ouvrées. Le ticket indique la date et l'heure de prise de connaissance, la source (hôpital,
   technicien, fournisseur, supervision), la version du dispositif et les identifiants des
   enregistrements concernés.
2. Les identifiants des patients ne figurent jamais dans le titre ou le résumé d'un ticket. On utilise
   le numéro d'examen de l'hôpital ; l'identité reste dans Kelvara Rhythm, où chaque accès est tracé
   selon la [politique d'accès aux données patients](../policies/patient-data-access.md).
3. Si un patient peut être en danger maintenant, le technicien référent appelle d'abord le cardiologue
   d'astreinte de l'hôpital et consigne l'appel dans le ticket. La déclaration passe toujours après la
   sécurité du patient.
4. Le ticket prévient automatiquement le responsable vigilance. En dehors des heures ouvrées,
   l'ingénieur support d'astreinte appelle la PRRC suppléante pour tout événement impliquant une alerte
   urgente manquée ou tardive.[^s1]

La première alerte sert à disposer d'une trace écrite et horodatée. La plupart des déclarations
tardives viennent de ce que personne n'a noté quand Kelvara a appris le problème.

## 4. Confinement

Le responsable vigilance décide avec l'équipe technique, dans les 4 heures, de ce qu'il faut confiner
pendant l'investigation.

- Si le problème peut toucher d'autres patients, suspendre le déploiement de la version concernée de
  Kelvara Rhythm et, si possible, ramener les hôpitaux à la version validée précédente.
- Si un modèle de détection est en cause, chaque enregistrement qu'il a analysé depuis la date de début
  supposée est remis en file pour une seconde lecture par un technicien à Elmhaven, en priorité sur les
  6 postes de tri urgent.
- Les enregistrements, traces et comptes rendus liés au ticket sont gelés : ils ne sont pas supprimés à
  la fin de leur durée normale selon la [politique de conservation des données](/policies/data-retention.md).
- Ne jamais corriger le problème en silence en production. Toute modification de code ou de
  configuration passe par la maîtrise des modifications, et la PRRC l'évalue selon la définition de la
  [modification significative](/glossary/significant-change.md) avant la mise en production.

Chaque décision de confinement est consignée dans le ticket avec sa justification et son responsable.

## 5. Incidents graves et déclaration de vigilance

La PRRC décide du caractère déclarable dans les 24 heures suivant l'ouverture du ticket. Quand la PRRC
ne peut pas exclure un lien de causalité entre le dispositif et l'événement, l'incident est traité
comme déclarable : selon le MDR, une déclaration est due dès qu'un lien de causalité est établi ou
raisonnablement possible.[^s1]

Les délais courent à partir de la date de prise de connaissance :

1. **Menace grave pour la santé publique :** déclaration immédiate, et au plus tard sous 2 jours.
2. **Décès ou dégradation grave et imprévue de l'état de santé d'une personne :** déclaration
   immédiate, et au plus tard sous 10 jours.
3. **Tout autre incident grave :** déclaration immédiate, et au plus tard sous 15 jours.

Les déclarations sont adressées à l'autorité compétente de l'État membre où l'incident s'est produit
(l'ANSM pour les incidents survenus en France ; voir la
[matériovigilance ANSM](/reglementation/materiovigilance-ansm.md)) sur le formulaire de déclaration
d'incident du fabricant (MIR). Quand les faits sont incomplets, une déclaration initiale est faite dans
les délais, puis complétée par des déclarations de suivi et une déclaration finale ; on ne manque
jamais un délai pour attendre la fin de l'investigation.[^s1]

L'hôpital qui a signalé l'événement reçoit un résumé de la déclaration initiale, sans les données des
autres hôpitaux. Les incidents non graves sont enregistrés, suivis en tendance et revus (section 11) ;
ils ne sont pas déclarés un par un.

## 6. Violations de données personnelles

Pour les données patients de Kelvara Rhythm, l'hôpital est responsable de traitement et Kelvara son
sous-traitant. Pour les comptes Kelvara Suivi et les données de son propre personnel, Kelvara est
responsable de traitement.

1. Toute suspicion de violation est transmise immédiatement au DPO, sur le même ticket que l'éventuel
   volet dispositif.
2. En tant que sous-traitant, Kelvara prévient chaque hôpital concerné dans les meilleurs délais, et en
   tout cas dans les 24 heures suivant la prise de connaissance, pour que l'hôpital puisse respecter son
   propre délai de 72 heures.
3. En tant que responsable de traitement, le DPO notifie l'autorité de contrôle dans les 72 heures
   suivant la prise de connaissance, sauf si la violation n'est pas susceptible d'engendrer un risque
   pour les personnes. Quand le risque est élevé, les personnes concernées sont aussi informées dans
   les meilleurs délais.
4. Ardoise Cloud doit prévenir Kelvara dans les 12 heures après avoir pris connaissance d'une violation
   touchant les données de Kelvara.[^s2] Le délai de 24 heures vis-à-vis des hôpitaux court à réception
   de l'avis d'Ardoise, ou plus tôt si Kelvara a appris la violation autrement.

Une violation qui touche aussi les performances du dispositif (par exemple des enregistrements
altérés) est traitée à la fois comme une violation et comme un incident grave possible ; le DPO et la
PRRC décident chacun de leur propre déclaration.

## 7. Mesures correctives de sécurité

Une mesure corrective de sécurité (FSCA) est toute action visant à réduire le risque d'incident grave
avec un dispositif déjà utilisé : retour à une version antérieure, mise à jour forcée, modification de
la notice d'utilisation ou retrait d'un lot de patchs.

- La PRRC décide de la FSCA et signe l'avis de sécurité (FSN).
- Sauf urgence, le projet de FSN est soumis à l'autorité compétente pour observations avant d'être
  envoyé aux hôpitaux.
- La FSN est envoyée à chaque hôpital qui utilise une version concernée, dans sa langue : les hôpitaux
  français la reçoivent en français.
- Linnet Medical est le fabricant du patch. Pour un défaut du patch, Kelvara prévient Linnet dans les
  2 jours ouvrés et Linnet mène sa propre FSCA ; Kelvara ne rappelle jamais seule un lot de Linnet.

## 8. Escalade

Le responsable vigilance escalade immédiatement vers la PRRC dans chacun de ces cas :

- un incident grave suspecté ;
- la même défaillance signalée par trois hôpitaux en 30 jours ;
- une violation impliquant des données patients (qui va aussi au DPO) ;
- un hôpital demande une mesure corrective ou menace de cesser d'utiliser le dispositif ;
- l'équipe technique et le responsable vigilance ne sont pas d'accord sur les faits.

L'escalade se fait d'abord par téléphone, puis par un résumé écrit dans le ticket dans la journée
ouvrée.

## 9. Incidents fournisseurs et crédits de service

Pour Ardoise Cloud, chaque mois où la disponibilité passe sous l'objectif de 99,9 % donne droit à un
crédit de service de 5 % de la redevance mensuelle par tranche de 0,1 point sous l'objectif.[^s3] Ce
n'est pas le responsable vigilance qui le réclame, mais le responsable des opérations IT, une fois par
mois, à partir des tickets d'incident.

1. En fin de mois, lister chaque panne imputée à Ardoise, avec ses heures de début et de fin relevées
   par la supervision de Kelvara.
2. Retirer les pannes causées par Kelvara elle-même (par exemple une version défectueuse de Kelvara).
3. Envoyer la liste restante et le crédit réclamé au responsable de compte d'Ardoise.
4. Les points contestés sont revus lors de la revue fournisseurs trimestrielle.

Pour Linnet Medical, un défaut de patch confirmé ouvre une demande d'action corrective fournisseur
(SCAR), à laquelle Linnet doit répondre dans les 30 jours. Deux SCAR dans l'année déclenchent un audit
fournisseur en dehors du cycle normal de deux ans.

## 10. Dossier d'incident

Chaque ticket qui parvient au responsable vigilance devient un dossier d'incident. Il contient :

- la date et l'heure de prise de connaissance, la source et la première personne informée ;
- la version du dispositif, les identifiants des enregistrements concernés et les hôpitaux impliqués
  (jamais les noms des patients) ;
- les décisions de confinement et leurs justifications ;
- la décision sur le caractère déclarable, qui l'a prise et quand ;
- une copie de chaque MIR, FSN et notification de violation, avec leurs dates d'envoi ;
- la cause racine, les actions correctives et préventives (CAPA) et leur vérification.

Les dossiers d'incident sont conservés 10 ans après la mise sur le marché de la dernière unité de la
version concernée, au sein de la documentation technique.

## 11. Après l'incident

Lors de la revue qualité hebdomadaire, la PRRC et le responsable vigilance passent en revue les tickets
de la semaine. Les tendances sont la principale préoccupation : le même type d'alerte manqué dans
plusieurs hôpitaux, une région d'Ardoise qui subit des micro-coupures répétées, ou un lot de patchs qui
se décollent souvent trop tôt. Une augmentation statistiquement significative de la fréquence ou de la
gravité des incidents non graves ou des effets secondaires attendus doit elle-même être déclarée, sous
forme de rapport de tendance. Chaque tendance reçoit un responsable, une CAPA et une échéance. Les
modifications de ce playbook y sont proposées et consignées dans le journal des modifications.[^s1]

## 12. Aide-mémoire

| Situation | Action | Qui |
| --- | --- | --- |
| Quelqu'un apprend un problème | Ouvrir un ticket dans l'heure, noter la date de prise de connaissance | La personne informée |
| Un patient peut être en danger maintenant | Appeler le cardiologue d'astreinte de l'hôpital | Technicien référent |
| Incident grave possible | Décider du caractère déclarable sous 24 h | PRRC |
| Décès ou dégradation grave | MIR sous 10 jours après la prise de connaissance | PRRC |
| Menace grave pour la santé publique | MIR sous 2 jours après la prise de connaissance | PRRC |
| Autre incident grave | MIR sous 15 jours après la prise de connaissance | PRRC |
| Violation de données patients (sous-traitant) | Prévenir les hôpitaux sous 24 h | DPO |
| Violation en tant que responsable de traitement | Autorité de contrôle sous 72 h | DPO |
| Fin de mois | Réclamer les crédits de service d'Ardoise | Responsable des opérations IT |

[^s1]: SOP-021 Vigilance et gestion des incidents, v6, sections 4–9.
[^s2]: Accord de sous-traitance des données Ardoise Cloud 2025, annexe 2.
[^s3]: Contrat d'hébergement Ardoise Cloud 2025, annexe B.

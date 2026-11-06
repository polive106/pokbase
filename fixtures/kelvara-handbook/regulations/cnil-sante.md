---
type: Regulation
title: CNIL health référentiels
description: The CNIL's frameworks for processing health data - non-research processing, the MR-004 reference methodology, and health data warehouses.
tags: [regulatory, cnil, gdpr, health-data, france]
status: stable
doc_id: REG-008
revision: 1
owner: "role:dpo"
review_due: "2027-03-31"
verified: "2026-11-05"
regulatory_refs: ["GDPR Art. 9", "CNIL deliberation n° 2018-155 (MR-004)", "CNIL deliberation n° 2021-118 (warehouses)"]
generated: { by: "human:fixture", at: "2026-11-05T09:00:00Z" }
sources:
  - id: s1
    resource: "src:cnil-referentiels-sante"
    title: "CNIL, Traitements de données dans le domaine de la santé : les référentiels pour simplifier vos démarches"
    url: "https://www.cnil.fr/fr/les-referentiels-et-methodologies-de-reference-sante"
  - id: s2
    resource: "src:cnil-referentiel-entrepot"
    title: "CNIL, Référentiel relatif aux entrepôts de données de santé"
    url: "https://www.cnil.fr/sites/cnil/files/atoms/files/referentiel_entrepot.pdf"
---

# CNIL health référentiels

The CNIL (the French data protection authority) publishes frameworks (*référentiels*) that simplify the
formalities for processing health data. Processing that strictly conforms needs a declaration (or
commitment) of conformity instead of a request for authorisation.[^s1]

## The three families

- **Non-research processing:** for example the framework on health vigilance and the framework on
  retention periods in the health sector.[^s1]
- **Research not involving the human person:** the **MR-004** reference methodology (deliberation
  n° 2018-155 of 3 May 2018), for studies and evaluations on existing data; the controller makes a
  commitment of conformity.[^s1]
- **Health data warehouses:** a separate framework (deliberation n° 2021-118 of 7 October 2021),
  limited to warehouses based on a task in the public interest (GDPR Article 6(1)(e)); warehouses run by
  private companies on the basis of legitimate interest are excluded.[^s2]

## What this means for Kelvara

- For Kelvara Rhythm the hospital is the controller and Kelvara the processor: the CNIL formalities for
  care are the hospital's.
- Reusing pseudonymised recordings for the clinical evaluation (see the
  [data retention policy](/policies/data-retention.md)) is research not involving the human person: it
  falls under MR-004, with patients informed.
- Kelvara, a private company, cannot build a health data warehouse under the warehouse framework; any
  warehouse project needs an authorisation request, after advice from the [DPO](/people/dpo.md).

[^s1]: CNIL, health frameworks and reference methodologies.
[^s2]: CNIL, framework for health data warehouses.

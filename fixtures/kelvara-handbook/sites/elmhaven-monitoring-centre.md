---
type: Site
title: Elmhaven monitoring centre
description: Kelvara's main remote ECG review centre, where certified technicians triage Kelvara Rhythm recordings for hospital customers.
tags: [operations, monitoring, site]
status: stable
generated: { by: "human:fixture", at: "2026-10-01T09:00:00Z" }
sources:
  - id: s1
    resource: "src:ops-memo-014"
    title: "Operations memo 14"
  - id: s2
    resource: "src:site-audit-2025"
    title: "Site security audit 2025"
---

# Elmhaven monitoring centre

The Elmhaven monitoring centre is Kelvara Health's main remote ECG review site. It opened in 2023 and
reviews the recordings of every contracted hospital in the northern region, including
[Valmoor University Hospital](/customers/valmoor-university-hospital.md).[^s2]

## Facilities

- 14 review stations, 6 of them cleared for urgent-alert triage.[^s2]
- Badge-controlled review room; screens face away from the windows and lock after 5 minutes idle.[^s2]
- Technician cover: 07:00–23:00, seven days a week. Overnight, urgent alerts go straight to the
  hospital's on-call cardiologist.[^s1]
- Staffed by certified cardiac technicians only (see the
  [training and competence policy](/policies/training-competence.md)).[^s1]

## Operations

No patient data is stored on the review stations: recordings stay in the HDS-certified
[Ardoise Cloud](/suppliers/ardoise-cloud.md) environment, under the
[patient-data access policy](/policies/patient-data-access.md). New patch kits from
[Linnet Medical](../suppliers/linnet-medical.md) are received in goods-in room 3 and shipped to
hospitals from there.[^s1] When a device problem or a data breach is suspected, staff follow the
[incident and vigilance playbook](/playbooks/incident-vigilance.md). When the review queue is above
90% of capacity, overflow goes to the [Thornfield backup centre](thornfield-backup-centre.md).

The site's regulatory duties are overseen by the [PRRC](/people/prrc.md).

[^s1]: Operations memo 14, section 2.
[^s2]: Site security audit 2025, pages 3–4.

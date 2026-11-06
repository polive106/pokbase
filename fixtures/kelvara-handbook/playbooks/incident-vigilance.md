---
type: Playbook
title: Incident and vigilance playbook
description: Step-by-step handling of device problems, serious incidents and personal data breaches, from first alert to regulatory report.
tags: [playbook, vigilance, mdr, gdpr, incidents]
status: stable
doc_id: SOP-021
revision: 6
owner: "role:prrc"
review_due: "2027-06-30"
regulatory_refs: ["MDR Art. 87", "MDR Art. 88", "MDR Art. 89", "GDPR Art. 33", "GDPR Art. 34", "ISO 13485 8.2.2"]
generated: { by: "human:fixture", at: "2026-10-01T09:00:00Z" }
sources:
  - id: s1
    resource: "src:qms-sop-021-v6"
    title: "SOP-021 Vigilance and incident management, v6"
  - id: s2
    resource: "src:dpa-ardoise-2025"
    title: "Ardoise Cloud data processing agreement 2025"
  - id: s3
    resource: "src:contract-ardoise-2025"
    title: "Ardoise Cloud hosting agreement 2025"
---

# Incident and vigilance playbook

This playbook explains what Kelvara staff do when something may have gone wrong with
[Kelvara Rhythm](/products/kelvara-rhythm.md) or with the patient data it processes: a complaint from
a hospital, a technician noticing a missed or false alert, an outage at
[Ardoise Cloud](/suppliers/ardoise-cloud.md), a faulty patch from
[Linnet Medical](/suppliers/linnet-medical.md), or a suspected personal data breach. It is written for
support engineers, technician leads at the [Elmhaven monitoring centre](/sites/elmhaven-monitoring-centre.md),
the [vigilance officer](/people/vigilance-officer.md), the [data protection officer (DPO)](/people/dpo.md)
and the [PRRC](/people/prrc.md), and it is the reference for every regulatory report Kelvara files.[^s1]
How complaints are received and logged is set out in the
[complaint handling procedure](/policies/complaint-handling.md).

## 1. Definitions

A **complaint** is any written, electronic or oral communication that alleges a deficiency in the
identity, quality, durability, reliability, usability, safety or performance of a device after it has
been released. Every complaint is assessed for vigilance, even when the hospital calls it a question.[^s1]

An **incident** is any malfunction or deterioration in the characteristics or performance of the
device, including a use error caused by its design, any inadequacy in the information supplied with
it, and any undesirable side-effect.

A **serious incident** is defined in the [glossary](/glossary/serious-incident.md): an incident that
led, might have led or might lead to a death, a serious deterioration of health, or a serious public
health threat. For Kelvara Rhythm, the typical serious incident is a missed AF episode or a delayed
urgent alert that led, or could have led, to a stroke because treatment started late.

A **personal data breach** is a breach of security leading to the accidental or unlawful destruction,
loss, alteration or unauthorised disclosure of, or access to, personal data.

The **awareness date** is the day any Kelvara employee first learns of the event, whoever they are and
however they heard. All reporting clocks start on the awareness date, not on the day the ticket reaches
the vigilance officer.[^s1]

## 2. Roles

The **support engineer** or **technician** who hears of the event opens the ticket. They do not
decide whether the event is reportable; their job is to record what they were told, when, and by whom.

The **technician lead** on shift owns the immediate patient-safety response at the monitoring centre:
re-reviewing the affected recordings and calling the hospital's on-call cardiologist when a patient
may be at risk now.

The **vigilance officer** owns the ticket from triage to closure, gathers the facts, drafts the
reports and keeps the incident record complete.

The **DPO** owns every suspected personal data breach, decides whether it is notifiable, and is the
only person who contacts a supervisory authority.

The **PRRC** decides whether an incident is a serious incident that must be reported, signs every
manufacturer incident report and field safety notice, and decides on field safety corrective actions.
The PRRC is a role, not a person; when the PRRC is absent, the deputy PRRC acts with the same
authority.[^s1]

## 3. First alert

1. Whoever hears of the event opens an incident ticket within 1 hour, in or out of working hours.
   The ticket records the awareness date and time, the source (hospital, technician, supplier,
   monitoring), the device version and the recording IDs involved.
2. Patient identifiers never go in a ticket's title or summary. Use the hospital's exam number;
   identity stays in Kelvara Rhythm, where every access is logged under the
   [patient-data access policy](../policies/patient-data-access.md).
3. If a patient may be in danger now, the technician lead calls the hospital's on-call cardiologist
   before anything else and records the call in the ticket. Reporting always comes second to patient
   safety.
4. The ticket notifies the vigilance officer automatically. Out of hours, the on-call support engineer
   phones the deputy PRRC for any event involving a missed or late urgent alert.[^s1]

The point of the first alert is a written, timed record. Most late reports happen because nobody wrote
down when Kelvara first heard about the problem.

## 4. Containment

The vigilance officer, with engineering, decides within 4 hours what to contain while the
investigation runs.

- If the problem may affect other patients, pause the rollout of the affected Kelvara Rhythm version
  and, when possible, move hospitals back to the previous validated version (the rollback path is
  described in the [software release procedure](/policies/software-release.md)).
- If a detection model is suspected, every recording it analysed since the suspected start date is
  queued for a second technician review at Elmhaven, on the 6 urgent-triage stations first.
- Recordings, logs and reports linked to the ticket are placed on legal hold: they are not deleted
  when their normal period under the [data retention policy](/policies/data-retention.md) ends.
- Never fix the problem silently in production. Any code or configuration change goes through change
  control, and the PRRC assesses it against the [significant change](/glossary/significant-change.md)
  definition before release.

Each containment decision is written in the ticket with its reason and its owner.

## 5. Serious incidents and vigilance reporting

The PRRC decides on reportability within 24 hours of the ticket being opened. When the PRRC cannot rule
out a causal link between the device and the event, the incident is treated as reportable: under the
MDR, a report is due as soon as a causal relationship is established or reasonably possible.[^s1]

Deadlines run from the awareness date:

1. **Serious public health threat:** report immediately, and no later than 2 days.
2. **Death or unanticipated serious deterioration in a person's state of health:** report
   immediately, and no later than 10 days.
3. **Any other serious incident:** report immediately, and no later than 15 days.

Reports go to the competent authority of the member state where the incident happened (ANSM for
incidents in France; see [ANSM matériovigilance](/regulations/ansm-materiovigilance.md)) on the
manufacturer incident report (MIR) form. When the facts are incomplete, an initial report is filed on
time and completed later with follow-up and final reports; a deadline is never missed to wait for the
investigation.[^s1]

The hospital that reported the event receives a summary of the initial report, without other
hospitals' data. Incidents that are not serious are recorded, trended and reviewed (section 11); they
are not reported one by one.

## 6. Personal data breaches

For patient data in Kelvara Rhythm, the hospital is the controller and Kelvara is its processor. For
Kelvara Suivi accounts and for Kelvara's own staff data, Kelvara is the controller.

1. Any suspected breach goes to the DPO at once, on the same ticket as any device aspect.
2. As processor, Kelvara tells each affected hospital without undue delay, and in any case within 24
   hours of awareness, so that the hospital can meet its own 72-hour deadline.
3. As controller, the DPO notifies the supervisory authority within 72 hours of awareness, unless the
   breach is unlikely to result in a risk to people. When the risk is high, the people affected are
   also told without undue delay.
4. Ardoise Cloud must tell Kelvara within 12 hours of becoming aware of a breach affecting Kelvara
   data.[^s2] The 24-hour clock towards hospitals starts when Ardoise's notice arrives, or earlier if
   Kelvara learned of the breach another way.

A breach that also affects the device's performance (for example, altered recordings) is handled both
as a breach and as a possible serious incident; the DPO and the PRRC each decide on their own report.

## 7. Field safety corrective actions

A field safety corrective action (FSCA) is any action taken to reduce the risk of a serious incident
with a device already in use: a software rollback, a forced update, a change to the instructions for
use, or the withdrawal of a patch batch.

- The PRRC decides on an FSCA and signs the field safety notice (FSN).
- Except when urgent, the draft FSN is sent to the competent authority for comments before it reaches
  hospitals.
- The FSN goes to every hospital using an affected version, in its own language: French hospitals
  receive it in French.
- Linnet Medical is the manufacturer of the patch. For a patch defect, Kelvara reports to Linnet within
  2 working days and Linnet runs its own FSCA; Kelvara never recalls a Linnet batch on its own.

## 8. Escalation

The vigilance officer escalates to the PRRC at once when any of these happen:

- a suspected serious incident;
- the same failure reported by three hospitals within 30 days;
- a breach involving patient data (which also goes to the DPO);
- a hospital asks for a corrective action or threatens to stop using the device;
- engineering and the vigilance officer disagree about the facts.

Escalation is by phone first, then by a written summary in the ticket within the working day.

## 9. Supplier incidents and service credits

For Ardoise Cloud, each month in which availability falls below the 99.9% target earns a service credit
of 5% of the monthly fee for each 0.1 point below target.[^s3] The vigilance officer does not claim it;
the head of IT operations does, once a month, from the incident tickets.

1. At month end, list every outage recorded against Ardoise, with start and end times taken from
   Kelvara's own monitoring.
2. Remove the outages Kelvara caused itself (for example, a faulty Kelvara release).
3. Send the remaining list and the claimed credit to Ardoise's account manager.
4. Disputed items are reviewed in the quarterly supplier review.

For Linnet Medical, a confirmed patch defect opens a supplier corrective action request (SCAR), which
Linnet must answer within 30 days. Two SCARs in one year trigger a supplier audit outside the normal
two-year cycle (see the [supplier management procedure](/policies/supplier-management.md)).

## 10. Incident record

Every ticket that reaches the vigilance officer becomes an incident record. It contains:

- the awareness date and time, the source and the first person told;
- the device version, the affected recording IDs and the hospitals involved (never patient names);
- the containment decisions and their reasons;
- the reportability decision, who made it and when;
- copies of every MIR, FSN and breach notification, with the dates they were sent;
- the root cause, the corrective and preventive actions (CAPA) and their verification.

Incident records are kept for 10 years after the last unit of the affected version is placed on the
market, as part of the technical documentation.

## 11. After the incident

At the weekly quality review, the PRRC and the vigilance officer review the week's tickets. Trends are
the main concern: the same alert type missed at several hospitals, an Ardoise region with repeated short
outages, or a patch batch with a high rate of early detachment. A statistically significant increase in
the frequency or severity of non-serious incidents or expected side-effects is itself reportable, as a
trend report. Each trend gets an owner, a CAPA and a due date, and feeds the
[post-market surveillance plan](/plans/post-market-surveillance.md). Changes to this playbook are
proposed there and recorded in the change log.[^s1]

## 12. Quick reference

| Situation | Action | Who |
| --- | --- | --- |
| Anyone hears of a problem | Open a ticket within 1 h, record the awareness date | Whoever heard |
| Patient may be at risk now | Call the hospital's on-call cardiologist | Technician lead |
| Possible serious incident | Decide reportability within 24 h | PRRC |
| Death or serious deterioration | MIR within 10 days of awareness | PRRC |
| Serious public health threat | MIR within 2 days of awareness | PRRC |
| Other serious incident | MIR within 15 days of awareness | PRRC |
| Patient-data breach (processor) | Tell the hospitals within 24 h | DPO |
| Breach as controller | Supervisory authority within 72 h | DPO |
| Month end | Claim Ardoise service credits | Head of IT operations |

[^s1]: SOP-021 Vigilance and incident management, v6, sections 4–9.
[^s2]: Ardoise Cloud data processing agreement 2025, schedule 2.
[^s3]: Ardoise Cloud hosting agreement 2025, schedule B.

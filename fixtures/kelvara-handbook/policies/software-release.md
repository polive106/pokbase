---
type: Policy
title: Software release procedure
description: The gates every Kelvara Rhythm release passes - IEC 62304 verification, risk review, PRRC sign-off - and the staged rollout and rollback rules.
tags: [procedure, quality, release, iec-62304]
status: stable
doc_id: SOP-015
revision: 3
owner: "role:head-of-engineering"
review_due: "2027-02-28"
regulatory_refs: ["IEC 62304 5.8", "ISO 14971", "ISO 13485 7.3"]
generated: { by: "human:fixture", at: "2026-11-06T09:00:00Z" }
sources:
  - id: s1
    resource: "src:qms-sop-015-v3"
    title: "SOP-015 Software release, v3"
---

# Software release procedure

Every release of [Kelvara Rhythm](/products/kelvara-rhythm.md), including hotfixes, passes the same
four gates, in order.[^s1]

## Gates

1. **Change classification:** the change is classified against the
   [significant change](/glossary/significant-change.md) definition. A significant change stops here
   until the notified body approves it.[^s1]
2. **Verification:** all IEC 62304 software system tests pass, and the AF detection performance is
   re-measured on the reference dataset.[^s1]
3. **Risk review:** the risk management file (ISO 14971) is updated and no risk moves to an
   unacceptable level.[^s1]
4. **Release sign-off:** the head of engineering and the [PRRC](/people/prrc.md) both sign the release
   record.[^s1]

## Staged rollout

- A release goes first to **one pilot hospital for 7 days**, then to all hospitals.[^s1]
- During the pilot, the [vigilance officer](/people/vigilance-officer.md) reviews every complaint from
  that hospital daily.[^s1]
- The previous validated version stays deployable for **90 days**, so hospitals can be moved back
  within 2 hours if the [incident and vigilance playbook](/playbooks/incident-vigilance.md) requires
  it.[^s1]

Release history is kept in the [release history](/products/rhythm-release-history.md).

[^s1]: SOP-015 Software release, v3, sections 2–5.

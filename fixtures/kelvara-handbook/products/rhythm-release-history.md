---
type: Product
title: Kelvara Rhythm release history
description: The Kelvara Rhythm releases since CE marking, what changed in each, and how each change was classified.
tags: [product, releases, change-control]
status: stable
generated: { by: "human:fixture", at: "2026-11-06T09:00:00Z" }
sources:
  - id: s1
    resource: "src:release-records-2026"
    title: "Kelvara Rhythm release records, 2025–2026"
---

# Kelvara Rhythm release history

Every release below went through the [software release procedure](/policies/software-release.md);
none was a [significant change](/glossary/significant-change.md).[^s1]

| Version | Released | Main changes | Classification |
| --- | --- | --- | --- |
| 2.1 | June 2025 | First version under the MDR certificate | Initial certification |
| 2.2 | December 2025 | Faster upload from Rhythm Capture; French interface for Rhythm Report | Not significant |
| 2.3 | April 2026 | New technician worklist in Rhythm Review | Not significant |
| 2.4 | September 2026 | Fix for duplicate urgent-alert notifications introduced in 2.3; detection model retrained, sensitivity +0.4 point | Not significant (below the 1-point threshold) |

## Known issues in 2.4

- Rhythm Review shows the recording length but does not warn when it is shorter than the planned exam
  length. A warning is planned for 2.5.[^s1]

[^s1]: Kelvara Rhythm release records, 2025–2026.

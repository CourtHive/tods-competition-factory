---
title: Participant Types
---

## Participant "agnostic"

The logic governing movements within draws is "participant agnostic", and doesn't know or care whether the participants moving through the `structures` of a draw are `participantType` INDIVIDUAL, PAIR or TEAM.

When participants progress through `matchUps` within and across `structures` the logic requires only `positionAssignments`, which are used when requesting `matchUps` with "context" to add `sides` which include `participants`.

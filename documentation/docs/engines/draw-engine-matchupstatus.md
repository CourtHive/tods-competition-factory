---
title: matchUpStatus
---

## Changing matchUpStatus

Changing the `matchUpStatus` of a `matchUp` may affect other `matchUps` across the structures that make up a draw.

Any attempt to from a **_directing_** to a **_non-directing_** `matchUpStatus`, or vice-versa, causes the **_drawEngine_** to check the validity of the change and, if valid, to modify all affected `matchUps`.

## matchUpStatus effects

| `matchUpStatus` | Completed | Directing | Active | Upcoming |
| --------------- | :-------: | :-------: | :----: | :------: |
| BYE             |     x     |     x     |        |          |
| RETIRED         |     x     |     x     |        |          |
| DEFAULTED       |     x     |     x     |        |          |
| COMPLETED       |     x     |     x     |        |          |
| WALKOVER        |     x     |     x     |        |          |
| DOUBLE_WALKOVER |     x     |     -     |        |          |
| INCOMPLETE      |           |           |   x    |          |
| IN_PROGRESS     |           |           |   x    |          |
| SUSPENDED       |           |           |   x    |          |
| TO_BE_PLAYED    |           |           |        |    x     |
| NOT_PLAYED      |           |           |        |    x     |
| CANCELLED       |           |           |        |          |
| ABANDONED       |           |           |        |          |
| DEAD_RUBBER     |           |           |        |          |

## Single structure effects

If the effects of a change to a `matchUpStatus` are limited to a single structure, the only changes necessary are that `drawPositions` of relevant `matchUps` be modified to reflect participant movements across rounds.

:::tip
`drawDefinitions` are "participant agnostic". All `matchUps` within `structures` require only `drawPositions`.
:::

## Multi-structure effects

When there are multiple structures in a draw, such as COMPASS or DOUBLE ELIMINATION draws, then losers (and sometimes winners) can move across structures. For instance a first round loser in an EAST structure will move into the first round of the WEST structure. When this happens the `positionAssignments` for the target structure must be updated to map the `participantId` to the `drawPosition` where they have been assigned.

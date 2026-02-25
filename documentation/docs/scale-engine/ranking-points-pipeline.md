---
title: Ranking Points Pipeline
---

The ranking points pipeline transforms tournament results into granular point awards. This page documents how `getTournamentPoints` processes each participant's tournament performance.

## Pipeline Overview

```
Tournament Record
       |
       v
  1. Policy Resolution      Find POLICY_TYPE_RANKING_POINTS
       |
       v
  2. Participant Hydration   getParticipants({ withRankingProfile: true })
       |                     -> structureParticipation per draw
       v
  3. Per-Draw Processing     For each draw a participant entered:
       |
       +-> 3a. Profile Selection   getAwardProfile (specificity scoring)
       +-> 3b. Position Points     finishingPositionRanges[accessor]
       +-> 3c. Per-Win Points      pointsPerWin or perWinPoints (level-keyed)
       +-> 3d. Bonus Points        champion/finalist bonusPoints
       +-> 3e. Quality Wins        getQualityWinPoints (ranked opponent bonus)
       +-> 3f. Doubles Attribution pair -> individual point distribution
       |
       v
  4. Output                  personPoints, pairPoints, teamPoints
```

## Profile Selection

When a participant has a `structureParticipation` entry, `getAwardProfile` finds the best matching `awardProfile` from the policy.

### Specificity Scoring

Profiles are scored by counting their populated scope fields. A profile that specifies `drawTypes`, `levels`, and `maxDrawSize` (score 3) beats a catch-all profile with no scope constraints (score 0).

**Scored fields** (1 point each):

| Field | Matches Against |
| --- | --- |
| `eventTypes` | `event.eventType` |
| `drawTypes` | `drawDefinition.drawType` |
| `drawSizes` | `drawDefinition.drawSize` |
| `maxDrawSize` | `drawDefinition.drawSize <= maxDrawSize` |
| `stages` | `structureParticipation.rankingStage` |
| `stageSequences` | `structureParticipation.stageSequence` |
| `levels` | `level` parameter |
| `maxLevel` | `level <= maxLevel` |
| `flights` | `structureParticipation.flightNumber` |
| `maxFlightNumber` | `flightNumber <= maxFlightNumber` |
| `participationOrder` | `structureParticipation.participationOrder` |
| `dateRanges` | `startDate`/`endDate` within range |
| `category.*` | Each populated CategoryScope field |

**Priority override:** If any matching profile has an explicit `priority` number, the highest priority wins regardless of specificity score.

### CategoryScope Matching

The `category` field on an `awardProfile` uses `CategoryScope` to match against the event's competitive context:

```js
category: {
  ageCategoryCodes: ['U18'],        // event.category.ageCategoryCode
  genders: ['MALE'],                // event.gender
  categoryNames: ['Junior'],        // event.category.categoryName
  categoryTypes: ['AGE'],           // event.category.type
  ratingTypes: ['WTN'],             // event.category.ratingType
  ballTypes: ['GREEN'],             // event.category.ballType
  wheelchairClasses: ['QUAD'],      // event.wheelchairClass
  subTypes: ['ADVANCED'],           // event.category.subType
}
```

Each field uses contains semantics: if the scope field is present, the event value must be in the array. Absent fields match everything.

## Position Points

Position points are determined by the participant's `finishingPositionRange` — a numeric range representing where they finished in the draw structure.

### The Accessor

```js
const accessor = Math.max(...finishingPositionRange);
```

The accessor is used to look up points in the profile's `finishingPositionRanges`:

| Finish | finishingPositionRange | accessor | Policy key |
| --- | --- | --- | --- |
| Champion | `[1, 1]` | `1` | `1` |
| Runner-up | `[2, 2]` | `2` | `2` |
| SF losers (no 3-4 playoff) | `[3, 4]` | `4` | `4` |
| 3rd place (with playoff) | `[3, 3]` | `3` | `3` |
| QF losers | `[5, 8]` | `8` | `8` |
| R16 losers | `[9, 16]` | `16` | `16` |

:::tip
In draws without a 3rd-place playoff (standard single elimination), both semifinal losers get `finishingPositionRange: [3, 4]` and accessor `4`. Set the key `4` value to your intended "semifinal loser" points.
:::

### Position Value Resolution

The value at each policy key can be:

- **Simple number**: `{ 1: 1000 }` — 1000 points regardless of level
- **Level-keyed**: `{ 1: { level: { 1: 1000, 2: 500, 3: 300 } } }` — varies by tournament level
- **Draw size threshold**: `{ 1: [{ threshold: 16, value: 800 }, { threshold: 32, value: 1000 }] }` — varies by draw size
- **Flight-specific**: `{ 1: { flights: { 1: 1000, 2: 500 } } }` — varies by flight number

### Multi-Structure Draws

For draws with multiple structures (FIC, Curtis Consolation, Compass), participants may have `structureParticipation` entries in multiple structures. The pipeline iterates all entries and takes the **maximum position points** across structures:

```
Main draw R2 loser:      accessor 24 -> 75 pts
Consolation SF finisher:  accessor 12 -> 150 pts
Final position points:    150 pts (consolation finish is better)
```

This happens automatically — no special policy configuration is needed for multi-structure draws.

## Per-Win Points

Per-win points are awarded when a participation has no position points (the accessor doesn't match any `finishingPositionRanges` key) or through a dedicated per-win config.

### Simple Per-Win

```js
awardProfile: {
  pointsPerWin: 60, // flat value per match won
}
```

### Level-Keyed Per-Win

```js
awardProfile: {
  perWinPoints: {
    level: { 1: 300, 2: 225, 3: 150 }
  }
}
```

### maxCountableMatches

Caps the number of wins counted for per-win points per participant per draw:

```js
awardProfile: {
  maxCountableMatches: 5,
  // or level-keyed:
  maxCountableMatches: { level: { 3: 5, 4: 4 } },
}
```

When a participant has wins across multiple structures (e.g., qualifying + main draw), the cap applies cumulatively across all participations sharing the same award profile.

## Bonus Points

Champion and finalist bonuses based on the participant's best finishing position across all structures in a draw:

```js
awardProfile: {
  bonusPoints: [
    { finishingPositions: [1], value: { level: { 6: 50, 7: 25 } } },
    { finishingPositions: [2], value: { level: { 6: 30, 7: 15 } } },
  ],
}
```

The `bestFinishingPosition` is `Math.min(finishingPositionRange)` — the best position the participant could have achieved.

## Doubles Attribution

Controls how pair (doubles) points flow to individual participants:

```js
rankingPolicy: {
  doublesAttribution: 'fullToEach', // or 'splitEven'
}
```

| Mode | Effect |
| --- | --- |
| `'fullToEach'` | Each individual receives 100% of pair points |
| `'splitEven'` | Each individual receives 50% of pair points (rounded) |
| Not set | Points only on pair record, not distributed to individuals |

## PointAward Output

Each award in `personPoints` contains a granular breakdown:

```ts
{
  positionPoints: 500,       // from finishingPositionRanges
  perWinPoints: 225,         // from per-win config
  bonusPoints: 50,           // from bonusPoints config
  points: 775,               // total: position + perWin + bonus
  winCount: 3,               // total wins in this draw
  rangeAccessor: 4,          // finishingPositionRange accessor used
  eventType: 'SINGLES',
  drawId: 'draw-abc',
  drawType: 'SINGLE_ELIMINATION',
  category: { ageCategoryCode: 'U18' },
  level: 3,
  startDate: '2025-06-01',
  endDate: '2025-06-07',
}
```

## Related Documentation

- **[Scale Engine Overview](./scale-engine-overview)** — Introduction and architecture
- **[Core API Reference](./scale-engine-api)** — Complete method reference
- **[Quality Win Points](./quality-win-points)** — Quality win bonus system
- **[Ranking Policy](/docs/policies/rankingPolicy)** — Full policy structure reference
- **[Ranking Governor](/docs/governors/ranking-governor)** — Stateless function reference

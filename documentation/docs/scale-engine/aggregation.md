---
title: Multi-Tournament Aggregation
---

The aggregation layer combines point awards from multiple tournaments into ranking lists. It operates as pure computation — no tournament state is accessed. The consumer is responsible for collecting `PointAward[]` from multiple `getTournamentPoints` calls and passing them to `generateRankingList`.

## Aggregation Pipeline

```
  PointAward[] (from multiple tournaments)
       |
  1. Category Filter     ageCategoryCodes, genders, eventTypes
       |
  2. Rolling Period       Exclude awards older than rollingPeriodDays
       |
  3. Group by Person      Collect all awards per personId
       |
  4. Bucket Processing    Per counting bucket:
       |                    - Filter by eventTypes + pointComponents
       +-> Sort descending  - Sort by computed value
       +-> Level cap        - Apply maxResultsPerLevel
       +-> Best-of-N        - Apply bestOfCount
       +-> Sum              - Bucket total
       |
  5. Total Points         Sum across all buckets
       |
  6. Minimum Check        meetsMinimum if countingResults >= minCountableResults
       |
  7. Sort + Tiebreak      Sort descending, apply tiebreakCriteria
       |
  8. Assign Ranks         1-based, tied ranks for equal positions
       |
       v
  RankingListEntry[]
```

## Typical Pipeline

```js
import { generateRankingList } from 'tods-competition-factory';

// Step 1: Collect awards from multiple tournaments
const allAwards = [];

for (const tournamentRecord of seasonTournaments) {
  scaleEngine.setState(tournamentRecord);
  const { personPoints } = scaleEngine.getTournamentPoints({
    policyDefinitions: rankingPolicy,
    level: tournamentRecord.level,
  });

  for (const [personId, awards] of Object.entries(personPoints)) {
    allAwards.push(...awards.map(a => ({ ...a, personId })));
  }
}

// Step 2: Generate ranking list
const rankingList = generateRankingList({
  pointAwards: allAwards,
  aggregationRules,
  asOfDate: '2025-12-31',
});
```

## Counting Buckets

Counting buckets define how awards are grouped and counted. Each bucket filters awards by `eventTypes` and extracts point values from `pointComponents`:

```js
aggregationRules: {
  countingBuckets: [
    {
      bucketName: 'Singles',
      eventTypes: ['SINGLES'],
      pointComponents: ['positionPoints', 'perWinPoints', 'bonusPoints'],
      bestOfCount: 6,                    // best 6 results count
      maxResultsPerLevel: { 7: 2 },     // max 2 level-7 results
    },
    {
      bucketName: 'Doubles',
      eventTypes: ['DOUBLES'],
      pointComponents: ['positionPoints', 'perWinPoints', 'bonusPoints'],
      bestOfCount: 2,                    // best 2 results count
    },
    {
      bucketName: 'Quality Wins',
      pointComponents: ['qualityWinPoints'],
      bestOfCount: 0,                    // 0 = count ALL (no limit)
    },
  ],
}
```

### Point Components

The `pointComponents` array specifies which fields on each award to sum for the bucket value:

| Component | Source |
| --- | --- |
| `'positionPoints'` | Finishing position points |
| `'perWinPoints'` | Per-win points |
| `'bonusPoints'` | Champion/finalist bonus |
| `'qualityWinPoints'` | Quality win bonus |
| `'linePoints'` | Team line position points |
| `'points'` | Combined total (position + perWin + bonus) |

### bestOfCount

- `0` — Count all results (no limit)
- `N > 0` — Count only the best N results; remaining are dropped

### maxResultsPerLevel

Limits how many results from a specific tournament level count toward the bucket:

```js
maxResultsPerLevel: { 7: 2, 6: 3 }
// At most 2 level-7 results and 3 level-6 results count
```

Results exceeding the level cap are moved to `droppedResults`.

## Without Counting Buckets

When no `countingBuckets` are defined, all awards are treated as a single group. The value for each award is `points + qualityWinPoints`. Global `bestOfCount` and `maxResultsPerLevel` from `aggregationRules` apply:

```js
aggregationRules: {
  bestOfCount: 10,              // best 10 results overall
  maxResultsPerLevel: { 7: 3 }, // max 3 level-7 results
}
```

## Rolling Period

Filter awards by date to implement rolling ranking windows:

```js
aggregationRules: {
  rollingPeriodDays: 365, // only awards from the last 365 days
}
```

Awards are filtered by their `endDate` field. Awards without an `endDate` are always included. The cutoff is calculated from `asOfDate`:

```js
generateRankingList({
  pointAwards: allAwards,
  aggregationRules: { rollingPeriodDays: 365 },
  asOfDate: '2025-12-31', // only awards ending after 2024-12-31
});
```

## Category Filter

Filter awards before aggregation by category, gender, or event type:

```js
generateRankingList({
  pointAwards: allAwards,
  categoryFilter: {
    ageCategoryCodes: ['U18'],
    genders: ['MALE'],
    eventTypes: ['SINGLES'],
  },
});
```

## Minimum Countable Results

Flag entries that don't have enough results to be considered for official ranking:

```js
aggregationRules: {
  minCountableResults: 3,
}
```

Entries below the threshold have `meetsMinimum: false` but are still included in the output with their points and rank.

## Tiebreakers

When two entries have the same `totalPoints`, tiebreak criteria are applied in order:

```js
aggregationRules: {
  tiebreakCriteria: ['highestSingleResult', 'mostCountingResults', 'mostWins'],
}
```

| Criterion | Resolution |
| --- | --- |
| `'highestSingleResult'` | Highest individual `points` value among counting results |
| `'mostCountingResults'` | More counting results wins |
| `'mostWins'` | More total `winCount` across counting results wins |

Tied entries that remain unresolved after all criteria share the same rank.

## RankingListEntry Output

```ts
{
  personId: string;
  totalPoints: number;
  rank: number;                    // 1-based, tied for equal positions
  meetsMinimum: boolean;           // false if below minCountableResults
  countingResults: PointAward[];   // results that count toward total
  droppedResults: PointAward[];    // results excluded by bestOfCount or level cap
  bucketBreakdown?: [{             // present when countingBuckets are used
    bucketName: string;
    countingResults: PointAward[];
    droppedResults: PointAward[];
    bucketTotal: number;
  }];
}
```

## Per-Participant Breakdown

Use `getParticipantPoints` to inspect a single participant's counting/dropped breakdown:

```js
import { getParticipantPoints } from 'tods-competition-factory';

const { buckets, totalPoints } = getParticipantPoints({
  pointAwards: allAwards,
  personId: 'player-abc',
  aggregationRules,
});
```

## Related Documentation

- **[Scale Engine Overview](./scale-engine-overview)** — Introduction and architecture
- **[Core API Reference](./scale-engine-api)** — generateRankingList and getParticipantPoints API
- **[Ranking Points Pipeline](./ranking-points-pipeline)** — How per-tournament points are computed
- **[Quality Win Points](./quality-win-points)** — Quality win bonus system
- **[Ranking Policy](/docs/policies/rankingPolicy)** — Full policy structure including aggregationRules

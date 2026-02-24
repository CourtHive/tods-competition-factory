---
title: Embargo and Scheduled Rounds
---

## Embargo

**Embargo** is a time-based visibility gate that extends the publishing system. When an embargo timestamp is set on any publishable element, the element is stored as `published: true` but remains **hidden from public-facing queries** until the embargo time passes. No additional mutation or cron job is needed — visibility changes automatically when the system clock passes the embargo timestamp.

### Why Embargo?

Embargoes solve a common tournament operations challenge: the need to **prepare and finalize** publish state ahead of time while controlling **exactly when** the public sees the data.

**Common scenarios:**

- **Media coordination**: Schedule draw release for a specific press conference time
- **Staged rollout**: Publish qualifying draws immediately, embargo main draw until the next morning
- **Schedule preparation**: Finalize the order of play internally and set it to go live at a specific hour
- **Participant announcements**: Coordinate participant list release with marketing campaigns

### How Embargo Works

Embargo adds an optional `embargo` field (ISO 8601 timestamp string) to the `PublishingDetail` type used across the publishing system:

```ts
type ScheduledRoundDetail = {
  published?: boolean;
  embargo?: string; // ISO 8601 timestamp
};

type PublishingDetail = {
  scheduledRounds?: { [roundNumber: number]: ScheduledRoundDetail };
  roundLimit?: number; // only applicable to structureDetails
  published?: boolean;
  embargo?: string; // ISO 8601 timestamp — content hidden until this time
};
```

The enforcement logic is:

1. If `published` is `false`, the element is **hidden** (embargo is irrelevant)
2. If `published` is `true` and there is **no embargo** (or the embargo is not a valid ISO date), the element is **visible** (backward compatible)
3. If `published` is `true` and the embargo is a **future** timestamp, the element is **hidden**
4. If `published` is `true` and the embargo is a **past** timestamp, the element is **visible**

### Embargo Levels

Embargoes can be applied at every level of the publish hierarchy:

#### Draw-Level Embargo

Hides an entire draw from public queries until the embargo passes.

```js
engine.publishEvent({
  eventId,
  drawDetails: {
    [drawId]: {
      publishingDetail: {
        published: true,
        embargo: '2024-06-15T10:00:00Z',
      },
    },
  },
});
```

**API Reference:** [publishEvent](/docs/governors/publishing-governor#publishevent)

#### Stage-Level Embargo

Hides a specific stage (e.g. QUALIFYING, MAIN) while other stages remain visible.

```js
engine.publishEvent({
  eventId,
  drawDetails: {
    [drawId]: {
      publishingDetail: { published: true },
      stageDetails: {
        QUALIFYING: { published: true }, // visible immediately
        MAIN: { published: true, embargo: '2024-06-16T08:00:00Z' }, // hidden until 8am
      },
    },
  },
});
```

**API Reference:** [publishEvent](/docs/governors/publishing-governor#publishevent)

#### Structure-Level Embargo

Hides a specific structure within a draw.

```js
engine.publishEvent({
  eventId,
  drawDetails: {
    [drawId]: {
      publishingDetail: { published: true },
      structureDetails: {
        [structureId]: { published: true, embargo: '2024-06-15T14:00:00Z' },
      },
    },
  },
});
```

**API Reference:** [publishEvent](/docs/governors/publishing-governor#publishevent)

#### Order of Play Embargo

Hides the published schedule until the embargo passes.

```js
engine.publishOrderOfPlay({
  scheduledDates: ['2024-06-15'],
  embargo: '2024-06-14T18:00:00Z', // schedule visible after 6pm the day before
});
```

When embargoed, `competitionScheduleMatchUps({ usePublishState: true })` returns empty `dateMatchUps`.

**API Reference:** [publishOrderOfPlay](/docs/governors/publishing-governor#publishorderofplay), [competitionScheduleMatchUps](/docs/governors/query-governor#competitionschedulematchups)

#### Participants Embargo

Hides the participant list until the embargo passes.

```js
engine.publishParticipants({
  embargo: '2024-06-10T09:00:00Z',
});
```

**API Reference:** [publishParticipants](/docs/governors/publishing-governor#publishparticipants)

### Admin vs Public Behavior

Embargo enforcement applies only to **public-facing query paths** — methods called with `usePublishState: true`:

| Method | Embargo enforced? | Notes |
|---|---|---|
| [`getEventData`](/docs/governors/query-governor#geteventdata) | Yes (when `usePublishState: true`) | Filters draws, stages, structures |
| [`competitionScheduleMatchUps`](/docs/governors/query-governor#competitionschedulematchups) | Yes (when `usePublishState: true`) | Filters orderOfPlay and matchUps |
| [`getDrawData`](/docs/governors/publishing-governor#getdrawdata) | Yes (when `usePublishState: true`) | Filters structures |
| [`getPublishState`](/docs/governors/publishing-governor#getpublishstate) | **No** | Reports full publish config including embargo metadata |

**`getPublishState`** is the **admin/reporting** function. It intentionally **ignores** embargo timestamps so that admin clients (like TMX) can see:

- Which elements are published
- Which have active embargoes
- When each embargo expires

This is essential for admin UIs — an organizer who sets a future embargo needs to see the element as "published (embargoed until X)" rather than "unpublished."

### Querying Embargo Status

`getPublishState()` returns an `embargoes` array when any embargoes exist:

```js
const { publishState } = engine.getPublishState();

// publishState.embargoes is an array when embargoes are present
publishState.embargoes?.forEach(({ type, id, embargo, embargoActive }) => {
  console.log(`${type} ${id ?? ''}: embargo ${embargo}, active: ${embargoActive}`);
});

// Example embargoes array:
// [
//   { type: 'draw', id: 'drawId1', embargo: '2024-06-15T10:00:00Z', embargoActive: true },
//   { type: 'stage', id: 'drawId1:QUALIFYING', embargo: '2024-06-14T08:00:00Z', embargoActive: false },
//   { type: 'structure', id: 'structureId1', embargo: '2024-06-15T14:00:00Z', embargoActive: true },
//   { type: 'scheduledRound', id: 'structureId1:round2', embargo: '2024-06-16T08:00:00Z', embargoActive: true },
//   { type: 'orderOfPlay', embargo: '2024-06-14T18:00:00Z', embargoActive: true },
//   { type: 'participants', embargo: '2024-06-10T09:00:00Z', embargoActive: false },
// ]
```

**API Reference:** [getPublishState](/docs/governors/publishing-governor#getpublishstate)

Each entry contains:

| Field | Type | Description |
|---|---|---|
| `type` | string | `'draw'`, `'stage'`, `'structure'`, `'scheduledRound'`, `'orderOfPlay'`, or `'participants'` |
| `id` | string? | Identifier (drawId, `drawId:stage`, structureId, `structureId:roundN`). Absent for tournament-level types. |
| `embargo` | string | ISO 8601 timestamp |
| `embargoActive` | boolean | `true` if the embargo is still in the future |

### Embargo Expiry

Embargoes are evaluated at query time — there is no background process. When the system clock passes the embargo timestamp, the content automatically becomes visible on the next query. This means:

- **No cron jobs needed** — visibility is always current
- **No second mutation needed** — the embargo is self-resolving
- **Time zone handling** — use ISO 8601 timestamps with timezone offsets (e.g. `2024-06-15T10:00:00Z`) for unambiguous behavior

### Embargo Workflow Example

A typical tournament workflow using embargoes:

```js
import { stageConstants } from 'tods-competition-factory';

// 1. Monday: Publish qualifying draw immediately, embargo main draw until Wednesday 9am
engine.publishEvent({
  eventId,
  drawDetails: {
    [drawId]: {
      publishingDetail: { published: true },
      stageDetails: {
        [stageConstants.QUALIFYING]: { published: true },
        [stageConstants.MAIN]: { published: true, embargo: '2024-06-12T09:00:00Z' },
      },
    },
  },
});

// 2. Monday: Schedule ready — embargo until Tuesday evening
engine.publishOrderOfPlay({
  scheduledDates: ['2024-06-11', '2024-06-12'],
  embargo: '2024-06-10T18:00:00Z',
});

// 3. Admin UI checks status
const { publishState } = engine.getPublishState();
// publishState.embargoes shows both active embargoes with their expiry times

// 4. No further action needed — embargoes resolve automatically
```

## Scheduled Rounds

**Scheduled Rounds** provide per-round control over which rounds' matchUps appear in the published schedule. This works in conjunction with `roundLimit` and embargo to enable progressive schedule disclosure.

### roundLimit Behavior

`roundLimit` behaves differently depending on draw type:

- **AD_HOC draws**: `roundLimit` filters both the bracket (draw data in `getEventData`) and the schedule (`competitionScheduleMatchUps`)
- **Non-AD_HOC draws** (elimination, round robin, etc.): `roundLimit` filters the **schedule only**. The bracket always shows all rounds because future rounds in elimination draws represent the structure, not yet-generated matchUps.

### Per-Round Schedule Control

Use `scheduledRounds` within `structureDetails` for granular control:

```js
engine.publishEvent({
  eventId,
  drawDetails: {
    [drawId]: {
      structureDetails: {
        [structureId]: {
          published: true,
          roundLimit: 3,            // schedule ceiling: rounds 1-3
          scheduledRounds: {
            1: { published: true }, // round 1 visible in schedule
            2: { published: true, embargo: '2024-06-16T08:00:00Z' }, // round 2 embargoed
            // round 3 not listed → hidden from schedule
          },
        },
      },
    },
  },
});
```

### Interaction Rules

1. **`roundLimit` is always the ceiling** — rounds above `roundLimit` never appear in the schedule, regardless of `scheduledRounds`
2. **`scheduledRounds` gates within the ceiling** — within the rounds allowed by `roundLimit`, only rounds listed in `scheduledRounds` with `{ published: true }` (and past embargo) appear
3. **When `scheduledRounds` is absent** — all rounds up to `roundLimit` appear in the schedule (backward compatible)
4. **Embargo on individual rounds** — each entry in `scheduledRounds` supports the standard `embargo` field for time-based release

### Scheduled Rounds Workflow

```js
// Step 1: Create 3 AD_HOC rounds, schedule all matchUps
// Step 2: Publish bracket with roundLimit 2, schedule only round 1
engine.publishEvent({
  eventId,
  drawDetails: {
    [drawId]: {
      structureDetails: {
        [structureId]: {
          published: true,
          roundLimit: 2,
          scheduledRounds: { 1: { published: true } },
        },
      },
    },
  },
});

// Step 3: Add round 2 to schedule with embargo
engine.publishEvent({
  eventId,
  removePriorValues: true,
  drawDetails: {
    [drawId]: {
      structureDetails: {
        [structureId]: {
          published: true,
          roundLimit: 2,
          scheduledRounds: {
            1: { published: true },
            2: { published: true, embargo: '2024-06-16T08:00:00Z' },
          },
        },
      },
    },
  },
});

// Step 4: Embargo passes → round 2 automatically visible in schedule
```

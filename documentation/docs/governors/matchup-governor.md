---
title: matchUp Governor
---

```js
import { matchUpGovernor } from 'tods-competition-factory';
```

## addMatchUpEndTime

```js
const endTime = '2020-01-01T09:05:00Z';
engine.addMatchUpEndTime({
  validateTimeSeries, // optional - true by default - when false does not verify endTime is later than startTime
  disableNotice, // when disabled subscribers will not be notified
  matchUpId,
  endTime,
  drawId,
});
```

---

## addMatchUpOfficial

```js
engine.addMatchUpOfficial({
  disableNotice, // when disabled subscribers will not be notified
  participantId,
  officialType,
  matchUpId,
  drawId,
});
```

---

## addMatchUpResumeTime

```js
const resumeTime = '2020-01-01T09:00:00Z';
engine.addMatchUpResumeTime({
  removePriorValues, // optional boolean
  disableNotice, // when disabled subscribers will not be notified
  resumeTime,
  matchUpId,
  drawId,
});
```

---

## addMatchUpScheduledDate

```js
const scheduledDate = '2020-01-01';
engine.addMatchUpScheduledDate({
  removePriorValues, // optional boolean
  disableNotice, // when disabled subscribers will not be notified
  scheduledDate,
  matchUpId,
  drawId,
});
```

---

## addMatchUpScheduledTime

```js
const scheduledTime = '08:00';
engine.addMatchUpScheduledTime({
  removePriorValues, // optional boolean
  disableNotice, // when disabled subscribers will not be notified
  scheduledTime,
  matchUpId,
  drawId,
});
```

---

## addMatchUpScheduleItems

Comprehensive scheduling method that adds multiple schedule attributes to a matchUp in a single operation.

### Features

- **Atomic Scheduling**: Assigns multiple schedule items (court, time, date, venue) in one transaction
- **Conflict Detection**: Optional validation to prevent double-booking court slots (pro-scheduling)
- **Chronology Validation**: Optional checks for scheduling dependencies and match order
- **Court Order Assignment**: Supports Pro Scheduling grid-based court order (row) assignments
- **Team MatchUp Support**: Handles court allocation for TEAM matchUps with multiple courts
- **Follow-By Scheduling**: Supports ITF-style follow-by and "Not Before" scheduling patterns
- **Time Modifiers**: Allows adding schedule modifiers like "Not Before" times
- **Home Participant**: Can designate home participant for display purposes

### Parameters

```js
engine.addMatchUpScheduleItems({
  // Required
  matchUpId, // matchUp identifier
  drawId, // draw containing the matchUp

  // Schedule Object - all fields optional
  schedule: {
    scheduledDate, // ISO date string (e.g., '2024-03-20')
    scheduledTime, // Time string (e.g., '14:00' or ISO timestamp)
    courtId, // Court identifier (requires scheduledDate and courtOrder for conflict detection)
    courtOrder, // Grid row number for Pro Scheduling (integer as string, e.g., '1', '2')
    venueId, // Venue identifier
    courtIds, // Array of court IDs (applies only to TEAM matchUps)
    startTime, // Actual start time (ISO timestamp)
    stopTime, // Pause time for interrupted matches (ISO timestamp)
    resumeTime, // Resume time after interruption (ISO timestamp)
    endTime, // Actual completion time (ISO timestamp)
    timeModifiers, // Array of modifiers (e.g., [{ type: 'NOT_BEFORE', value: '14:00' }])
    homeParticipantId, // Designate home participant
  },

  // Optional Control Parameters
  proConflictDetection, // boolean - default true - validates no existing matchUp occupies { courtId, courtOrder, scheduledDate }
  checkChronology, // boolean - validates scheduling doesn't create dependency conflicts
  errorOnAnachronism, // boolean - throw error (vs warning) for chronology violations
  removePriorValues, // boolean - removes existing schedule values before applying new ones
  disableNotice, // boolean - when true, subscribers will not be notified of changes
});
```

### Return Values

**Success:**

```js
{
  success: true;
}
```

**Error (Double Booking):**

```js
{
  error: {
    message: 'Schedule conflict: court slot already occupied',
    code: 'ERR_SCHEDULE_CONFLICT_DOUBLE_BOOKING',
  },
  info: 'Court slot already occupied by matchUp <matchUpId>',
}
```

**Warning (Chronology Issue):**

```js
{
  success: true,
  warnings: [
    {
      code: 'ANACHRONISM',
      message: 'Chronological error; time violation.',
    },
  ];
}
```

### Pro Scheduling Grid Assignment

When scheduling matchUps in a grid-based format (Pro Scheduling), always provide `courtId`, `courtOrder`, and `scheduledDate` together:

```js
// Assign to Court 1, Row 3, on March 20th
engine.addMatchUpScheduleItems({
  matchUpId: 'match-123',
  drawId: 'draw-456',
  schedule: {
    courtId: 'court-1',
    courtOrder: '3', // Row 3 on the grid
    scheduledDate: '2024-03-20',
    scheduledTime: '14:00', // Optional display time
  },
});
```

### Double Booking Prevention

By default, `proConflictDetection: true` validates that no other matchUp is scheduled to the same `{ courtId, courtOrder, scheduledDate }` combination. This prevents accidentally double-booking a court slot in grid-based scheduling.

**Disable for Performance**: When scheduling large tournaments (1000+ matchUps) or when client-side UI already validates conflicts, disable detection to improve performance:

```js
engine.addMatchUpScheduleItems({
  matchUpId: 'match-123',
  drawId: 'draw-456',
  schedule: {
    courtId: 'court-1',
    courtOrder: '3',
    scheduledDate: '2024-03-20',
  },
  proConflictDetection: false, // Skip validation for performance
});
```

**When to Disable:**

- High-volume bulk scheduling operations
- Client application already validates conflicts before submission
- Multi-user environments with optimistic UI updates
- Scheduling is rolled back on error anyway

**When to Keep Enabled:**

- Interactive scheduling by tournament directors
- Automated scheduling scripts without UI validation
- Single-user applications
- Critical scheduling operations that must not fail

### Chronology Validation

When `checkChronology: true`, the system validates that scheduling doesn't violate match dependencies:

```js
// Round 1 match
engine.addMatchUpScheduleItems({
  matchUpId: 'round1-match',
  drawId: 'draw-456',
  schedule: {
    scheduledDate: '2024-03-21',
    scheduledTime: '10:00',
  },
  checkChronology: true, // Validate dependencies
});

// Round 2 match (winner of round1-match)
engine.addMatchUpScheduleItems({
  matchUpId: 'round2-match',
  drawId: 'draw-456',
  schedule: {
    scheduledDate: '2024-03-20', // ERROR: Earlier than prerequisite
  },
  checkChronology: true,
  errorOnAnachronism: true, // Throw error vs warning
});
```

### Follow-By Scheduling (ITF Style)

For stadium courts with "Follow" or "Not Before" scheduling:

```js
// First match: fixed time
engine.addMatchUpScheduleItems({
  matchUpId: 'match-1',
  drawId: 'draw-456',
  schedule: {
    courtId: 'centre-court',
    courtOrder: '1',
    scheduledDate: '2024-03-23',
    scheduledTime: '13:00',
  },
});

// Second match: to follow first match
engine.addMatchUpScheduleItems({
  matchUpId: 'match-2',
  drawId: 'draw-456',
  schedule: {
    courtId: 'centre-court',
    courtOrder: '2',
    scheduledDate: '2024-03-23',
    // No scheduledTime - will follow match-1
    timeModifiers: [
      {
        type: 'FOLLOWED_BY',
        value: { matchUpId: 'match-1' },
      },
    ],
  },
});

// Third match: Not Before with follow
engine.addMatchUpScheduleItems({
  matchUpId: 'match-3',
  drawId: 'draw-456',
  schedule: {
    courtId: 'centre-court',
    courtOrder: '3',
    scheduledDate: '2024-03-23',
    scheduledTime: '18:00', // Not Before 6 PM
    timeModifiers: [
      {
        type: 'FOLLOWED_BY',
        value: { matchUpId: 'match-2', notBeforeTime: '18:00' },
      },
    ],
  },
});
```

### Time Recording During Match

Record actual match times as play progresses:

```js
// Match starts
engine.addMatchUpScheduleItems({
  matchUpId: 'match-123',
  drawId: 'draw-456',
  schedule: {
    startTime: '2024-03-20T14:05:23Z', // Actual start time
  },
});

// Match interrupted (rain delay)
engine.addMatchUpScheduleItems({
  matchUpId: 'match-123',
  drawId: 'draw-456',
  schedule: {
    stopTime: '2024-03-20T14:45:12Z',
  },
});

// Match resumes
engine.addMatchUpScheduleItems({
  matchUpId: 'match-123',
  drawId: 'draw-456',
  schedule: {
    resumeTime: '2024-03-20T15:30:00Z',
  },
});

// Match completes
engine.addMatchUpScheduleItems({
  matchUpId: 'match-123',
  drawId: 'draw-456',
  schedule: {
    endTime: '2024-03-20T16:15:45Z',
  },
});
```

### TEAM MatchUp Court Allocation

For TEAM matchUps (e.g., Davis Cup ties), allocate multiple courts:

```js
engine.addMatchUpScheduleItems({
  matchUpId: 'team-tie-123',
  drawId: 'draw-456',
  schedule: {
    scheduledDate: '2024-03-20',
    courtIds: ['court-1', 'court-2', 'court-3'], // Multiple courts for simultaneous tie matches
    venueId: 'venue-789',
  },
});
```

### Bulk Scheduling Pattern

When scheduling multiple matchUps, disable notifications and enable at the end:

```js
matchAssignments.forEach(({ matchUpId, courtId, courtOrder, scheduledDate }) => {
  engine.addMatchUpScheduleItems({
    matchUpId,
    drawId: 'draw-456',
    schedule: { courtId, courtOrder, scheduledDate },
    proConflictDetection: false, // Validated at UI layer
    disableNotice: true, // Batch notifications
  });
});

// Manually trigger notification after bulk operation
engine.notify({ topic: 'scheduleUpdate', payload: { drawId: 'draw-456' } });
```

### Error Handling

```js
const result = engine.addMatchUpScheduleItems({
  matchUpId: 'match-123',
  drawId: 'draw-456',
  schedule: {
    courtId: 'court-1',
    courtOrder: '2',
    scheduledDate: '2024-03-20',
  },
});

if (result.error) {
  if (result.error.code === 'ERR_SCHEDULE_CONFLICT_DOUBLE_BOOKING') {
    console.error('Court slot already occupied:', result.info);
    // Suggest alternative court or time
  } else if (result.error.code === 'ANACHRONISM') {
    console.warn('Scheduling creates dependency conflict');
    // Allow with confirmation
  } else {
    console.error('Scheduling failed:', result.error);
  }
} else if (result.warnings) {
  console.warn('Scheduling completed with warnings:', result.warnings);
}
```

### Related Methods

- **[assignMatchUpCourt](#assignmatchupcourt)** - Assign court only
- **[addMatchUpScheduledDate](#addmatchupscheduleddate)** - Assign date only
- **[addMatchUpScheduledTime](#addmatchupscheduledtime)** - Assign time only
- **[addMatchUpCourtOrder](#addmatchupcourtorder)** - Assign grid row only

### Related Documentation

- **[Pro Scheduling Concepts](/docs/concepts/pro-scheduling)** - Grid-based scheduling workflows
- **[Schedule Governor](/docs/governors/schedule-governor)** - Automated scheduling methods
- **[Scheduling Policy](/docs/policies/scheduling)** - Recovery times and constraints

---

## addMatchUpStartTime

```js
const startTime = '2020-01-01T08:05:00Z';
engine.addMatchUpStartTime({
  drawId,
  matchUpId,
  startTime,
  disableNotice, // when disabled subscribers will not be notified
});
```

---

## addMatchUpStopTime

```js
const stopTime = '2020-01-01T08:15:00Z';
engine.addMatchUpStopTime({
  drawId,
  matchUpId,
  stopTime,
  disableNotice, // when disabled subscribers will not be notified
});
```

---

## addMatchUpCourtOrder

When using Pro-scheduling, assign order on court

```js
engine.addMatchUpCourtOrder({
  removePriorValues, // optional boolean
  drawId, // drawId where matchUp is found
  courtOrder,
  matchUpId,
  courtId,
});
```

---

## applyLinueUps

Applies `lineUps` to the `sides` of a _TEAM_ matchUp. Order is not important as team side is determined automatically. Does not check to ensure that participants in `lineUps` are part of teams; this is assumed. It is possible to have **_some_** participants assigned to a team side who are not part of a team.

```js
result = engine.applyLineUps({
  matchUpId, // must be { matchUpType: TEAM }
  lineUps, // array of at most two lineUps (see TODS)
  drawId, // reference to draw in which matchUp occurs
});
```

---

## assignMatchUpSideParticipant

Assign participant to AD_HOC matchUp.

```js
engine.assignMatchUpSideParticipant({
  participantId,
  sideNumber,
  matchUpId,
  drawId,
});
```

---

## assignMatchUpCourt

```js
engine.assignMatchUpCourt({
  removePriorValues, // optional boolean
  drawId, // drawId where matchUp is found
  courtDayDate, // ISO date string
  matchUpId,
  courtId,
});
```

---

## assignMatchUpVenue

```js
engine.assignMatchUVenue({
  removePriorValues, // optional boolean
  drawId, // drawId where matchUp is found
  matchUpId,
  venueId,
});
```

---

## assignTieMatchUpParticipantId

Used when interactively assigning participants to `matchUps`. When individual `participantIds` are assigned to `{ matchUpType: 'DOUBLES' }` it handles creating `{ participantType: PAIR }` participants dynamically.

```js
engine.assignTieMatchUpParticipantId({
  teamParticipantId, // optional - participant team can be derived from participantId. This supports assigning "borrowed" players from other teams.
  participantId, // id of INDIVIDUAL or PAIR participant to be assigned to a matchUp
  tieMatchUpId, // matchUpId of a SINGLES or DOUBLES that is part of a matchUp between teams
  sideNumber, // optional - only necessary if a participant is part of both teams (edge case!)
  drawId, // identifies draw in which matchUp is present
});
```

---

## bulkMatchUpStatusUpdate

Provides the ability to update the outcomes of multiple matchUps at once.

```js
const outcomes = [
  {
    eventId,
    drawId,
    matchUpId,
    matchUpFormat,
    matchUpStatus,
    winningSide,
    score,
  },
];
engine.bulkMatchUpStatusUpdate({ outcomes });
```

---

## checkInParticipant

Set the check-in state for a participant. Used to determine when both participants in a matchUp are available to be assigned to a court.

```js
engine.checkInParticipant({
  participantId,
  matchUpId,
  drawId,
});
```

---

## checkOutParticipant

```js
engine.checkOutParticipant({
  participantId,
  matchUpId,
  drawId,
});
```

---

## disableTieAutoCalc

Disable default behavior of auto calculating TEAM matchUp scores.

```js
engine.disableTieAutoCalc({ drawId, matchUpId });
```

---

## enableTiaAutoCalc

Re-enable default behavior of auto calculating TEAM matchUp scores, and trigger auto calculation.

```js
engine.enableTieAutoCalc({ drawId, matchUpId });
```

---

## findMatchUp

```js
const {
  matchUp,
  structure, // returned for convenience
} = engine.findMatchUp({
  inContext, // optional - boolean - returns matchUp with additional attributes
  matchUpId,
  drawId,
});
```

---

## getHomeParticipantId

```js
const { homeParticipantId } = engine.getHomeParticipantId({ matchUp });
```

---

## modifyMatchUpFormatTiming

Modifies the average match duration and recovery time requirements for a specific matchUp format. This function adds an extension to the tournament record that overrides default scheduling policy timing.

**How it Works:**

- Adds a tournament-level extension that is read by scheduling functions
- Persists across scheduling operations until explicitly modified or removed
- Can be scoped to specific age categories (e.g., 'U12', 'U14')
- Can specify different timings for SINGLES vs. DOUBLES
- Multiple calls will merge/override previous values for the same format

**Parameters:**

- `matchUpFormat` - TODS matchUpFormat code (e.g., 'SET3-S:6/TB7')
- `averageTimes` - Array of timing configurations by category
  - `categoryNames` - Array of category names (empty array = default for all categories)
  - `minutes` - Object with `default` and/or event type keys (e.g., SINGLES, DOUBLES)
- `recoveryTimes` - Array of recovery configurations by category (same structure as averageTimes)
- `event` - Optional - Scope modification to specific event
- `drawId` - Optional - Scope modification to specific draw
- `eventId` - Optional - Scope modification to specific event

**Returns:** Standard result object with success/error status

```js
// Modify timing for a specific format with category-based differentiation
engine.modifyMatchUpFormatTiming({
  matchUpFormat: 'SET3-S:6/TB7',
  averageTimes: [
    {
      categoryNames: ['U12', 'U14'],
      minutes: { DOUBLES: 110, default: 130 },
    },
    {
      categoryNames: ['U16', 'U18'],
      minutes: { DOUBLES: 100, default: 120 },
    },
  ],
  recoveryTimes: [{ categoryNames: [], minutes: { default: 15, DOUBLES: 15 } }],
});

// Retrieve existing modifications before updating
const { matchUpFormat, averageTimes, recoveryTimes } = engine.getModifiedMatchUpFormatTiming({
  matchUpFormat: 'SET3-S:6/TB7',
});
```

**Related Functions:**

- `getModifiedMatchUpFormatTiming()` - Query existing format timing modifications
- See [Scheduling Policy](/docs/concepts/scheduling-policy) for policy configuration

---

## removeMatchUpSideParticipant

Removes participant assigned to AD_HOC matchUp.

```js
engine.removeMatchUpSideParticipant({
  sideNumber, // number - required
  matchUpId, // required
  drawId, // required
});
```

---

## replaceTieMatchUpParticipantId

```js
engine.replaceTieMatchUpParticipantId({
  existingParticipantId,
  newParticipantId,
  tieMatchUpId,
  drawId,
});
```

---

## removeTieMatchUpParticipantId

```js
engine.removeTieMatchUpParticipantId({
  participantId, // id of INDIVIDUAL or PAIR be removed
  tieMatchUpId, // tieMatchUp, matchUpType either DOUBLES or SINGLES
  drawId, // draw within which tieMatchUp is found
});
```

---

## resetAdHocMatchUps

Will remove all results (scores) and optionally all participant assignments from specified matchUps (via matchUpIds or roundNumbers).

```js
const result = engine.resetAdHocMatchUps({
  removeAssignments, // optional; remove all assigned participants
  roundNumbers, // optional if matchUpids provided
  matchUpIds, // optional only if roundNumber(s) provided
  structureId, // optional unless matchUpIds not provided
  drawId,
};

export function resetAdHocMatchUps(params: ResetAdHocMatchUps) {
  const paramsCheck = checkRequiredParameters(params, [
    { [DRAW_DEFINITION]: true, [EVENT]: true },
    {
      [ONE_OF]: { [MATCHUP_IDS]: false, roundNumbers: false },
      [INVALID]: INVALID_VALUES,
      [OF_TYPE]: ARRAY,
    },
  ]);
  if (paramsCheck.error) return paramsCheck;

  const structureResult = getAdHocStructureDetails(params);
  if (structureResult.error) return structureResult;
  const { matchUpIds } = structureResult;
})
```

---

## resetScorecard

Removes all scores from `tieMatchUps` within a TEAM `matchUp`; preserves `lineUps`.

```js
engine.resetScorecard({
  tiebreakReset, // optional boolean - check for tiebreak scenarios and reset tieFormat
  tournamentId, // required
  matchUpId, // required - must be a TEAM matchUp
  drawId, // required
});
```

---

## resetTieFormat

Remove the `tieFormat` from a TEAM `matchUp` if there is a `tieFormat` further up the hierarchy; modifies `matchUp.tieMatchUps` to correspond.

```js
engine.resetTieFormat({
  tournamentId, // required
  matchUpId, // must be a TEAM matchUp
  drawId, // required
  uuids, // optional - in client/server scenarios generated matchUps must have equivalent matchUpIds
});
```

---

## setMatchUpDailyLimits

Sets daily match limits for participants. This function adds an extension to the tournament record that is enforced by all scheduling functions to prevent over-scheduling players.

**How it Works:**

- Adds a tournament-level extension that is checked by scheduling functions
- Persists across scheduling operations until explicitly modified
- Enforced during both manual and automated scheduling
- Can be scoped to specific tournament in multi-tournament scenarios
- Multiple calls will override previous values entirely

**Parameters:**

- `dailyLimits` - Object specifying limits:
  - `SINGLES` - Maximum singles matches per day per participant
  - `DOUBLES` - Maximum doubles matches per day per participant
  - `total` - Maximum total matches per day per participant (across all event types)
- `tournamentId` - Optional - Scope to specific tournament (for multi-tournament records)

**Returns:** Standard result object with success/error status

```js
// Set tournament-wide daily limits
engine.setMatchUpDailyLimits({
  dailyLimits: { SINGLES: 2, DOUBLES: 1, total: 3 },
});

// Scope to specific tournament
engine.setMatchUpDailyLimits({
  dailyLimits: { SINGLES: 1, DOUBLES: 1, total: 2 },
  tournamentId: 'tournament-123',
});

// Retrieve current daily limits
const { matchUpDailyLimits } = engine.getMatchUpDailyLimits();
const { SINGLES, DOUBLES, total } = matchUpDailyLimits;
```

**Related Functions:**

- `getMatchUpDailyLimits()` - Query current daily limit configuration
- See [Scheduling Policy](/docs/concepts/scheduling-policy) for policy-based limits

---

## setMatchUpFormat

Sets the `matchUpFormat` for a specific `matchUp` or for any scope within the hierarchy of a `tournamentRecord`.

:::info
If an array of `scheduledDates` is provided then `matchUps` which have `matchUpStatus: TO_BE_PLAYED` and are scheduled to be played on the specified dates will have their `matchUpFormat` fixed rather than inherited. This means that subsequent changes to the parent `structure.matchUpFormat` will have no effect on such `matchUps`.

The `force` attribute will remove the `matchUpFormat` from all targeted `matchUps` which have `matchUpStatus: TO_BE_PLAYED`; this allows the effect of using `scheduledDates` to be reversed. Use of this attribute will have no effect if `scheduledDates` is also provided.

:::

```js
engine.setMatchUpFormat({
  matchUpFormat, // TODS matchUpFormatCode
  eventType, // optional - restrict to SINGLES or DOUBLES

  matchUpId, // optional - set matchUpFormat for a specific matchUp
  drawId, // required only if matchUpId, structureId or structureIds is present
  force, // optional boolean - when setting for structure, draws or events, strip any defined matchUpFormat from all TO_BE_PLAYED matchUps

  // scoping options
  scheduledDates, // optional - ['2022-01-01']
  stageSequences, // optional - [1, 2]
  structureIds, // optional - ['structureId1', 'structureId2']
  structureId, // optional
  eventIds, // optional - ['eventId1', 'eventId2']
  eventId, // optional
  drawIds, // optional - ['drawId1', 'drawId2']
  stages, // optional - ['MAIN', 'CONSOLATION']
});
```

---

## setMatchUpHomeParticipantId

Value `homeParticipantId` will appear in hydrated `matchUps.schedule`.

```js
engine.setMatchUpHomeParticipantId({
  disableNotice, // when disabled subscribers will not be notified
  homeParticipantId, // empty string ('') will remove
  removePriorValues, // optional boolean
  matchUpId,
  drawId,
});
```

---

## setMatchUpStatus

Sets either matchUpStatus or score and winningSide; values to be set are passed in outcome object. Handles any winner/loser participant movements within or across structures.

```js
const outcome = {
  matchUpStatus, // optional
  winningSide, // optional
  score, // optional
};

engine.setMatchUpStatus({
  disableScoreValidation, // optional boolean
  allowChangePropagation, // optional boolean - allow winner/loser to be swapped and propgate change throughout draw structures
  disableAutoCalc, // optional - applies only to { matchUpType: TEAM }
  enableAutoCalc, // optional - applies only to { matchUpType: TEAM }
  tournamentId,
  matchUpTieId, // optional - if part of a TIE matchUp
  matchUpId,
  outcome, // optional
  drawId,
  schedule: {
    // optional - set schedule items
    courtIds, // optional - applies only to TEAM matchUps => creates .allocatedCourts
    courtId, // requires scheduledDate
    venueId,
    scheduledDate,
    scheduledTime,
    startTime,
    endTime,
  },
  notes, // optional - add note (string) to matchUp object
});
```

---

## setOrderOfFinish

Sets the `orderOfFinish` attribute for `matchUps` specified by `matchUpId` in the `finishingOrder` array.

### Validation

Validation is done within a _cohort_ of `matchUps` which have equivalent `structureId`, `matchUpType`, `roundNumber`, and `matchUpTieId` (if applicable).

- `matchUpIds` in `finishingOrder` must be part of the same _cohort_
- `orderOfFinish` values must be unique positive integers within the _cohort_

```js
engine.setOrderOfFinish({
  finishingOrder: [{ matchUpId, orderOfFinish: 1 }],
  drawId,
});
```

---

## toggleParticipantCheckInState

```js
engine.toggleParticipantCheckInState({
  participantId,
  tournamentId,
  matchUpId,
  drawId,
});
```

---

## updateTieMatchUpScore

Trigger automatic calculation of the score of a TEAM matchUp.

```js
engine.updateTieMatchUpScore({
  tournamentId, // optional if default tournament set
  matchUpId,
  drawId,
});
```

---

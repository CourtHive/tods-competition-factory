---
title: Schedule Governor
---

```js
import { scheduleGovernor } from 'tods-competition-factory';
```

## allocateTeamMatchUpCourts

```js
let result = engine.allocateTeamMatchUpCourts({
  removePriorValues, // optional boolean
  matchUpId,
  courtIds,
  drawId,
});
```

---

## bulkRescheduleMatchUps

```js
const {
  rescheduled, // array of inContext matchUps which have been rescheduled
  notRescheduled, // array of inContext matchUps which have NOT been rescheduled
  allRescheduled, // boolean indicating whether all matchUps have been rescheduled
  dryRun, // boolean - only report what would happen without making modifications
} = engine.bulkRescheduleMatchUps({
  matchUpIds, // array of matchUupIds for matchUps which are to be rescheduled
  scheduleChange: {
    daysChange: 1, // number of days +/-
    minutesChange: 30, // number of minutes +/-
  },
});
```

---

## bulkScheduleTournamentMatchUps

```js
const schedule = {
  scheduledTime: '08:00',
  scheduledDate: '2021-01-01T00:00', // best practice to provide ISO date string
  venueId,
};
const matchUpDetails = [{ matchUpId, schedule }];
engine.bulkScheduleTournamentMatchUps({
  checkChronology, // optional boolean - returns warnings for scheduling errors; throws errors when combined with errorOnAnachronism
  errorOnAnachronism, // optional boolean - throw error if chronological scheduduling error
  removePriorValues, // optional boolean - remove all pre-existing scheduling timeItems from matchUps
  matchUpDetails, // optional - for use when matchUps have different scheduling details
  matchUpIds, // optional - used together with schedule when all matchUps will have the same schedule details applied
  schedule, // optiona - used together with matchUpIds when all matchUps will ahve the same schedule details applied
});
```

## bulkUpdatePublishedEventIds

Returns a filtered array of publishedEventIds from all eventIds which are included in a bulkMatchUpStatusUpdate. publishedEventIds can be used to determine which events to re-publish.

```js
const { publishedEventIds } = engine.bulkUpdatePublishedEventIds({
  outcomes,
});
```

---

## clearMatchUpSchedule

```js
engine.clearMatchUpSchedule({
  scheduleAttributes, // optional array of schedule constants
  matchUpId,
  drawId, // optional optimizes matchUp lookup, triggers drawModificationNotice
});
```

---

## clearScheduledMatchUps

```js
engine.clearScheduledMatchUps({
  ignoreMatchUpStatuses, // optional - specify matchUpStatus values to be ignored; defaults to all completed matchUpStatuses
  scheduleAttributes, // optional - specify which attributes should be considered; defaults to ['scheduledDate', 'scheduledTime']
  scheduledDates, // optional - array of dates to be cleared; only matchUps with specified scheduledDate will be cleared
  venueIds, // optional - array of venueIds; only matchUps at specified venues will be cleared
});
```

---

## matchUpScheduleChange

Swaps the schedule details of two scheduled matchUps.

```js
engine.matchUpScheduleChange({
  courtDayDate: dateSelected,
  sourceMatchUpContextIds,
  targetMatchUpContextIds,
  sourceCourtId,
  targetCourtId,
});
```

---

## reorderUpcomingMatchUps

```js
const matchUpContextIds = [{ tournamentId, drawId, matchUpId }];
engine.reorderUpcomingMatchUps({
  matchUpContextIds,
  firstToLast, // boolean - direction of reorder
});
```

---

## removeMatchUpCourtAssignment

```js
engine.removeMatchUpCourtAssignment({
  tournamentId,
  courtDayDate,
  matchUpId,
  drawId,
});
```

---

## scheduleMatchUps

Auto schedule matchUps on a given date using the Garman formula.

**Parameters:**

- `scheduleDate` - Date string in format `YYYY-MM-DD`
- `matchUpIds` - Array of matchUpIds to schedule; auto-sorted by draw size and roundNumbers if no schedulingProfile present
- `venueIds` - Optional - Defaults to all venues; if single venueId provided, all matchUps scheduled at that venue
- `periodLength` - Optional - **Scheduling block size in minutes** (default: 30)
  - Defines time slot granularity: 15, 30, or 60 minutes typical
  - Affects match grouping and start time precision
  - See [Period Length documentation](/docs/concepts/automated-scheduling#period-length-scheduling-block-size) for detailed explanation
- `averageMatchUpMinutes` - Optional - Average match duration (default: 90)
- `recoveryMinutes` - Optional - Participant recovery time between matches (default: 0)
- `matchUpDailyLimits` - Optional - Policy declaration: SINGLES, DOUBLES and total limits per participant
- `startTime` - Optional - Schedule start time; derived from court availability if not provided
- `endTime` - Optional - Schedule end time; derived from court availability if not provided
- `checkPotentialRequestConflicts` - Boolean - Consider participant requests when matchUp participants are "potential" (default: true)

```js
engine.scheduleMatchUps({
  scheduleDate: '2024-06-15',
  matchUpIds,
  venueIds,
  periodLength: 30, // 30-minute scheduling blocks (recommended default)
  averageMatchUpMinutes: 90,
  recoveryMinutes: 0,
  matchUpDailyLimits,
  checkPotentialRequestConflicts: true,
});
```

---

## scheduleProfileRounds

Auto-schedules all rounds which have been specified in a `schedulingProfile` which has been saved to the tournamentRecord using [engine.setSchedulingProfile](#setschedulingprofile). See [Scheduling Profile](/docs/concepts/scheduling-profile).

:::note
SINGLES and DOUBLES `matchUps` will be scheduled, but not TEAM `matchUps`.
:::

**Parameters:**

- `periodLength` - Optional - **Scheduling block size in minutes** (default: 30)
  - Controls time slot granularity and match grouping
  - Common values: 15 (short format), 30 (standard), 60 (long format)
  - Affects court utilization efficiency and start time precision
  - See [Period Length documentation](/docs/concepts/automated-scheduling#period-length-scheduling-block-size) for detailed guidance
- `scheduleDates` - Optional - Array of specific dates to schedule from profile
- `clearScheduleDates` - Optional - Boolean (true = clear all) or array of dates to clear before scheduling
- `dryRun` - Boolean - Preview scheduling without making changes (default: false)
- `pro` - Boolean - Use grid scheduling instead of Garman (default: false)
- `checkPotentialRequestConflicts` - Boolean - Consider participant requests when participants are "potential" (default: true)

**Returns:**

- `scheduledDates` - Dates where matchUps were successfully scheduled
- `scheduledMatchUpIds` - Array of matchUpIds that were scheduled
- `noTimeMatchUpIds` - Array of matchUpIds that couldn't be fit into available time
- `overLimitMatchUpIds` - MatchUps not scheduled due to participant daily limits
- `requestConflicts` - Array of `{ date, conflicts }` objects for participant conflicts

```js
const result = engine.scheduleProfileRounds({
  periodLength: 30, // 30-minute blocks (recommended for most tournaments)
  scheduleDates, // Optional - specific dates to schedule
  clearScheduleDates, // Optional - clear before scheduling
  dryRun: false, // Actually schedule (true = preview only)
  pro: false, // Use Garman formula (true = grid scheduling)
  checkPotentialRequestConflicts: true,
});

const { scheduledDates, scheduledMatchUpIds, noTimeMatchUpIds, overLimitMatchUpIds, requestConflicts } = result;
```

---

## setMatchUpDailyLimits

Sets daily match limits for participants. This function adds an extension to the tournament record that is enforced by all scheduling functions to prevent over-scheduling players.

**How it Works:**

- Adds a tournament-level extension that is checked by scheduling functions
- Persists across scheduling operations until explicitly modified
- Enforced during both manual and automated scheduling (including `scheduleMatchUps()` and `scheduleProfileRounds()`)
- Can be scoped to specific tournament in multi-tournament scenarios
- Multiple calls will override previous values entirely

**Parameters:**

- `dailyLimits` - Object specifying limits:
  - `SINGLES` - Maximum singles matches per day per participant
  - `DOUBLES` - Maximum doubles matches per day per participant
  - `total` - Maximum total matches per day per participant (across all event types)
- `tournamentId` - Optional - Scope to specific tournament (for multi-tournament records)

**Returns:** Standard result object with success/error status

**Scheduling Behavior:**

- When scheduling operations encounter participants who would exceed daily limits, those matchUps are not scheduled
- Use `overLimitMatchUpIds` in scheduling results to identify affected matches
- Daily limits can be combined with scheduling policies for comprehensive protection

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

// Use with automated scheduling
engine.scheduleMatchUps({
  scheduleDate: '2024-01-15',
  matchUpIds,
  venueIds,
});
// Returns: { overLimitMatchUpIds } for matches that couldn't be scheduled

// Retrieve current daily limits
const { matchUpDailyLimits } = engine.getMatchUpDailyLimits();
const { SINGLES, DOUBLES, total } = matchUpDailyLimits;
```

**Related Functions:**

- `getMatchUpDailyLimits()` - Query current daily limit configuration (see Query Governor)
- `scheduleMatchUps()` - Auto-scheduling that respects daily limits
- `scheduleProfileRounds()` - Profile-based scheduling that respects daily limits
- See [Scheduling Policy](/docs/concepts/scheduling-policy) for policy-based configuration

---

## setSchedulingProfile

See [Scheduling Profile](/docs/concepts/scheduling-profile).

```js
engine.setSchedulingProfile({ schedulingProfile });
```

---

## validateSchedulingProfile

```js
const { valid, error } = engine.validateSchedulingProfile({
  schedulingProfile,
});
```

---
title: Schedule Governor
---

```js
import { governors: { scheduleGovernor }} from 'tods-competition-factory';
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

```js
engine.scheduleMatchUps({
  scheduleDate, // date string in the format `YYYY-MM-DD`
  startTime, // optional - if not provided will be derived from court availability for the tiven date
  endTime, // optional - if not provided will be derived from court availability for the tiven date
  venueIds, // optional - defaults to all known; if a single venueId is provided then all matchUps will be scheduled for that venue
  matchUpIds, // array of matchUpIds; if no schedulingProfile is present will be auto-sorted by draw size and roundNumbers
  periodLength = 30, // optional - size of scheduling blocks
  averageMatchUpMinutes = 90, // optional - defaults to 90
  recoveryMinutes = 0, // optional - amount of time participants are given to recover between matchUps
  matchUpDailyLimits, // optional - policy declaration; SINGLES, DOUBLES and total limits per individual participant
  checkPotentialRequestConflicts, // boolean - defaults to true - consider individual requests when matchUp participants are "potential"
});
```

---

## scheduleProfileRounds

Auto-schedules all rounds which have been specified in a `schedulingProfile` which has been saved to the tournamentRecord using [engine.setSchedulingProfile](#setschedulingprofile). See [Scheduling Profile](/docs/concepts/scheduling-profile).

:::note
SINGLES and DOUBLES `matchUps` will be scheduled, but not TEAM `matchUps`.
:::

```js
const result = engine.scheduleProfileRounds({
  checkPotentialRequestConflicts, // boolean - defaults to true - consider individual requests when matchUp participants are "potential"
  periodLength = 30, // optional - size of scheduling blocks
  clearScheduleDates, // optional - boolean: true to clear ALL dates, otherwise array of scheduleDates to clear
  scheduleDates, // optional array of dates to schedule
  dryRun, // boolean - only report what would happen without making modifications
  pro: // boolean - defaults to false; schedule specific courts without using garman
});

const {
  scheduledDates, // dates for which matchUps have been scheduled
  scheduledMatchUpIds, // array of matchUpIds which have been scheduled
  noTimeMatchUpIds, // array of matchUpids which have NOT been scheduled
  overLimitMatchUpIds, // matchUps not scheduled because of participant daily limits
  requestConflicts, // array of { date, conflicts } objects for each date in schedulingProfile
} = result;
```

---

## setMatchUpDailyLimits

```js
engine.setMatchUpDailyLimits({
  dailyLimits: { SINGLES: 2, DOUBLES: 1, total: 3 },
  tournamentId, // optional - scope to a specific tournamentId
});
```

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

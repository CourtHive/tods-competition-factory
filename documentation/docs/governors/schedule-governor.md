---
title: Schedule Governor
---

```js
import { governors: { scheduleGovernor }} from 'tods-competition-factory';
```

## allocateTeamMatchUpCourts

```js
let result = tournamentEngine.allocateTeamMatchUpCourts({
  removePriorValues, // optional boolean
  matchUpId,
  courtIds,
  drawId,
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

Auto-schedules all rounds which have been specified in a `schedulingProfile` which has been saved to the tournamentRecord using `competitionEngine.setSchedulingProfile`.

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

```js
competitionEngine.setSchedulingProfile({ schedulingProfile });
```

---

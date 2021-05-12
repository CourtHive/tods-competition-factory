---
name: API
title: Competition Engine API
---

## addExtension

Adds an extension to all `tournamentRecords` loaded into `competitionEngine`.

```js
competitionEngine.addExtension({ extension });
```

---

## allCompetitionMatchUps

```js
const { matchUps } = competitionEngine.allCompetitionMatchUps({
  scheduleVisibilityFilters,
});
```

---

## calculateScheduleTimes

Returns an array of available schedule times for a given date (and optional time range).

```js
const { scheduleTimes } = competitionEngine.calculateScheduleTimes({
  date,

  startTime, // optional - if not provided will be derived from court availability for the tiven date
  endTime, // optional - if not provided will be derived from court availability for the tiven date

  averageMatchUpTime = 90, // optional - defualts to 90
  periodLength = 30, // optional - defualts to 30

  venueIds, // optional - restrict calculation to specified venueIds
});
```

---

## competitionMatchUps

Returns aggregated arrays of "inContext" matchUps for all tournamentRecords loaded into `competitionEngine`.

```js
const {
  byeMatchUps,
  abandonedMatchUps,
  completedMatchUps,
  pendingMatchUps,
  upcomingMatchUps,
} = competitionEngine.competitionMatchUps({
  scheduleVisibilityFilters,
});
```

---

## competitionScheduleMatchUps

```js
const matchUpFilters = {
  isMatchUpTie: false,
  scheduledDate, // scheduled date of matchUps to return

  localTimeZone, // optional - used to convert scheduleDate
  localPerspective: true,
};

const { completedMatchUps, dateMatchUps, courtsData, venues } =
  competitionEngine.competitionScheduleMatchUps({ matchUpFilters });
```

---

## devContext

Setting devContext(true) bypasses **try {} catch (err) {}** code block and in some cases enables enhanced logging

```js
competitionEngine.devContext(true);
```

---

## getState

Returns a deep copy of the current competitionEngine state.

```js
const { tournaentRecords } = competition.getState({
  convertExtensions, // optional - convert extensions to '_' prefixed attributes
});
```

---

## getVenuesAndCourts

Returns an aggregate view of venues and courts across all tournamentRecords loaded into `competitionEngine`.

```js
const { courts, venues } = competitionEngine.getVenuesAndCourts();
```

---

## matchUpScheduleChange

Swaps the schedule details of two scheduled matchUps.

```js
competitionEngine.matchUpScheduleChange({
  sourceMatchUpContextIds,
  targetMatchUpContextIds,
  sourceCourtId,
  targetCourtId,
  courtDayDate: dateSelected,
});
```

---

## removeExtension

Removes an extension from all `tournamentRecords` loaded into `competitionEngine`.

```js
competitionEngine.removeExtension({ name });
```

---

## removeMatchUpCourtAssignment

```js
competitionEngine.removeMatchUpCourtAssignment({
  drawId,
  matchUpId,
  tournamentId,
  courtDayDate,
});
```

---

## reorderUpcomingMatchUps

```js
const matchUpContextIds = [{ tournamentId, drawId, matchUpId }];
competitionEngine.reorderUpcomingMatchUps({
  matchUpContextIds,
  firstToLast, // boolean - direction of reorder
});
```

---

## scheduleMatchUps

Auto schedule matchUps on a given date using the Garmin formula.

```js
const schedulingProfile = [
  {
    tournamentId,
    eventId,
    drawId,
    structureId, // optional - will default to first structure of first stage
    venueId, // optional - target venue for given event/draw/structure
    roundNumbers, // optional - if not provided will check scheduling policy for # of permitted matchUps / participant / day
    roundProfile: { // optional - necessary when matchUps within a single structure are split across venues or dates
      roundNumber,
      roundPositionStart,
      roundPositionEnd,
   }
  }
];

competitionEngine.scheduleMatchUps({
  date,
  startTime, // optional - if not provided will be derived from court availability for the tiven date
  endTime, // optional - if not provided will be derived from court availability for the tiven date

  venueIds, // optional - defaults to all known; if a single venueId is provided then all matchUps will be scheduled for that venue

  matchUpIds, // array of matchUpIds; if no schedulingProfile provided will be auto-sorted by draw size and roundNumbers
  schedulingProfile, // optional profile for sorting matchUps to be scheduled

  periodLength = 30, // optional - defaults to 30
  averageMatchUpTime = 90, // optional - defaults to 90
});
```

---

## setState

Loads tournament records into competitionEngine; supports both an array of tournamentRecords and an object with tournamentId keys.

```js
const tournamentRecords = [tournamentRecord];
// or const tournamentRecords = { [tournamentId]: tournamentRecord }

competitionEngine.setsState(tournamentRecords, deepCopy);
```

---

## setTournamentRecord

Adds a tournamentRecord to `competitionEngine` state.

```js
competitionEngine.setTournamentRecord(tournamentRecord);
```

---

## setSubscriptions

Please refer to the [Subscriptions](../concepts/subscriptions) in General Concepts.

---

## toggleParticipantCheckInState

---

## version

Returns NPM package version. Can be used in configurations that utilize Competition Factory engines on both client and server to ensure equivalency.

```js
const version = competitionEngine.version();
```

---

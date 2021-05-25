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

### addSchedulingProfileRound

```js
competitionEngine.addSchedulingProfileRound({
  scheduleDate, // string date, e.g. '2022-01-01' or '2022-01-01T00:00'
  venueId, // id of the venue to which the round has been assigned
  round, // details of a round to be played on specified date
});
```

---

## allCompetitionMatchUps

```js
const { matchUps } = competitionEngine.allCompetitionMatchUps({
  scheduleVisibilityFilters,
});
```

---

## attachPolicy

Attaches a `policyDefinition` to all tournamentRecords currently loaded into `competitionEngine`.

```js
competitionEngine.attachPolicy({ policyDefinition });
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

## findExtension

```js
const { extension } = competitionEngine.findExtension({ name });
```

---

## getCompetitionDateRange

```js
const { startDate, endDate } = competitionEngine.getCompetitionDateRange();
```

---

## getCompetitionVenues

```js
const { venues, venueIds } = competitionEngine.getCompetitionVenues();
```

---

## getLinkedTournamentIds

Returns `linkedTournamentIds` for each tournamentRecord loaded in `compeitionEngine`.

Caters for the possibility that, for instance, two "linked" tournaments and one "unlinked" tournament could be loaded.

```js
const { linkedTournamentIds } = competitionEngine.getLinkedTournamentIds();
/*
{
  'tournamentId-1': ['tournamentId-2', 'tournamentId-3'],
  'tournamentId-2': ['tournamentId-1', 'touranmentId-3'],
  'tournamentId-3': ['tournamentId-1', 'tournamentId-2']
}
*/
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

## getSchedulingProfile

```js
const { schedulingProfile } = competitionEngine.getSchedulingProfile();
```

---

## getVenuesAndCourts

Returns an aggregate view of venues and courts across all tournamentRecords loaded into `competitionEngine`.

```js
const { courts, venues } = competitionEngine.getVenuesAndCourts();
```

---

### isValidSchedulingProfile

```js
const isValid = competitionEngine.isValidSchedulingProfile({
  schedulingProfile,
});
```

---

## linkTournaments

Links all tournaments currently loaded in `competitionEngine`.

```js
competitionEngine.linkTournaments();
```

---

## matchUpActions

Convenience pass through to `tournamentEngine.matchUpActions` for use in contexts where multiple tournamentRecords are loaded into `competitionEngine`.

```js
const { matchUpActions } = competitionEngine.matchUpActions({
  tournamentId,
  eventId,
  drawId,
  matchUpId,
});
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

## removeTournamentRecord

Removes a tournamentRecord from `competitionEngine` state.

```js
competitionEngine.removeTournamentRecord(tournamentId);
```

---

## removeUnlinkedTournamentRecords

Removes all tournamentRecords from `competitionEngine` state that are unlinked.

```js
competitionEngine.removeUnlinkedTournamentRecords();
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

### setSchedulingProfile

```js
competitionEngine.setSchedulingProfile({ schedulingProfile });
```

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

## unlinkTournament

Unlink the tournament specified by `tournamentId` from other tournaments loaded in `compeitionEngine`.

```js
competitionEngine.unlinkTournament({ tournamentId });
```

---

## unlinkTournaments

Removes links between all tournaments currently loaded in `competitionEngine`.

```js
competitionEngine.unlinkTournaments();
```

## version

Returns NPM package version. Can be used in configurations that utilize Competition Factory engines on both client and server to ensure equivalency.

```js
const version = competitionEngine.version();
```

---

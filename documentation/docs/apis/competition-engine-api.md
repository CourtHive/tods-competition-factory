---
name: API
title: Competition Engine API
---

## allCompetitionMatchUps

```js
const { matchUps } = competitionEngine.allCompetitionMatchUps();
```

---

## competitionMatchUps

Return an array of all matchUps, "inContext", contained within the collection of tournaments loaded into `competitionEngine.

```js
const { matchUps } = competitionEngine.competitionMatchUps();
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

const {
  completedMatchUps,
  dateMatchUps,
  courtsData,
  venues,
} = competitionEngine.competitionScheduleMatchUps({ matchUpFilters });
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

---

## setState

Loads tournament records into competitionEngine.

```js
competitionEngine.setsState(tournamentRecords, deepCopy);
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

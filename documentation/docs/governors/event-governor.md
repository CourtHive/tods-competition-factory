---
title: Event Governor
---

```js
import { governors: { eventGovernor }} from 'tods-competition-factory';
```

## modifyCollectionDefinition

Modifies the `collectionName` and/or `matchUpFormat` for targeted `collectionId` within the `tieFormat` specified by `eventId`, `drawId`, `structureId` or `matchUpId`.

```js
competitionEngine.modifyCollectionDefinition({
  collectionName, // optional
  matchUpFormat, // optional
  tournamentId, // required
  collectionId, // required
  structureId, // required if modifying tieFormat for a structure
  matchUpId, // required if modifying tieFormat for a matchUp
  eventId, // required if modifying tieFormat for a event
  drawId, // required if modifying tieFormat for a drawDefinition or a structure
  gender, // optional

  // value assignment, only one is allowed to have a value
  collectionValueProfiles, // optional - [{ collectionPosition: 1, value: 2 }] - there must be a value provided for all matchUp positions
  collectionValue, // optional - value awarded for winning more than half of the matchUps in the collection
  matchUpValue, // optional - value awarded for each matchUp won
  scoreValue, // optional - value awarded for each game or point won (points for tiebreak sets)
  setValue, // optional - value awarded for each set won
});
```

---

## modifyEventMatchUpFormatTiming

```js
competitionEngine.modifyEventMatchUpFormatTiming({
  recoveryMinutes,
  averageMinutes,
  matchUpFormat,
  eventId,
});
```

---

## modifyMatchUpFormatTiming

```js
competitionEngine.modifyMatchUpFormatTiming({
  matchUpFormat: 'SET3-S:6/TB7',
  averageTimes: [
    {
      categoryNames: [U12, U14],
      minutes: { [DOUBLES]: 110, default: 130 },
    },
    {
      categoryNames: [U16, U18],
      minutes: { [DOUBLES]: 100, default: 120 },
    },
  ],
  recoveryTimes: [{ categoryNames: [], minutes: { default: 15, [DOUBLES]: 15 } }],
});
```

---

## modifyPersonRequests

Modifies existing person requests.

Any requests without a `requestId` will be **added**. Any requests without `requestType` will be **removed**.

```js
competitionEngine.modifyPersonRequests({
  personId, // optional - scope to single personId; avoid brute-force updates
  requests: [
    {
      requestType,
      requestId, // if requestId is not present, will attempt to added
      startTime,
      endTime,
      date,
    },
  ],
});
```

---

## modifyPenalty

```js
const notes = 'Hit ball into spectator';
const modifications = { notes };
competitionEngine.modifyPenalty({ penaltyId, modifications });
```

---

## modifyTieFormat

Both modifies the `tieFormat` on the target `event`, `drawDefinition`, `structure` or `matchUp` and adds/deletes `tieMatchUps` as necessary.

```js
competitionEngine.modifyTieFormat({
  modifiedTieFormat, // will be compared to existing tieFormat that is targeted and differences calculated
  tournamentId, // required
  structureId, // required if modifying tieFormat for a structure
  matchUpId, // required if modifying tieFormat for a matchUp
  eventId, // required if modifying tieFormat for a event
  drawId, // required if modifying tieFormat for a drawDefinition or a structure
});
```

---

## modifyVenue

See [Scheduling](/docs/concepts/scheduling).

```js
const modifications = {
  venueName,
  onlineResources,
  venueAbbreviation,
  courts: [
    {
      courtId: 'b9df6177-e430-4a70-ba47-9b9ff60258cb',
      courtName: 'Custom Court 1',
      dateAvailability: [
        {
          date: '2020-01-01', // if no date is provided then `startTime` and `endTime` will be considered default values
          startTime: '16:30',
          endTime: '17:30',
        },
      ],
    },
  ],
};
competitionEngine.modifyVenue({ venueId, modifications });
```

---

## orderCollectionDefinitions

Modify the array order of `tieFormat.collectionDefinitions` for an `event`, a `drawDefinition`, `structure`, or `matchUp`.

```js
competitionEngine.orderCollectionDefinitions({
  orderMap: { collectionId1: 1, collectionId2: 2 },
  tournamentId, // required
  structureId, // required if modifying tieFormat for a structure
  matchUpId, // required if modifying tieFormat for a matchUp
  eventId, // required if modifying tieFormat for a event
  drawId, // required if modifying tieFormat for a drawDefinition or a structure
});
```

---

## publishOrderOfPlay

```js
competitionEngine.publishOrderOfPlay({
  removePriorValues, // optional boolean - when true will delete prior timeItems
  scheduledDates, // optional - if not provided will publish all scheduledDates
  eventIds, // optional - if not provided will publish all eventIds
});
```

---

## removeCollectionDefinition

```js
competitionEngine.removeCollectionDefinition({
  updateInProgressMatchUps, // optional; defaults to true
  tieFormatComparison, // optional; defaults to false; when true will not delete unique collections on unscored matchUps
  tieFormatName, // any time a collectionDefinition is modified a new name must be provided
  tournamentId, // required
  collectionId, // required - id of collectionDefinition to be removed
  structureId, // optional - if removing from tieFormat associated with a specific structure
  matchUpId, // optional - if removing from tieFormat asscoiated with a specific matchUp
  eventId, // optional - if removing from tieFormat asscoiated with an event
  drawId, // required if structureId is specified or if tieFormat associated with drawDefinition is to be modified
});
```

---

## removeCollectionGroup

Removes a `collectionGroup` from the `tieFormat` found for the `event`, `drawDefinition`, `structure` or `matchUp`; recalculates

```js
competitionEngine.removeCollectionGroup({
  updateInProgressMatchUps, // optional - defaults to true
  tieFormatName: 'New tieFormat', // if no name is provided then there will be no name
  collectionGroupNumber: 1,
  tournamentId, // required
  structureId, // optional
  matchUpId, // optional
  eventId, // optional
  drawId, // optional; required if structureId is targeted
});
```

---

## removeEventMatchUpFormatTiming

```js
competitionEngine.removeEventMatchUpFormatTiming({ eventId });
```

---

## removeExtension

Removes an extension from all `tournamentRecords` loaded into `competitionEngine`.

```js
competitionEngine.removeExtension({ name, discover: true });
```

---

## removeMatchUpCourtAssignment

```js
competitionEngine.removeMatchUpCourtAssignment({
  tournamentId,
  courtDayDate,
  matchUpId,
  drawId,
});
```

---

## removePersonRequests

Removes person requests matching passed values. If no paramaters are provided, removes **all** person requests.

```js
result = competitionEngine.removePersonRequests({
  personId, // optional - scope to personId
  requestType, // optioanl - scope to requestType
  requestId, // optional - scope to a single requestId
  date, // optional - scope to a specific date
});
```

---

## removePenalty

Removes a penalty from all relevant tournament participants.

```js
competitionEngine.removePenalty({ penaltyId });
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

## resetScorecard

Removes all scores from `tieMatchUps` within a TEAM `matchUp`; preserves `lineUps`.

```js
competitionEngine.resetScorecard({
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
competitionEngine.resetTieFormat({
  tournamentId, // required
  matchUpId, // must be a TEAM matchUp
  drawId, // required
  uuids, // optional - in client/server scenarios generated matchUps must have equivalent matchUpIds
});
```

---

## scheduleMatchUps

Auto schedule matchUps on a given date using the Garman formula.

```js
competitionEngine.scheduleMatchUps({
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
const result = competitionEngine.scheduleProfileRounds({
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
competitionEngine.setMatchUpDailyLimits({
  dailyLimits: { SINGLES: 2, DOUBLES: 1, total: 3 },
  tournamentId, // optional - scope to a specific tournamentId
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

competitionEngine.setMatchUpStatus({
  disableScoreValidation, // optional boolean
  allowChangePropagation, // optional boolean - allow winner/loser to be swapped and propgate change throughout draw structures
  disableAutoCalc, // optional - applies only to { matchUpType: TEAM }
  enableAutoCalc, // optional - applies only to { matchUpType: TEAM }
  tournamentId,
  matchUpTieId, // optional - if part of a TIE matchUp
  matchUpId,
  drawId,
  outcome, // optional
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

## setState

Loads tournament records into competitionEngine; supports both an array of tournamentRecords and an object with tournamentId keys.

```js
const tournamentRecords = [tournamentRecord];
// or const tournamentRecords = { [tournamentId]: tournamentRecord }

competitionEngine.setsState(tournamentRecords, deepCopy, deepCopyConfig);
```

:::info
By default a deep copy of the `tournamentRecords` is made so that mutations made by `competitionEngine` do not affect the source objects. An optional boolean parameter, _deepCopy_ can be set to false to override this default behavior.
:::

:::note
`deepCopyConfig` is an optional configuration for `makeDeepCopy`. In server configurations when `deepCopy` is FALSE and `tournamentRecords` are retrieved from Mongo, for instance, there are scenarios where nodes of the JSON structure contain prototypes which cannot be converted.
:::

```js
const deepCopyConfig = {
  ignore, // optional - either an array of attributes to ignore or a function which processes attributes to determine whether to ignore them
  toJSON, // optional - an array of attributes to convert to JSON if the attribute in question is an object with .toJSON property
  stringify, // optional - an array of attributes to stringify
  modulate, // optional - function to process every attribute and return custom values, or undefined, which continues normal processing
};
```

---

## setSchedulingProfile

```js
competitionEngine.setSchedulingProfile({ schedulingProfile });
```

## setTournamentRecord

Adds a tournamentRecord to `competitionEngine` state, or overwrite/replace an existing `tournamentRecord` with the same `tournamentId`.

```js
competitionEngine.setTournamentRecord(tournamentRecord);
```

---

## toggleParticipantCheckInState

```js
competitionEngine.toggleParticipantCheckInState({
  drawId,
  matchUpId,
  tournamentId,
  participantId,
});
```

---

## unPublishOrderOfPlay

```js
competitionEngine.unPublishOrderOfPlay({
  removePriorValues, // optional boolean - when true will delete prior timeItems
});
```

---

## updateTieMatchUpScore

Trigger automatic calculation of the score of a TEAM matchUp.

```js
competitionEngine.updateTieMatchUpScore({
  tournamentId,
  matchUpId,
  drawId,
});
```

---

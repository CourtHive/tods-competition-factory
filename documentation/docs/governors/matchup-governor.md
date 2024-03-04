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

Convenience function to add several schedule items at once.

```js
engine.addMatchUpScheduleItems({
  checkChronology, // optional boolean - returns warnings for scheduling errors; throws errors when combined with errorOnAnachronism
  removePriorValues, // optional boolean
  matchUpId,
  drawId,
  schedule: {
    scheduledTime,
    scheduledDate,
    startTime,
    courtIds, // applies only to TEAM matchUps
    courtId, // requires scheduledDate
    venueId,
    endTime,
  },
  disableNotice, // when disabled subscribers will not be notified
});
```

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

```js
engine.modifyMatchUpFormatTiming({
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

```js
engine.setMatchUpDailyLimits({
  dailyLimits: { SINGLES: 2, DOUBLES: 1, total: 3 },
});
```

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

---
title: drawEngine API
---

// NOTEXPORTED: should it be?

## addFinishingRounds

```js
addFinishingRounds({
  finishingPositionOffset = 0, // required for sub-structures; e.g. consolation fed from R32 would have { finishingPositionOffset: 16 }
  roundLimit, // for qualifying, offset the final round so that qualifyinground is finishingRound
  matchUps, // required - matchUps belonging to a single structure
});
```

---

// NOTEXPORTED: should it be?

## allStructureMatchUps

Returns all matchUps from a single structure within a draw.

```js
const { matchUps } = drawEngine.allStructureMatchUps({
  structureId,
  context, // optional context to be added into matchUps
  inContext, // boolean - add context { drawId, structureId, participant, individualParticipants ... }
  nextMatchUps, // optioanl - boolean - to include winnerTo and loserTo
  matchUpFilters, // attribute filters
  contextFilters, // filters based on context attributes
  tournamentParticipants, // optional - provide an array of tournamentParticipants to add into matchUps
  requireParticipants, // optional - require that participants be loaded into drawEngine or passed into method
  tournamentAppliedPolicies, // any policies, such as privacy, to be applied to matchUps
});
```

---

// NOTEXPORTED: should it be?

## assignSeed

```js
result = drawEngine.assignSeed({
  structureId,
  seedNumber,
  seedValue, // optional - display value, e.g. '5-8'
  participantId,
});
```

---

// NOTEXPORTED: should it be?

## clearDrawPosition

Removes a `participantId` or `bye` from a specified `drawPosition` within a `structure` or, optionally, removes a specified `participantId` from a `structure`.

```js
drawEngine.clearDrawPosition({
  structureId,
  drawPosition, // optional if participantId is provided
  participantId, // optional if drawPosition is provided
});
```

---

// NOTEXPORTED: should it be?

## generateQualifyingLink

Generates and adds a `link` to `drawDefinition.links`.

```js
drawEngine.generateQualifyingLink({
  qualifyingStructureId,
  mainStructureId,
});
```

---

// NOTEXPORTED: should it be?

## getDrawStructures

```js
const { structures, stageStructures } = drawEngine.getDrawStructures({
  withStageGrouping, // optinal, return structures collated by stage
  stageSequences, // optional - specify stageSequences to include
  stageSequence, // optional - filter by stageSequence
  stages, // optional - specify stageSequences to include
  stage, // optional - filter by stage
});
```

---

// NOTEXPORTED: should it be?

## getEliminationDrawSize

```js
const { drawSize } = drawEngine.getEliminationDrawSize({ participantsCount });
```

---

// NOTEXPORTED: should it be?

## getMatchUpParticipantIds

Convenience function; requires inContext matchUp.

```js
const { sideParticipantIds, individualParticipantIds } = drawEngine.getMatchUpParticipantIds({ matchUp });
```

---

// NOTEXPORTED: should it be?

## getNextSeedBlock

Returns the next block of drawPositions which are to be assigned seeded participants.

```js
const { nextSeedBlock, unplacedSeedParticipantIds, unplacedSeedNumbers, unfilledPositions, unplacedSeedAssignments } =
  drawEngine.getNextSeedBlock({
    structureId,
  });
```

---

// NOTEXPORTED: should it be?

## getNextUnfilledDrawPositions

Returns the next valid block of unfilled drawPositions. Useful for UI to give visual indication of drawPostions valid to assign.

```js
const { nextUnfilledDrawPositions } = drawEngine.getNextUnfilledDrawPositions({
  structureId,
});
```

---

// NOTEXPORTED: should it be?

## getSourceRounds

Returns the round numbers for desired playoff positions.

```js
const {
  sourceRounds, // all source rounds for playedOff positions and specified playoffPositions
  playoffSourceRounds,
  playedOffSourceRounds,
  playoffPositionsReturned,
} = drawEngine.getSourceRounds({
  structureId,
  playoffPositions: [3, 4],
});
```

---

## initializeStructureSeedAssignments

Creates the `seedAssignments` attribute for the specified structure.

```js
drawEngine.initializeStructureSeedAssignments({
  structureId,
  seedsCount,
});
```

---

## isCompletedStructure

Returns boolean whether all matchUps in a given structure have been completed

```js
const structureIsComplete = drawEngine.isCompletedStructure({
  structureId,
});
```

---

## matchUpActions

Return an array of all validActions for a specific matchUp.

```js
const {
  isByeMatchUp, // boolean; true if matchUp includes a BYE
  structureIsComplete, // boolean; true if structure is ready for positioning
  validActions, // array of possible actions given current matchUpStatus
} = drawEngine.matchUpActions({
  restrictAdHocRoundParticipants, // optional - true by default; applies to AD_HOC; disallow the same participant being in the same round multiple times
  sideNumber, // optional - select side to which action should apply; applies to AD_HOC position assignments
  matchUpId,
});

const {
  type, // 'REFEREE', 'SCHEDULE', 'PENALTY', 'STATUS', 'SCORE', 'START', 'END'.
  method, // tournamentEngine method relating to action type
  payload, // attributes to be passed to method
  // additional method-specific options for values to be added to payload when calling method
} = validAction;
```

---

## matchUpDuration

Calculates matchUp duration from START, STOP, RESUME, END timeItems.

```js
const {
  milliseconds,
  time, // string representation of elapsed time, e.g. "01:10:00" for an hour and 10 seconds
  relevantTimeItems,
} = drawEngine.matchUpDuration({
  matchUp,
});
```

---

## newDrawDefinition

Creates a new drawDefinition within drawEngine state.

```js
const { drawId } = drawEngine.newDrawDefinition();
const { drawDefinition } = drawEngine.getState();
```

---

## positionActions

```js
const positionActions = drawEngine.positionActions({
  policyDefinitions: positionActionsPolicy, // optional - policy defining what actions are allowed in client context
  returnParticipants, // optional boolean; defaults to true; performance optimization when false requires client to provide participants.
  drawPosition,
  structureId,
});

const {
  isActiveDrawPosition, // boolean
  isByePosition, // boolean
  isDrawPosition, // boolean
  hasPositionAssiged, // boolean
  validActions,
} = positionActions;

const {
  type, // 'ASSIGN', 'LUCKY', 'SWAP', 'BYE', 'REMOVE'
  method, // tournamentEngine method relating to action type
  payload, // attributes to be passed to method
  // additional method-specific options for values to be added to payload when calling method
} = validAction;
```

---

## removeEntry

```js
drawEngine.removeEntry({
  participantId,
  autoEntryPositions, // optional - keeps entries ordered by entryStage/entryStatus
});
```

---

## removeStructure

Removes targeted `drawDefinition.structure` and all other child `structures` along with all associated `drawDefinition.links`.

```js
const { removedMatchUpIds } = drawEngine.removeStructure({
  structureId,
});
```

---

## renameStructures

```js
drawEngine.renameStructures({
  structureDetails: [{ structureId, structureName }],
});
```

## reset

Clears the drawEngine state.

```js
drawEngine.reset();
```

---

## resetMatchUpTimeItems

Removes all timeItems from a specified matchUp.

```js
drawEngine.resetMatchUpTimeItems({ matchUpId });
```

---

## setDrawDescription

```js
const drawDescription = 'Draw Description';
drawEngine.setDrawDescription({ description: drawDescription });
```

---

## setMatchUpFormat

Sets the default `matchUpFormat` for a `drawDefintion` or a `structure`, or for a specific `matchUp`.

```js
drawEngine.setMatchUpFormat({
  matchUpFormat,
  structureId, // optional - if structureId is present and not matchUpId is present, then set for structure
  matchUpId, // optional - if matchUpId is present then only set for matchUp
});
```

---

## setMatchUpStatus

Sets either matchUpStatus or score and winningSide. Handles any winner/loser participant movements within or across structures.

```js
drawEngine.setMatchUpStatus({
  disableScoreValidation, // optional boolean
  allowChangePropagation, // optional boolean - allow winner/loser to be swapped and propgate change throughout draw structures
  disableAutoCalc, // optional - applies only to { matchUpType: TEAM }
  enableAutoCalc, // optional - applies only to { matchUpType: TEAM }
  matchUpTieId, // optional - if part of a TIE matchUp
  matchUpStatus, // optional - if matchUpFormat differs from event/draw/structure defaults
  matchUpId,
  score, // optional - { sets }
  winningSide,
  schedule: {
    // optional - set schedule items
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
drawEngine.setOrderOfFinish({
  finishingOrder: [{ matchUpId, orderOfFinish: 1 }],
});
```

---

## setParticipants

Participants are not managed by the `drawEngine`, but they can be used when returning 'inContext' matchUps as well as when automated positioning relies on avoidance policies.

```js
drawEngine.setParticipants(participants);
```

---

## setStageAlternatesCount

Sets an (optional) limit to the number of accepted alternates.

Modifies the 'entryProfile' of a drawDefinition before the structures have been generated.

```js
drawEngine.setStageAlternatesCount({ alternatesCount: 8 });
```

---

## setStageDrawSize

Modifies the 'entryProfile' of a drawDefinition before the structures have been generated.

```js
drawEngine.setStageDrawSize({ stage: QUALIFYING, stageSequence, drawSize: 8 });
drawEngine.setStageDrawSize({ stage: MAIN, drawSize: 16 });
```

---

## setStageQualifiersCount

```js
drawEngine.setStageQualifiersCount({
  qualifiersCount: 4,
  stageSequence,
  stage,
});
```

---

## setStageWildcardsCount

```js
drawEngine.setStageWildcardsCount({ stage, stageSequence, wildcardsCount: 2 });
```

---

## setState

Loads a drawDefinition into drawEngine.

```js
drawEngine.setsState(drawDefinition, deepCopy, deepCopyConfig);
```

:::info
By default a deep copy of the tournament record is made so that mutations made by drawEngine do not affect the source object. An optional boolean parameter, _deepCopy_ can be set to false to override this default behavior.
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

## setSubOrder

Used to order ROUND_ROBIN participants when finishingPosition ties cannot be broken algorithmically. Assigns a subOrder value to a participant within a structure by drawPosition.

```js
drawEngine.setSubOrder({
  structureId, // structure identifier within drawDefinition
  drawPosition: 1, // drawPosition of the participant where subOrder is to be added
  subOrder: 2, // order in which tied participant should receive finishing position
});
```

---

## swapDrawPositionAssignments

Swaps the `participantIds` of two `drawPositions`.

```js
drawEngine.swapDrawPositionAssignments({ structureId, drawPositions });
```

---

## getStructureMatchUps

Returns categorized matchUps from a single structure.

```js
const { upcomingMatchUps, pendingMatchUps, completedMatchUps, abandonedMatchUps, byeMatchUps } =
  drawEngine.getStructureMatchUps({
    structureId,
    context, // optional context to be added into matchUps
    inContext, // boolean - add context { drawId, structureId, participant, individualParticipants ... }
    nextMatchUps, // optioanl - boolean - to include winnerTo and loserTo
    matchUpFilters, // attribute filters
    contextFilters, // filters based on context attributes
    tournamentParticipants, // optional - provide an array of tournamentParticipants to add into matchUps
    requireParticipants, // optional - require that participants be loaded into drawEngine or passed into method
    tournamentAppliedPolicies, // any policies, such as privacy, to be applied to matchUps
    scheduleVisibilityFilters, // { visibilityThreshold: Date, eventIds, drawIds }
  });
```

---

## validDrawPositions

Returns boolean indicating whether all matchUps have valid draw positions

```js
drawEngine.validDrawPositions({ matchUps });
```

---

## version

Returns NPM package version. Can be used in configurations that utilize Competition Factory engines on both client and server to ensure equivalency.

```js
const version = drawEngine.version();
```

---

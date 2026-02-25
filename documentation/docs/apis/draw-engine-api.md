---
title: drawEngine API
---

// NOTEXPORTED: should it be?

## addFinishingRounds

```js
addFinishingRounds({
  finishingPositionOffset = 0, // required for sub-structures; e.g. consolation fed from R32 would have { finishingPositionOffset: 16 } — see Finishing Positions concept
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

// NOTEXPORTED: should it be?

## initializeStructureSeedAssignments

Creates the `seedAssignments` attribute for the specified structure.

```js
drawEngine.initializeStructureSeedAssignments({
  structureId,
  seedsCount,
});
```

---

// NOTEXPORTED: should it be?

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

// NOTEXPORTED: should it be?

## newDrawDefinition

Creates a new drawDefinition within drawEngine state.

```js
const { drawId } = drawEngine.newDrawDefinition();
const { drawDefinition } = drawEngine.getState();
```

---

// NOTEXPORTED: should it be?

## resetMatchUpTimeItems

Removes all timeItems from a specified matchUp.

```js
drawEngine.resetMatchUpTimeItems({ matchUpId });
```

---

// NOTEXPORTED: should it be?

## setDrawDescription

```js
const drawDescription = 'Draw Description';
drawEngine.setDrawDescription({ description: drawDescription });
```

---

// NOTEXPORTED: should it be?

## setStageAlternatesCount

Sets an (optional) limit to the number of accepted alternates.

Modifies the 'entryProfile' of a drawDefinition before the structures have been generated.

```js
drawEngine.setStageAlternatesCount({ alternatesCount: 8 });
```

---

// NOTEXPORTED: should it be?

## setStageDrawSize

Modifies the 'entryProfile' of a drawDefinition before the structures have been generated.

```js
drawEngine.setStageDrawSize({ stage: QUALIFYING, stageSequence, drawSize: 8 });
drawEngine.setStageDrawSize({ stage: MAIN, drawSize: 16 });
```

---

// NOTEXPORTED: should it be?

## setStageQualifiersCount

```js
drawEngine.setStageQualifiersCount({
  qualifiersCount: 4,
  stageSequence,
  stage,
});
```

---

// NOTEXPORTED: should it be?

## setStageWildcardsCount

```js
drawEngine.setStageWildcardsCount({ stage, stageSequence, wildcardsCount: 2 });
```

---

// NOTEXPORTED: should it be?

## getStructureMatchUps

Returns categorized matchUps from a single structure.

```js
const { upcomingMatchUps, pendingMatchUps, completedMatchUps, abandonedMatchUps, byeMatchUps } =
  drawEngine.getStructureMatchUps({
    tournamentAppliedPolicies, // any policies, such as privacy, to be applied to matchUps
    scheduleVisibilityFilters, // { visibilityThreshold: Date, eventIds, drawIds }
    tournamentParticipants, // optional - provide an array of tournamentParticipants to add into matchUps
    requireParticipants, // optional - require that participants be loaded into drawEngine or passed into method
    contextFilters, // filters based on context attributes
    matchUpFilters, // attribute filters
    structureId,
    nextMatchUps, // optioanl - boolean - to include winnerTo and loserTo
    inContext, // boolean - add context { drawId, structureId, participant, individualParticipants ... }
    context, // optional context to be added into matchUps
  });
```

---

// NOTEXPORTED: should it be?

## validDrawPositions

Returns boolean indicating whether all matchUps have valid draw positions

```js
drawEngine.validDrawPositions({ matchUps });
```

---

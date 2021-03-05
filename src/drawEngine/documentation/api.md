---
name: API
menu: Draw Engine
route: /drawEngine/api
---

# drawEngine API Reference

## addDrawEntries

```js
drawEngine.addDrawEntries({
  participantIds, // an array of participantIds, should all be of the same participantType
  entryStatus, // optional - defaults to DIRECT_ACCEPTANCE
  stage, // optional - stage into which participantIds have been entered; defaults to MAIN
});
```

---

## addDrawEntry

```js
drawEngine.addDrawEntry({
  participantId,
  entryStage, // optional - stage into which participantIds have been entered; defaults to MAIN
  entryStatus, // optional - defaults to DIRECT_ACCEPTANCE
  entryPosition, // optional - used to order entries, e.g. { entryPosition: 1 } for 1st alternate
});
```

---

## addMatchUpEndTime

```js
const endTime = '2020-01-01T09:05:00Z';
drawEngine.addMatchUpEndTime({ matchUpId, endTime });
```

---

## addMatchUpOfficial

```js
drawEngine.addMatchUpOfficial({ matchUpId, participantId, officialType });
```

---

## addMatchUpResumeTime

```js
const resumeTime = '2020-01-01T09:00:00Z';
drawEngine.addMatchUpResumeTime({ matchUpId, resumeTime });
```

---

## addMatchUpScheduledDayDate

```js
const scheduledDayDate = '2020-01-01';
drawEngine.addMatchUpScheduledDayDate({ matchUpId, scheduledDayDate });
```

---

## addMatchUpScheduledTime

```js
const scheduledTime = '08:00';
drawEngine.addMatchUpScheduledTime({ matchUpId, scheduledTime });
```

---

## addMatchUpStartTime

```js
const startTime = '2020-01-01T08:05:00Z';
drawEngine.addMatchUpStartTime({ matchUpId, startTime });
```

---

## addMatchUpStopTime

```js
const stopTime = '2020-01-01T08:15:00Z';
drawEngine.addMatchUpStopTime({ matchUpId, stopTime });
```

---

## addPlayoffStructures

```js
drawEngine.addPlayoffStructures({
  structureId,
  roundNumbers: [3], // optional if playoffPositions not provided; roundNumbers of structure to be played off.
  playoffPositions: [3, 4], // optional if roundNumbers not provided; finishing positions to be played off.
  playoffAttributes, // optional - mapping of exitProfile to structure names, e.g. 0-1-1 for SOUTH
  playoffStructureNameBase, // optional - Root word for default playoff naming, e.g. 'Playoff' for 'Playoff 3-4'
});
```

---

## addMatchUpTimeItem

```js
const timeItem = {
  itemType: SCHEDULED_DATE,
  itemValue: scheduledDayDate,
};
drawEngine.addMatchUpTimeItem({
  matchUpId,
  timeItem,
  duplicateValues: false,
});
```

---

## setSubOrder

Assigns a subOrder value to a participant within a structure by drawPosition where participant has been assigned

```js
drawEngine.setSubOrder({
  structureId, // structure identifier within drawDefinition
  drawPosition: 1, // drawPosition of the participant where subOrder is to be added
  subOrder: 2, // order in which tied participant should receive finishing position
});
```

---

## allDrawMatchUps

Returns all matchUps from all structures within a draw.

```js
const { matchUps } = drawEngine.allDrawMatchUps({
  context, // optional context to be added into matchUps
  inContext, // boolean - add context { drawId, structureId, participant, individualParticipants ... }
  roundFilter, // filter to target matchUps from specified rounds
  nextMatchUps, // optioanl - boolean - to include winnerGoesTo and loserGoesTo
  matchUpFilters, // attribute filters
  contextFilters, // filters based on context attributes
  includeByeMatchUps, // return matchUps with { matchUpStatus: BYE }
  tournamentParticipants, // optional - provide an array of tournamentParticipants to add into matchUps
  requireParticipants, // optional - require that participants be loaded into drawEngine or passed into method
  tournamentAppliedPolicies, // any policies, such as privacy, to be applied to matchUps
});
```

---

## allStructureMatchUps

Returns all matchUps from a single structure within a draw.

```js
const { matchUps } = drawEngine.allDrawMatchUps({
  structureId,
  context, // optional context to be added into matchUps
  inContext, // boolean - add context { drawId, structureId, participant, individualParticipants ... }
  roundFilter, // filter to target matchUps from specified rounds
  nextMatchUps, // optioanl - boolean - to include winnerGoesTo and loserGoesTo
  matchUpFilters, // attribute filters
  contextFilters, // filters based on context attributes
  includeByeMatchUps, // return matchUps with { matchUpStatus: BYE }
  tournamentParticipants, // optional - provide an array of tournamentParticipants to add into matchUps
  requireParticipants, // optional - require that participants be loaded into drawEngine or passed into method
  tournamentAppliedPolicies, // any policies, such as privacy, to be applied to matchUps
});
```

---

## analyzeMatchUp

Method used internally by the `scoreGovernor` and `keyValueScore`.

```js
const {
  isActiveSet,
  isExistingSet,
  existingValue,
  hasExistingValue,
  isValidSideNumber,
  completedSetsCount,
  isCompletedMatchUp,
  isLastSetWithValues,
  validMatchUpOutcome,
  matchUpScoringFormat,
  calculatedWinningSide,
  validMatchUpWinningSide,
  completedSetsHaveValidOutcomes,
  specifiedSetAnalysis: {
    expectTiebreakSet,
    expectTimedSet,
    hasTiebreakCondition,
    isCompletedSet,
    isDecidingSet,
    isTiebreakSet,
    isValidSet,
    isValidSetNumber,
    isValidSetOutcome,
    setFormat,
    sideGameScores,
    sideGameScoresCount,
    sidePointScores,
    sidePointScoresCount,
    sideTiebreakScores,
    sideTiebreakScoresCount,
    winningSide,
  },
} = drawEngine.analyzeMatchUp({
  matchUp,
  sideNumber,
  setNumber,
  matchUpFormat,
});
```

---

## analyzeSet

```js
const {
  expectTiebreakSet,
  expectTimedSet,
  hasTiebreakCondition,
  isCompletedSet,
  isDecidingSet,
  isTiebreakSet,
  isValidSet,
  isValidSetNumber,
  isValidSetOutcome,
  setFormat,
  sideGameScores,
  sideGameScoresCount,
  sidePointScores,
  sidePointScoresCount,
  sideTiebreakScores,
  sideTiebreakScoresCount,
  winningSide,
} = drawEngine.analyzeSet({
  setObject,
  matchUpScoringFormat,
});
```

---

## assignDrawPosition

```js
drawEngine.assignDrawPosition({
  structureId,
  drawPosition,
  participantId,
});
```

---

## assignDrawPositionBye

```js
drawEngine.assignDrawPositionBye({
  structureId,
  drawPosition,
});
```

---

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

## attachEventPolicy

Attaches a policy to an event within a tournamentRecord.

See [Policies](/concepts/policies).

```js
drawEngine.attachEventPolicy({
  eventId,
  policyDefinition: SEEDING_POLICY,
});
```

---

## attachPolicy

Attaches a policy to a drawDefinition.

See [Policies](/concepts/policies).

```js
drawEngine.attachPolicy({ policyDefinition: SEEDING_POLICY });
```

---

## automatedPositioning

Positions participants in a draw structure. `drawEngine` is agnostic about the type of participants that are placed in a draw structure, but requires tournament participants for avoidance policies to work.

See [Policies](/concepts/policies).

```js
drawEngine.automatedPositioning({
  structureId,
  participants, // optional - participants must be passed in for Avoidance Policies to be effective
});
```

---

## checkInParticipant

Set the check-in state for a participant. Used to determine when both participants in a matchUp are available to be assigned to a court.

```js
drawEngine.checkInParticipant({
  matchUpId,
  participantId,
});
```

---

## checkOutParticipant

```js
drawEngine.checkOutParticipant({
  matchUpId,
  participantId,
});
```

---

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

## devContext

Setting devContext(true) bypasses **try {} catch (err) {}** code block and in some cases enables logging

```js
drawEngine.devContext(true);
```

---

## drawMatchUps

Returns categorized matchUps from all structures within a draw.

```js
const {
  upcomingMatchUps,
  pendingMatchUps,
  completedMatchUps,
  abandonedMatchUps,
  byeMatchUps,
} = drawEngine.allDrawMatchUps({
  context, // optional context to be added into matchUps
  inContext, // boolean - add context { drawId, structureId, participant, individualParticipants ... }
  roundFilter, // filter to target matchUps from specified rounds
  nextMatchUps, // optioanl - boolean - to include winnerGoesTo and loserGoesTo
  matchUpFilters, // attribute filters
  contextFilters, // filters based on context attributes
  includeByeMatchUps, // return matchUps with { matchUpStatus: BYE }
  tournamentParticipants, // optional - provide an array of tournamentParticipants to add into matchUps
  requireParticipants, // optional - require that participants be loaded into drawEngine or passed into method
  tournamentAppliedPolicies, // any policies, such as privacy, to be applied to matchUps
});
```

---

## findMatchUp

```js
const {
  matchUp,
  structure, // returned for convenience
} = drawEngine.findMatchUp({
  matchUpId,
  inContext, // optional - boolean - returns matchUp with additional attributes
  tournamentParticipants, // optional - enables inContext matchUp to contain full participant objects
});
```

---

## generateDrawType

Convenience method to generate pre-defined drawTypes.

For more information on `feedPolicy` see [Feed Policies](/drawEngine/feedPolicies).

```js
drawEngine.generateDrawType({
  drawType, // defaults to SINGLE_ELIMINATION

  matchUpFormat, // optional - default matchUpFormat
  playoffMatchUpFormat, // optional - default playoffMatchUpFormat

  seedingProfile, // optional - applies only to WATERFALL seeding in ROUND_ROBIN structures
  feedPolicy, // optional - provides fine-grain control for FEED_IN_CONSOLATION feed links

  qualifyingRound, // optional - for qualifying draw structures, roundNumber to win to qualify
  qualifyingPositions, // optional - number of drawPositions to be filled by qualifiers
  finishingPositionLimit, // optional - for playoff structures, limit to the number of positions to be played off

  structureOptions: {
    groupSize, // e.g. 4 participants per group
    groupSizeLimit: 8,
  },

  goesTo, // optional - generate winnerGoesTo and loserGoesTo attributes
  uuids, // optional - array of UUIDs to be used for structureIds and matchUpIds

  stage, // optional - defaults to MAIN
  structureName, // optional - defaults to stage
});
```

---

## generateQualifyingLink

Generates and adds a `link` to `drawDefinition.links`.

```js
drawEngine.generateQualifyingLink({
  qualifyingStructureId,
  mainStructureId,
  qualifyingRound,
});
```

---

## generateScoreString

```js
const sets = [
  {
    side1Score: 6,
    side2Score: 7,
    side1TiebreakScore: 3,
    side2TiebreakScore: 7,
    winningSide: 2,
  },
  {
    side1Score: 7,
    side2Score: 6,
    side1TiebreakScore: 14,
    side2TiebreakScore: 12,
    winningSide: 1,
  },
  { side1Score: 3 },
];
let result = generateScoreString({
    sets, // TODS sets object
    winningSide, // optional - 1 or 2
    reversed, // optional - reverse the score
    winnerFirst = true, // optional - boolean - tranform sets so that winningSide is first (on left)
    matchUpStatus, // optional - used to annotate scoreString
    addOutcomeString, // optional - tranform matchUpStatus into outcomeString appended to scoreString
    autoComplete: true, // optional - complete missing set score
  });
```

---

## generateTieMatchUpScoreString

Returns string representation of current tieMatchUp score.

```js
drawEngine.generateTieMatchUpScoreString({
  matchUp,
  separator, // optional - defaults to '-'
});
```

---

## getAvailablePlayoffRounds

Returns rounds of a structure which are available for adding playoff structures.

```js
const {
  playoffRounds,
  playoffRoundsRanges,
} = drawEngine.getAvailablePlayoffRounds({
  structureId,
});
```

...For a SINGLE_ELIMINATION struture with drawSize: 16 would return:

```js
    {
      playoffRounds: [ 1, 2, 3 ],
      playoffRoundsRanges: [
        { round: 1, range: '9-16' },
        { round: 2, range: '5-8' },
        { round: 3, range: '3-4' }
      ]
    }

```

---

## getCheckedInParticipantIds

```js
const {
  allParticipantsCheckedIn, // boolean
  checkedInParticipantIds, // array of participantIds
} = drawEngine.getCheckedInParticipantIds({ matchUp });
```

---

## getDrawStructures

```js
const { structures } = drawEngine.getDrawStructures({
  stage, // optional - filter by stage
  stageSequence, // optiona - filter by stageSequence
});
```

---

## getMatchUpContextIds

Convenience method to find a `matchUp` by `matchUpId` and return "context ids". Does NOT require that drawEngine state be set, but does require an array of "inContext" `matchUps`.

```js
const {
  matchUpId,
  drawId,
  eventId,
  structureId,
  tournamentId,
} = drawEngine.getMatchUpContextIds({ matchUps, matchUpId });
```

---

## getMatchUpParticipantIds

Convenience function; requires inContext matchUp.

```js
const {
  sideParticipantIds,
  individualParticipantIds,
} = drawEngine.getMatchUpParticipantIds({ matchUp });
```

---

## getMatchUpScheduleDetails

Returns the latest values for all `matchUp.timeItems`, along with calculated values, that relate to the scheduling of a `matchUp`.

```js
const {
  schedule: {
    time,
    courtId,
    venueId,
    startTime,
    endTime,
    milliseconds,
    scheduledDate,
    scheduledTime,
  },
} = drawEngine.getMatchUpScheduleDetails({ matchUp });
```

---

## getNextSeedBlock

Returns the next block of drawPositions which are to be assigned seeded participants.

```js
const {
  nextSeedBlock,
  unplacedSeedParticipantIds,
  unplacedSeedNumbers,
  unfilledPositions,
  unplacedSeedAssignments,
} = drawEngine.getNextSeedBlock({
  structureId,
});
```

---

## getNextUnfilledDrawPositions

Returns the next valid block of unfilled drawPositions. Useful for UI to give visual indication of drawPostions valid to assign.

```js
const { nextUnfilledDrawPositions } = drawEngine.getNextUnfilledDrawPositions({
  structureId,
});
```

---

## getParticipantIdFinishingPositions

Returns the Range of finishing positions possible for all participantIds within a draw

```js
const idMap = drawEngine.getParticipantIdFinishingPositions({
  byeAdvancements, // optional boolean - whether or not to consider byeAdvancements
});

const {
  relevantMatchUps,
  finishingPositionRanges,
  finishingPositionRange,
} = idMap[participantId];
```

---

## getPositionsPlayedOff

Determines which finishing positions will be returned by a draw. For example, a First Match Loser Consolation with a draw size of 16 will playoff possitions 1, 2, 9 and 10.

```js
const { positionsPlayedOff } = getPositionsPlayedOff({ drawDefinition });
```

---

## getRoundMatchUps

Organizes matchUps by roundNumber. **roundMatchUps** contains matchUp objects; **roundProfile** provides an overview of drawPositions which have advanced to each round, a matchUpsCount, finishingPositionRange for winners and losers, and finishingRound.

```js
const { roundMatchUps, roundProfile } = getRoundMatchUps({ matchUps });
```

---

## getSourceRounds

Returns the round numbers for desired playoff positions.

```js
const {
  sourceRounds, // all source rounds for playedOff positions and specified playoffPositions
  playoffSourceRounds,
  playedOffSourceRounds,
  playoffPositionsReturned,
} = getSourceRounds({
  drawDefinition,
  structureId,
  playoffPositions: [3, 4],
});
```

---

## getStructureSeedAssignments

Returns seedAssignments for a specific structure based on structureId or structure

The structure of an **_assignment object_** is as follows:

```json
{
  "seedNumber": 1,
  "seedValue": 1,
  "participantId": "uuid-of-participant"
}
```

The most basic usage is to retrieve seed assignments for a draw which has a single main stage structure

```js
const { seedAssignments } = drawEngine.getStructureSeedAssignments({
  structureId,
});
```

---

## getState

No parameters.

Returns a deep copy of the current drawEngine state.

```js
const { drawDefinition } = drawEngine.getState({
  convertExtensions, // optional - convert extensions to '_' prefixed attributes
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
const structureIsComplete = isCompletedStructure({
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

## matchUpSort

Sorting function to arrange matchUps by stage, stageSequence, roundNumber, roundPosition (where applicable)

Used by `mocksEngine` for automatically scoring all matchUps in connected draw structures as part of test suites.

```js
const { matchUps } = drawEngine.allDrawMatchUps();
const sortedMatchUps = matchUps.sort(drawEngine.matchUpSort);
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
  structureId,
  drawPosition,
  policyDefinition: positionActionsPolicy, // optional - policy definiting what actions are allowed in client context
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
drawEngine.removeEntry({ participantId });
```

---

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
  matchUpType, // optional - insures that a matchUpFormat is not set on a tieMatchUp
  tieFormat, // optional - when setting the format for a tieMatchUp

  structureId, // optional - if structureId is present and not matchUpId is present, then set for structure
  matchUpId, // optional - if matchUpId is present then only set for matchUp
});
```

---

## setMatchUpStatus

Sets either matchUpStatus or score and winningSide. Handles any winner/loser participant movements within or across structures.

```js
drawEngine.setMatchUpStatus({
  matchUpId,
  matchUpTieId, // optional - if part of a TIE matchUp
  matchUpStatus, // optional - if matchUpFormat differs from event/draw/structure defaults
  winningSide,
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
drawEngine.setStageDrawSize({ stage: QUALIFYING, drawSize: 8 });
drawEngine.setStageDrawSize({ stage: MAIN, drawSize: 16 });
```

---

## setStageQualifiersCount

```js
drawEngine.setStageQualifiersCount({ qualifiersCount: 4 });
```

---

## setStageWildcardsCount

```js
drawEngine.setStageWildcardsCount({ wildcardsCount: 2 });
```

---

## setState

Loads a drawDefinition into drawEngine.

```js
drawEngine.setsState(drawDefinition, deepCopy);
```

By default a deep copy of the tournament record is made so that mutations made by drawEngine do not affect the source object. An optional boolean parameter, _deepCopy_ can be set to false to override this default behavior.

---

## setSubscriptions

Please refer to the [Subscriptions](/concepts/subscriptions) in General Concepts.

---

## structureSort

Sorting function to arrange structures by stage, positionAssignments count (size) then stageSequence
Used internally to order Compass structures

```js
const sortedStructures = drawDefinition.structures.sort(structureSort);
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
const {
  upcomingMatchUps,
  pendingMatchUps,
  completedMatchUps,
  abandonedMatchUps,
  byeMatchUps,
} = drawEngine.allDrawMatchUps({
  structureId,
  context, // optional context to be added into matchUps
  inContext, // boolean - add context { drawId, structureId, participant, individualParticipants ... }
  roundFilter, // filter to target matchUps from specified rounds
  nextMatchUps, // optioanl - boolean - to include winnerGoesTo and loserGoesTo
  matchUpFilters, // attribute filters
  contextFilters, // filters based on context attributes
  includeByeMatchUps, // return matchUps with { matchUpStatus: BYE }
  tournamentParticipants, // optional - provide an array of tournamentParticipants to add into matchUps
  requireParticipants, // optional - require that participants be loaded into drawEngine or passed into method
  tournamentAppliedPolicies, // any policies, such as privacy, to be applied to matchUps
});
```

---

## tallyParticipantResults

Method used to calculate finishing positions within a ROUND_ROBIN group.

```js
const { participantResults } = drawEngine.tallyParticipantResults({
  matchUps: structureMatchUps,
  matchUpFormat,
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

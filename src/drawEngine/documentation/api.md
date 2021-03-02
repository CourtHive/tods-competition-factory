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

- @param {object} drawDefinition - passed in automatically by drawEngine
- @param {string} structureId - id of structure to which playoff structures are to be added
- @param {number[]} roundNumbers - source roundNumbers which will feed target structures
- @param {number[]} playoffPositions - positions to be played off
- @param {object} playoffAttributes - mapping of exitProfile to structure names, e.g. 0-1-1 for SOUTH
- @param {string} playoffStructureNameBase - Root word for default playoff naming, e.g. 'Playoff' for 'Playoff 3-4'

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

---

## getEventAppliedPolicies

---

## getMatchUpContextIds

---

## getMatchUpParticipantIds

---

## getMatchUpScheduleDetails

---

## getNextSeedBlock

---

## getNextUnfilledDrawPositions

---

## getParticipantIdFinishingPositions

Returns the range of finishing positions for all participants

- @param {string} drawId - drawId of target draw within a tournament
- @param {object[]} tournamentParticipants - optional - to return matchUps with inContext participant details
- @param {boolean} byeAdvancements - whether or not to consider byeAdancements in returns finishingPositionRange

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

Returns seedAssignments a specific structure based on structureId or structure

| Parameters     | Required | Type   | Description                                     |
| :------------- | :------- | :----- | :---------------------------------------------- |
| drawDefinition | required | object | drawDefinition object                           |
| structure      | Optional | object | Return seedAssignments for a specific structure |
| structureId    | Optional | string | Return seedAssignments for a specific structure |

The result is an array of objects which contain seeding details for all structures within the current draw

| Object Attributes | Type   | Description                                                   |
| :---------------- | :----- | :------------------------------------------------------------ |
| structureId       | string | unique identifier for draw structure                          |
| seedAssignments   | array  | array of assignment objects                                   |
| stage             | string | draw stage within which structure appears                     |
| stageSequence     | number | stageSequence within a draw stage                             |
| seedLimit         | number | either defined structure seedLimit or number of drawPositions |

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
drawEngine.setState(drawDefinition);
const structureId = drawDefinition.structures[0].structureId;
const structureSeedingDetails = drawEngine.getStructureSeedAssignments({
  structureId,
});
const firstStructureDetails = structureSeedingDetails[0];
const { seedAssignments } = firstStructureDetails;
```

---

## getSetComplement

---

## getState

No parameters.

Returns a deep copy of the current drawEngine state.

```js
const { drawDefinition } = drawEngine.getState();
```

---

## getRoundPresentationProfile

Returns an object describing draw rounds such that they can be generated as independent columns

- @param {boolean} isRoundRobin - flag to determine whether to generate for round robin or elimination structure
- @param {object[]} matchUps - inContext matchUp objects, generally provided by **getAllStructureMatchUps()**

---

## getStructureQualifiersCount

---

## getTiebreakComplement

---

## initializeStructureSeedAssignments

---

## isCompletedStructure

Expects drawEngine.setState(drawDefinition) has been previously called
Returns boolean whether all matchUps in a given structure have been completed

- @param {string} structureId

---

## matchUpActions

Return an array of all validActions for a given matchUp

- @param {object} drawDefinition
- @param {string} matchUpId - id of matchUp for which validActions will be returned

---

## matchUpDuration

---

## matchUpSort

Sorting function to arrange matchUps by stage, stageSequence, roundNumber, roundPosition (where applicable)

Useful for automatically scoring all matchUps in connected draw structures

- @param {object} a - matchUp object
- @param {object} b - matchUp object

---

## newDrawDefinition

---

## positionActions

---

## removeEntry

---

## reset

---

## resetMatchUpTimeItems

---

## setDrawDescription

---

## setDrawId

---

## setMatchUpFormat

---

## setMatchUpStatus

---

## setParticipants

---

## setStageAlternates

---

## setStageDrawSize

---

## setStageQualifiersCount

---

## setStageWildcardsCount

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

Sorting function to arrange structures by positionAssignments count (size) then stageSequence
Used internally to order Compass structures

- @param {object} a - matchUp object
- @param {object} b - matchUp object

---

## swapDrawPositionAssignments

- @param {string} drawId - id of drawDefinition within which structure is found
- @param {string} structureId - id of structure of drawPosition
- @param {number[]} drawPositions - drawPositions for which particpants will be swapped

---

## getStructureMatchUps

---

## tallyParticipantResults

---

## validDrawPositions

Returns boolean indicating whether all matchUps have valid draw positions

```js
drawEngine.validDrawPositions({ matchUps });
```

---

## version

Returns NPM package version

---

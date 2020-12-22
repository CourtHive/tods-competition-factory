---
name: API
menu: Draw Engine
route: /drawEngine/api
---

# drawEngine API Reference

## addDrawEntries

- @param {object} drawDefinition - drawDefinition object; passed in automatically when _drawEngine.setState(drawDefinition)_ has been previously called
- @param {string[]} participantIds - ids of participants to add to drawDefinition.entries
- @param {string} entryStatus - entry status to be applied to all draw Entries
- @param {string} stage - entry stage for particpants (QUALIFYING, MAIN)

---

## addDrawEntry

- @param {object} drawDefinition - drawDefinition object; passed in automatically by drawEngine when drawEngine.setSTate(drawdefinition) has been previously called
- @param {string} participantId - id of participant being entered into draw
- @param {object} participant - optional; for passing participantId
- @param {string} entryStage - either QUALIFYING or MAIN
- @param {string} entryStatus - entryStatusEnum (e.g. DIRECT_ACCEPTANCE, WILDCARD)

---

## addMatchUpEndTime

---

## addMatchUpOfficial

---

## addMatchUpResumeTime

---

## addMatchUpScheduledDayDate

---

## addMatchUpScheduledTime

---

## addMatchUpStartTime

---

## addMatchUpStopTime

---

## addPlayoffStructures

```js
drawEngine.addPlayoffStructures({
  structureId,
  roundNumbers: [3],        // either target roundNumbers or playoffPositions
  playoffPositions: [3, 4],
});
```

---

## addTimeItem

---

## allDrawMatchUps

---

## allStructureMatchUps

Returns object { matchUps } with array of all matchUps within a structure

| Parameters     | Required | Type   | Description                                           |
| :------------- | :------- | :----- | :---------------------------------------------------- |
| structureId    | Required | string | id of structure for which matchUps are requeste4d     |
| drawDefinition | Optional | object | if drawEngine does not already contain drawDefinition |

---

## analyzeMatchUp

---

## analyzeSet

---

## assignDrawPosition

---

## assignDrawPositionBye

---

## assignSeed

---

## attachEventPolicy

---

## attachPolicy

Attaches a policy to a drawDefinition. Policies determine the rules for seeding, avoidance, etc.

| Parameters       | Required | Type   | Description                            |
| :--------------- | :------- | :----- | :------------------------------------- |
| policyDefinition | Required | Object | A policy definition object (see below) |

The structure of an **_assignment object_** is as follows:

```json
{
  [policyName]: {      // e.g. 'seeding' or 'avoidance'
    policyName: 'name'  // for 'seeding' can be the provider of the policy, e.g. 'ITF' or 'USTA'
    ...attributes       // attributes relevant to the policyName
  },
}
```

---

## automatedPositioning

---

## availablePlayoffRounds

Returns rounds of a structure which are available for adding playoff structures.

```js
const { playoffRounds, playoffRoundsRanges } = getAvailablePlayoffRounds({
  drawDefinition,
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

## buildDrawHierarchy

---

## calcTieMatchUpScore

---

## checkInParticipant

---

## checkOutParticipant

---

## clearDrawPosition

---

## createQualifyingLink

---

## devContext

Setting devContext(true) bypasses **try {} catch (err) {}** code block and in some cases enables enhanced logging

```js
tournamentEngine.devContext(true);
```

---

## drawMatchUps

---

## findMatchUp

---

## flushErrors

---

## generateDrawType

---

## generateScoreString

| Parameters    | Required | Type    | Description                                                              |
| :------------ | :------- | :------ | :----------------------------------------------------------------------- |
| sets          | Required | object  | An array of TODS sets objects                                            |
| matchUpStatus | Optional | string  | TODS matchUpStatus ENUM                                                  |
| winningSide   | Optional | number  | TODS side indicator: 1 or 2 (can also be string)                         |
| winnerFirst   | Optional | boolean | Whether or not to display the winning side on the left of each set score |
| autoComplete  | Optional | boolean | Whether or not to convert **undefined** to 0                             |

---

## getCheckedInParticipantIds

---

## getDrawStructures

---

## getErrors

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
| drawDefiniiton | required | object | drawDefinition object                           |
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

---

## matchUpDuration

---

## newDrawDefinition

---

## positionActions

---

## removeEntry

---

## reset

---

## resetTimeItems

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

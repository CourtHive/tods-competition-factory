---
name: API
menu: Draw Engine
route: /drawEngine/api
---

# drawEngine API Reference

## addDrawEntries

---

## addDrawEntry

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

## assignMatchUpCourt

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

## getRoundMatchUps

---

## getStructureSeedAssignments

Returns existing seedAssignments for **_all_** structures within a draw

| Parameters    | Required | Type   | Description                                                            |
| :------------ | :------- | :----- | :--------------------------------------------------------------------- |
| structureId   | Optional | string | Return assignments for a specific structure, identified by structureId |
| stage         | Optional | string | Locate structure by stage; used together with stageSequence            |
| stageSequence | Optional | number | Locate structure by stageSequence; used together with stage            |

```json
Defaults to { stage: 'MAIN', stageSequence: 1 } if { structureId: undefined }
```

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

## getStructureQualifiersCount

---

## getTiebreakComplement

---

## initializeStructureSeedAssignments

---

## load

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

---

## getStructureMatchUps

---

## tallyParticipantResults

---

## version

Returns NPM package version

---

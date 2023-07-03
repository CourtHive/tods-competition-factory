---
title: matchUpEngine API
---

All **matchUpEngine** methods which make a mutation return either `{ success: true }` or `{ error }`

---

## addCollectionDefinition

Adds a `collectionDefinition` to the specified target, either `matchUp`, `structure`, `drawDefinition` or `event`.

```js
matchUpEngine.addCollectionDefinition({
  updateInProgressMatchUps, // defaults to true; in progress matchUps have matchUpStatus: IN_PROGRESS
  collectionDefinition, // will be validated
  tieFormatName, // if not provided, existing tieFormatName will be deleted
  uuids, // optional - array of UUIDs to use for newly created matchUps
});
```

---

## addCollectionGroup

```js
matchUpEngine.addCollectionGroup({
  tieFormatName: 'Swelled',
  groupDefinition,
  collectionIds,
});
```

---

### analyzeMatchUp

```js
let analysis = matchUpEngine.analyzeMatchUp({ matchUp });

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
  matchUpScoringFormat: {
    bestOf,
    setFormat: { setTo, tiebreakFormat, tiebreakAt },
  },
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
} = analysis;
```

---

## modifyCollectionDefinition

Modifies the `collectionName` and/or `matchUpFormat` for targeted `collectionId` within `matchUp.tieFormat`.

```js
matchUpEngine.modifyCollectionDefinition({
  collectionName, // optional
  matchUpFormat, // optional
  collectionId, // required

  // value assignment, only one is allowed to have a value
  collectionValueProfile, // optional - [{ collectionPosition: 1, value: 2 }] - there must be a value provided for all matchUp positions
  collectionValue, // optional - value awarded for winning more than half of the matchUps in the collection
  matchUpValue, // optional - value awarded for each matchUp won
  scoreValue, // optional - value awarded for each game or point won (points for tiebreak sets)
  setValue, // optional - value awarded for each set won
  gender, // optional
});
```

---

## orderCollectionDefinitions

Modify the array order of `tieFormat.collectionDefinitions` for an `event`, a `drawDefinition`, `structure`, or `matchUp`.

```js
matchUpEngine.orderCollectionDefinitions({
  orderMap: { collectionId1: 1, collectionId2: 2 },
});
```

---

## removeCollectionDefinition

```js
matchUpEngine.removeCollectionDefinition({
  updateInProgressMatchUps, // optional; defaults to true
  updateUnscoredMatchUps, // optional; defaults to false
  tieFormatName, // any time a collectionDefinition is modified a new name must be provided
  collectionId, // required - id of collectionDefinition to be removed
  structureId, // optional - if removing from tieFormat associated with a specific structure
  matchUpId, // optional - if removing from tieFormat asscoiated with a specific matchUp
});
```

---

## removeCollectionGroup

Removes a `collectionGroup` from the `tieFormat` found for the `event`, `drawDefinition`, `structure` or `matchUp`; recalculates

```js
matchUpEngine.removeCollectionGroup({
  updateInProgressMatchUps, // optional - defaults to true
  tieFormatName: 'New tieFormat', // if no name is provided then there will be no name
  collectionGroupNumber: 1,
});
```

---

## reverseScore

```js
const { reversedScore } = machUpEngine.reverseScore({ score });
```

---

## scoreHasValue

Returns boolean whether or not a `matchUp.score` contains a point, game or set value.

```js
const result = matchUpEngine.scoreHasValue(); // use matchUp that is in state
const result = matchUpEngine.scoreHasValue({ matchUp }); // pass matchUp
const result = matchUpEngine.scoreHasValue({ score }); // pass score
```

---

## tallyParticipantResults

Processes `matchUps` of `{ drawType: 'ROUND_ROBIN' }` from a single grouping within a ROUND_ROBIN structure and produces a detailed tally of particpant metrics.

```js
const { participantResults } = matchUpEngine.tallyParticipantResults({
  matchUpFormat, // required for accurate calculations
  tallyPolicy, // optional - can configure determination of winner when tied values
  subOrderMap, // map { [participantId]: subOrder } // manual determination of order when ties cannot be broken
  matchUps, // optional - array of Group matchUps; will use matchUps in state when not provided
});
```

---

## validateScore

```js
const { valid, error } = validateScore({
  matchUpFormat,
  matchUpStatus,
  winningSide,
  score,
});
```

---

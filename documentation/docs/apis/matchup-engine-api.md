---
title: matchUpEngine API
---

All **\_matchUpEngine** methods which make a mutation return either `{ success: true }` or `{ error }`

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
  tieFormatName, // any time a collectionDefinition is modified a new name must be provided
  collectionId, // required - id of collectionDefinition to be removed
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

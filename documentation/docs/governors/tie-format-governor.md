---
title: tieFormat Governor
---

```js
import { governors: { tieFormatGovernor }} from 'tods-competition-factory';
```

## addCollectionDefinition

Adds a `collectionDefinition` to the specified target, either `matchUp`, `structure`, `drawDefinition` or `event`.

```js
engine.addCollectionDefinition({
  updateInProgressMatchUps, // defaults to true; in progress matchUps have matchUpStatus: IN_PROGRESS
  collectionDefinition, // will be validated
  tieFormatName, // if not provided, existing tieFormatName will be deleted
  structureId, // optional - if provided only tieFormat on structure will be modified
  matchUpId, // optional - if provided only tieFormat on matchUp will be modified
  eventId, // optional - if provided only tieFormat on event will be modified
  drawId, // required if structureId is specified; if provided without structureId only tieFormat on drawDefinition will be modified
  uuids, // optional - array of UUIDs to use for newly created matchUps
});
```

---

## addCollectionGroup

```js
engine.addCollectionGroup({
  collectionIds: result.modifiedCollectionIds,
  tieFormatName: 'Swelled',
  groupDefinition,
  structureId, // optional - if provided only tieFormat on structure will be modified
  matchUpId, // optional - if provided only tieFormat on matchUp will be modified
  eventId, // optional - if provided only tieFormat on event will be modified
  drawId, // required if structureId is specified; if provided without structureId only tieFormat on drawDefinition will be modified
});
```

---

## modifyCollectionDefinition

Modifies the `collectionName` and/or `matchUpFormat` for targeted `collectionId` within the `tieFormat` specified by `eventId`, `drawId`, `structureId` or `matchUpId`.

```js
engine.modifyCollectionDefinition({
  collectionName, // optional
  matchUpFormat, // optional
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

## validateCollectionDefinition

```js
const { valid } = engine.validateCollectionDefinition({
  collectionDefinition, // required
  checkCollectionIds, // optional boolean - check that collectionIds are present
  referenceCategory, // optional - category for comparision if eventId is not provided
  referenceGender, // optional - expected gender if eventId is not provided
  checkCategory, // optional boolean - defaults to true
  checkGender, // optional boolean - defaults to true
  eventId, // required only for checking gender
});
```

---

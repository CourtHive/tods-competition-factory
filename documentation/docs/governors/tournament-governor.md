---
title: Tournament Governor
---

```js
import { tournamentGovernor } from 'tods-competition-factory';
```

## addDrawDefinitionExtension

```js
engine.addDrawDefinitionExtension({
  extension: {
    name: 'extension name',
    value: {},
  },
  drawId,
});
```

---

## addEventExtension

```js
engine.addEventExtension({
  extension: {
    name: 'extension name',
    value: {},
  },
  eventId,
});
```

---

## addTimeItem

When calling via an engine, `participant` will be resolved from `participantId`, `drawDefinition`will be resovled from`drawId`, `event`will be resolved from`eventId`, and `tournamentRecord` will be present. Method will only attach `timeItem` to one element.

```js
engine.addTimeItem({
  removePriorValues, // boolean; prior values with equivalent `itemType` will be removed
  duplicateValues, // boolean; allow duplicate values
  participantId, // optional; resolves to participant
  creationTime, // optional timestamp adds `createdAt` value
  timeItem, // required; { itemType, itemValue, itemSubTypes, itemDate }
  eventId, // optional; resolves to event
  drawId, // optional; resolves to drawDefinition
});
```

When calling directly without an engine. Attaches to first element encountered in params: `element, drawDefinition, event, tournamentRecord`.

```js
addTimeItem({
  removePriorValues, // boolean; prior values with equivalent `itemType` will be removed
  tournamentRecord, // optional
  duplicateValues, // boolean; allow duplicate values
  drawDefinition, // optional
  creationTime, // optional
  timeItem, // required; { itemType, itemValue, itemSubTypes, itemDate }
  element, // optional if event, drawDefinition or tournamentRecord provided
  event, // optional
});
```

---

## addTournamentExtension

```js
engine.addTournamentExtension({
  extension: {
    name: 'extension name',
    value: {},
  },
});
```

---

## newTournamentRecord

Creates a new tournamentRecord in shared state.

```js
engine.newTournamentRecord({
  tournamentId, // optional - will be generated if not provided
});

const { tournamentRecord } = engine.getTournament();
```

---

## orderCollectionDefinitions

Modify the array order of `tieFormat.collectionDefinitions` for an `event`, a `drawDefinition`, `structure`, or `matchUp`.

```js
engine.orderCollectionDefinitions({
  orderMap: { collectionId1: 1, collectionId2: 2 },
  structureId, // required if modifying tieFormat for a structure
  matchUpId, // required if modifying tieFormat for a matchUp
  eventId, // required if modifying tieFormat for a event
  drawId, // required if modifying tieFormat for a drawDefinition or a structure
});
```

---

## removeTournamentExtension

```js
engine.removeTournamentExtension({ name });
```

---

## setTournamentCategories

Define categories to be used in `event` creation for tournament record.

```js
const categories = [
  {
    type: eventConstants.AGE,
    categoryName: 'U18',
  },
  {
    type: eventConstants.AGE,
    categoryName: 'U16',
  },
  {
    type: eventConstants.RATING,
    categoryName: 'WTN',
  },
];
engine.setTournamentCategories({ categories });
```

---

## setTournamentDates

Accepts an ISO String Date;

Set tournament `startDate` and `endDate` in one method call. Also cleans up `matchUp` schedules that are invalid due to date changes, and updates court `dateAvailability`.

```js
engine.setTournamentDates({ startDate, endDate });
```

## setTournamentName

```js
const tournamentName = 'CourtHive Challenge';
engine.setTournamentName({
  tournamentName,
});
```

---

## setTournamentNotes

```js
engine.setTournamentNotes({ notes });
```

---

## setTournamentStatus

```js
engine.setTournamentStatus({ status: CANCELLED });
```

---

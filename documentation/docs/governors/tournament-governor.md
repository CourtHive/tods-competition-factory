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

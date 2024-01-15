---
title: Tournament Governor
---

```js
import { governors: { tournamentGovernor }} from 'tods-competition-factory';
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

## removeExtension

Removes an extension from all `tournamentRecords` loaded into `competitionEngine`.

```js
competitionEngine.removeExtension({ name, discover: true });
```

---

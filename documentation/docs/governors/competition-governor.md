---
title: Competition Governor
---

Functions which are applicable to situations where multiple `tournamentRecords` are held in shared state.

```js
import { governors: { competitionGovernor }} from 'tods-competition-factory';
```

## linkTournaments

Links all tournaments currently loaded in state.

```js
engine.linkTournaments();
```

---

## unlinkTournament

Unlink the tournament specified by `tournamentId` from other tournaments loaded in state.

```js
engine.unlinkTournament({ tournamentId });
```

---

## unlinkTournaments

Removes links between all tournaments currently loaded in state.

```js
engine.unlinkTournaments();
```

## removeExtension

Removes an extension from all `tournamentRecords` loaded into shared state.

```js
engine.removeExtension({ name, discover: true });
```

---

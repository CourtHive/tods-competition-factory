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
competitionEngine.linkTournaments();
```

---

## unlinkTournament

Unlink the tournament specified by `tournamentId` from other tournaments loaded in state.

```js
competitionEngine.unlinkTournament({ tournamentId });
```

---

## unlinkTournaments

Removes links between all tournaments currently loaded in state.

```js
competitionEngine.unlinkTournaments();
```

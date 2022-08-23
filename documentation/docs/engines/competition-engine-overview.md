---
title: Competition Engine
---

**competitionEngine** operates on a multiple tournament object, or `tournamentRecords`.

```js
import { competitionEngine } from 'tods-competition-factory';
```

The `competitionEngine` is a state machine that performs mutations across multiple `tournamentRecords`.

```js
competitionEngine.setState(tournamentRecord); // a single tournamentRecord
competitionEngine.setState(tournamentRecords); // an object containing multiple tournamentRecords { [tournamentId]: tournamentRecord }
competitionEngine.setState([tournamentRecord]); // an array of tournamentRecords
```

All tournamentEngine methods which make a mutation return either `{ success: true }` or `{ error }`

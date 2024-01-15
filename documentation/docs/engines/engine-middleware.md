---
title: Engine Middleware
---

Before each factory function invocation, parameters are passed through engine middleware which resolves `event` and `drawDefinition` from provided identifiers.

```js
askEngine.getEvent({ drawId }); // derivation of event is handled by middleware
```

## Tournament

Since the engine shared state can hold multiple `tournamentRecords`, passing `tournamentId` as a parameter ensures that functions are performed on the correct tournament.

```js
const { participants } = askEngine.getParticipants({ tournamentId });
```

Passing `tournamentId` is unnecessary when there is only one tournament in state, or when `setTournamentId(tournamentId)` has been called.

```js
import { askEngine, globalState: { setTournmentId }} from 'tods-competition-factory';

setTournamentId(tournamentId);

// - or -
askEngine.setTourmamentId(touramentId);
```

## Disable middleware

To disable middleware, pass the parameter `_middleware: false`:

```js
askEngine.getEvent({ drawId, _middleware: false }); // function invocation will fail
```

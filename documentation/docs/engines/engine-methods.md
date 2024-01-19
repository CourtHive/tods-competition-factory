---
title: Engine Methods
---

## importMethods

Imports methods into shared factory state.

```ts
type MethodsObject = {
  { [key]: function | MethodObject}
}

engine.importMethods(methods: MethodsObject, traverse?: boolean | string[], maxDepth?: number);
```

---

## getTournament

```js
engine.getTournament(params?)
```

---

## getState

```js
engine.getState = (params?) =>
```

---

## reset

```js
engine.reset();
```

---

## devContext

```js
engine.devContex(contextCriteria);
```

---

## getDevContext

```js
engine.getDevContext(contextCriteria);
```

---

## newTournamentRecord

```js
engine.newTournamentRecord(params);
```

---

## setState

See [Global State](/docs/engines/global-state#setstate)

```js
engine.setState(tournamentRecords, deepCopyOption, deepCopyAttributes);
```

---

## setTournamentId

```js
engine.setTournamentId(tournamentId);
```

---

## getTournamentId

```js
engine.getTournamentId();
```

---

## setTournamentRecord

```js
engine.setTournamentRecord();
```

---

## removeTournamentRecord

```js
engine.removeTournamentRecord(tournamentId);
```

---

## removeUnlinkedTournamentRecords

```js
engine.removeUnlinkedTournamentRecords();
```

---

## version

Returns NPM package version. Can be used in configurations that utilize Competition Factory engines on both client and server to ensure equivalency.

```js
const version = engine.version();
```

---

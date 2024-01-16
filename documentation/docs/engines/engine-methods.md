---
title: Engine Methods
---

engine.importMethods(methods);

---

engine.getTournament(params?)

---

engine.getState = (params?) =>

---

engine.reset();

---

engine.devContex(contextCriteria);

---

engine.getDevContext(contextCriteria);

---

engine.newTournamentRecord(params);

---

## setState

See [Global State](/docs/engines/global-state#setstate)

```js
engine.setState(tournamentRecords, deepCopyOption, deepCopyAttributes);
```

---

engine.setTournamentId(tournamentId);

---

engine.getTournamentId();

---

engine.setTournamentRecord();

---

engine.removeTournamentRecord(tournamentId);

---

engine.removeUnlinkedTournamentRecords();

---

## version

Returns NPM package version. Can be used in configurations that utilize Competition Factory engines on both client and server to ensure equivalency.

```js
const version = engine.version();
```

---

---
title: Global State
---

## devContext

Setting devContext(true) bypasses **try {} catch (err) {}** code block and in some cases enables enhanced logging

```js
getDevContext(true);
```

---

## getState

Returns a deep copy of `tournamentRecords` which have been loaded, along with currently selected `tournamentId`.

```js
const { tournamentId, tournamentRecords } = getState({
  convertExtensions, // optional - convert extensions to '_' prefixed attributes
  removeExtensions, // optional - strip all extensions out of tournamentRecord
});
```

---

## removeTournamentRecord

Removes a tournamentRecord from shared state.

```js
removeTournamentRecord(tournamentId);
```

---

## setState

Loads tournament records into [Global State](/docs/engines/global-state); supports both an array of tournamentRecords and an object with tournamentId keys.

```js
const tournamentRecords = [tournamentRecord];
// or const tournamentRecords = { [tournamentId]: tournamentRecord }

setsState(tournamentRecords, deepCopy, deepCopyConfig);
```

:::info
By default a deep copy of the `tournamentRecords` is made so that mutations do not affect the source objects. An optional boolean parameter, _deepCopy_ can be set to false to override this default behavior.
:::

:::note
`deepCopyConfig` is an optional configuration for `makeDeepCopy`. In server configurations when `deepCopy` is FALSE and `tournamentRecords` are retrieved from Mongo, for instance, there are scenarios where nodes of the JSON structure contain prototypes which cannot be converted.
:::

```js
const deepCopyConfig = {
  ignore, // optional - either an array of attributes to ignore or a function which processes attributes to determine whether to ignore them
  toJSON, // optional - an array of attributes to convert to JSON if the attribute in question is an object with .toJSON property
  stringify, // optional - an array of attributes to stringify
  modulate, // optional - function to process every attribute and return custom values, or undefined, which continues normal processing
};
```

---

## setTournamentRecord

Adds a tournamentRecord to shared engine state, or overwrite/replace an existing `tournamentRecord` with the same `tournamentId`.

```js
setTournamentRecord(tournamentRecord);
```

---

## setTournamentId

Sets a tournamentRecord in shared state as the 'default' tournament for invoked functions.

```js
setTournamentId(tournamentId);
```

---

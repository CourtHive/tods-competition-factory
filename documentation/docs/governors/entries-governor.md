---
title: Entries Governor
---

```js
import { governors: { entriesGovernor }} from 'tods-competition-factory';
```

## addDrawEntries

Bulk add an array of `participantIds` to a specific **stage** of a draw with a specific **entryStatus**. Will fail if `participantIds` are not already present in `event.entries`. Use `addEventEntries` to add to both `event` and `drawDefinition` at the same time.

```js
engine.addDrawEntries({
  entryStage: MAIN, // optional
  entryStatus: ALTERNATE, // optional
  ignoreStageSpace, // optional boolean to disable checking available positions
  entryStageSequence, // optional - applies to qualifying
  autoEntryPositions, // optional - keeps entries ordered by entryStage/entryStatus and auto-increments
  participantIds,
  eventId,
  drawId,
});
```

---

## addEventEntries

Adds `participantIds` to `event.entries`; optionally pass drawId to add participantIds to `flightProfile.flight[].drawEntries` at the same time.

:::note

Will **_not_** throw an error if unable to add entries into specified `flightProfile.flight[].drawEntries`,
which can occur if a `drawDefinition` has already been generated and an attempt is made to add
a participant with `entryStatus: DIRECT_ACCEPTANCE`.

:::

```js
engine.addEventEntries({
  entryStatus: ALTERNATE, // optional; defaults to DIRECT_ACCEPTANCE
  entryStage: MAIN, // optional; defaults to MAIN
  autoEntryPositions, // optional - keeps entries ordered by entryStage/entryStatus and auto-increments
  participantIds,
  enforceGender, // optional - defaults to true
  eventId,
  drawId, // optional - will add participantIds to specified flightProfile.flight[].drawEntries and drawDefinition.entries (if possible)
});
```

---

## addEventEntryPairs

Add **PAIR** participant to an event. Creates new `{ participantType: PAIR }` participants if the combination of `individualParticipantIds` does not already exist.

```js
engine.addEventEntryPairs({
  allowDuplicateParticipantIdPairs, // optional - boolean - allow multiple pair participants with the same individualParticipantIds
  uuids, // optional - array of UUIDs to use for newly created pairs
  entryStatus: ALTERNATE, // optional
  entryStage: QUALIFYING, // optional
  participantIdPairs,
  eventId,
});
```

---

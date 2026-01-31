---
title: Entries Governor
---

```js
import { entriesGovernor } from 'tods-competition-factory';
```

## addDrawEntries

Bulk add an array of `participantIds` to a specific **stage** of a draw with a specific **entryStatus**. Will fail if `participantIds` are not already present in `event.entries`. Use `addEventEntries` to add to both `event` and `drawDefinition` at the same time.

```js
engine.addDrawEntries({
  suppressDuplicateEntries, // do not throw error on duplicates; instead notify to DATA_ISSUE subscribers
  ignoreStageSpace, // optional boolean to disable checking available positions
  entryStageSequence, // optional - applies to qualifying
  autoEntryPositions, // optional - keeps entries ordered by entryStage/entryStatus and auto-increments
  entryStatus: ALTERNATE, // optional
  entryStage: MAIN, // optional
  participantIds,
  eventId,
  drawId,
});
```

---

## addEventEntries

Adds `participantIds` to `event.entries`; optionally pass drawId to add participantIds to `flightProfile.flight[].drawEntries` at the same time.

Supports optional validation of participant eligibility against event category constraints (age ranges, rating requirements).

:::note

Will **_not_** throw an error if unable to add entries into specified `flightProfile.flight[].drawEntries`,
which can occur if a `drawDefinition` has already been generated and an attempt is made to add
a participant with `entryStatus: DIRECT_ACCEPTANCE`.

:::

```js
engine.addEventEntries({
  suppressDuplicateEntries, // do not throw error on duplicates; instead notify to DATA_ISSUE subscribers
  entryStatus: ALTERNATE, // optional; defaults to DIRECT_ACCEPTANCE
  entryStage: MAIN, // optional; defaults to MAIN
  autoEntryPositions, // optional - keeps entries ordered by entryStage/entryStatus and auto-increments
  enforceCategory, // optional - validate against event category (age/rating); defaults to false
  enforceGender, // optional - validate gender; defaults to true
  participantIds,
  eventId,
  drawId, // optional - will add participantIds to specified flightProfile.flight[].drawEntries and drawDefinition.entries (if possible)
});
```

### Category Validation

When `enforceCategory: true`, validates participants against event category constraints:

**Age Validation**:

- Participant must be valid throughout entire event period (start to end date)
- Requires `person.birthDate` if age restrictions exist
- Combined age categories (e.g., `C50-70`) are automatically skipped for individuals

**Rating Validation**:

- Participant must have rating matching `category.ratingType`
- Rating value must fall within `ratingMin`/`ratingMax` range
- Uses most recent rating from participant's scale items

**Rejection Response**:

```js
const result = engine.addEventEntries({
  participantIds: ['player1', 'player2', 'player3'],
  enforceCategory: true,
  eventId,
});

if (result.error) {
  // result.context.categoryRejections contains detailed rejection information
  result.context.categoryRejections.forEach((rejection) => {
    console.log(`${rejection.participantName}:`);
    rejection.rejectionReasons.forEach((reason) => {
      console.log(`  - ${reason.reason}`);
      console.log(`    Details:`, reason.details);
    });
  });
}
```

**See:** [Entries - Category Validation](/docs/concepts/events/entries#category-validation) for comprehensive documentation and examples.

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

## checkValidEntries

```js
const { error, success } = engine.checkValidEntries({
  consideredEntries, // optional array of entries to check
  enforceGender, // optional boolean - defaults to true
  eventId, // required
});
```

---

## destroyGroupEntry

Removes a "grouping" entry from a event and adds the `individualParticipantIds` to entries. Grouping entries are `participantType` **TEAM** and **PAIR**, both of which include `individualParticipantIds`.

```js
engine.destroyGroupEntry({
  participantId,
  eventId,

  entryStatus, // optional - new entryStatus for individualParticipantIds
  removeGroupParticipant, // optional - removes group participant from tournament participants
});
```

---

## destroyPairEntry

Removes a `{ participantType: PAIR }` entry from an event and adds the individualParticipantIds to entries as entryStatus: UNGROUPED

```js
engine.destroyPairEntry({
  participantId,
  eventId,
});
```

---

## modifyEntriesStatus

Modify the entryStatus of participants already in an event or flight/draw. Does not allow participants assigned positions in structures to have an entryStatus of WITHDRAWN.

```js
const result = engine.modifyEntriesStatus({
  autoEntryPositions, // optional - keeps entries ordered by entryStage/entryStatus and auto-increments
  participantIds, // ids of participants whose entryStatus will be modified
  entryStatus, // new entryStatus
  entryStage, // optional - e.g. QUALIFYING
  eventSync, // optional - if there is only a single drawDefinition in event, keep event.entries in sync
  extension, // optional - { name, value } - add if value; removes if value is undefined
  eventId, // id of event where the modification(s) will occur
  drawId, // optional - scope to a specific flight/draw
  stage, // optional - scope to a specific stage
});
```

---

## modifyEventEntries

Modify the entries for an event. For DOUBLES events automatically create PAIR participants if not already present.

```js
engine.modifyEventEntries({
  entryStatus = DIRECT_ACCEPTANCE,
  unpairedParticipantIds = [],
  participantIdPairs = [],
  entryStage = MAIN,
  eventId,
})
```

---

## setEntryPosition

Set entry position a single event entry

```js
engine.setEntryPosition({
  entryPosition,
  participantId,
  eventId, // optional if drawId is provided
  drawId, // optional if eventId is provided
});
```

---

## setEntryPositions

Set entry position for multiple event entries.

```js
engine.setEntryPositions({
  entryPositions, // array of [{ entryPosition: 1, participantId: 'participantid' }]
  eventId, // optional if drawId is provided
  drawId, // optional if eventId is provided
});
```

---

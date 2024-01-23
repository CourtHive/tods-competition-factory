---
title: Event Governor
---

```js
import { eventGovernor } from 'tods-competition-factory';
```

## addDrawDefinition

Adds a drawDefinition to an event in a tournamentRecord. Called after [generateDrawDefinition](/docs/governors/generation-governor#generatedrawdefinition).

```js
const { drawDefinition, error } = engine.generateDrawDefinition(drawDefinitionValues);
if (!error) {
  const result = engine.addDrawDefinition({
    modifyEventEntries, // event.entries[{entryStatus}] are modified to match draw.entries[{entryStatus}]
    existingDrawCount, // number of draws that exist in the event, used to check that two clients don't attempt to add simultaneously
    allowReplacement, // optional - defaults to false
    checkEntryStatus, // optional - defualts to false
    drawDefinition,
    eventId,
    flight, // optional - pass flight definition object for integrity check
  });
}
```

---

## addEvent

Add an event object to a tournamentRecord.

```js
engine.addEvent({ event });
```

---

## addFlight

```js
engine.addFlight({
  drawEntries, // optional
  drawName,
  eventId,
  drawId, // optional -- if scenario involves client and server side tournamentEngines, provide { drawId: UUID() }
  stage,
});
```

---

## assignSeedPositions

Assign **seedNumbers** to **participantIds** within a target draw structure.

- Provides the ability to assign seeding _after_ a structure has been generated
- To be used _before_ participants are positioned

**seedNumber** is unique while **seedValue** can be any string representation, e.g `"5-8"`

```js
engine.assignSeedPositions({
  assignments, // [{ seedNumber: 1, seedValue: '1', participantId: 'pid' }];
  structureId,
  eventId,
  drawId,

  stage, // opional; defaults to { stage: MAIN }
  stageSequence, // optional; defaults to { stageSequence: 1 }
  useExistingSeedLimits, // optional; restrict ability to assign seedNumbers beyond established limit
});
```

---

## attachFlightProfile

Attaches a `flightProfile` to the `event` specified by `eventId`. A `flightProfile` is first generated with `generateFlightProfile()`.

```js
engine.attachFlightProfile({ flightProfile, eventId });
```

---

## deleteDrawDefinitions

Remove `drawDefinitions` from an `event`. An audit timeItem is added to the tournamentRecord whenever this method is called. If `autoPublish: true` (default behavior) then if a deleted draw was published then the `event` to which it belongs will be re-published.

```js
engine.deleteDrawDefinitions({
  autoPublish, // optional - defaults to true.
  auditData, // object with attributes to be added to drawDeletions extension
  drawIds: [drawId],
  eventId,
  force, // boolean - override error when scores present
});
```

---

## deleteEvents

```js
engine.deleteEvents({ eventIds });
```

---

## deleteFlightAndFlightDraw

Removes flight from `event` flightProfile as well as associated `drawDefinition` (if generated).

```js
engine.deleteFlightAndFlightDraw({
  autoPublish, // optional - defaults to true.
  auditData, // object with attributes to be added to drawDeletions extension
  eventId,
  drawId,
  force, // boolean - override error when scores present
});
```

---

## deleteFlightProfileAndFlightDraws

Removes flightProfiles and all associated drawDefinitions from a specified event.

```js
engine.deleteFlightProfileAndFlightDraws({
  auditData, // object with attributes to be added to drawDeletions extension
  eventId,
  force, // boolean - override error when scores present
});
```

---

## getCategoryAgeDetails

Parses `ageCategoryCode` to determine min/max eligible birthdates and min/max age. Category age/birthdate boundaries can be specified using other attributes.
If attributes are combined will sanity check correspondence and return an array of any encountered errors.

```js
const {
} = engine.getCategoryAgeDetails({
  consideredDate, // returns either supplied value or date when invoked
  combinedAge, // boolean indicating that ageMax and ageMin are combined values
  ageMaxDate,
  ageMinDate,
  ageMax,
  ageMin,
  errors,
} = engine.getCategoryAgeDetails({
  consideredDate, // optional - date string 'YYYY-MM-DD'; defaults to current date
  category: {
    ageCategoryCode, // TODS code, e.g. 'U18', '18U', '18O', 'O18', '8O-U18', 'C50-70'
    categoryName, // when no ageCategoryCode is provided, an attempt is made to find in categoryName
    ageMaxDate, // latest/most recent date acceptable for eligibilty
    ageMinDate, // earliest date acceptable for eligibility
    ageMax, // maximum age acceptable for eligibility
    ageMin, // minimum age acceptable for eligibility
  },
});
```

---

## modifyEvent

```js
event.modifyEvent({
  eventUpdates: {
    eventGender, // optional - must validate against current event entries, if any
    eventType, // optional - must validate against current event entries, if any
    eventName, // optional
  },
  eventId,
});
```

---

## modifyEventMatchUpFormatTiming

```js
engine.modifyEventMatchUpFormatTiming({
  recoveryMinutes,
  averageMinutes,
  matchUpFormat,
  eventId,
});
```

---

## modifyPairAssignment

Modifies an individualParticipantId within a PAIR particiapnt entered into an event or draw. Will clean up (delete) any PAIR participants that are not entered into any other draws or events.

```js
engine.modifyPairAssignment({
  replacementIndividualParticipantId,
  existingIndividualParticipantId,
  participantId,
  eventId, // optional if drawId is provided
  drawId, // optional if eventId is provided; scopes change to specified draw
  uuids, // optional array of uuids for use when generating new participant
});
```

---

## modifyTieFormat

Both modifies the `tieFormat` on the target `event`, `drawDefinition`, `structure` or `matchUp` and adds/deletes `tieMatchUps` as necessary.

```js
engine.modifyTieFormat({
  modifiedTieFormat, // will be compared to existing tieFormat that is targeted and differences calculated
  structureId, // required if modifying tieFormat for a structure
  matchUpId, // required if modifying tieFormat for a matchUp
  eventId, // required if modifying tieFormat for a event
  drawId, // required if modifying tieFormat for a drawDefinition or a structure
});
```

---

## promoteAlternates

```js
engine.promoteAlternates({
  participantIds,
  // either drawId or eventId are REQUIRED
  eventId, // optional if drawId proided
  drawId, // optional if eventId proided
});
```

---

## refreshEventDrawOrder

---

## removeEventEntries

Removes `event.entries` with integrity checks.

Filters `participantIds` by specified `entryStatuses` and/or `stage`. If no `participantIds` are provided, removes all `entries` that match both `entryStatuses` and `stage`.

```js
engine.removeEventEntries({
  autoEntryPositions, // optional - keeps entries ordered by entryStage/entryStatus and auto-increments
  participantIds, // optional array of participantIds to remove
  entryStatuses, // optional array of entryStatuses to remove
  stage, // optional - remove entries for specified stage
  eventId,
});
```

---

## removeEventExtension

```js
engine.removeEventExtension({ eventId, name });
```

---

## removeEventMatchUpFormatTiming

```js
engine.removeEventMatchUpFormatTiming({ eventId });
```

---

## removeScaleValues

Removes scale values for participants in a particular event. Optionally restrict by draw or stage.

```js
engine.removeScaleValues({
  scaleAttributes, // { scaleType, scaleName, eventType }
  scaleName, // optional - override default scaleName, event.category.categoryName || event.category.ageCategoryCode
  drawId, // optional - to scope participants to entries in a specific draw
  stage, // optinal - scope participants to entries in a specific stage of draw
  eventId,
});
```

---

## removeSeeding

```js
engine.removeSeeding({
  entryStatuses, // optional array of entryStatues to consider
  scaleName, // optional - override default scaleName, event.category.categoryName || event.category.ageCategoryCode
  drawId, // optional - to scope participants to entries in a specific draw
  stage, // optinal - scope participants to entries in a specific stage of draw
  eventId,
});
```

---

## setEventDates

Where startDate and/or endDate are strings 'YYYY-MM-DD'. Can be used to set `startDate` and `endDate` independently.

```js
engine.setEventDates({ eventId, startDate, endDate });
```

---

## setEventDisplay

Defines publish status for attributes of `participants` and `matchUp` schedules which are returned by [getEventData](/docs/governors/query-governor#geteventdata) and [competitionScheduleMatchUps](/docs/governors/query-governor#competitionschedulematchups).

```js
const displaySettings = {
  draws: {
    default: {
      participantAttributes: { [key]: boolean },
      // an array of attribute settings to be applied to specified dates
      scheduleDetails: [
        {
          attributes: { scheduledTime: false },
          dates: [], // empty array or undefined specifies that attribute setting apply to all scheduledDates
        },
      ],
    },
    [drawId]: {},
  },
};

engine.setEventDisplay({
  displaySettings,
  eventId,
});
```

---

## updateDrawIdsOrder

Updates the `drawOrder` attribute of all `drawDefinitions` within an event. The `drawOrder` attribute can be used for sorting or for differentiating `drawDefinitions` for the award of rankings points, when "flighting" separates participants by some `scaleValue`.

```js
engine.updateDrawIdsOrder({
  eventId,
  orderedDrawIdsMap: {
    'id-Of-draw-1': 1,
    'id-of-draw-2': 2,
  },
});
```

---

## validateCategory

```js
engine.validateCategory({ category });
```

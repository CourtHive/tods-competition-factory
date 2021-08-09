---
name: API
title: Tournament Engine API
---

All tournamentEngine methods return either `{ success: true }` or `{ error }`

## addCourt

Add a court to a Venue. See [Scheduling](/docs/concepts/scheduling).

```js
const court = {
  altitude, // optional
  courtDimensions, // optional
  courtId, // generated automatically if not provided
  courtName,
  dateAvailability, // optional - see below
  latitude, // optional
  longitude, // optional
  onlineResources,  // optional
  pace, // optional - string;
  surfaceCategory, SurfaceCategoryEnum;
  surfaceType, // string; see: https://www.itftennis.com/en/about-us/tennis-tech/recognised-courts/
  surfacedDate?: Date;
}
tournamentEngine.addCourt({ venueId, court });
```

---

## addCourts

Convenience function to bulk add courts to a Venue. Only adds **dataAvailability** and **courtName**. See [Scheduling](/docs/concepts/scheduling).

```js
const dateAvailability = [
  {
    date: '2020-01-01T00:00', // if no date is provided then this profile will be used as default
    startTime: '07:00',
    endTime: '19:00',
    bookings: [
      { startTime: '07:00', endTime: '08:30', bookingType: 'PRACTICE' },
      { startTime: '08:30', endTime: '09:00', bookingType: 'MAINTENANCE' },
      { startTime: '13:30', endTime: '14:00', bookingType: 'MAINTENANCE' },
    ],
  },
];
tournamentEngine.addCourts({
  venueId,
  courtsCount: 3, // optional, can be added/modified later
  courtNames: ['Court 1', 'Court 2', 'Court 3'], // optional
  dateAvailability, // optional
});
```

---

## addDrawDefinition

Adds a drawDefinition to an event in a tournamentRecord. Called after [generateDrawDefinition](#generatedrawdefinition).

```js
const { drawDefinition, error } =
  tournamentEngine.generateDrawDefinition(drawDefinitionValues);
if (!error) {
  const result = tournamentEngine.addDrawDefinition({
    eventId,
    drawDefinition,
  });
}
```

---

## addDrawDefinitionExtension

Add an extension to a drawDefinition.

```js
tournamentEngine.addDrawDefinitionExtension({
  extension: {
    name: 'extension name',
    value: {},
  },
});
```

---

## addDrawEntries

Bulk add an array of `participantIds` to a specific **stage** of a draw with a specific **entryStatus**. Will fail if `participantIds` are not already present in `event.entries`. Use `addEventEntries` to add to both `event` and `drawDefinition` at the same time.

```js
tournamentEngine.addDrawEntries({
  drawId,
  eventId,
  participantIds,
  entryStage: MAIN, // optional
  entryStatus: ALTERNATE, // optional
  autoEntryPositions, // optional - keeps entries ordered by entryStage/entryStatus and auto-increments
});
```

---

## addEvent

Add an event object to a tournamentRecord.

```js
tournamentEngine.addEvent({ event });
```

---

## addEventEntries

Adds `participantIds` to `event.entries`; optionally pass drawId to add participantIds to `flightProfile.drawEntries` at the same time.

:::note

Will **_not_** throw an error if unable to add entries into specified `flightProfile.drawEntries`,
which can occur if a `drawDefinition` has already been generated and an attempt is made to add
a participant with `entryStatus: DIRECT_ACCEPTANCE`.

:::

```js
tournamentEngine.addEventEntries({
  eventId,
  participantIds,
  stage: MAIN, // optional
  entryStatus: ALTERNATE, // optional
  autoEntryPositions, // optional - keeps entries ordered by entryStage/entryStatus and auto-increments
  drawId, // optional - will add participantIds to specified flightProfile.flight[].drawEntries and drawDefinition.entries (if possible)
});
```

---

## addEventEntryPairs

Add **PAIR** participant to an event. Creates new `{ participantType: PAIR }` participants if the combination of `individualParticipantIds` does not already exist.

```js
tournamentEngine.addEventEntryPairs({
  eventId,
  participantIdPairs,
  entryStatus: ALTERNATE, // optional
  entryStage: QUALIFYING, // optional
  uuids, // optional - array of UUIDs to use for newly created pairs
  allowDuplicateParticipantIdPairs, // optional - boolean - allow multiple pair participants with the same individualParticipantIds
});
```

---

## addEventExtension

```js
tournamentEngine.addEventExtension({
  extension: {
    name: 'extension name',
    value: {},
  },
});
```

---

## addFlight

```js
tournamentEngine.addFlight({
  eventId,
  stage,
  drawName,
  drawId, // optional -- if scenario involves client and server side tournamentEngines, provide { drawId: UUID() }
  drawEntries, // optional
});
```

---

## addIndividualParticipantIds

Adds individualParticipantIds to GROUP or TEAM participants

```js
tournamentEngine.addIndividualParticipantIds({
  groupingParticipantId,
  individualParticipantIds,
  removeFromOtherTeams, // optional boolean
});
```

---

## addMatchUpEndTime

```js
const endTime = '2020-01-01T09:05:00Z';
tournamentEngine.addMatchUpEndTime({
  drawId,
  matchUpId,
  endTime,
  disableNotice, // when disabled subscribers will not be notified
});
```

---

## addMatchUpOfficial

```js
tournamentEngine.addMatchUpOfficial({
  drawId,
  matchUpId,
  participantId,
  officialType,
  disableNotice, // when disabled subscribers will not be notified
});
```

---

## addMatchUpResumeTime

```js
const resumeTime = '2020-01-01T09:00:00Z';
tournamentEngine.addMatchUpResumeTime({
  drawId,
  matchUpId,
  resumeTime,
  disableNotice, // when disabled subscribers will not be notified
});
```

---

## addMatchUpScheduledDate

```js
const scheduledDate = '2020-01-01';
tournamentEngine.addMatchUpScheduledDate({
  drawId,
  matchUpId,
  scheduledDate,
  disableNotice, // when disabled subscribers will not be notified
});
```

---

## addMatchUpScheduledTime

```js
const scheduledTime = '08:00';
tournamentEngine.addMatchUpScheduledTime({
  drawId,
  matchUpId,
  scheduledTime,
  disableNotice, // when disabled subscribers will not be notified
});
```

---

## addMatchUpScheduleItems

Convenience function to add several schedule items at once.

```js
tournamentEngine.addMatchUpScheduleItems({
  drawId,
  matchUpId,
  schedule: {
    courtId, // requires scheduledDate
    venueId,
    scheduledTime,
    scheduledDate,
    startTime,
    endTime,
  },
  disableNotice, // when disabled subscribers will not be notified
});
```

---

## addMatchUpStartTime

```js
const startTime = '2020-01-01T08:05:00Z';
tournamentEngine.addMatchUpStartTime({
  drawId,
  matchUpId,
  startTime,
  disableNotice, // when disabled subscribers will not be notified
});
```

---

## addMatchUpStopTime

```js
const stopTime = '2020-01-01T08:15:00Z';
tournamentEngine.addMatchUpStopTime({
  drawId,
  matchUpId,
  stopTime,
  disableNotice, // when disabled subscribers will not be notified
});
```

---

## addParticipant

Adds an INDIVIDUAL, PAIR or TEAM participant to tournament participants. Includes integrity checks for `{ participantType: PAIR }` to insure `participant.individualParticipantIds` are valid.

```js
const participantId = UUID();
const participant = {
  participantId, // automatically generated if not provided
  participantRole: COMPETITOR,
  participantType: INDIVIDUAL,
  person: {
    standardFamilyName: 'Family',
    standardGivenName: 'Given',
    nationalityCode, // optional
    sex, // optional
  },
};

tournamentEngine.addParticipant({ participant });
```

---

## addParticipants

Bulk add participants to a tournamentRecord.

```js
tournamentEngine.addParticipants({ participants });
```

---

## addPenalty

Add a penaltyItem to one or more participants.

```js
const createdAt = new Date().toISOString();
const penaltyData = {
  refereeParticipantId, // optional
  participantIds: [participantId],
  penaltyType: BALL_ABUSE,
  penaltyCode: 'Organization specific code', // optional
  matchUpId,
  issuedAt, // optional ISO timeStamp for time issued to participant
  createdAt,
  notes: 'Hit ball into sea',
};
let result = tournamentEngine.addPenalty(penaltyData);
```

---

## addPlayoffStructures

Adds playoff structures to an existing drawDefinition.

```js
tournamentEngine.addPlayoffStructures({
  drawId,
  structureId,
  roundNumbers: [3], // required if no playoffPositions - source roundNumbers which will feed target structures, e.g. [1, 2]
  roundProfiles, // optional - source roundNumbers as Object.keys with depth as Object.values, e.g. [{ 1: 2}, {2: 1}]
  playoffPositions: [3, 4], // required if not provided roundNumbers
  playoffAttributes, // optional - object mapping exitProfiles to structure names, e.g. 0-1-1 for SOUTH
  exitProfileLimit, // limit playoff rounds generated by the attributes present in playoffAttributes
  playoffStructureNameBase, // optional - base word for default playoff naming, e.g. 'Playoff'
});

// example use of playoffAttributes - will generated playoff structure from 2nd round with structureName: 'bronze'
const playoffAttributes = {
  '0-2': { name: 'BRONZE', abbreviation: 'B' },
};
```

---

## addTournamentExtension

```js
tournamentEngine.addTournamentExtension({
  extension: {
    name: 'extension name',
    value: {},
  },
});
```

---

## addVenue

Adds **venueId** if not provided.

```js
tournamentEngine.addVenue({ venue: { venueName } });
```

---

## addVoluntaryConsolationStage

Modifies the entryProfile for a draw to allow `{ entryStage: VOLUNTARY_CONSOLATION }`

```js
tournamentEngine.addVoluntaryConsolationStage({
  drawId,
  drawSize,
});
```

---

## allEventMatchUps

Returns all matchUps for an event.

```js
const { matchUps } = allEventMatchUps({
  eventId,
  inContext: true, // include contextual details
  nextMatchUps: true, // include winner/loser target matchUp details
  matchUpFilters, // optional; [ scheduleDates: [], courtIds: [], stages: [], roundNumbers: [], matchUpStatuses: [], matchUpFormats: []]
  scheduleVisibilityFilters,
});
```

---

## allTournamentMatchUps

Return an array of all matchUps contained within a tournament. These matchUps are returned **inContext**.

```js
const { matchUps } = tournamentEngine.allTournamentMatchUps({
  scheduleVisibilityFilters,
  matchUpFilters, // optional; [ scheduleDates: [], courtIds: [], stages: [], roundNumbers: [], matchUpStatuses: [], matchUpFormats: []]
  nextMatchUps, // include winnerTo and loserTo matchUps
});
```

---

## alternateDrawPositionAssignment

Replaces an existing drawPosition assignment with an alternateParticipantId. This method is included in `validActions` for [positionActions](../policies/positionActions)

```js
tournamentEngine.alternateDrawPositionAssignment({
  drawId,
  structureId,
  drawPosition,
  alternateParticipantId,
});
```

---

## assignDrawPosition

Low level function normally called by higher order convenience functions.

```js
tournamentEngine.assignDrawPosition({
  drawId,
  structureId,
  drawPosition,
  participantId, // optional - if assigning position to a participant
  qualifier, // optional boolean, if assigning a space for a qualifier
  bye, // optional boolean, if assigning a bye
});
```

---

## assignMatchUpCourt

```js
tournamentEngine.assignMatchUpCourt({
  drawId, // drawId where matchUp is found
  matchUpId,
  courtId,
  courtDayDate, // ISO date string
});
```

---

## assignMatchUpVenue

```js
tournamentEngine.assignMatchUVenue({
  drawId, // drawId where matchUp is found
  matchUpId,
  venueId,
});
```

---

## assignSeedPositions

Assign **seedNumbers** to **participantIds** within a target draw structure.

- Provides the ability to assign seeding _after_ a structure has been generated
- To be used _before_ participants are positioned

**seedNumber** is unique while **seedValue** can be any string representation, e.g `"5-8"`

```js
let assignments = [{ seedNumber: 1, seedValue: 1, participantId }];
tournamentEngine.assignSeedPositions({
  eventId,
  drawId,
  structureId,
  assignments,

  stage, // opional; defaults to { stage: MAIN }
  stageSequence, // optional; defaults to { stageSequence: 1 }
  useExistingSeedLimits, // optional; restrict ability to assign seedNumbers beyond established limit
});
```

---

## assignTieMatchUpParticipantId

Used when interactively creating `{ participantType: PAIR }` participants.

---

## attachEventPolicy

Attaches a policy to an event within a tournamentRecord.

See [Policies](../concepts/policies).

```js
tournamentEngine.attachEventPolicy({
  eventId,
  policyDefinition: SEEDING_POLICY,
});
```

---

## attachPolicy

Attaches a policy to a tournamentRecord.

See [Policies](../concepts/policies).

```js
tournamentEngine.attachPolicy({ policyDefinition: SEEDING_POLICY });
```

---

## automatedPositioning

Positions participants in a draw structure.

See [Policies](../concepts/policies).

```js
tournamentEngine.automatedPositioning({ drawId, structureId });
```

---

## autoSeeding

```js
const { scaleItemsWithParticipantIds } = tournamentEngine.autoSeeding({
  eventId,
  policyDefinition, // seeding policyDefinition determines the # of seeds for given participantCount/drawSize
  scaleAttributes, // { scaleType, scaleName, }
  scaleName, // Optional - defaults to scaleAttributes.scaleName
  drawSize, // Optional - defaults to calculation based on # of entries
  drawId, // Optional - will use flight.drawEntries or drawDefinition.entries rather than event.entries
  stage, // Optional - filters entries by specified stage

  scaleSortMethod, // Optional - user defined sorting method
  sortDescending, // Optional - defaults to false
});

tournamentEngine.setParticipantScaleItems({
  scaleItemsWithParticipantIds,
});
```

---

## bulkMatchUpStatusUpdate

Provides the ability to update the outcomes of multiple matchUps at once.

```js
const outcomes = [
  {
    eventId,
    drawId,
    matchUpId,
    matchUpFormat,
    matchUpStatus,
    winningSide,
    score,
  },
];
tournamentEngine.bulkMatchUpStatusUpdate({ outcomes });
```

---

## bulkScheduleMatchUps

```js
const schedule = {
  scheduledTime: '08:00',
  scheduledDate: '2021-01-01T00:00', // best practice to provide ISO date string
  venueId,
};
tournamentEngine.bulkScheduleMatchUps({ matchUpIds, schedule });
```

## bulkUpdatePublishedEventIds

Returns a filtered array of publishedEventIds from all eventIds which are included in a bulkMatchUpStatusUpdate. publishedEventIds can be used to determine which events to re-publish.

```js
const { publishedEventIds } = tournamentEngine.bulkUpdatePublishedEventIds({
  outcomes,
});
```

---

## checkInParticipant

Set the check-in state for a participant. Used to determine when both participants in a matchUp are available to be assigned to a court.

```js
tournamentEngine.checkInParticipant({
  drawId,
  matchUpId,
  participantId,
});
```

---

## checkOutParticipant

```js
tournamentEngine.checkOutParticipant({
  drawId,
  matchUpId,
  participantId,
});
```

---

## clearScheduledMatchUps

```js
tournamentEngine.clearScheduledMatchUps({
  ignoreMatchUpStatuses, // optionally specify matchUpStatus values to be ignored
  scheduleAttributes, // optionally specify which attributes should be considered
});
```

---

## deleteCourt

```js
tournamentEngine.deleteCourt({
  courtId,
  force, // override warnings about matchUps scheduled on specified court
});
```

---

## deleteDrawDefinitions

Remove drawDefinitions from an event. An audit timeItem is added to the tournamentRecord whenever this method is called.

```js
tournamentEngine.deleteDrawDefinitions({
  eventId,
  drawIds: [drawId],
});
```

---

## deleteFlightAndFlightDraw

Removes flight from event's flightProfile as well as associated drawDefinition (if generated).

```js
tournamentEngine.deleteFlightAndFlightDraw({ eventId, drawId });
```

---

## deleteFlightProfileAndFlightDraws

Removes flightProfiles and all associated drawDefinitions from a specified event.

```js
tournamentEngine.deleteFlightProfileAndFlightDraws({ eventId });
```

---

## deleteEvents

```js
tournamentEngine.deleteEvents({ eventIds });
```

---

## deleteParticipants

```js
tournamentEngine.deleteParticipants({ paricipantIds });
```

---

## deleteVenue

If a venue has scheduled matchUps then it will not be deleted unless `{ force: true }` in which case all relevant matchUps will be unscheduled.

```js
tournamentEngine.deleteVenue({ venueId, force });
```

---

## deleteVenues

If a venue has scheduled matchUps then it will not be deleted unless `{ force: true }` in which case all relevant matchUps will be unscheduled.

```js
tournamentEngine.deleteVenues({ venueIds, force });
```

---

## destroyGroupEntry

Removes a "grouping" entry from a event and adds the `individualParticipantIds` to entries. Grouping entries are `participantType` **TEAM** and **PAIR**, both of which include `individualParticipantIds`.

```js
tournamentEngine.destroyGroupEntry({
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
tournamentEngine.destroyPairEntry({
  eventId,
  participantId,
});
```

---

## devContext

Setting devContext(true) bypasses **try {} catch (err) {}** code block and in some cases enables enhanced logging

```js
tournamentEngine.devContext(true);
```

---

## eventMatchUps

Returns matchUps for an event grouped by status.

```js
const {
  abandonedMatchUps,
  byeMatchUps,
  completedMatchUps,
  pendingMatchUps,
  upcomingMatchUps,
} = tournamentEngine.eventMatchUps({
  eventId,
  nextMatchUps, // optional boolean; include winner/loser target matchUp details
  matchUpFilters, // optional; [ scheduleDates: [], courtIds: [], stages: [], roundNumbers: [], matchUpStatuses: [], matchUpFormats: []]
  contextFilters,
  tournamentAppliedPolicies,
  scheduleVisibilityFilters,
  inContext: true, // optional - adds context details to all matchUps
});
```

---

## executionQueue

The `executionQueue` method accepts an array of `tournamentEngine` methods and associated parameters,
allowing for multiple queries or mutations in a single API call, which is significant if a client is making a
request of a server and the server needs to prepare context by loading a tournament record.

An additional benefit of the `executionQueue` is that subscribers to `tournamentEngine` events are not notified
until all methods in the queue have completed successfully, and a failure of any one method can be used to roll back state
with the assurance that there are no side-effects caused by subscribers responding to notifications. This also means
that the server context can not be blocked by any long-running external processes.

```js
const result = tournamentEngine.executionQueue([
  {
    method: 'getTournamentParticipants',
    params: { participantFilters: { participantTypes: [PAIR] } },
  },
  {
    method: 'getTournamentParticipants',
    params: { participantFilters: { participantTypes: [INDIVIDUAL] } },
  },
]);
```

---

## findCourt

```js
const { court, venue } = tournamentEngine.findCourt({ courtId });
```

---

## findDrawDefinitionExtension

```js
const { extension } = tournamentEngine.findDrawDefinitionExtension({
  drawId,
  eventId,
  name,
});
```

---

## findEventExtension

```js
const { extension } = tournamentEngine.findEventExtension({ eventId, name });
```

---

## findMatchUp

```js
const {
  matchUp,
  structure, // returned for convenience
} = tournamentEngine.findMatchUp({
  drawId,
  matchUpId,
  inContext, // optional - boolean - returns matchUp with additional attributes
});
```

---

## findParticipant

Find tournament participant by either `participantId` or `personId`.

```js
const { participant } = tournamentEngine.findParticipant({
  participantId,
  personId, // required only if no participantId provided
});
```

---

## findParticipantExtension

```js
const { extension } = tournamentEngine.findParticipantExtension({
  participantId,
  name,
});
```

---

## findPolicy

Find `policyType` either on an event object or the tournamentRecord.

```js
const { policy } = tournamentEngine.findPolicy({
  policyType: POLICY_TYPE_SCORING,
  eventId, // optional
});
```

---

## findTournamentExtension

```js
const { extension } = tournamentEngine.findTournamentExtension({ name });
```

---

## findVenue

Returns a complete venue object. Primarily used internally.

```js
tournamentEngine.findVenue({ venueId });
```

---

## generateDrawDefinition

This is a convenience method which handles most use cases for draw generation.

The `automated` parameter is "truthy" and supports placing only seeded participants and any byes which are adjacent to seeded positions.
Support for this scenario is provided to enable some unique positioning strategies where unseeded participants have some agency in the selection process.

```js
const drawDefinitionValues = {
  eventId, // optional - used to find any avoidance policies to be applied
  drawSize, // number of drawPositions in the first draw structure
  drawType, // optional - defaults to SINGLE_ELIMINATION
  drawName, // cutom name for generated draw structure(s)
  automated, // optional - whether or not to automatically place participants in structures; true/false or 'truthy' { seedsOnly: true }
  matchUpType, // optional - SINGLES, DOUBLES, or TEAM
  matchUpFormat, // optional - default matchUpFormatCode for all contained matchUps
  playoffMatchUpFormat, // optional - relevant for ROUND_ROBIN_WITH_PLAYOFFS
  tieFormat, // optional - { collectionDefinitions, winCriteria } for 'dual' or 'tie' matchUps
  seedsCount, // optional - number of seeds to generate if no seededParticipants provided
  seededParticipants, // optional - { participantId, seedNumber, seedValue }
  seedingScaleName, // optional - custom scale for determining seeded participants
  seedingProfile, // optional - WATERFALL seeding for ROUND_ROBIN structures, CLUSTER or SEPARATE seeding for elimination structures
  qualifyingRound, // optional - used to derive roundLimit
  structureOptions, // optional - for ROUND_ROBIN - { groupSize, playoffGroups }
  staggeredEntry, // optional - accepts non-base-2 drawSizes and generates feed arms for "extra" drawPositions
  policyDefinitions, // optional - seeding or avoidance policies to be used when placing participants
  qualifyingPositions, // optional - number of positions in draw structure to be filled by qualifiers
  finishingPositionNaming, // optional - map of { [finishingPositionRange]: { name: 'customName', abbreviation: 'A' } }
  enforcePolicyLimits, // optional - defaults to true - constrains seedsCount to policyDefinition limits
};

const { drawDefinition } =
  tournamentEngine.generateDrawDefinition(drawDefinitionValues);
```

---

## generateFlightProfile

Splits event entries into `flightsCount` (# of draws). `flightProfile` is an extension on an event which contains attributes to be used by `generateDrawDefinition`.

NOTE: The method returns `{ flightProfile, splitEntries }` for testing; `splitEntries` provides a breakdown on how `event.entries` were split across each `flight` within the `event`.

For an explanation of `scaleAttributes` see [Scale Items](../concepts/scaleItems).

```js
const scaleAttributes = {
  scaleType: RATING,
  eventType: SINGLES,
  scaleName: 'WTN',
  accessor, // optional - string determining how to access attribute if scaleValue is an object
};

const { flightProfile, splitEntries } = tournamentEngine.generateFlightProfile({
  eventId, // event for which entries will be split
  scaleAttributes, // defines participant sort method prior to split
  scaleSortMethod, // optional - function(a, b) {} sort method, useful when scaleValue is an object or further proessing is required
  sortDescending, // optional - default sorting is ASCENDING; only applies to default sorting method.
  flightsCount: 3, // number of draws to be created
  deleteExisting: true, // optional - remove existing flightProfile
  splitMethod: SPLIT_WATERFALL, // optional - defaults to SPLIT_LEVEL_BASED
  drawNames: ['Green Flight', 'Blue Flight'], // optional
  drawNameRoot: 'Flight', // optional - used to generate drawNames, e.g. 'Flight 1', 'Flight 2'
});

const {
  flights: [
    {
      drawId, // unique identifier for generating drawDefinitions
      drawName, // custom name for generated draw
      drawEntries, // entries allocated to target draw
    },
  ],
} = flightProfile;

// use flight information to generate drawDefinition
const {
  flights: [flight],
} = flightProfile;

Object.assign(drawDefinitionValues, flight);
const { drawDefinition } =
  tournamentEngine.generateDrawDefinition(drawDefinitionValues);
```

---

## generateSeedingScaleItems

Used in conjunction with `getEntriesAndSeedsCount` when it is necessary to make use of a custom function for generating `scaledEntries`.

```js
const { scaleItemsWithParticipantIds } =
  tournamentEngine.generateSeedingScaleItems({
    scaledEntries,
    seedsCount,
    scaleAttributes,
    scaleName,
    stageEntries,
  });
```

---

## generateTeamsFromParticipantAttribute

Uses attributes of individual participnts or persons to generate `{ participantType: TEAM }` participants.

Returns count of # of TEAM participants added;

```js
const { participantsAdded } =
  tournamentEngine.generateTeamsFromParticipantAttribute({
    participantAttribute,
    personAttribute, // optional - attribute of person object
    uuids, // optional - uuids to assign to generated participants
  });
```

---

### generateVoluntaryConsolationStructure

Generates a new structure within a `drawDefinition` if any draw entries are present for `{ entryStage: VOLUNTARY_CONSOLATION }`.

```js
tournamentEngine.generateVoluntaryConsolationStructure({
  drawId,
  automated: true, // optional
});
```

---

## getAllEventData

Returns all `matchUps` for all draws in all events along with `tournamentInfo`, `eventInfo`, and `drawInfo`.

```js
const { allEventData } = tournamentEngine.getAllEventData({
  policyDefinition, // optional - allows participant data to be filtered via a privacy policy
});

const { tournamentInfo, eventsData, venuesData } = allEventData;
```

---

## getAllowedDrawTypes

Returns an array of names of allowed Draw Types, if any applicable policies have been applied to the tournamentRecord.

```js
const drawTypes = tournamentEngine.getAllowedDrawTypes();
```

---

## getAllowedMatchUpFormats

Returns an array of TODS matchUpFormat codes for allowed scoring formats, if any applicable policies have been applied to the tournamentRecord.

```js
const drawTypes = tournamentEngine.getAllowedMatchUpFormats();
```

---

## getAvailablePlayoffRounds

If provided a `structureId`, returns rounds of the selected structure which are available for adding playoff structures.

```js
const { playoffRounds, playoffRoundsRanges, positionsPlayedOff } =
  tournamentEngine.getAvailablePlayoffRounds({
    drawId,
    structureId,
  });
```

...For a SINGLE_ELIMINATION struture with drawSize: 16 this would return:

```js
    {
      playoffRounds: [ 1, 2, 3 ],
      playoffRoundsRanges: [
        { round: 1, range: '9-16' },
        { round: 2, range: '5-8' },
        { round: 3, range: '3-4' }
      ]
    }

```

When no `structureId` is provided, returns an array of `availablePlayoffRounds` with entries for each structure in a specified `drawDefinition`.

```js
const { availablePlayoffRounds, positionsPlayedOff } =
  tournamentEngine.getAvailablePlayoffRounds({ drawId });
```

---

## getCourtInfo

```js
const {
  altitude,
  courtId,
  courtName,
  courtDimensions,
  latitude,
  longitude,
  surfaceCategory,
  surfaceType,
  surfaceDate,
  pace,
  notes,
} = tournamentEngine.getCourtInfo({ courtId });
```

---

## getCourts

Returns courts associated with a tournaments; optionall filter by venue(s).

```js
const { courts } = tournamentEngine.getCourts({
  venueId, // optional - return courts for a specific venue
  venueIds, // optional - return courts for specified venues
});
```

---

## getDrawData

Primarily used by `getEventData` for publishing purposes.

```js
const {
  drawInfo: {
    drawActive, // boolean - draw has active matchUps
    drawCompleted, // boolean - all draw matchUps are complete
    drawGenerated, // boolean - draw has structures containing matchUps
    participantPlacements, // boolean - whether any participants have been placed in the draw
  },
  structures,
} = tournamentEngine.getDrawData({ drawDefinition });
```

---

## getDrawParticipantRepresentativeIds

Get the participantIds of participants in the draw who are representing players by observing the creation of the draw.

```js
const { representativeParticipantIds } =
  tournamentEngine.getDrawParticipantRepresentativeIds({
    drawId,
  });
```

---

## getEntriesAndSeedsCount

```js
const { error, entries, seedsCount, stageEntries } =
  tournamentEngine.getEntriesAndSeedsCount({
    eventId,
    policyDefinition, // seeding policy which determines # of seeds for # of participants/drawSize

    drawSize, // optional - overrides number calculaed from entries in either event or draw
    drawId, // optional - scopes entries to a specific flight/drawDefinition
    stage, // optional - scopes entries to a specific stage
  });
```

---

## getEvent

Get an event by either its `eventId` or by a `drawId` which it contains. Also returns `drawDefinition` if a `drawId` is specified.

```js
const {
  event,
  drawDefinition, // only returned if drawId is specified
} = tournamentEngine.getEvent({
  eventId, // optional - find event by eventId
  drawId, // optional - find the event which contains specified drawId
});
```

- @param {string} eventId - id of the event to retreive
- @param {object} context - attributes to be added into each event object.

---

## getEventAppliedPolicies

```js
const { appliedPolicies } = tournamentEngine.getEventAppliedPolicies({
  eventId,
});
```

---

## getEvents

Return **deepCopies** of all events in a tournament record.

```js
const { events } = tournamentEngine.getEvents();
```

---

## getEventProperties

Gather attributes of events which come from other tournament elements, e.g. participants which have rankings/ratings/seedings for a given event.

```js
const {
  entryScaleAttributes,
  hasSeededParticipants,
  hasRankedParticipants,
  hasRatedParticipants,
} = tournamentEngine.getEventProperties({ eventId });
```

... where **entryScaleAttributes** is an array of { prticipantId, participantName, seed, ranking, rating }

---

## getEventData

Returns event information optimized for publishing: `matchUps` have context and separated into rounds for consumption by visualization libraries such as `tods-react-draws`.

See [publishEvent](#publishEvent) for details on `policyDefinition`.

```js
const { eventData } = tournamentEngine.getEventData({
  drawId,
  policyDefinition, // optional
});
const { drawsData, venuesData, eventInfo, tournamentInfo } = eventData;
```

---

## getEventMatchUpFormatTiming

Method is used internally in advanced scheduling to determine averageMatchUp times for matchUps within an event.

Requires an array of `matchUpFormats` either be defined in scoring policy that is attached to the tournamentRecord or an event, or passed in as parameter. `matchUpFormats` can be passed either as an array of strings, or an array of `[{ matchUpFormat }]`.

```js
const { eventMatchUpFormatTiming } =
  tournamentEngine.getEventMatchUpFormatTiming({
    matchUpFormats, // optional - can be retrieved from policy
    categoryType, // optional - categoryType is not part of TODS or event attributes, but can be defined in a policy
    eventId,
  });
```

---

## getMatchUpFormat

Returns `matchUpFormat` codes for specified context(s). Refer to `getMatchUpFormat.test.js` for specfic use cases.

`matchUpFormat` for each matchUp is determined by traversing the hierarchy: `matchUp => stucture => drawDefinition => event`

```js
const {
  matchUpFormat,
  structureDefaultMatchUpFormat,
  drawDefaultMatchUpFormat,
  eventDefaultMatchUpFormat,
} = tournamentEngine.getMatchUpFormat({
  eventId,
  drawId,
  structureId,
  matchUpId,
});
```

---

## getMatchUpFormatTiming

Searches for policy definitions or extensions to determine the `averageMinutes` and `recoveryMinutes` for a given `matchUpFormat`. Extensions are considered to be overrides of policy definitions.

```js
const { averageMinutes, recoveryMinutes } =
  tournamentEngine.getMatchUpFormatTiming({
    defaultAverageMinutes, // optional setting if no matching definition found
    defaultRecoveryMinutes, // optional setting if no matching definition found
    matchUpFormat,
    categoryName, // optional
    categoryType, // optional
    eventType, // optional - defaults to SINGLES; SINGLES, DOUBLES
    eventId, // optional - prioritizes policy definition attached to event before tournament record
  });
```

---

## getMatchUpFormatTimingUpdate

Returns an array of methods/params necessary for updating a remote instance of a tournamentRecord to match a local instance. This method enables multiple "provisional" updates to be made on a local document without contacting a server; support deployments where a server is considered "master".

```js
const { methods } = tournamentEngine.getMatchUpFormatTimingUpdate();
```

---

## getMatchUpScheduleDetails

Returns the latest values for all `matchUp.timeItems`, along with calculated values, that relate to the scheduling of a `matchUp`.

```js
const {
  schedule: {
    time,
    courtId,
    venueId,
    startTime,
    endTime,
    milliseconds,
    scheduledDate,
    scheduledTime,
  },
} = tournamentEngine.getMatchUpScheduleDetails({
  scheduleVisibilityFilters,
  matchUp,
});
```

---

## getMatchUpDailyLimits

Returns player daily match limits for singles/doubles/total matches.

```js
const { matchUpDailyLimits } = tournamentId.getMatchUpDailyLimits();
const { DOUBLES, SINGLES, total } = matchUpDailyLimits;
```

---

## getModifiedMatchUpFormatTiming

Returns `averageTimes` and `recoveryTimes` configuration objects for specified `matchUpFormat`. Useful before calling `modifyMatchUpFormatTiming` to preserve existing modifications.

```js
const { matchUpFormat, averageTimes, recoveryTimes } =
  tournamentEngine.getModifiedMatchUpFormatTiming({
    matchUpFormat, // TODS matchUpFormat code
    event, // optional - include event in scope for search
  });
```

---

## getPairedParticipant

Returns the `{ participantType: PAIR }`, if any, which contains the specified `individualParticipantIds`.

```js
const { participant } = tournamentEngine.getPairedParticipant({
  participantIds: individualParticipantIds,
});
```

---

## getParticipantEventDetails

Returns an array of eventDetails in which a specified `participantId` appears. For details on draw entry within events use `tournamentEngine.getTournamentParticipants({ inContext: true })`.

```js
const { eventDetails } = tournamentEngine.getParticipantEventDetails({
  participantId,
});

const [{ eventName, eventId }] = eventDetails;
```

---

## getParticipantIdFinishingPositions

Returns the Range of finishing positions possible for all participantIds within a draw

```js
const idMap = tournamentEngine.getParticipantIdFinishingPositions({
  drawId,
  byeAdvancements, // optional boolean - whether or not to consider byeAdvancements
});

const { relevantMatchUps, finishingPositionRanges, finishingPositionRange } =
  idMap[participantId];
```

---

## getParticipantMembership

Returns all grouping participants which include `participantId` in `{ individualParticipantIds }`.

```js
const {
  [PAIR]: doublesParticipantIds,
  [GROUP]: groupParticipantIds,
  [TEAM]: teamParticipantIds,
} = tournamentEngine.getParticipantMembership({
  participantId,
});
```

---

## getParticipantScaleItem

Return a ranking or rating or seeding value for a participant, referenced by participantId.

See [Scale Items](../concepts/scaleItems).

```js
const scaleAttributes = {
  scaleType: RATING,
  eventType: SINGLES,
  scaleName: 'WTN',
  accessor, // optional - string determining how to access attribute if scaleValue is an object
};
const {
  scaleItem: { scaleValue },
} = tournamentEngine.getParticipantScaleItem({
  participantId,
  scaleAttributes,
});
```

---

## getParticipantSignInStatus

Participant signInStatus can be either 'SIGNED_IN' or 'SIGNED_OUT' (or undefined). See [modifyParticipantsSignInStatus](#modifyParticipantsSignInStatus).

```js
const signInStatus = tournamentEngine.getParticipantSignInStatus({
  participantId,
});
```

---

## getPolicyDefinition

Finds policyDefinition for either draw (if drawId), event (if eventId), or tournament, in that order. This enables a default policy to be attached to the tournament record and for event-specific or draw-specific policies to override the default(s).

See [Policies](../concepts/policies).

```js
const { policyDefinition } = tournamentEngine.getPolicyDefinition({
  policyType: POLICY_TYPE_SEEDING,
  eventId, // optional
  drawId, // optional
});
```

---

## getPositionAssignments

Returns an array of `positionAssignments` for a structure. Combines `positionAssginments` for child structures in the case of ROUND_ROBIN where `{ structureType: CONTAINER }`.

```js
let { positionAssignments } = getPositionAssignments({
  drawDefinition, // optional if { structure } is provided
  structureId, // optional if { structure } is provided
  structure, // optional if { drawDefinition, structureId } are provided
});

const [{ drawPosition, participantId, qualifier, bye }] = positionAssignments;
```

---

## getScaledEntries

See [Scale Items](../concepts/scaleItems).

```js
const { scaledEntries } = tournamentEngine.getScaledEntries({
  eventId, // optional - not required if provided array of entries
  entries, // optional - overrides use of event.entries
  stage, // optional - filter entries by stage

  scaleAttributes,
  scaleSortMethod, // optional - function(a, b) {} sort method, useful when scaleValue is an object or further proessing is required
  sortDescending, // optional - default sorting is ASCENDING; only applies to default sorting method.
});
```

---

## getSeedsCount

Takes a policyDefinition, drawSize and participantCount and returrns the number of seeds valid for the specified drawSize

```js
const { seedsCount, error } = getSeedsCount({
  drawSizeProgression, // optional - fits the seedsCount to the participantsCount rather than the drawSize
  policyDefinition: SEEDING_USTA,
  participantCount: 15,
  drawSize: 128,
});
```

---

## getState

Returns a deep copy of the current tournamentEngine state.

```js
const { tournamentRecord } = tournamentEngine.getState({
  convertExtensions, // optional - convert extensions to '_' prefixed attributes
});
```

---

## getTournamentParticipants

Returns **deepCopies** of tournament participants filtered by participantFilters which are arrays of desired participant attribute values.

```js
const participantFilters = {
  accessorValues: [{ accessor, value }], // optional - see Accessors in Concepts
  eventEntryStatuses, // boolean
  participantTypes: [INDIVIDUAL],
  participantRoles, [COMPETITOR],
  signInStatus, // specific signIn status
  eventIds, // events in which participants appear
};
const {
  tournamentParticipants,
  participantIdsWithConflicts //  returns array of participantIds which have scheduling conflicts
} = tournamentEngine.getTournamentParticipants({
  inContext, // optional - adds individualParticipants for all individualParticipantIds

  withStatistics, // optional - adds events, machUps and statistics, e.g. 'winRatio'
  withOpponents, // optional - include opponent participantIds
  withEvents, // optional - defaults to true
  withDraws, // optional - defaults to true

  withMatchUps, // optional - include all matchUps in which the participant appears, as well as potentialMatchUps

  convertExtensions, // optional - BOOLEAN - convert extensions so _extensionName attributes
  policyDefinition, // optional - can accept a privacy policy to filter participant attributes
  participantFilters, // optional - filters
});
```

### Implemented participantFilters

- accessorValues: array of accessors and targeted value `[{ accessor, value }]`
- drawEntryStatuses: boolean - participantIds found in draw.entries
- eventEntryStatuses: boolean - participantIds found in event.entries
- eventIds: array of targeted eventIds
- participantIds: array of targeted participantIds
- participantRoles: array of targeted participantRoles
- participantTypes: array of targeted participantTypes
- positionedOnly: participantIds positioned in structures `[true, false, undefined]`
- signInStatus: SIGNED_IN or SIGNED_OUT

---

## getTournamentPersons

Returns **deepCopies** of persons extracted from tournament participants. Each person includes an array of `participantIds` from which person data was retrieved.

```js
const { tournamentPersons } = tournamentEngine.getTournamentPersons({
  participantFilters: { participantRoles: [COMPETITOR] }, // optional - filters
});
```

---

## getTournamentPenalties

Returns an array of all penalties issued during a tournament.

```js
const { penalties } = tournamentEngine.getTournamentPenalties();
```

---

## getTournamentInfo

Returns tournament attributes. Used to attach details to publishing payload by `getEventData`.

```js
const { tournamentInfo } = getTournamentInfo({ tournamentRecord });
const {
  tournamentId,
  tournamentRank,

  formalName,
  tournamentName,
  promotionalName,
  onlineResources,

  localTimeZone,
  startDate,
  endDate,

  hostCountryCode,
  tournamentContacts,
  tournamentAddresses,
} = tournamentInfo;
```

---

## getVenuesAndCourts

Returns an array of all Venues which are part of a tournamentRecord and an aggregation of courts across all venues.

```js
const { venues, courts } = tournamentEngine.getVenuesAndCourts();
```

---

## getVenueData

Returns restricted venue attributes along with information for all associated courts. Used primarily by `getEventData` to return a subset of venue/courts information for publishing purposes.

```js
const {
  venueName,
  venueAbbreviation,
  courtsInfo, // array of courts and associated attributes
} = tournamentEngine.getVenueData({ venueId });
```

---

## isValidMatchUpFormat

Returns boolean indicating whether matchUpFormat code is valid.

```js
const valid = tournamentEngine.isValidMatchUpFormat(matchUpFormat);
```

---

## luckyLoserDrawPositionAssignment

Replaces an existing drawPosition assignment with a luckyLoserParticipantId. This method is included in `validActions` for [positionActions](../policies/positionActions)

```js
tournamentEngine.luckyLoserDrawPositionAssignment({
  drawId,
  structureId,
  drawPosition,
  luckyLoserParticipantId,
});
```

---

## matchUpActions

Return an array of all validActions for a specific matchUp.

```js
const {
  isByeMatchUp, // boolean; true if matchUp includes a BYE
  structureIsComplete, // boolean; true if structure is ready for positioning
  validActions, // array of possible actions given current matchUpStatus
} = tournamentEngine.matchUpActions({
  drawId, // optional - not strictly required; method will find matchUp by brute force without it
  matchUpId,
});

const {
  type, // 'REFEREE', 'SCHEDULE', 'PENALTY', 'STATUS', 'SCORE', 'START', 'END'.
  method, // tournamentEngine method relating to action type
  payload, // attributes to be passed to method
  // additional method-specific options for values to be added to payload when calling method
} = validAction;
```

---

## mergeParticipants

Merge `participants` array with existing tournament participants. Useful when synchronizing with a remote registration service, for example.

```js
tournamentEngine.mergeParticipants({ participants });
```

---

## modifyCourtAvailability

Modifies the `dateAvailability` attribute of a specified court. Warns if existing scheduled matchUps would be affected. See [Scheduling](/docs/concepts/scheduling).

```js
const result = tournamentEngine.modifyCourtAvailability({
  courtId,
  dateAvailability,
  force, // override warning that existing scheduled matchUps exist
});
```

---

## modifyDrawName

```js
tournamentEngine.modifyDrawName({
  eventId,
  drawId,
  drawName,
});
```

---

## modifyEventMatchUpFormatTiming

```js
tournamentEngine.modifyEventMatchUpFormatTiming({
  eventId,
  matchUpFormat,
  averageMinutes,
  recoveryMinutes,
});
```

---

## modifyMatchUpFormatTiming

```js
tournamentEngine.modifyMatchUpFormatTiming({
  matchUpFormat: 'SET3-S:6/TB7',
  averageTimes: [
    {
      categoryNames: [U12, U14],
      minutes: { [DOUBLES]: 110, default: 130 },
    },
    {
      categoryNames: [U16, U18],
      minutes: { [DOUBLES]: 100, default: 120 },
    },
  ],
  recoveryTimes: [
    { categoryNames: [], minutes: { default: 15, [DOUBLES]: 15 } },
  ],
});
```

---

## modifyEntriesStatus

Modify the entryStatus of participants already in an event or flight/draw. Does not allow participants assigned positions in structures to have an entryStatus of WITHDRAWN.

```js
const result = tournamentEngine.modifyEntriesStatus({
  participantIds, // ids of participants whose entryStatus will be modified
  entryStatus, // new entryStatus
  eventId, // id of event where the modification(s) will occur
  drawId, // optional - scope to a specific flight/draw
  stage, // optional - scope to a specific stage

  eventSync, // optional - if there is only a single drawDefinition in event, keep event.entries in sync
  autoEntryPositions, // optional - keeps entries ordered by entryStage/entryStatus and auto-increments
});
```

---

## modifyEventEntries

Modify the entries for an event. For DOUBLES events automatically create PAIR participants if not already present.

```js
tournamentEngine.modifyEventEntries({
  eventId,
  entryStage = MAIN,
  participantIdPairs = [],
  unpairedParticipantIds = [],
  entryStatus = DIRECT_ACCEPTANCE,
})
```

---

## modifyIndividualParticipantIds

Modify `individualParticipantIds` of a grouping participant `{ participantType: TEAM || GROUP }`.

```js
tournamentEngine.devContext(true).modifyIndividualParticipantIds({
  groupingParticipantId, // participant (TEAM or GROUP) to which participantIds are to be added
  individualParticipantIds: newIndividualParticipantIds,
});
```

---

## modifyParticipant

Modifies attributes of a participant with integrity checks to insure valid values for e.g. `{ participantType, participantRole }`. Adds participant if not found.

```js
tournamentEngine.modifyParticipant({
  participant: updatedIndividualParticipant,
});
```

---

## modifyPenalty

```js
const penaltyData = {
  participantIds: [participantId],
  penaltyType: BALL_ABUSE,
  matchUpId,
  issuedAt,
  notes: 'Hit ball into sea',
};
let result = tournamentEngine.addPenalty(penaltyData);
const { penaltyId } = result;

const notes = 'Hit ball into spectator';
const modifications = { notes };
tournamentEngine.modifyPenalty({ penaltyId, modifications });
```

---

## modifyParticipantsSignInStatus

Modify the signInStatus of multiple participants, referenced by participantId.

```js
tournamentEngine.modifyParticipantsSignInStatus({
  participantIds: [participantId],
  signInState: SIGNED_IN,
});
```

---

## modifySeedAssignment

Change the display representation of a seedNumber for a specified `participantId`. This method is included in `validActions` for [positionActions](../policies/positionActions).

```js
tournamentEngine.modifySeedAssignment({
  drawId,
  structureId,
  participantId,
  seedValue, // display representation such as '5-8'
});
```

---

## modifyVenue

See [Scheduling](/docs/concepts/scheduling).

```js
const modifications = {
  venueName,
  venueAbbreviation,
  courts: [
    {
      courtId: 'b9df6177-e430-4a70-ba47-9b9ff60258cb',
      courtName: 'Custom Court 1',
      dateAvailability: [
        {
          date: '2020-01-01',
          startTime: '16:30',
          endTime: '17:30',
        },
      ],
    },
  ],
};
tournamentEngine.modifyVenue({ venueId, modifications });
```

---

## newTournamentRecord

Creates a new tournamentRecord in tournamentEngine state.

```js
tournamentEngine.newTournamentRecord({
  tournamentId, // optional - will be generated if not provided
});

const { tournamentRecord } = tournamentEngine.getState();
```

---

## participantScaleItem

Similar to [getParticipantScaleItem](#getParticipantScaleItem) but takes a `participant` object and doesn't require `tournamentEngine.setState(tournamentRecord)`.

See [Scale Items](../concepts/scaleItems).

```js
const scaleAttributes = {
  scaleType: RATING,
  eventType: SINGLES,
  scaleName: 'WTN',
  accessor, // optional - string determining how to access attribute if scaleValue is an object
};
const {
  scaleItem: { scaleValue },
} = tournamentEngine.participantScaleItem({
  participant,
  scaleAttributes,
});
```

---

## participantScheduledMatchUps

Returns `matchUps` which have been scheduled, organized by `scheduledDate` and sorted by `scheduledTime`.

```js
const { scheduledMatchUps } = tournamentEngine.participantScheduledMatchUps({
  matchUps,
});
```

---

## positionActions

```js
const positionActions = tournamentEngine.positionActions({
  drawId,
  structureId,
  drawPosition,
  policyDefinition: positionActionsPolicy, // optional - policy defining what actions are allowed in client context
});

const {
  isActiveDrawPosition, // boolean
  isByePosition, // boolean
  isDrawPosition, // boolean
  hasPositionAssiged, // boolean
  validActions,
} = positionActions;

const {
  type, // 'ASSIGN', 'LUCKY', 'SWAP', 'BYE', 'REMOVE'
  method, // tournamentEngine method relating to action type
  payload, // attributes to be passed to method
  // additional method-specific options for values to be added to payload when calling method
} = validAction;
```

---

## publishEvent

Utilizes [getEventData](#getEventData) to prepare data for display. Differs from [getEventData](#getEventData) in that it modifies the `publishState` of the event. Subscriptions or middleware may be used to deliver the generated payload for presentation on a public website.

See [Policies](../concepts/policies) for more details on `policyDefinitions`.

```js
const policyDefinition = Object.assign(
  {},
  ROUND_NAMING_POLICY,
  PARTICIPANT_PRIVACY_DEFAULT
);

const { eventData } = tournamentEngine.publishEvent({
  policyDefinition,
  eventId,
  drawIds, // optional - array of drawIds within the event to publish
  structureIds = [], // optional - specify structureIds
  drawIdsToRemove, // optional - add these drawIds to drawIds already published
  drawIdsToAdd, // optional - remove these drawIds from drawIds published
});
```

---

## removeDrawDefinitionExtension

```js
tournamentEngine.removeDrawDefintionExtension({ eventId, drawId, name });
```

---

## removeDrawPositionAssignment

Clear draw position and optionally replace with a BYE, change entryStatus, or decompose a PAIR participant into UNGROUPED participants (DOUBLES only).

```js
removeDrawPositionAssignment({
  drawDefinition,
  structureId,
  drawPosition,
  replaceWithBye, // optional
  entryStatus, // optional - change the entryStatus of the removed participant
  destroyPair, // optional - decompose PAIR participant into UNGROUPED participants
});
```

---

## removeDrawEntries

Removes participantIds from `drawDefinition.entries` (if generated) as well as any relevent `flightProfile.flights`.

```js
tournamentEngine.removeDrawEntries({
  drawId,
  eventId,
  participantIds
  autoEntryPositions, // optional - keeps entries ordered by entryStage/entryStatus and auto-increments
  });
```

---

## removeEventEntries

Removes `participantIds` from `event.entries` with integrity checks.

```js
tournamentEngine.removeEventEntries({
  eventId,
  participantIds,
  autoEntryPositions, // optional - keeps entries ordered by entryStage/entryStatus and auto-increments
});
```

---

## removeEventExtension

```js
tournamentEngine.removeEventExtension({ eventId, name });
```

---

## removeEventMatchUpFormatTiming

```js
tournamentEngine.removeEventMatchUpFormatTiming({ eventId });
```

---

## removeIndividualParticipantIds

Remove an array of individualParticipantIds from a grouping participant [TEAM, GROUP]

```js
tournamentEngine.removeIndividualParticipantIds({
  groupingParticipantId,
  individualParticipantIds,
});
```

---

## removeParticipantIdsFromAllTeams

```js
tournamentEngine.removeParticipantIdsFromAllTeams({
  individualParticipantIds,
  groupingType, // optional - restrict to removing from only specified groupingType
});
```

---

## removeParticipantExtension

```js
tournamentEngine.removeParticipantExtension({ participantId, name });
```

---

## removePenalty

Removes a penalty from all relevant tournament participants.

```js
tournamentEngine.removePenalty({ penaltyId });
```

---

## removeScaleValues

Removes scale values for participants in a particular event. Optionally restrict by draw or stage.

```js
tournamentEngine.removeScaleValues({
  eventId,
  scaleAttributes, // { scaleType, scaleName, eventType }
  scaleName, // optional - override default scaleName, event.category.categoryName || event.category.ageCategoryCode
  drawId, // optional - to scope participants to entries in a specific draw
  stage, // optinal - scope participants to entries in a specific stage of draw
});
```

---

## removeSeeding

```js
tournamentEngine.removeSeeding({
  eventId,
  scaleName, // optional - override default scaleName, event.category.categoryName || event.category.ageCategoryCode
  drawId, // optional - to scope participants to entries in a specific draw
  stage, // optinal - scope participants to entries in a specific stage of draw
});
```

---

## removeStructure

Removes targeted `drawDefinition.structure` and all other child `structures` along with all associated `drawDefinition.links`.

```js
const { removedMatchUpIds } = tournamentEngine.removeStructure({
  drawId,
  structureId,
});
```

---

## removeTournamentExtension

```js
tournamentEngine.removeTournamentExtension({ name });
```

---

## setDrawDefaultMatchUpFormat

```js
tournamentEngine.setDrawDefaultMatchUpFormat({
  drawId,
  matchUpFormat, // TODS matchUpFormatCode
});
```

---

## setDrawParticipantRepresentativeIds

Set the participantIds of participants in the draw who are representing players by observing the creation of the draw.

```js
tournamentEngine.setDrawParticipantRepresentativeIds({
  drawId,
  representativeParticipantIds,
});
```

---

## setEventDefaultMatchUpFormat

```js
tournamentEngine.setEventDefaultMatchUpFormat({
  eventId,
  matchUpFormat, // TODS matchUpFormatCode
});
```

---

## setEventDates

Where startDate and/or endDate are strings 'YYYY-MM-DD'.

```js
tournamentEngine.setEventDates({ eventId, startDate, endDate });
```

---

## setEventEndDate

Where endDate is a string 'YYYY-MM-DD'.

```js
tournamentEngine.setEventEndDate({ eventId, endDate });
```

---

## setEventStartDate

Where startDate is a string 'YYYY-MM-DD'.

```js
tournamentEngine.setEventStartDate({ eventId, startDate });
```

---

## setMatchUpDailyLimits

```js
tournamentEngine.setMatchUpDailyLimits({
  dailyLimits: { SINGLES: 2, DOUBLES: 1, total: 3 },
});
```

---

## setMatchUpStatus

Sets either matchUpStatus or score and winningSide; values to be set are passed in outcome object. Handles any winner/loser participant movements within or across structures.

```js
const outcome = {
  score,
  winningSide,
  matchUpStatus,
};

tournamentEngine.setMatchUpStatus({
  drawId,
  matchUpId,
  matchUpTieId, // optional - if part of a TIE matchUp
  outcome,
  schedule: {
    // optional - set schedule items
    courtId, // requires scheduledDate
    venueId,
    scheduledDate,
    scheduledTime,
    startTime,
    endTime,
  },
  notes, // optional - add note (string) to matchUp object
});
```

---

## setParticipantScaleItem

```js
scaleItem = {
  scaleValue: 12,
  scaleName: 'U16',
  scaleType: RANKING,
  eventType: SINGLES,
  scaleDate: '2020-06-06',
};

result = tournamentEngine.setParticipantScaleItem({
  participantId,
  scaleItem,
});
```

---

## setParticipantScaleItems

```js
const scaleItemsWithParticipantIds = [
  {
    participantId,
    scaleItems: [
      {
        scaleValue: 8.3,
        scaleName: 'WTN',
        scaleType: RATING,
        eventType: SINGLES,
        scaleDate: '2021-01-01',
      },
    ],
  },
];
tournamentEngine.setParticipantScaleItems({ scaleItemsWithParticipantIds });
```

---

## setStructureDefaultMatchUpFormat

```js
tournamentEngine.setStructureDefaultMatchUpFormat({
  drawId,
  structureId,
  matchUpFormat, // TODS matchUpFormatCode
});
```

---

## setState

Loads a tournament record into tournamentEngine.

:::info
By default a deep copy of the `tournamentRecord` is made so that mutations made by `tournamentEngine` do not affect the source object. An optional boolean parameter, _deepCopy_ can be set to false to override this default behavior.
:::

```js
tournamentEngine.setsState(tournamentRecord, deepCopy);
```

---

## setSubOrder

Assigns a subOrder value to a participant within a structure by drawPosition where participant has been assigned

```js
tournamentEngine.setSubOrder({
  drawId,
  structureId,
  drawPosition: 1,
  subOrder: 2,
});
```

---

## setTournamentCategories

Define categories to be used in event creation for tournament record.

```js
const categories = [
  {
    categoryName: 'U18',
    type: eventConstants.AGE,
  },
  {
    categoryName: 'U16',
    type: eventConstants.AGE,
  },
  {
    categoryName: 'WTN',
    type: eventConstants.RATING,
  },
];
tournamentEngine.setTournamentCategories({ categories });
```

---

## setTournamentEndDate

Accepts an ISO String Date;

```js
tournamentEngine.setTournamentEndDate({ endDate });
```

---

## setTournamentId

Points `tournamentEngine` to a tournamentRecord that is in shared state, e.g. loaded by `competitionEngine`.

```js
tournamentEngine.setTournamentId(tournamentId);
```

---

## setTournamentName

```js
const tournamentName = 'CourtHive Challenge';
tournamentEngine.setTournamentName({
  tournamentName,
});
```

---

## setTournamentNotes

```js
tournamentEngine.setTournamentNotes({ notes });
```

---

## setTournamentStartDate

Accepts an ISO String Date;

```js
tournamentEngine.setTournamentStartDate({ StartDate });
```

---

## toggleParticipantCheckInState

```js
tournamentEngine.toggleParticipantCheckInState({
  drawId,
  matchUpId,
  participantId,
});
```

---

## tournamentMatchUps

Returns tournament matchUps grouped by matchUpStatus. These matchUps are returned with _context_.

```js
const {
  abandonedMatchUps,
  byeMatchUps,
  completedMatchUps,
  pendingMatchUps,
  upcomingMatchUps,
} = tournamentEngine.tournamentMatchUps({
  matchUpFilters, // optional; [ scheduleDates: [], courtIds: [], stages: [], roundNumbers: [], matchUpStatuses: [], matchUpFormats: []]
  scheduleVisibilityFilters,
});
```

---

## unPublishEvent

Modifies the `publishState` of an event. `Subscriptions` or middleware can be used to trigger messaging to services which make event data visible on public websites.

```js
tournamentEngine.unPublishEvent({ eventId });
```

---

## updateDrawIdsOrder

Updates the `drawOrder` attribute of all `drawDefinitions` within an event. The `drawOrder` attribute can be used for sorting or for differentiating `drawDefinitions` for the award of rankings points, when "flighting" separates participants by some `scaleValue`.

```js
tournamentEngine.updateDrawIdsOrder({
  eventId,
  orderedDrawIdsMap: {
    'id-Of-draw-1': 1,
    'id-of-draw-2': 2,
  },
});
```

---

## withdrawParticipantAtDrawPosition

Thin wrapper around [removeDrawPositionAssignment](#removeDrawPositionAssignment). This method is included in `validActions` for [positionActions](../policies/positionActions).

```js
withdrawParticipantAtDrawPosition({
  drawDefinition,
  structureId,
  drawPosition,
  replaceWithBye, // optional
  entryStatus = WITHDRAWN,
  destroyPair, // optional - decompose PAIR participant into UNPAIRED participants
});
```

---

## version

Returns NPM package version. Can be used in configurations that utilize Competition Factory engines on both client and server to ensure equivalency.

```js
const version = tournamentEngine.version();
```

---

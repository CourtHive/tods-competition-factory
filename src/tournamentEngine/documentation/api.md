---
name: API
menu: Tournament Engine
route: /tournamentEngine/api
---

# tournamentEngine API Reference

All tournamentEngine methods return either `{ success: true }` or `{ error }`

## addCourt

Add a court to a Venue.

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

Convenience function to bulk add courts to a Venue. Only adds **dataAvailability** and **courtName**.

```js
const dateAvailability = [
  {
    date: '2020-01-01T00:00',
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

Adds a drawDefinition to an event in a tournamentRecord. Called after [generateDrawDefinition](#generateDrawDefinition).

```js
const { drawDefinition, error } = generateDrawDefinition(drawDefinitionValues);
if (!error) {
  const result = tournamentEngine.addDrawDefinition({
    eventId,
    drawDefinition,
  });
}
```

---

## addDrawEntries

Bulk add an array of **participantIds** to a specific draw **stage** with a specific **entryStatus**.

```js
tournamentEngine.addDrawEntries({
  drawId,
  eventId,
  participantIds,
  stage: MAIN, // optional
  entryStatus: ALTERNATE, // optional
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

Adds participantIds to the entries array in an event

```js
tournamentEngine.addEventEntries({
  eventId,
  participantIds,
  stage: MAIN, // optional
  entryStatus: ALTERNATE, // optional
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
  allowDuplicateParticipantIdPairs, // optional - boolean - allow multiple pair participants with the same individualParticpantIds
});
```

---

## addMatchUpEndTime

```js
const endTime = '2020-01-01T09:05:00Z';
tournamentEngine.addMatchUpEndTime({ drawId, matchUpId, endTime });
```

---

## addMatchUpOfficial

```js
tournamentEngine.addMatchUpOfficial({
  drawId,
  matchUpId,
  participantId,
  officialType,
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

## addPenalty

Add a penaltyItem to one or more particpants.

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
  roundNumbers: [3], // requires if not provided playoffPositions
  playoffPositions: [3, 4], // required if not provided roundNumbers
  playoffAttributes, // optional - object mapping exitProfiles to structure names, e.g. 0-1-1 for SOUTH
  playoffStructureNameBase, // optional - base word for default playoff naming, e.g. 'Playoff'
});
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

## addVenue

Adds **venueId** if not provided.

```js
tournamentEngine.addVenue({ venue: { venueName } });
```

---

## allowedDrawTypes

Returns an array of names of allowed Draw Types, if any applicable policies have been applied to the tournamentRecord.

```js
const drawTypes = tournamentEngine.allowedDrawTypes();
```

---

## allowedMatchUpFormats

Returns an array of TODS matchUpFormat codes for allowed scoring formats, if any applicable policies have been applied to the tournamentRecord.

```js
const drawTypes = tournamentEngine.allowedDrawTypes();
```

---

## allEventMatchUps

Returns all matchUps for an event.

```js
const { matchUps } = allEventMatchUps({
  eventId,
  inContext: true, // include contextual details
  nextMatchUps: true, // include winner/loser target matchUp details
});
```

---

## allTournamentMatchUps

Return an array of all matchUps contained within a tournament. These matchUps are returned **inContext**.

```js
const { matchUps } = tournamentEngine.allTournamentMatchUps();
```

---

## alternateDrawPositionAssignment

Replaces an existing drawPosition assignment with an alternateParticipantId. This method is included in `validActions` for [positionActions](/concepts/positionActions)

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

See [Policies](/concepts/policies).

```js
tournamentEngine.attachEventPolicy({
  eventId,
  policyDefinition: SEEDING_POLICY,
});
```

---

## attachPolicy

Attaches a policy to a tournamentRecord.

See [Policies](/concepts/policies).

```js
tournamentEngine.attachPolicy({ policyDefinition: SEEDING_POLICY });
```

---

## automatedPositioning

Positions participants in a draw structure.

See [Policies](/concepts/policies).

```js
tournamentEngine.automatedPositioning({ drawId, structureId });
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
  scheduledDayDate: '2021-01-01T00:00', // best practice to provide ISO date string
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

## destroyPairEntry

Removes a `{ participantType: PAIR }` entry from an event and adds the individualParticipantIds to entries as entryStatus: UNPAIRED

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
  matchUpFilters,
  contextFilters,
  tournamentAppliedPolicies,
  inContext: true, // optional - adds context details to all matchUps
});
```

---

## findCourt

```js
const { court } = tournamentEngine.findCourt({ courtId });
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

## findVenue

Returns a complete venue object. Primarily used internally.

```js
tournamentEngine.findVenue({ venueId });
```

---

## generateDrawDefinition

This is a convenience method which handles most use cases for draw generation.

```js
const drawDefinitionValues = {
  eventId, // optional - used to find any avoidance policies to be applied
  drawSize, // number of drawPositions in the first draw structure
  drawType, // optional - defaults to SINGLE_ELIMINATION
  drawName, // cutom name for generated draw structure(s)
  automated, // optional - whether or not to automatically place participants in structures
  matchUpType, // optional - SINGLES, DOUBLES, or TEAM
  matchUpFormat, // optional - default matchUpFormatCode for all contained matchUps
  playoffMatchUpFormat, // optional - relevant for ROUND_ROBIN_WITH_PLAYOFFS
  tieFormat, // optional - { collectionDefinitions, winCriteria } for 'dual' or 'tie' matchUps
  seedsCount, // optional - number of seeds to generate if no seededParticipants provided
  seededParticipants, // optional - { participantId, seedNumber, seedValue }
  seedingProfile, // optional - used to specify WATERFALL seeding for ROUND_ROBIN
  qualifyingRound, // optional - used to derive roundLimit
  structureOptions, // optional - for ROUND_ROBIN - { groupSize, playoffGroups }
  policyDefinitions, // optional - seeding or avoidance policies to be used when placing participants
  qualifyingPositions, // optional - number of positions in draw structure to be filled by qualifiers
};

const { drawDefinition } = tournamentEngine.generateDrawDefinition(
  drawDefinitionValues
);
```

---

## generateFlightProfile

Splits event entries into # of draws. `flightProfile` is an extension on an event which contains attributes to be used by `generateDrawDefinition`.

See [Scale Items](/concepts/scaleItems).

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
const { drawDefinition } = tournamentEngine.generateDrawDefinition(
  drawDefinitionValues
);
```

---

## generateTeamsFromParticipantAttribute

Uses attributes of individual participnts or persons to generate `{ participantType: TEAM }` participants.

Returns count of # of TEAM participants added;

```js
const {
  participantsAdded,
} = tournamentEngine.generateTeamsFromParticipantAttribute({
  participantAttribute,
  personAttribute, // optional - attribute of person object
  uuids, // optional - uuids to assign to generated participants
});
```

---

## getAvailablePlayoffRounds

Returns rounds of a structure which are available for adding playoff structures.

```js
const {
  playoffRounds,
  playoffRoundsRanges,
} = tournamentEngine.getAvailablePlayoffRounds({
  drawId,
  structureId,
});
```

...For a SINGLE_ELIMINATION struture with drawSize: 16 would return:

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
  },
  structures,
} = getDrawData({ drawDefinition });
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
} = tournamentEngine.getMatchUpScheduleDetails({ matchUp });
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

Returns an array of eventDetails in which a specified `participantId` appears. Used primarily by `tournamentEngine.tournamentParticipants()` to add context.

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

const {
  relevantMatchUps,
  finishingPositionRanges,
  finishingPositionRange,
} = idMap[participantId];
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

See [Scale Items](/concepts/scaleItems).

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

See [Policies](/concepts/policies).

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

See [Scale Items](/concepts/scaleItems).

```js
const { scaledEntries } = tournamentEngine.getScaledEntries({
  eventId,
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

Returns **deepCopies** of tournament participants filtered by participantFilters which are arrays of desired participant attribute values

```js
const { tournamentParticipants } = tournamentEngine.getTournamentParticipants({
  participantFilters: { participantTypes: [INDIVIDUAL] },
  inContext, // optional - adds individualParticipants for all individualParticipantIds
  withStatistics, // optional - adds events, machUps and statistics, e.g. 'winRatio'
  withOpponents, // optional - include opponent participantIds
  withMatchUps, // optional - include all matchUps in which the participant appears
  convertExtensions, // optional - BOOLEAN - convert extensions so _extensionName attributes
  policyDefinition, // optional - can accept a privacy policy to filter participant attributes
});
```

participantFilters imlemented: eventIds, participantTypes, participantRoles, signInStatus

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

## getVenues

Returns an array of all Venues which are part of a tournamentRecord.

```js
const { venues } = tournamentEngine.getVenues();
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

## luckyLoserDrawPositionAssignment

Replaces an existing drawPosition assignment with a luckyLoserParticipantId. This method is included in `validActions` for [positionActions](/concepts/positionActions)

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

Modifies the `dateAvailability` attribute of a specified court. Warns if existing scheduled matchUps would be affected.

```js
const result = tournamentEngine.modifyCourtAvailability({
  courtId,
  dateAvailability,
  force, // override warning that existing scheduled matchUps exist
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

Change the display representation of a seedNumber for a specified `participantId`. This method is included in `validActions` for [positionActions](/concepts/positionActions).

```js
tournamentEngine.modifySeedAssignment({
  drawId,
  structureId,
  participantId,
  seedValue, // display representation such as '5-8'
});
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

See [Scale Items](/concepts/scaleItems).

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

## positionActions

```js
const positionActions = tournamentEngine.positionActions({
  drawId,
  structureId,
  drawPosition,
  policyDefinition: positionActionsPolicy, // optional - policy definiting what actions are allowed in client context
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

See [Policies](/concepts/policies) for more details on `policyDefinitions`.

```js
const policyDefinition = Object.assign(
  {},
  ROUND_NAMING_POLICY,
  PARTICIPANT_PRIVACY_DEFAULT
);

const { eventData } = tournamentEngine.publishEvent({
  eventId,
  policyDefinition,
});
```

---

## rankByRatings

---

## regenerateDrawDefinition

---

## removeDrawPositionAssignment

Clear draw position and optionally replace with a BYE, change entryStatus, or decompose a PAIR particpant into UNPAIRED participants (DOUBLES only).

```js
removeDrawPositionAssignment({
  drawDefinition,
  mappedMatchUps,
  structureId,
  drawPosition,
  replaceWithBye, // optional
  entryStatus, // optional - change the entryStatus of the removed participant
  destroyPair, // optional - decompose PAIR participant into UNPAIRED participants
});
```

---

## removeDrawEntries

Removes participantIds from `drawDefinition.entries` (if generated) as well as any relevent `flightProfile.flights`.

```js
tournamentEngine.removeDrawEntries({ drawId, eventId, participantIds });
```

---

## removeEventEntries

Removes `participantIds` from `event.entries` with integrity checks.

```js
tournamentEngine.removeEventEntries({ eventId, participantIds });
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

## removeIndividualParticipantIds

Remove an array of individualParticipantIds from a grouping participant [TEAM, GROUP]

```js
tournamentEngine.removeIndividualParticipantIds({
  groupingParticipantId,
  individualParticipantIds,
});
```

---

## removePenalty

Removes a penalty from all relevant tournament participants.

```js
tournamentEngine.removePenalty({ penaltyId });
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

## setDrawParticipantRepresentatives

Set the participantIds of participants in the draw who are representing players by observing the creation of the draw.

```js
tournamentEngine.setDrawParticipantRepresentatives({
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
  matchUpStatus, // optional - if matchUpFormat differs from event/draw/structure defaults
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

```js
tournamentEngine.setsState(tournamentRecord, deepCopy);
```

By default a deep copy of the tournament record is made so that mutations made by tournamentEngine do not affect the source object. An optional boolean parameter, _deepCopy_ can be set to false to override this default behavior.

---

## setSubscriptions

Please refer to the [Subscriptions](/concepts/subscriptions) in General Concepts.

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
} = tournamentEngine.tournamentMatchUps();
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
  event,
  orderedDrawIdsMap: {
    'id-Of-draw-1': 1,
    'id-of-draw-2': 2,
  },
});
```

---

## withdrawParticipantAtDrawPosition

Thin wrapper around [removeDrawPositionAssignment](#removeDrawPositionAssignment). This method is included in `validActions` for [positionActions](/concepts/positionActions).

```js
withdrawParticipantAtDrawPosition({
  drawDefinition,
  mappedMatchUps,
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

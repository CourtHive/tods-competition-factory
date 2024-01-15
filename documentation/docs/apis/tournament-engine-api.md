---
title: tournamentEngine API
---

## bulkRescheduleMatchUps

```js
const {
  rescheduled, // array of inContext matchUps which have been rescheduled
  notRescheduled, // array of inContext matchUps which have NOT been rescheduled
  allRescheduled, // boolean indicating whether all matchUps have been rescheduled
  dryRun, // boolean - only report what would happen without making modifications
} = tournamentEngine.bulkRescheduleMatchUps({
  matchUpIds, // array of matchUupIds for matchUps which are to be rescheduled
  scheduleChange: {
    daysChange: 1, // number of days +/-
    minutesChange: 30, // number of minutes +/-
  },
});
```

---

## bulkScheduleTournamentMatchUps

```js
const schedule = {
  scheduledTime: '08:00',
  scheduledDate: '2021-01-01T00:00', // best practice to provide ISO date string
  venueId,
};
const matchUpDetails = [{ matchUpId, schedule }];
tournamentEngine.bulkScheduleTournamentMatchUps({
  checkChronology, // optional boolean - returns warnings for scheduling errors; throws errors when combined with errorOnAnachronism
  errorOnAnachronism, // optional boolean - throw error if chronological scheduduling error
  removePriorValues, // optional boolean - remove all pre-existing scheduling timeItems from matchUps
  matchUpDetails, // optional - for use when matchUps have different scheduling details
  matchUpIds, // optional - used together with schedule when all matchUps will have the same schedule details applied
  schedule, // optiona - used together with matchUpIds when all matchUps will ahve the same schedule details applied
});
```

## bulkUpdatePublishedEventIds

Returns a filtered array of publishedEventIds from all eventIds which are included in a bulkMatchUpStatusUpdate. publishedEventIds can be used to determine which events to re-publish.

```js
const { publishedEventIds } = tournamentEngine.bulkUpdatePublishedEventIds({
  outcomes,
});
```

---

## checkValidEntries

```js
const { error, success } = tournamentEngine.checkValidEntries({
  consideredEntries, // optional array of entries to check
  enforceGender, // optional boolean - defaults to true
  eventId, // required
});
```

---

## clearMatchUpSchedule

```js
tournamentEngine.clearMatchUpSchedule({
  scheduleAttributes, // optional array of schedule constants
  matchUpId,
  drawId, // optional optimizes matchUp lookup, triggers drawModificationNotice
});
```

---

## clearScheduledMatchUps

```js
tournamentEngine.clearScheduledMatchUps({
  ignoreMatchUpStatuses, // optional - specify matchUpStatus values to be ignored; defaults to all completed matchUpStatuses
  scheduleAttributes, // optional - specify which attributes should be considered; defaults to ['scheduledDate', 'scheduledTime']
  scheduledDates, // optional - array of dates to be cleared; only matchUps with specified scheduledDate will be cleared
  venueIds, // optional - array of venueIds; only matchUps at specified venues will be cleared
});
```

---

## deleteAdHocMatchUps

```js
const result = tournamentEngine.deleteAdHocMatchUps({
  drawId, // required - drawId of drawDefinition in which target structure is found
  structureId, // required - structureId of structure for which matchUps are being generated
  matchUpIds, // array of matchUpIds identifying matchUps to be deleted
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

## deleteEvents

```js
tournamentEngine.deleteEvents({ eventIds });
```

---

## deleteParticipants

```js
tournamentEngine.deleteParticipants({
  addIndividualParticipantsToEvents, // optional boolean
  paricipantIds,
});
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
  participantId,
  eventId,
});
```

---

## devContext

Setting devContext(true) bypasses **try {} catch (err) {}** code block and in some cases enables enhanced logging

```js
tournamentEngine.devContext(true);
```

---

## disableCourts

```js
tournamentEngine.disableCourts({
  courtIds,
  dates, // optional - if not provided, courts will be disalbed for all dates
});
```

---

## disableTieAutoCalc

Disable default behavior of auto calculating TEAM matchUp scores.

```js
tournamentEngine.disableTieAutoCalc({ drawId, matchUpId });
```

---

## disableVenues

```js
tournamentEngine.disableVenues({ venueIds });
```

---

## drawMatic

```js
const { matchUps, participantIdPairings, iterations, candidatesCount } = tournamentEngine.drawMatic({
  restrictEntryStatus, // optional - only allow STRUCTURE_SELECTED_STATUSES
  generateMatchUps, // optional - defaults to true; when false only returns { participantIdPairings }
  maxIterations, // optional - defaults to 5000
  structureId, // optional; if no structureId is specified find the latest AD_HOC stage which has matchUps
  matchUpIds, // optional array of uuids to be used when generating matchUps
  eventType, // optional - override eventType of event within which draw appears; e.g. to force use of SINGLES ratings in DOUBLES events
  drawId, // required

  scaleAccessor, // optional string to access value within scaleValue, e.g. 'wtnRating'
  scaleName, // optional; custom rating name to seed dynamic ratings
});
```

---

## enableCourts

```js
tournamentEngine.enableCourts({
  enableAll, // optional boolean
  courtIds,
  dates, // optional - array of dates to enable (if they have been disabled)
});
```

---

## enableTiaAutoCalc

Re-enable default behavior of auto calculating TEAM matchUp scores, and trigger auto calculation.

```js
tournamentEngine.enableTieAutoCalc({ drawId, matchUpId });
```

---

## enableVenues

```js
tournamentEngine.enableVenues({ venueIds, enableAll });
```

---

## eventMatchUps

Returns matchUps for an event grouped by status.

```js
const { abandonedMatchUps, byeMatchUps, completedMatchUps, pendingMatchUps, upcomingMatchUps } =
  tournamentEngine.eventMatchUps({
    eventId,
    nextMatchUps, // optional boolean; include winner/loser target matchUp details
    matchUpFilters, // optional; [ scheduledDates: [], courtIds: [], stages: [], roundNumbers: [], matchUpStatuses: [], matchUpFormats: []]
    contextFilters,
    tournamentAppliedPolicies,
    scheduleVisibilityFilters, // { visibilityThreshold: Date, eventIds, drawIds }
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
    method: 'getParticipants',
    params: { participantFilters: { participantTypes: [PAIR] } },
  },
  {
    method: 'getParticipants',
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

## findMatchUp

```js
const {
  matchUp,
  structure, // returned for convenience
} = tournamentEngine.findMatchUp({
  inContext, // optional - boolean - returns matchUp with additional attributes
  matchUpId,
  drawId,
});
```

---

## findParticipant

```js
const { participant } = tournamentEngine.findParticipant({
  participantId, // required only if no personId provided
  personId, // required only if no participantId provided
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

## findVenue

Returns a complete venue object. Primarily used internally.

```js
tournamentEngine.findVenue({ venueId });
```

---

## generateAdHocMatchUps

Draws with `{ drawType: AD_HOC }` allow `matchUps` to be dynamically added. In this type of draw there is no automatic participant progression between rounds. Participant assignment to `matchUps` is done manually, or via **DrawMatic**. The only restriction is that a participant may appear once per round.

```js
const result = tournamentEngine.generateAdHocMatchUps({
  participantIdPairings, // optional - array of array of pairings [['id1', 'id2'], ['id3', 'id4']]
  drawId, // required - drawId of drawDefinition in which target structure is found
  matchUpIds, // optional - if matchUpIds are not specified UUIDs are generated
  roundNumber, // optional - specify round for which matchUps will be generated
  newRound, // optional - boolean defaults to false - whether to auto-increment to next roundNumber
});
```

---

## generateAndPopulatePlayoffStructures

Generates values but does not attach them to the `drawDefinition`. Used in conjunction with `attachPlayoffStructures`.

```js
const { structures, links, matchUpModifications } = tournamentEngine.generateAndPopulatePlayoffStructures({
  requireSequential, // boolean defaults to true; only applies to Round Robin; require finishingPositions to be sequential
  roundNumbers: [3], // optional if playoffPositions not provided; roundNumbers of structure to be played off.
  roundProfiles, // optional - source roundNumbers as Object.keys with depth as Object.values, e.g. [{ 1: 2}, {2: 1}]
  playoffPositions: [3, 4], // optional if roundNumbers not provided; finishing positions to be played off.
  playoffStructureNameBase, // optional - Root word for default playoff naming, e.g. 'Playoff' for 'Playoff 3-4'
  exitProfileLimit, // limit playoff rounds generated by the attributes present in playoffAttributes
  playoffAttributes, // optional - mapping of either exitProfile or finishingPositionRange to structure names, e.g. 0-1-1 for South
  playoffGroups, // optional - only applies to Playoffs from ROUND_ROBIN: { structureNameMap: {}, finishingPositions: [], drawType: '' }
  structureId,
  drawId,
});
```

---

## generateDrawMaticRound

Typically not called directly. `tournamentEngine.drawMatic` is a higher level wrapper which automates derivation of `adHocRatings`.

```js
const {
  participantIdPairings,
  candidatesCount,
  iterations,
  matchUps,
  success,
} = generateDrawMaticRound({
  maxIterations,// optional - defaults to 5000
  generateMatchUps = true, // optional - defaults to true; when false only returns { participantIdPairings }
  participantIds, // required
  adHocRatings, // optional { ['participantId']: numericRating }
  structureId, // required
  matchUpIds, // optional array of uuids to be used when generating matchUps
  eventType, // optional - override eventType of event within which draw appears; e.g. to force use of SINGLES ratings in DOUBLES events
  drawId, // required
});
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
  attachFlightProfile, // boolean - also attach to event after generation
  scaledEntries, // optional - overrides the use of scaleAttributes, scaleSortMethod, and sortDescending
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
const { drawDefinition } = tournamentEngine.generateDrawDefinition(drawDefinitionValues);
```

---

## generateLineUps

Generates lineUps for TEAM events which have selected teams with ranked or rated individualParticipants. Individual TEAM participants are assigned line positions based on the scale specified.

```js
const scaleAccessor = {
  scaleName: categoryName,
  scaleType: RANKING,
  sortOrder, // optional - ASCENDING or DESCENDING - defaults to ASCENDING
};
const { lineUps, participantsToAdd } = tournamentEngine.generateLineUps({
  useDefaultEventRanking, // optional boolen; when true scaleAccessor is not required
  scaleAccessor, // see above
  singlesOnly, // optional boolean - when true SINGLES rankings will be used for DOUBLES position assignment
  attach, // optional boolean - when true the lineUps will be attached to the drawDefinition specified by drawId
  drawId,
});
```

---

## generateQualifyingStructure

```js
let { structure, link } = tournamentEngine.generateQualifyingStructure({
  targetStructureId, // required: structure for which participants will qualify
  qualifyingPositions, // optional: specify the # of qualifyingPositions
  qualifyingRoundNumber, // optional: determine qualifyingPositions by # of matchUps in specified round; does not apply to ROUND_ROBIN
  structureOptions, // optional: specific to ROUND_ROBIN generation
  structureName, // optional
  drawSize,
  drawType, // optional: defaults to SINGLE_ELIMINATION
  drawId, // required: draw within which target structure appears
});
```

---

## generateSeedingScaleItems

Used in conjunction with `getEntriesAndSeedsCount` when it is necessary to make use of a custom function for generating `scaledEntries`.

```js
const { scaleItemsWithParticipantIds } = tournamentEngine.generateSeedingScaleItems({
  scaleAttributes,
  scaledEntries,
  stageEntries,
  seedsCount,
  scaleName,
});
```

---

## createTeamsFromParticipantAttributes

Uses attributes of individual participnts or persons to generate `{ participantType: TEAM }` participants.

Returns count of # of TEAM participants added;

```js
const { participantsAdded } = tournamentEngine.createTeamsFromParticipantAttributes({
  participantAttribute, // optional -- attribute of participant object
  addParticipants, // optional boolean; defaults to true; when false return new participants
  personAttribute, // optional - attribute of person object
  accessor, // optional - use accessor string to retrieve nested value (even from person address arrays)
  uuids, // optional - uuids to assign to generated participants
});
```

---

## generateVolunataryConsolation

```js
const { structures, links } = tournamentEngine.generateVoluntaryConsolation({
  attachConsolation: false, // optional - defaults to true
  automated: true,
  drawId,
});

// if { attachConsolation: false } then it will be necessary to subsequently attach the structures and links
tournamentEngine.attachConsolationStructures({ drawId, structures, links });
```

---

## getAllEventData

Returns all `matchUps` for all draws in all events along with `tournamentInfo`, `eventInfo`, and `drawInfo`.

```js
const { allEventData } = tournamentEngine.getAllEventData({
  policyDefinitions, // optional - allows participant data to be filtered via a privacy policy
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

## getAvailablePlayoffProfiles

If provided a `structureId`, returns rounds of the selected structure which are available for adding playoff structures.

```js
const { playoffRounds, playoffRoundsRanges, positionsPlayedOff } = tournamentEngine.getAvailablePlayoffProfiles({
  structureId,
  drawId,
});
```

...for a SINGLE_ELIMINATION struture with `{ drawSize: 16 }` this would return:

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

...for a ROUND_ROBIN struture with `{ drawSize: 16 }` and `{ groupSize: 4 }` this would return:

```js
{
    "finishingPositionsAvailable": [ 1, 2, 3, 4 ],
    "playoffFinishingPositionRanges": [
        {
            "finishingPosition": 1,
            "finishingPositions": [ 1, 2, 3, 4 ],
            "finishingPositionRange": "1-4"
        },
        {
            "finishingPosition": 2,
            "finishingPositions": [ 5, 6, 7, 8 ],
            "finishingPositionRange": "5-8"
        },
        {
            "finishingPosition": 3,
            "finishingPositions": [ 9, 10, 11, 12 ],
            "finishingPositionRange": "9-12"
        },
        {
            "finishingPosition": 4,
            "finishingPositions": [ 13, 14, 15, 16 ],
            "finishingPositionRange": "13-16"
        }
    ],
}
```

When no `structureId` is provided, returns an array of `availablePlayoffProfiles` with entries for each structure in a specified `drawDefinition`.

```js
const { availablePlayoffProfiles, positionsPlayedOff } = tournamentEngine.getAvailablePlayoffProfiles({ drawId });
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
  surfacedDate,
  pace,
  notes,
} = tournamentEngine.getCourtInfo({ courtId });
```

---

## getCourts

Returns courts associated with a tournaments; optionally filter by venue(s).

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
const { representativeParticipantIds } = tournamentEngine.getDrawParticipantRepresentativeIds({
  drawId,
});
```

---

## getEligibleVoluntaryConsolationParticipants

```js
const { eligibleParticipants } = tournamentEngine.getEligibleVoluntaryConsolationParticipants({
  excludedMatchUpStatuses, // optional - array of matchUpStatuses which are excluded from matchUpsLimit
  includeQualifyingStage, // optional - allow losers in qualifying
  finishingRoundLimit, // optional number - limits considered matchUps by finishingRound, e.g. 3 doesn't consider past QF
  roundNumberLimit, // optional number - limits matchUps by roundNumber
  matchUpsLimit, // optional number - limits the number of considered matchUps; works in tandem with excludedMatchUpStatuses
  winsLimit, // defaults to 0, meaning only participants with no wins are eligible
  requireLoss, // optional boolean - defaults to true; if false then all participants who have played and appear in MAIN draw are considered
  requirePlay, // optional boolean - defaults to true; if false then all participants who appear in MAIN draw are considered
  allEntries, // optional boolean - consider all entries, regardless of whether placed in draw
  includeEventParticipants, // optional boolean - consider event entries rather than draw entries (if event is present)
  drawId,
});
```

---

## getEntriesAndSeedsCount

```js
const { error, entries, seedsCount, stageEntries } = tournamentEngine.getEntriesAndSeedsCount({
  policyDefinitions, // seeding policy which determines # of seeds for # of participants/drawSize
  eventId,
  drawSize, // optional - overrides number calculaed from entries in either event or draw
  drawId, // optional - scopes entries to a specific flight/drawDefinition
  stage, // optional - scopes entries to a specific stage
});
```

---

## getEntryStatusReports

```js
const {
  tournamentEntryReport: {
    nonParticipatingEntriesCount,
    individualParticipantsCount,
    drawDefinitionsCount,
    eventsCount,
  },
  entryStatusReports, // count and pct of total for all entryStatuses for each event
  participantEntryReports, // person entryStatus, ranking, seeding, WTN and confidence for each event
  eventReports, // primarily internal use - entries for each event with main/qualifying seeding
} = tournamentEngine.getEntryStatusReports();
```

To export reports as CSV:

```js
const entryStatusCSV = utilities.JSON2CSV(entryStatusReports);
const personEntryCSV = utilities.JSON2CSV(participantEntryReports);
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

---

## getEvents

Return **deepCopies** of all events in a tournament record.

```js
const { events } = tournamentEngine.getEvents({
  withScaleValues, // optional boolean
  scaleEventType, // override event.eventType for accessing scales, e.g. SINGLES override for DOUBLES events
  inContext, // optional boolean hydrates with tournamentId
  eventIds, // optional array
  drawIds, // optional array
  context, // optional object to spread into all targeted events
});
```

---

## getEventData

Returns event information optimized for publishing: `matchUps` have context and separated into rounds for consumption by visualization libraries such as `tods-react-draws`.

See [Policies](../concepts/policies) for more details on `policyDefinitions`.

```js
const { eventData } = tournamentEngine.getEventData({
  participantsProfile, // optional - ability to specify additions to context (see parameters of getParticipants())
  policyDefinitions, // optional
  usePublishState, // optional - filter out draws which are not published
  eventId,
});
const { drawsData, venuesData, eventInfo, tournamentInfo } = eventData;
```

---

## getEventTimeItem

```js
const { timeItem } = tournamentEngine.getEventTimeItem({
  itemType: ADD_SCALE_ITEMS,
  itemSubTypes: [SEEDING], // optional
  eventId,
});
```

---

## getEventProperties

Gather attributes of events which come from other tournament elements, e.g. participants which have rankings/ratings/seedings for a given event.

```js
const { entryScaleAttributes, hasSeededParticipants, hasRankedParticipants, hasRatedParticipants } =
  tournamentEngine.getEventProperties({ eventId });
```

... where **entryScaleAttributes** is an array of `{ participantId, participantName, seed, ranking, rating }`

---

## getEventMatchUpFormatTiming

Method is used internally in advanced scheduling to determine averageMatchUp times for matchUps within an event.

Requires an array of `matchUpFormats` either be defined in scoring policy that is attached to the tournamentRecord or an event, or passed in as parameter. `matchUpFormats` can be passed either as an array of strings, or an array of `[{ matchUpFormat }]`.

```js
const { eventMatchUpFormatTiming } = tournamentEngine.getEventMatchUpFormatTiming({
  matchUpFormats, // optional - can be retrieved from policy
  categoryType, // optional - categoryType is not part of TODS or event attributes, but can be defined in a policy
  eventId,
});
```

---

## getEventStructures

```js
const { structures, stageStructures } = tournamentEngine.getEventStructures({
  withStageGrouping: true, // optional return structures grouped by stages
  stageSequences, // optional - specify stageSequences to include
  stageSequence, // optional - filter by stageSequence
  stages, // optional - specify stageSequences to include
  stage, // optional - filter by stage
  eventId, // REQUIRED
});
```

---

## getFlightProfile

A `flightProfile` is an extension on an `event` detailing the parameters that will be used to generate `drawDefinitions` within the `event`. There is an array of `flights` which specify attributes of a draw such as `drawEntries, drawName, drawId, flightNumber` as well as `stage`, which is significant for flights which are only intended to reflect VOLUNTARY_CONSOLATION structures. A Voluntary Consolation flight is "linked" to the flight from which competitors originate and will be automatically deleted if the source flight is deleted.

If a `flight` has already been used to generate a draw, the `drawDefinition` will be returned with the profile.

```js
const { flightProfile } = tournamentEngine.getFlightProfile({ eventId });
```

---

## getMatchUpCompetitiveProfile

Returns a categorization of a matchUp as "Competitive", "Routine" or "Decisive"

```js
const {
  competitiveness, // [COMPETITIVE, DECISIVE, ROUTINE]
  pctSpread, // 0-100 - rounded loser's percent of games required to win
} = tournamentEngine.getMatchUpCompetitiveProfile({
  profileBands, // optional { [DECISIVE]: 20, [ROUTINE]: 50 } // can be attached to tournamentRecord as a policy
  matchUp,
});
```

---

## getMatchUpDependencies

For each `matchUpId` returns an array of other `matchUpIds` which occur earlier in the draw.

Optionally returns an array of `participantIds` which could potentially appear in each `matchUp`;
used internally to ensure that auto scheduling respects the `timeAfterRecovery` of all potential participants.

```js
const {
  matchUpDependencies: {
    [matchUpId]: {
      matchUpIds: [matchUpIdDependency], // array of all matchUpIds which occur prior to this matchUpId in the draw; crosses all structures
      participantIds: [potentialParticipantIds], // array of all participantIds which could potentially appear in this matchUp
      dependentMatchUpIds: [dependentMatchUpId], // array of matchUpIds which occur after this matchUpId in the draw; crosses all structures
    },
  },
} = tournamentEngine.getMatchUpDependencies({
  includeParticipantDependencies, // boolean - defaults to false
  drawIds, // optional array of drawIds to scope the analysis
});
```

---

## getMatchUpFormat

Returns `matchUpFormat` codes for specified context(s). Refer to `getMatchUpFormat.test.js` for specfic use cases.

`matchUpFormat` for each matchUp is determined by traversing the hierarchy: `matchUp => stucture => drawDefinition => event`

```js
const { matchUpFormat, structureDefaultMatchUpFormat, drawDefaultMatchUpFormat, eventDefaultMatchUpFormat } =
  tournamentEngine.getMatchUpFormat({
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
const { averageMinutes, recoveryMinutes } = tournamentEngine.getMatchUpFormatTiming({
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
    allocatedCourts: [{ venueId, courtid }], // applies only to TEAM matchUps
  },
} = tournamentEngine.getMatchUpScheduleDetails({
  scheduleVisibilityFilters, // { visibilityThreshold: Date, eventIds, drawIds }
  matchUp,
});
```

---

## getMatchUpsStats

Returns percentages of matchUps which fall into `cmpetitiveBands` defined as "Competitive", "Routine", and "Decisive".

```js
const { competitiveBands } = tournamentEngine.getMatchUpsStats({
  profileBands, // optional { [DECISIVE]: 20, [ROUTINE]: 50 } // can also be set in policyDefinitions
  matchUps,
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
const { matchUpFormat, averageTimes, recoveryTimes } = tournamentEngine.getModifiedMatchUpFormatTiming({
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

Returns an array of eventDetails in which a specified `participantId` appears. For details on draw entry within events use `tournamentEngine.getParticipants({ inContext: true })`.

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
  byeAdvancements, // optional boolean - whether or not to consider byeAdvancements
  drawId,
});

const { relevantMatchUps, finishingPositionRanges, finishingPositionRange } = idMap['participantId'];
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

## getParticipants

Returns **deepCopies** of competition participants filtered by participantFilters which are arrays of desired participant attribute values. This method is an optimization of `getCompetitionParticipants` and will replace it going forward.

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
  participantIdsWithConflicts, // returns array of participantIds which have scheduling conflicts
  competitionParticipants,
  eventsPublishStatuses,
  derivedEventInfo,
  derivedDrawInfo,
  participantsMap, // object { ['participantId']: participant }
  mappedMatchUps, // object { [matchUpId]: matchUp }; when { withMatchUps: true }
  participants, // array of participants
  matchUps, // array of all matchUps; when { withMatchUps: true }
 } =
  tournamentEngine.getParticipants({
    convertExtensions, // optional - BOOLEAN - convert extensions so _extensionName attributes
    participantFilters, // optional - filters
    policyDefinitions, // optional - can accept a privacy policy to filter participant attributes
    usePublishState, // optional - BOOLEAN - don't add seeding information when not published
    scheduleAnalysis: {
      scheduledMinutesDifference // optional - scheduling conflicts determined by scheduledTime difference between matchUps
    },
    usePublishState,  // optional boolean
    withDraws, // optional - defaults to true if any other context options are specified
    withEvents, // optional - defaults to true if any other context options are specified
    withIndividualParticipants, // optional - boolean or attributeFilter template - include hydrated individualParticiapnts for TEAM/PAIR participants
    withIOC, // optional - will add IOC country code and countryName to participant persons
    withISO2, // optional - will add ISO2 country code and countryName to participant persons
    withMatchUps, // optional - include all matchUps in which the participant appears, as well as potentialMatchUps
    withOpponents, // optional - include opponent participantIds
    withPotentialMatchUps, // optional boolean
    withRankingProfile, // optional boolean - include details necessary for point awards
    withScaleValues, // optional - include { ratings, rankings } attributes extracted from timeItems
    withSeeding, // optionsl - add event seeding
    withScheduleItems, // optional boolean - include array of scheduled matchUp details
    withSignInStatus, // optional boolean
    withStatistics, // optional - adds events, matchUps and statistics, e.g. 'winRatio'
    withTeamMatchUps // optional boolean
  });
```

### participantFilters

- enableOrFiltering: boolean - use OR logic instead of default AND
- accessorValues: array of accessors and targeted value `[{ accessor, value }]`
- drawEntryStatuses: array of `entryStatus` values for participantIds found in draw.entries
- eventEntryStatuses: array of `entryStatus` values for participantIds found in event.entries
- eventIds: array of targeted eventIds
- participantIds: array of targeted participantIds
- participantRoles: array of targeted participantRoles
- participantTypes: array of targeted participantTypes
- positionedParticipants: participantIds positioned in structures `[true, false, undefined]`
- signInStatus: SIGNED_IN or SIGNED_OUT

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
  scaleAttributes,
  participantId,
});
```

---

## getParticipantSchedules

```js
const { participantSchedules } = tournamentEngine.getParticipantSchedules({
  participantFilters: { participantIds, participantTypes, eventIds },
});
```

---

## getParticipantSignInStatus

Participant signInStatus can be either 'SIGNED_IN' or 'SIGNED_OUT' (or undefined). See [modifyParticipantsSignInStatus](#modifyparticipantssigninstatus).

```js
const signInStatus = tournamentEngine.getParticipantSignInStatus({
  participantId,
});
```

---

## getParticipantStats

```js
const result = tournamentEngine.getParticipantStats({
  withCompetitiveProfiles, // optional boolean
  opponentParticipantId, // optional team opponent participantId, otherwise stats vs. all opponents
  withIndividualStats, // optional boolean
  teamParticipantId, // optional - when not provided all teams are processed
  tallyPolicy, // optional
  matchUps, // optional - specifiy or allow tournamentEngine to get all
});

const {
  participatingTeamsCount, // only if no teamPartiicpantId has been specified
  allParticipantStats, // only if no teamParticipantId has been specified
  relevantMatchUps, // matchUps which were relevant to the calculations
  opponentStats, // only if opponentParticipantId has been provided
  teamStats, // only if teamParticipantId has been provided
  success, // when no error
  error, // if error
} = result;
```

---

## getPolicyDefinitions

Finds policies which have been attached to the tournamentRecord, or to a target event, or target drawDefinition, in reverse order.
Once a matching `policyType` has been found, higher level policies of the same type are ignored, enabling a default policy to be attached to the tournamentRecord and for event-specific or draw-specific policies to override the default(s).

The constructed `policyDefinitions` object contains targeted policies from all levels, scoped to the lowest level specified.

See [Policies](../concepts/policies).

```js
const { policyDefinitions } = tournamentEngine.getPolicyDefinitions({
  policyTypes: [POLICY_TYPE_SEEDING],
  eventId, // optional
  drawId, // optional
});
```

---

## getPositionAssignments

Returns an array of `positionAssignments` for a structure. Combines `positionAssginments` for child structures in the case of ROUND_ROBIN where `{ structureType: CONTAINER }`.

```js
let { positionAssignments } = tournamentEngine.getPositionAssignments({
  structureId, // optional if { structure } is provided
  structure, // optional if { drawId, structureId } are provided
  drawId, // optional if { structure } is provided
});

const [{ drawPosition, participantId, qualifier, bye }] = positionAssignments;
```

---

## getPredictiveAccuracy

```js
const { accuracy, zoneDistribution } = tournamentEngine.getPredictiveAccuracy({
  exclusionRule: { valueAccessor: 'confidence', range: [0, 70] }, // exclude low confidence values

  zoneMargin: 3, // optional - creates +/- range and report competitiveness distribution
  zonePct: 20, // optional - precedence over zoneMargin, defaults to 100% of rating range

  valueAccessor: 'wtnRating', // optional if `scaleName` is defined in factory `ratingsParameters`
  ascending: false, // optional - scale goes from low to high with high being the "best"
  scaleName: WTN,
});
```

---

## getRoundMatchUps

Organizes matchUps by roundNumber. **roundMatchUps** contains matchUp objects; **roundProfile** provides an overview of drawPositions which have advanced to each round, a matchUpsCount, finishingPositionRange for winners and losers, and finishingRound.

```js
const { roundMatchUps, roundProfile } = tournamentEngine.getRoundMatchUps({
  matchUps,
});
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

Takes a policyDefinition, drawSize and participantsCount and returrns the number of seeds valid for the specified drawSize

:::note
`drawSizeProgression` will be overridden by a `{ drawSizeProgression }` value in a policyDefinition.
:::

```js
const { seedsCount, error } = tournamentEngine.getSeedsCount({
  drawSizeProgression, // optional - fits the seedsCount to the participantsCount rather than the drawSize
  policyDefinitions: SEEDING_USTA,
  participantsCount: 15,
  drawSize: 128,
});
```

---

## getState

Returns a deep copy of the current tournamentEngine state.

```js
const { tournamentRecord } = tournamentEngine.getState({
  convertExtensions, // optional - convert extensions to '_' prefixed attributes
  removeExtensions, // optional - strip all extensions out of tournamentRecord
});
```

---

## getStructureReports

Returns details of all structures within a tournamentRecord, as well as aggregated details per event.

`tournamentId, eventId, structureId, drawId, eventType, category: subType, categoryName, ageCategoryCode, flightNumber, drawType, stage, winningPersonId, winningPersonWTNrating, winningPersonWTNconfidence, winningPerson2Id, winningPerson2WTNrating, winningPerson2WTNconfidence, positionManipulations, pctNoRating, matchUpFormat, pctInitialMatchUpFormat, matchUpsCount, tieFormatDesc, tieFormatName, avgConfidence, avgWTN`

```js
const {
  structureReports,
  eventStructureReports: {
    totalPositionManipulations,
    maxPositionManipulations,
    generatedDrawsCount,
    drawDeletionsCount,
  },
} = tournamentEngine.getStructureReports({
  firstFlightOnly, // boolean - defaults to true - only return first flight when multiple drawDefinitions per event
  extensionProfiles: [
    {
      name, // extension name
      label, // label for generated attribute
      accessor, // dot-notation accessor for extension value, e.g. 'attribute.attribute'
    },
  ],
});
```

To export report as CSV:

```js
const csv = utilities.JSON2CSV(structureReports);
```

---

## getTeamLineUp

```js
const { lineUp } = tournamentEngine.getTeamLineUp({ drawId, participantId });
```

---

## getTieFormat

Returns `tieFormat` definition objects for specified context(s).

`tieFormat` for each matchUp is determined by traversing the hierarchy: `matchUp => stucture => drawDefinition => event`

```js
const { tieFormat, structureDefaultTieFormat, drawDefaultTieFormat, eventDefaultTieFormat } =
  tournamentEngine.getTieFormat({
    structureId,
    matchUpId,
    eventId,
    drawId,
  });
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

## getTournamentStructures

```js
const { structures, stageStructures } = tournamentEngine.getTournamentStructures({
  withStageGrouping: true, // optional return structures grouped by stages
  stageSequences, // optional - specify stageSequences to include
  stageSequence, // optional - filter by stageSequence
  stages, // optional - specify stageSequences to include
  stage, // optional - filter by stage
});
```

---

## getVenuesAndCourts

Returns an array of all Venues which are part of a tournamentRecord and an aggregation of courts across all venues.

```js
const { venues, courts } = tournamentEngine.getVenuesAndCourts({
  convertExtensions, // optional boolean
  ignoreDisabled, // optional boolean
  dates, // optional - used with ignoreDisabled - applies to courts
});
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

## isValidForQualifying

Provides determination of whether qualifying structure(s) may be added to the structure specified by `structureId`.

```js
const { valid } = tournamentEngine.isValidForQualifiying({
  structureId,
  drawId,
});
```

---

## isValidMatchUpFormat

Returns boolean indicating whether matchUpFormat code is valid.

```js
const valid = tournamentEngine.isValidMatchUpFormat({ matchUpFormat });
```

---

## luckyLoserDrawPositionAssignment

Replaces an existing drawPosition assignment with a luckyLoserParticipantId. This method is included in `validActions` for [positionActions](../policies/positionActions)

```js
tournamentEngine.luckyLoserDrawPositionAssignment({
  luckyLoserParticipantId,
  drawPosition,
  structureId,
  drawId,
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
  restrictAdHocRoundParticipants, // optional - true by default; applies to AD_HOC; disallow the same participant being in the same round multiple times
  sideNumber, // optional - select side to which action should apply; applies to AD_HOC position assignments
  matchUpId, // required - reference to targeted matchUp
  drawId, // optional - not strictly required; method will find matchUp by brute force without it
});

const {
  type, // 'REFEREE', 'SCHEDULE', 'PENALTY', 'STATUS', 'SCORE', 'START', 'END', 'SUBSTITUTION'.
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

## modifyCollectionDefinition

Modifies the `collectionName` and/or `matchUpFormat` for targeted `collectionId` within the `tieFormat` specified by `eventId`, `drawId`, `structureId` or `matchUpId`.

```js
tournamentEngine.modifyCollectionDefinition({
  collectionName, // optional
  matchUpFormat, // optional
  collectionId, // required
  structureId, // required if modifying tieFormat for a structure
  matchUpId, // required if modifying tieFormat for a matchUp
  eventId, // required if modifying tieFormat for a event
  drawId, // required if modifying tieFormat for a drawDefinition or a structure
  gender, // optional

  // value assignment, only one is allowed to have a value
  collectionValueProfiles, // optional - [{ collectionPosition: 1, value: 2 }] - there must be a value provided for all matchUp positions
  collectionValue, // optional - value awarded for winning more than half of the matchUps in the collection
  matchUpValue, // optional - value awarded for each matchUp won
  scoreValue, // optional - value awarded for each game or point won (points for tiebreak sets)
  setValue, // optional - value awarded for each set won
});
```

---

## modifyCourt

```js
tournamentEngine.modifyCourt({
  courtId,
  force, // applies only to dateAvailability, will remove scheduling information from matchUps where court is no longer available
  modifications: {
    courtName,
    dateAvailability,
    courtDimensions,
    onlineResources,
    surfaceCategory,
    surfacedDate,
    surfaceType,
    altitude,
    latitude,
    longitude,
    notes,
    pace,
  },
});
```

---

## modifyCourtAvailability

Modifies the `dateAvailability` attribute of a specified court. Warns if existing scheduled matchUps would be affected. See [Scheduling](/docs/concepts/scheduling).

```js
const result = tournamentEngine.modifyCourtAvailability({
  dateAvailability,
  courtId,
  force, // override warning that existing scheduled matchUps exist
});
```

---

## modifyDrawDefinition

```js
tournamentEngine.modifyDrawDefinition({
  drawUpdates: { policyDefinitions: { ...policies } },
  drawName: 'League Play',
  drawId,
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
  recoveryTimes: [{ categoryNames: [], minutes: { default: 15, [DOUBLES]: 15 } }],
});
```

---

## modifyEntriesStatus

Modify the entryStatus of participants already in an event or flight/draw. Does not allow participants assigned positions in structures to have an entryStatus of WITHDRAWN.

```js
const result = tournamentEngine.modifyEntriesStatus({
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
tournamentEngine.modifyEventEntries({
  entryStatus = DIRECT_ACCEPTANCE,
  unpairedParticipantIds = [],
  participantIdPairs = [],
  entryStage = MAIN,
  eventId,
})
```

---

## modifyEventMatchUpFormatTiming

```js
tournamentEngine.modifyEventMatchUpFormatTiming({
  recoveryMinutes,
  averageMinutes,
  matchUpFormat,
  eventId,
});
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

Modifies attributes of a participant with integrity checks to ensure valid values for e.g. `{ participantType, participantRole }`. Adds participant if not found.

```js
tournamentEngine.modifyParticipant({
  participant: updatedIndividualParticipant,
});
```

---

## modifyPenalty

```js
const penaltyData = {
  participantIds: ['participantId'],
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
  participantIds: ['participantId'],
  signInState: SIGNED_IN,
});
```

---

## modifySeedAssignment

Change the display representation of a seedNumber for a specified `participantId`. This method is included in `validActions` for [positionActions](../policies/positionActions).

The rationale for `seedValue` is to be able to, for instance, represent the fifth through the eighth seed as `5-8`, or simply as `5`. When there are no restrictions on seed positioning `seedValue` allows assigning seeding to arbitrary `participants`.

```js
tournamentEngine.modifySeedAssignment({
  participantId,
  structureId,
  seedValue, // display representation such as '5-8'
  drawId,
});
```

---

## modifyTieFormat

Both modifies the `tieFormat` on the target `event`, `drawDefinition`, `structure` or `matchUp` and adds/deletes `tieMatchUps` as necessary.

```js
tournamentEngine.modifyTieFormat({
  modifiedTieFormat, // will be compared to existing tieFormat that is targeted and differences calculated
  structureId, // required if modifying tieFormat for a structure
  matchUpId, // required if modifying tieFormat for a matchUp
  eventId, // required if modifying tieFormat for a event
  drawId, // required if modifying tieFormat for a drawDefinition or a structure
});
```

---

## modifyVenue

See [Scheduling](/docs/concepts/scheduling).

```js
const modifications = {
  venueAbbreviation,
  venueName,

  courts: [
    {
      courtId: 'b9df6177-e430-4a70-ba47-9b9ff60258cb',
      courtName: 'Custom Court 1',
      dateAvailability: [
        {
          date: '2020-01-01', // if no date is provided then `startTime` and `endTime` will be considered default values
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

const { tournamentRecord } = tournamentEngine.getTournament();
```

---

## orderCollectionDefinitions

Modify the array order of `tieFormat.collectionDefinitions` for an `event`, a `drawDefinition`, `structure`, or `matchUp`.

```js
tournamentEngine.orderCollectionDefinitions({
  orderMap: { collectionId1: 1, collectionId2: 2 },
  structureId, // required if modifying tieFormat for a structure
  matchUpId, // required if modifying tieFormat for a matchUp
  eventId, // required if modifying tieFormat for a event
  drawId, // required if modifying tieFormat for a drawDefinition or a structure
});
```

---

## participantScaleItem

Similar to [getParticipantScaleItem](#getparticipantscaleitem) but takes a `participant` object and doesn't require `tournamentEngine.setState(tournamentRecord)`.

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
  scaleAttributes,
  participant,
});
```

---

## positionActions

Returns valid actions for a given `drawPosition`. If params includes `matchUpId` will pass through to [matchUpActions](#matchupactions) when called for **AD_HOC** structures.

```js
const positionActions = tournamentEngine.positionActions({
  policyDefinitions: positionActionsPolicy, // optional - policy defining what actions are allowed in client context
  returnParticipants, // optional boolean; defaults to true; performance optimization when false requires client to provide participants.
  drawPosition,
  structureId,
  drawId,
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

## promoteAlternates

```js
tournamentEngine.promoteAlternates({
  participantIds,
  // either drawId or eventId are REQUIRED
  eventId, // optional if drawId proided
  drawId, // optional if eventId proided
});
```

---

## publishEvent

Utilizes [getEventData](#geteventdata) to prepare data for display. Differs from [getEventData](#geteventdata) in that it modifies the `publishState` of the event. Subscriptions or middleware may be used to deliver the generated payload for presentation on a public website.

See [Policies](../concepts/policies) for more details on `policyDefinitions` and [Publishing](../concepts/publishing.md) for more on use cases.

```js
const policyDefinitions = Object.assign({}, ROUND_NAMING_POLICY, PARTICIPANT_PRIVACY_DEFAULT);

const { eventData } = tournamentEngine.publishEvent({
  removePriorValues, // optional boolean - when true will delete prior timeItems
  policyDefinitions, // optional - e.g. participant privacy policy (if not already attached)

  drawIdsToRemove, // optional - drawIds to remove from drawIds already published
  drawIdsToAdd, // optional - drawIds to add to drawIds already published

  drawDetails, // { [drawId]: { structureDetails, stageDetails, publishingDetail: { published: true, embargo: UTC Date string } }}

  eventId, // required - eventId of event to publish
});
```

---

## publishEventSeeding

```js
tournamentEngine.publishEventSeeding({
  removePriorValues, // optional boolean - when true will delete prior timeItems
  stageSeedingScaleNames, // { MAIN: 'mainScaleName', QUALIFYING: 'qualifyingScaleName' } - required if a distinction is made between MAIN and QUALIFYING seeding
  seedingScaleNames, // optional
  drawIds, // optional - publish specific drawIds (flights) within the event
  eventId,
});
```

---

## publishOrderOfPlay

```js
tournamentEngine.publishOrderOfPlay({
  removePriorValues, // optional boolean - when true will delete prior timeItems
  scheduledDates, // optional - if not provided will publish all scheduledDates
  eventIds, // optional - if not provided will publish all eventIds
});
```

---

## qualifierDrawPositionAssignment

Replaces an existing drawPosition assignment with a qualifierParticipantId. This method is included in `validActions` for [positionActions](../policies/positionActions)

```js
tournamentEngine.qualifierDrawPositionAssignment({
  qualifierParticipantId,
  drawPosition,
  structureId,
  drawId,
});
```

---

## regenerateParticipantNames

Regenerate `.participantName` for SINGLES and DOUBLES `participants`.

Upper/lower case and order are derived from `personFormat` string which must contain "last" and may contain "first" or "f", for first initial.

```js
const formats = {
  PAIR: { personFormat: 'LAST', doublesJointer: '/' },
  INDIVIDUAL: { personFormat: 'LAST, First' },
};
tournamentEngine.regenerateParticipantNames({ formats });
```

---

## removeCollectionDefinition

```js
tournamentEngine.removeCollectionDefinition({
  updateInProgressMatchUps, // optional; defaults to true
  tieFormatComparison, // optional; defaults to false; when true will not delete unique collections on unscored matchUps
  tieFormatName, // any time a collectionDefinition is modified a new name must be provided
  collectionId, // required - id of collectionDefinition to be removed
  structureId, // optional - if removing from tieFormat associated with a specific structure
  matchUpId, // optional - if removing from tieFormat asscoiated with a specific matchUp
  eventId, // optional - if removing from tieFormat asscoiated with an event
  drawId, // required if structureId is specified or if tieFormat associated with drawDefinition is to be modified
});
```

---

## removeCollectionGroup

Removes a `collectionGroup` from the `tieFormat` found for the `event`, `drawDefinition`, `structure` or `matchUp`; recalculates

```js
tournamentEngine.removeCollectionGroup({
  updateInProgressMatchUps, // optional - defaults to true
  tieFormatName: 'New tieFormat', // if no name is provided then there will be no name
  collectionGroupNumber: 1,
  structureId, // optional
  matchUpId, // optional
  eventId, // optional
  drawId, // optional; required if structureId is targeted
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
  autoEntryPositions, // optional - keeps entries ordered by entryStage/entryStatus and auto-increments
  participantIds
  eventId,
  stages, // optional array of stages to consider, e.g. [VOLUNTARY_CONSOLATION]
  drawId,
  });
```

---

## removeEventEntries

Removes `event.entries` with integrity checks.

Filters `participantIds` by specified `entryStatuses` and/or `stage`. If no `participantIds` are provided, removes all `entries` that match both `entryStatuses` and `stage`.

```js
tournamentEngine.removeEventEntries({
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
tournamentEngine.removeEventExtension({ eventId, name });
```

---

## removeEventMatchUpFormatTiming

```js
tournamentEngine.removeEventMatchUpFormatTiming({ eventId });
```

---

## removePolicy

```js
tournamentEngine.removePolicy({ policyType }); // remove from tournamentRecord
tournamentEngine.removePolicy({ policyType, eventId }); // remove from event
```

---

## removeIndividualParticipantIds

Remove an array of individualParticipantIds from a grouping participant [TEAM, GROUP].
If an individualParticipant is in a matchUp with a result they cannot be removed.

```js
const { removed, notRemoved, cannotRemove } = tournamentEngine.removeIndividualParticipantIds({
  addIndividualParticipantsToEvents, // optional boolean
  individualParticipantIds,
  groupingParticipantId,
  suppressErrors, // optional boolean - do not throw an error if an individualParticipant cannot be removed
});
```

---

## removeMatchUpSideParticipant

Removes participant assigned to AD_HOC matchUp.

```js
removeMatchUpSideParticipant({
  sideNumber, // number - required
  matchUpId, // required
  drawId, // required
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

## removeRoundMatchUps

```js
const {
  deltedMatchUpsCount, // number
  roundRemoved, // boolean
  success, // boolean
  error, // if any
} = tournamentEngine.removeRoundMatchUps({
  removeCompletedMatchUps, // optional boolean - whether to remove completed matchUps
  roundNumber, // required - roundNumber to remove
  structureId, // required
  drawId, // required
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

## removeTieMatchUpParticipantId

```js
tournamentEngine.removeTieMatchUpParticipantId({
  participantId, // id of INDIVIDUAL or PAIR be removed
  tieMatchUpId, // tieMatchUp, matchUpType either DOUBLES or SINGLES
  drawId, // draw within which tieMatchUp is found
});
```

---

## removeTournamentExtension

```js
tournamentEngine.removeTournamentExtension({ name });
```

---

## renameStructures

```js
tournamentEngine.renameStructures({
  structureDetails: [{ structureId, structureName }],
  drawId,
});
```

## replaceTieMatchUpParticipantId

```js
tournamentEngine.replaceTieMatchUpParticipantId({
  existingParticipantId,
  newParticipantId,
  tieMatchUpId,
  drawId,
});
```

---

## resetDrawDefinition

```js
tournamentEngine.resetDrawDefinition({ drawId });
```

---

## resetScorecard

Removes all scores from `tieMatchUps` within a TEAM `matchUp`; preserves `lineUps`.

```js
tournamentEngine.resetScorecard({
  tiebreakReset, // optional boolean - check for tiebreak scenarios and reset tieFormat
  matchUpId, // required - must be a TEAM matchUp
  drawId, // required
});
```

---

## resetTieFormat

Remove the `tieFormat` from a TEAM `matchUp` if there is a `tieFormat` further up the hierarchy; modifies `matchUp.tieMatchUps` to correspond.

```js
tournamentEngine.resetTieFormat({
  matchUpId, // must be a TEAM matchUp
  drawId, // required
  uuids, // optional - in client/server scenarios generated matchUps must have equivalent matchUpIds
});
```

---

## resetVoluntaryConsolationStructure

```js
tournamentEngine.resetVoluntaryConsolationStructure({
  resetEntries, // optional - remove all { entryStage: VOLUNTARY_CONSOLATION }
  drawId,
});
```

--

## scaledTeamAssignment

Assigns individual participants to teams using a waterfall pattern; removes UNGROUPED entries as appropriate for TEAM events. May be called with either `individualParticipantIds` and `scaleAttributes` or with an array of `scaledParticipants`.

:::info
By default existing `individualParticipant` assignments are cleared. If existing assignments are retained, any `individualParticipant` already assigned will be excluded from further assignment. It may be desirable to retain existing assignments if sequential assignment of different groups of `individualParticipants` is desired.
:::

:::note
Modifying team assignments has "global" effect, meaning that if a team appears in multiple events, team membership will be changed for all events.
:::

### Example use with `individualParticipantIds` and `scaleAttributes`

```js
const scaleAttributes = {
  scaleType: RANKING,
  eventType: SINGLES,
  scaleName: 'U18',
  sortOrder: ASCENDING, // defaults to ASCENDING; use case for DESCENDING is unclear!
};
tournamentEngine.scaledTeamAssignment({
  clearExistingAssignments, // optional - true by default remove all existing individualParticipantIds from targeted teams
  individualParticipantIds, // individuals to be sorted by scaleAttributes and assigned to teams (WATERFALL)
  reverseAssignmentOrder, // optional - reverses team order; useful for sequential assignment of participant groupings to ensure balanced distribution
  teamParticipantIds, // optional, IF teamsCount is provided then teams will be created
  initialTeamIndex, // optional - allows assignment to begin at a specified array index; useful for sequential assignment of groups of scaledParticipants
  scaleAttributes, // ignored if scaledParticipants are provided; { scaleName, scaleType, sortOrder, eventType }
  teamNameBase, // optional - defaults to '[categoryName] TEAM #', where categoryName is derived from eventId (if supplied)
  teamsCount, // optional - derived from teamParticipantIds (if provided) - create # of teams if teamParticipantIds provided are insufficient
  eventId, // optional - source team participants from DIRECT_ACCEPTANCE entries for specified event
});
```

### Example use with `scaledParticipants`

```js
const scaleAttributes = {
  scaleType: RANKING,
  eventType: SINGLES,
  scaleName: 'U18',
};

const scaledParticipants = individualParticipants.map((participant) => ({
  participantId: 'participantId',
  scaleValue: participantScaleItem({ participant, scaleAttributes }).scaleItem.scaleValue,
}));

const teamParticipantIds = teamParticipants.map(getParticipantId);

tournamentEngine.scaledTeamAssignment({
  scaledParticipants, // [{ participantId: 'participantId', scaleValue: '10' }]
  teamParticipantIds,
});
```

### Example use with sequential assignment where there are 8 teams

In this scenario scaled MALE participants are assigned in a waterfall pattern beginning with the first team (default behavior); scaled FEMALE participants are then assigned in a reverse waterfall pattern beginning with the last team. The goal is to balance the teams to the greatest extent possible. This pattern can be used with an arbitrary number of groups of `individualParticipants`.

```js
tournamentEngine.scaledTeamAssignment({
  scaledParticipants: maleScaleParticipants,
  teamParticipantIds,
});

tournamentEngine.scaledTeamAssignment({
  scaledParticipants: femaleScaleParticipants,
  clearExistingAssignments: false,
  reverseAssignmentOrder: true,
  initialTeamIndex: 7,
  teamParticipantIds,
});
```

---

## setDrawParticipantRepresentativeIds

Set the participantIds of participants in the draw who are representing players by observing the creation of the draw.

```js
tournamentEngine.setDrawParticipantRepresentativeIds({
  representativeParticipantIds,
  drawId,
});
```

---

## setEntryPosition

Set entry position a single event entry

```js
tournamentEngine.setEntryPosition({
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
tournamentEngine.setEntryPositions({
  entryPositions, // array of [{ entryPosition: 1, participantId: 'participantid' }]
  eventId, // optional if drawId is provided
  drawId, // optional if eventId is provided
});
```

---

## setMatchUpDailyLimits

```js
tournamentEngine.setMatchUpDailyLimits({
  dailyLimits: { SINGLES: 2, DOUBLES: 1, total: 3 },
});
```

---

## setMatchUpFormat

Sets the `matchUpFormat` for a specific `matchUp` or for any scope within the hierarchy of a `tournamentRecord`.

:::info
If an array of `scheduledDates` is provided then `matchUps` which have `matchUpStatus: TO_BE_PLAYED` and are scheduled to be played on the specified dates will have their `matchUpFormat` fixed rather than inherited. This means that subsequent changes to the parent `structure.matchUpFormat` will have no effect on such `matchUps`.

The `force` attribute will remove the `matchUpFormat` from all targeted `matchUps` which have `matchUpStatus: TO_BE_PLAYED`; this allows the effect of using `scheduledDates` to be reversed. Use of this attribute will have no effect if `scheduledDates` is also provided.

:::

```js
tournamentEngine.setMatchUpFormat({
  matchUpFormat, // TODS matchUpFormatCode
  eventType, // optional - restrict to SINGLES or DOUBLES

  matchUpId, // optional - set matchUpFormat for a specific matchUp
  drawId, // required only if matchUpId, structureId or structureIds is present
  force, // optional boolean - when setting for structure, draws or events, strip any defined matchUpFormat from all TO_BE_PLAYED matchUps

  // scoping options
  scheduledDates, // optional - ['2022-01-01']
  stageSequences, // optional - [1, 2]
  structureIds, // optional - ['structureId1', 'structureId2']
  structureId, // optional
  eventIds, // optional - ['eventId1', 'eventId2']
  eventId, // optional
  drawIds, // optional - ['drawId1', 'drawId2']
  stages, // optional - ['MAIN', 'CONSOLATION']
});
```

---

## setMatchUpStatus

Sets either `matchUpStatus` or `score` and `winningSide`; values to be set are passed in `outcome` object. Handles any winner/loser participant movements within or across `structures`.

```js
const outcome = {
  matchUpStatus, // optional
  winningSide, // optional
  score, // optional
};

tournamentEngine.setMatchUpStatus({
  disableScoreValidation, // optional boolean
  allowChangePropagation, // optional boolean - allow winner/loser to be swapped and propgate change throughout draw structures
  disableAutoCalc, // optional - applies only to { matchUpType: TEAM }
  enableAutoCalc, // optional - applies only to { matchUpType: TEAM }
  matchUpTieId, // optional - if part of a TIE matchUp
  matchUpId,
  outcome, // optional
  drawId,
  schedule: {
    // optional - set schedule items
    courtIds, // applies only to TEAM matchUps
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

## setOrderOfFinish

Sets the `orderOfFinish` attribute for `matchUps` specified by `matchUpId` in the `finishingOrder` array.

### Validation

Validation is done within a _cohort_ of `matchUps` which have equivalent `structureId`, `matchUpType`, `roundNumber`, and `matchUpTieId` (if applicable).

- `matchUpIds` in `finishingOrder` must be part of the same _cohort_
- `orderOfFinish` values must be unique positive integers within the _cohort_

```js
tournamentEngine.setOrderOfFinish({
  finishingOrder: [{ matchUpId, orderOfFinish: 1 }],
  drawId,
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
  removePriorValues, // optional boolean - when true will delete prior timeItems
  participantId,
  scaleItem,
});
```

---

## setParticipantScaleItems

```js
const scaleItemsWithParticipantIds = [
  {
    participantId: 'participantId',
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
tournamentEngine.setParticipantScaleItems({
  removePriorValues, // optional boolean - when true will delete prior timeItems
  scaleItemsWithParticipantIds,
  // optional context, primarily used when adding SEEDING, useful for structureReports
  context: {
    scaleAttributes, // e.g. { scaleType: 'SEEDING' }
    scaleBasis, // e.g. { scaleType: 'RANKING', scaleDate }
    eventId,
  },
});
```

```js
result = tournamentEngine.setParticipantScaleItems({
  scaleItemsWithParticipantIds: result.scaleItemsWithParticipantIds,
});
```

---

## setPositionAssignments

Intended to be used in conjunction with `automatedPlayoffPositioning` in deployments where a client instance gets the positioning which is then set on both the client and the server, to ensure that both client and server are identical. If `automatedPlayoffPositioning` is invoked on both client and server independently then it is likely that the positioning on client and server will be different.

```js
// executed only on the client
const { structurePositionAssignments } = tournamentEngine.automatedPlayoffPositioning({
  applyPositioning: false, // instructs tournamentEngine to only return values, not apply them
  structureId,
  drawId,
});

// executed on both client and server
result = tournamentEngine.setPositionAssignments({
  structurePositionAssignments,
  drawId,
});
```

---

## setState

Loads a tournament record into tournamentEngine.

```js
tournamentEngine.setsState(tournamentRecord, deepCopy, deepCopyConfig);
```

:::info
By default a deep copy of the `tournamentRecord` is made so that mutations made by `tournamentEngine` do not affect the source object. An optional boolean parameter, _deepCopy_ can be set to false to override this default behavior.
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

## setSubOrder

Used to order ROUND_ROBIN participants when finishingPosition ties cannot be broken algorithmically. Assigns a `subOrder` value to a participant within a `structure` by `drawPosition`.

```js
tournamentEngine.setSubOrder({
  drawPosition: 1,
  subOrder: 2,
  structureId,
  drawId,
});
```

---

## setTournamentCategories

Define categories to be used in `event` creation for tournament record.

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

## setTournamentDates

Set tournament `startDate` and `endDate` in one method call. Also cleans up `matchUp` schedules that are invalid due to date changes, and updates court `dateAvailability`.

```js
tournamentEngine.setTournamentDates({ startDate, endDate });
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

## setTournamentStatus

```js
tournamentEngine.setTournamentStatus({ status: CANCELLED });
```

---

## swapDrawPositionAssignments

Swaps the `participantIds` of two `drawPositions`.

```js
tournamentEngine.swapDrawPositionAssignments({
  drawPositions,
  structureId,
  drawId,
});
```

---

## toggleParticipantCheckInState

```js
tournamentEngine.toggleParticipantCheckInState({
  participantId,
  matchUpId,
  drawId,
});
```

---

## tournamentMatchUps

Returns tournament matchUps grouped by matchUpStatus. These matchUps are returned with _context_.

```js
const { abandonedMatchUps, completedMatchUps, upcomingMatchUps, pendingMatchUps, byeMatchUps, groupInfo } =
  tournamentEngine.tournamentMatchUps({
    matchUpFilters, // optional; [ scheduledDates: [], courtIds: [], stages: [], roundNumbers: [], matchUpStatuses: [], matchUpFormats: []]
    policyDefinitions, // optional - seeding or avoidance policies to be used when placing participants
    scheduleVisibilityFilters, // { visibilityThreshold: Date, eventIds, drawIds }
  });
```

---

## unPublishEvent

Modifies the `publishState` of an event. `Subscriptions` or middleware can be used to trigger messaging to services which make event data visible on public websites.

```js
tournamentEngine.unPublishEvent({
  removePriorValues, // optional boolean, defaults to true - when true will delete prior timeItems
  eventId,
});
```

---

## unPublishEventSeeding

```js
tournamentEngine.unPublishEventSeeding({
  removePriorValues, // optional boolean, defaults to true - when true will delete prior timeItems
  stages, // optionally specify array of stages to be unpublished, otherwise unpublish all stages
  eventId,
});
```

---

## unPublishOrderOfPlay

```js
tournamentEngine.unPublishOrderOfPlay({
  removePriorValues, // optional boolean, defaults to true - when true will delete prior timeItems
});
```

---

## updateTeamLineUp

```js
tournamentEngine.updateTeamLineUp({
  participantId, // id of the team for which lineUp is being updated
  tieFormat, // valid tieFormat - used to validate collectionIds
  lineUp, // valid lineUp array - see tournamentEngine.validateTeamLineUp
  drawId, // required as latest lineUp modification is stored in an extension on drawDefinition
});
```

---

## updateTieMatchUpScore

Trigger automatic calculation of the score of a TEAM matchUp.

```js
tournamentEngine.updateTieMatchUpScore({
  matchUpId,
  drawId,
});
```

---

## withdrawParticipantAtDrawPosition

Thin wrapper around [removeDrawPositionAssignment](#removedrawpositionassignment). This method is included in `validActions` for [positionActions](../policies/positionActions).

```js
tournamentEngine.withdrawParticipantAtDrawPosition({
  entryStatus = WITHDRAWN,
  replaceWithBye, // optional
  drawDefinition,
  drawPosition,
  structureId,
  destroyPair, // optional - decompose PAIR participant into UNPAIRED participants
});
```

---

## validateCollectionDefinition

```js
const { valid } = validateCollectionDefinition({
  collectionDefinition, // required
  checkCollectionIds, // optional boolean - check that collectionIds are present
  referenceCategory, // optional - category for comparision if eventId is not provided
  referenceGender, // optional - expected gender if eventId is not provided
  checkCategory, // optional boolean - defaults to true
  checkGender, // optional boolean - defaults to true
  eventId, // required only for checking gender
});
```

---

## validateTeamLineUp

```js
const { valid, error, errors } = tournamentEngine.validateLineUp({
  tieFormat, // required to validate collectionIds in lineUp
  lineUp,
});
```

---

## version

Returns NPM package version. Can be used in configurations that utilize Competition Factory engines on both client and server to ensure equivalency.

```js
const version = tournamentEngine.version();
```

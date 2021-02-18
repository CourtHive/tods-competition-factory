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
  refereeParticipantId: undefined,
  participantIds: [participantId],
  penaltyType: BALL_ABUSE,
  penaltyCode: 'Organization specific code',
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

## removeEventEntries

```js
tournamentEngine.removeEventEntries({ eventId, participantIds });
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

---

## deleteEvents

---

## deleteParticipants

---

## deleteVenue

---

## deleteVenues

---

## destroyPairEntry

Removes a participantType: PAIR entry from an event and adds the individualParticipantIds to entries as entryStatus: UNPAIRED

- @param {object} tournamentRecord - passed in by tournamentEngine
- @param {string} eventId - resolved to event by tournamentEngine
- @param {string} participantId - id of PAIR participant to remove; individualParticipantIds will be added as UNPAIRED participant entries

---

## devContext

Setting devContext(true) bypasses **try {} catch (err) {}** code block and in some cases enables enhanced logging

```js
tournamentEngine.devContext(true);
```

---

## eventMatchUps

---

## findCourt

---

## findMatchUp

---

## findParticipant

---

## findVenue

---

## generateDrawDefinition

This is a convenience method which handles most use cases for draw generation.

| Parameters           | Required | Type    | Description                                                                  |
| :------------------- | :------- | :------ | :--------------------------------------------------------------------------- |
| eventId              | Required | string  | Unique identifier for the event within the current tournament                |
| drawSize             | Required | number  | Number of draw postions there will be in the draw structure                  |
| drawType             | Optional | string  | ELIMININATION, ROUND_ROBIN & etc, defaults to SINGLE_ELIMINATION             |
| drawName             | Optional | string  | Custom name for the generated draw structure                                 |
| automated            | Optional | boolean | Whether or not to automatically generate draw structure(s); defaults to true |
| matchUpType          | Optional | string  | SINGLES, DOUBLES, or TEAM                                                    |
| matchUpFormat        | Optional | string  | ITF TODS matchUpFormat code which describes scoring format                   |
| playoffMatchUpFormat | Optional | string  | Alternate matchUpformat for connected playoff structures                     |
| tieFormat            | Optional | object  | includes collectionDefinitions and winCriteria                               |
| seedsCount           | Optional | number  | Desired seeds to be generated from rankings if no seededParticipants data    |
| seedingProfile       | Optional | string  | Used to specify WATERFALL seeding, for instance, for Round Robin structures  |
| seedByRanking        | Optional | boolean | Defaults to TRUE; use rankings for seeding if no seededParticipants provided |
| seededParticipants   | Optional | array   | Array of seeding objects including seedValue and participantId               |
| qualifyingRound      | Optional | number  | Round of the strucrure which qualifies participants for connected structure  |
| structureOptions     | Optional | object  | Defines groupSize and playoffGroups for Round Robin structures               |
| policyDefinitions    | Optional | array   | Seeding or avoidance policies to be used when placing participants in draw   |
| qualifyingPositions  | Optional | number  | Number of positions in this draw structure to will be filled by qualifiers   |

---

## generateFlightProfile

- @param {object} event - automatically retrieved by tournamentEngine given eventId
- @param {string} eventId - unique identifier for event
- @param {string} splitMethod - one of the supported methods for splitting entries
- @param {object} scaleAttributes - { scaleName, scaleType, evenTType }
- @param {number} flightsCount - number of flights to create from existing entries
- @param {string[]} drawNames - array of names to be used when generating flights
- @param {string} drawNameRoot - root word for generating flight names

---

## generateTeamsFromParticipantAttribute

---

## getCourtInfo

---

## getCourts

---

## getDrawData

---

## getEvent

- @param {string} eventId - id of the event to retreive
- @param {object} context - attributes to be added into each event object.

---

## getEvents

Return an array of deepCopies of all event objects.

- @param {object} context - attributes to be added into each event object.
- @param {boolean} inContext - whether or not to add tournament context into event (not yet implemented).

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

---

## getMatchUpFormat

Returns the matchUpFormat code for a given matchUp, along with any

- @param {object} tournamentRecord - passed in automatically by tournamentEngine
- @param {string} drawId - optional - avoid brute force search for matchUp
- @param {object} drawDefinition - passed in automatically by tournamentEngine when drawId provided
- @param {string} eventId - optional - if only the default matchUpFormat for an event is required
- @param {object} event - passed in automatically by tournamentEngine when drawId or eventId provided
- @param {string} structureId - optional - if only the default matchUpFormat for a structure is required
- @param {string} matchUpId - id of matchUp for which the scoped matchUpFormat(s) are desired

---

## getMatchUpScheduleDetails

---

## getPairedParticipant

- @param {string[]} participantIds - ids of the participants

---

## getParticipantEventDetails

Returns { eventDetails: { eventName, eventId }} for events in which participantId or TEAM/PAIR including participantId appears

- @param {object} tournamentRecord - tournament object (passed automatically from tournamentEngine state)
- @param {string} participantId - id of participant for which events (eventName, eventId) are desired

---

## getParticipantIdFinishingPositions

Returns the Range of finishing positions possible for all participantIds within a draw

- @param {string} drawId - drawId of target draw within a tournament
- @param {boolean} byeAdvancements - whether or not to consider byeAdancements in returns finishingPositionRange

## getParticipantScaleItem

---

## getParticipantSignInStatus

---

## getPolicyDefinition

Finds policyDefinition for either tournament, event (if eventId), or draw (if drawId);
Takes policyType as a parameter ('seeding', 'avoidance', or 'scoring')

---

## getPositionAssignments

---

## getSeedsCount

Takes a policyDefinition, drawSize and participantCount and returrns the number of seeds valid for the specified drawSize

- @param {boolean} drawSizeProgression - drawSizeProgression indicates that rules for all smaller drawSizes should be considered
- @param {object} policyDefinition - polictyDefinition object
- @param {number} participantCount - number of participants in draw structure
- @param {number} drawSize - number of positions available in draw structure

---

## getState

No parameters.

Returns a deep copy of the current tournamentEngine state.

```js
const { tournamentRecord } = tournamentEngine.getState();
```

---

## getTournamentParticipants

Returns deepCopies of tournament participants filtered by participantFilters which are arrays of desired participant attribute values

- @param {object} tournamentRecord - tournament object (passed automatically from tournamentEngine state)
- @param {object} participantFilters - attribute arrays with filter value strings
- @param {boolean} inContext - adds individualParticipants for all individualParticipantIds
- @param {boolean} withStatistics - adds events: { [eventId]: eventName }, matchUps: { [matchUpId]: score }, statistics: [{ statCode: 'winRatio'}]
- @param {boolean} withOpponents - include opponent participantIds
- @param {boolean} withMatchUps - include all matchUps in which participant appears

participantFilters imlemented: eventIds, participantTypes, participantRoles, signInStatus

```js
const { tournamentParticipants } = tournamentEngine.getTournamentParticipants({
  participantFilters: { participantTypes: [INDIVIDUAL] },
});
```

---

## getTournamentPenalties

---

## getTournamentInfo

---

## getVenues

---

## getVenueData

---

## matchUpActions

- return an array of all validActions for a given matchUp
-
- @param {object} tournamentRecord - provided automatically if tournamentEngine state has been set
- @param {string} drawId - if provided then drawDefinition will be found automatically
- @param {object} drawDefinition
- @param {string} matchUpId - id of matchUp for which validActions will be returned

---

## mergeParticipants

---

## modifyCourtAvailability

---

## modifyIndividualParticipantIds

Modify grouping participant [TEAM, GROUP] individualParticipantIds

- @param {object} tournamentRecord - passed in automatically by tournamentEngine
- @param {string} groupingParticipantId - grouping participant to which participantIds are to be added
- @param {string[]} individualParticipantIds - new value for individualParticipantIds array

---

## modifyParticipant

---

## modifyPenalty

---

## newTournamentRecord

---

## participantMembership

Returns all grouping participants which include participantId

- @param {object} tournamentRecord - passed automatically by tournamentEngine
- @param {string} participantId - id of individual participant

---

## participantScaleItem

---

## modifyParticipantsSignInStatus

---

## modifySeedAssignment

Change the display representation of a seedNumber

- @param {string} drawId - id of drawDefinition within which structure occurs
- @param {object} drawDefinition - added automatically by tournamentEngine
- @param {string} participantId - id of participant which will receive the seedValue
- @param {string} structureId - id of structure within drawDefinition
- @param {string} seedValue - supports value of e.g. '5-8'

---

## publishEvent

---

## rankByRatings

---

## regenerateDrawDefinition

---

## removeDrawPositionAssignment

Clear draw position.

- @param {string} drawId - id of drawDefinition within which structure is found
- @param {string} structureId - id of structure of drawPosition
- @param {number} drawPosition - number of drawPosition for which actions are to be returned
- @param {boolean} replaceWithBye - boolean whether or not to replace with BYE
- @param {boolean} destroyPair - if { participantType: PAIR } it is possible to destroy pair entry before modifying entryStatus
- @param {string} entryStatus - change the entry status of the removed participant to either ALTERNATE or WITHDRAWN

---

## removeParticipantIdsFromAllTeams

---

## removeIndividualParticipantIds

Remove individualParticipantIds from a grouping participant [TEAM, GROUP]

- @param {object} tournamentRecord - passed in automatically by tournamentEngine
- @param {string} groupingParticipantId - grouping participant to which participantIds are to be added
- @param {string[]} individualParticipantIds - individual participantIds to be removed to grouping participant

---

## removePenalty

---

## setDrawDefinitionDefaultMatchUpFormat

- @param {object} tournamentRecord - passed automatically by tournamentEngine
- @param {string} drawId - id of the draw for which matchUpFormat is being set
- @param {string} matchUpFormat - TODS matchUpFormatCode defining scoring format

---

## setDrawParticipantRepresentatives

---

## setEventDefaultMatchUpFormat

- @param {object} tournamentRecord - passed automatically by tournamentEngine
- @param {string} eventId - id of the event for which matchUpFormat is being set
- @param {string} matchUpFormat - TODS matchUpFormatCode defining scoring format

---

## setMatchUpStatus

- Sets either matchUpStatus or score and winningSide; values to be set are passed in outcome object.

- @param {string} drawId - id of draw within which matchUp is found
- @param {string} matchUpId - id of matchUp to be modified
- @param {string} matchUpTieId - id of matchUpTie, if relevant
- @param {string} matchUpFormat - optional - matchUpFormat if different from draw/event default
- @param {object} outcome - { score, winningSide, matchUpStatus }

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

- @param {object} tournamentRecord - passed automatically by tournamentEngine
- @param {string} drawId - id of the draw within which structure is found
- @param {object} drawDefinition - passed automatically by tournamentEngine when drawId is provided
- @param {string} matchUpFormat - TODS matchUpFormatCode defining scoring format
- @param {string} structureId - id of the structure for which the matchUpFormat is being set

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

---

## setTournamentEndDate

---

## setTournamentName

---

## setTournamentNotes

---

## setTournamentStartDate

---

## setVenueAddress

---

## tournamentMatchUps

Returns all matchUups in a tournamentRecord, assuming that `tournament.setState(tournamentRecord)` has already been called. These matchUps are returned **inContext**.

| Parameters     | Required | Type  | Description |
| :------------- | :------- | :---- | :---------- |
| matchUpFilters | Optional | array |             |
| contestFilters | Optional | array |             |

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

---

## withdrawParticipantAtDrawPosition

- @param {string} drawId - id of drawDefinition within which structure is found
- @param {string} structureId - id of structure of drawPosition
- @param {number} drawPosition - number of drawPosition for which actions are to be returned
- @param {boolean} replaceWithBye - boolean whether or not to replace with BYE
- @param {boolean} destroyPair - if { participantType: PAIR } it is possible to destroy pair entry before modifying entryStatus

---

## version

Returns NPM package version

---

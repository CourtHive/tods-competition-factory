---
name: API
menu: Tournament Engine
route: /tournamentEngine/api
---

# tournamentEngine API Reference

## addCourt

- @param {string} venueId
- @param {object} court - court object

{ courtId, courtName, altitude, latitude, longitude, surfaceCategory, surfaceType, surfaceDate, dateAvailability, onlineResources, courtDimensions, notes }

---

## addCourts

- @param {string} venueId
- @param {number} courtsCount - number of courts to add
- @param {string[]} courtNames - array of names to assign to generated courts
- @param {object[]} dataAvailability - dataAvailability object

---

## addDrawDefinition

---

## addDrawEntries

---

## addEvent

---

## addEventEntries

Adds participantIds to the entries array in an event

- @param {object} tournamentRecord - passed in automatically by tournamentEngine
- @param {string} eventId - tournamentEngine automatically retrieves event
- @param {string[]} participantIds - ids of all participants to add to event
- @param {string} enryStatus - entryStatus enum, e.g. DIRECT_ACCEPTANCE, ALTERNATE, UNPAIRED
- @param {string} entryStage - entryStage enum, e.g. QUALIFYING, MAIN

---

## addEventEntryPairs

Add PAIR participant to an event. Creates new participantType: PAIR participants if necessary

- @param {object} tournamentRecord - passed in automatically by tournamentEngine
- @param {string} eventId - tournamentEngine automatically retrieves event
- @param {string[][]} participantIdPairs - array of paired id arrays for all participants to add to event
- @param {string} enryStatus - entryStatus enum, e.g. DIRECT_ACCEPTANCE, ALTERNATE, UNPAIRED
- @param {string} entryStage - entryStage enum, e.g. QUALIFYING, MAIN

---

## addParticipant

Adds an INDIVIDUAL, PAIR or TEAM participant to tournament participants
Generates participant.participantId if none is provided
Includes integrity checks for PAIR participants to insure participant.individualParticipantIds are valid

- @param {object} participant - participant object

---

## addParticipants

---

## addIndividualParticipantIds

Adds individualParticipantIds to GROUP or TEAM participants

- @param {object} tournamentRecord - passed in automatically by tournamentEngine
- @param {string} groupingParticipantId - grouping participant to which participantIds are to be added
- @param {string[]} individualParticipantIds - individual participantIds to be added to grouping participant
- @param {boolean} removeFromOtherTeams - whether or not to remove from other teams

---

## addPenalty

---

## addPlayoffStructures

- @param {object} drawDefinition - passed in automatically by drawEngine
- @param {string} structureId - id of structure to which playoff structures are to be added
- @param {number[]} roundNumbers - source roundNumbers which will feed target structures
- @param {number[]} playoffPositions - positions to be played off
- @param {object} playoffAttributes - mapping of exitProfile to structure names, e.g. 0-1-1 for SOUTH
- @param {string} playoffStructureNameBase - Root word for default playoff naming, e.g. 'Playoff' for 'Playoff 3-4'

```js
tournamentEngine.addPlayoffStructures({
  drawId,
  structureId,
  roundNumbers: [3], // either target roundNumbers or playoffPositions
  playoffPositions: [3, 4],
});
```

---

## setSubOrder

Assigns a subOrder value to a participant within a structure by drawPosition where participant has been assigned

- @param {object} drawDefinition - added automatically by tournamentEngine with drawId
- @param {string} drawId - used by tournamentEngine to retrieve drawDefinition
- @param {string} structureId - structure identifier within drawDefinition
- @param {number} drawPosition - drawPosition of the participant where subOrder is to be added
- @param {number} subOrder - order in which tied participant should receive finishing position

---

## addVenue

---

## allowedDrawTypes

No parameters.

Returns an array of names of allowed Draw Types, if any applicable policies have been applied to the tournamentRecord.

---

## allowedMatchUpFormats

No parameters.

Returns an array of TODS matchUpFormat codes for allowed scoring formats, if any applicable policies have been applied to the tournamentRecord.

---

## allEventMatchUps

---

## allTournamentMatchUps

Return an array of all matchUps contained within a tournament. These matchUps are returned **inContext**.

```js
const { matchUps } = tournamentEngine.allTournamentMatchUps();
```

---

## alternateDrawPositionAssignment

- @param {string} drawId - id of drawDefinition within which structure is found
- @param {string} structureId - id of structure of drawPosition
- @param {number} drawPosition - drawPosition where alternate participantId will be assigned
- @param {string} alternateParticipantId - id of participant

---

## assignDrawPosition

---

## assignMatchUpCourt

---

## assignSeedPositions

- Provides the ability to assign seedPositions _after_ a structure has been generated
- To be used _before_ participants are positioned

Assign **participantIds** to **seedNumbers** within a target draw structure.

```json
Defaults to { stage: 'MAIN', stageSequence: 1 } if { structureId: undefined }
```

The structure of an **_assignment object_** is as follows:

```json
{
  "seedNumber": 1,
  "seedValue": 1,
  "participantId": "uuid-of-participant"
}
```

**seedNumber** is unique while **seedValue** can be any string representation.

This allows seeds 5-8 to be visually represented as all having a seed value of '5' or '5-8'.

| Parameters            | Required | Type    | Description                                                          |
| :-------------------- | :------- | :------ | :------------------------------------------------------------------- |
| drawId                | Required | string  | Unique identifier for target drawDefinition                          |
| assignments           | Required | array   | Array of assignment objects                                          |
| eventId               | Optional | string  | Not required; optimizes locating draw witthin tournamentRecord       |
| structureId           | Optional | string  | Apply assignments to a specific structure, identified by structureId |
| stage                 | Optional | string  | Locate target structure by stage; used together with stageSequence   |
| stageSequence         | Optional | number  | Locate target structure by stageSequence; used together with stage   |
| useExistingSeedLimits | Optional | boolean | Restrict ability to assign seedNumbers beyond established limit      |

---

## assignTieMatchUpParticipantId

---

## bulkMatchUpStatusUpdate

---

## bulkScheduleMatchUps

- @param {object} tournamentRecord - passed in automatically by tournamentEngine
- @param {string[]} matchUpIds - array of matchUpIds to be scheduled
- @param {object} schedule - { venueId?: string; scheduledDayDate?: string; scheduledTime?: string }

## bulkUpdatePublishedEventIds

- @param {object} tournamentRecord - passed in automatically by tournamentEngine
- @param {object[]} outcomes - array of outcomes to be applied to matchUps, relevent attributes: { eventId: string; drawId: string; }

Returns a filtered array of publishedEventIds from all eventIds which are included in a bulkMatchUpStatusUpdate

---

## checkInParticipant

---

## checkOutParticipant

---

## deleteCourt

---

## deleteDrawDefinitions

---

## removeEventEntries

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
| automated            | Optional | boolean | Whether or not to automatically generate draw structure(s); defaults to true |
| matchUpType          | Optional | string  | SINGLES, DOUBLES, or TEAM                                                    |
| matchUpFormat        | Optional | string  | ITF TODS matchUpFormat code which describes scoring format                   |
| playoffMatchUpFormat | Optional | string  | Alternate matchUpformat for connected playoff structures                     |
| tieFormat            | Optional | object  | includes collectionDefinitions and winCriteria                               |
| customName           | Optional | string  | Custom name for the generated draw structure                                 |
| seedsCount           | Optional | number  | Desired seeds to be generated from rankings if no seededParticipants data    |
| seedingProfile       | Optional | string  | Used to specify WATERFALL seeding, for instance, for Round Robin structures  |
| seedByRanking        | Optional | boolean | Defaults to TRUE; use rankings for seeding if no seededParticipants provided |
| seededParticipants   | Optional | array   | Array of seeding objects including seedValue and participantId               |
| qualifyingRound      | Optional | number  | Round of the strucrure which qualifies participants for connected structure  |
| structureOptions     | Optional | object  | Defines groupSize and playoffGroups for Round Robin structures               |
| policyDefinitions    | Optional | array   | Seeding or avoidance policies to be used when placing participants in draw   |
| qualifyingPositions  | Optional | number  | Number of positions in this draw structure to will be filled by qualifiers   |

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

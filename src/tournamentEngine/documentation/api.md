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

---

## addParticipant

Adds an INDIVIDUAL, PAIR or TEAM participant to tournament participants
Generates particpant.participantId if none is provided
Includes integrity checks for PAIR participants to insure participant.individualParticipantIds are valid

- @param {object} participant - participant object

---

## addParticipants

---

## addParticipantsToGrouping

---

## addPenalty

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

## devContext

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

## flushErrors

---

## generateDrawDefinition

This is a convenience method which handles most use cases for draw generation.

| Parameters           | Required | Type    | Description                                                                  |
| :------------------- | :------- | :------ | :--------------------------------------------------------------------------- |
| eventId              | Required | string  | Unique identifier for the event within the current tournament                |
| drawSize             | Required | number  | Number of draw postions there will be in the draw structure                  |
| drawType             | Optional | string  | ELIMININATION, ROUND_ROBIN & etc, defaults to ELIMINATION                    |
| automated            | Optional | boolean | Whether or not to automatically generate draw structure(s); defaults to true |
| matchUpType          | Optional | string  | SINGLES, DOUBLES, or TEAM                                                    |
| matchUpFormat        | Optional | string  | ITF TODS matchUpFormat code which describes scoring format                   |
| playoffMatchUpFormat | Optional | string  | Alternate matchUpformat for connected playoff structures                     |
| tieFormat            | Optional | object  | includes collectionDefinitions and winCriteria                               |
| customName           | Optional | string  | Custom name for the generated draw structure                                 |
| seedsCount           | Optional | number  | Desired seeds to be generated from rankings if no seededParticipants data    |
| seedingProfile       | Optional | string  | Used to specify WATERFALL seeding, for instance, for Round Robin structures  |
| seededParticipants   | Optional | array   | Array of seeding objects including seedValue and participantId               |
| qualifyingRound      | Optional | number  | Round of the strucrure which qualifies participants for connected structure  |
| structureOptions     | Optional | object  | Defines groupSize and playoffGroups for Round Robin structures               |
| policyDefinitions    | Optional | array   | Seeding or avoidance policies to be used when placing participants in draw   |
| qualifyingPositions  | Optional | number  | Number of positions in this draw structure to will be filled by qualifiers   |

---

## generateMockParticipants

---

## generateTeamsFromParticipantAttribute

---

## getAudit

---

## getCourts

---

## getEvent

- @param {string} eventId - id of the event to retreive

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

## getParticipantScaleItem

---

## getParticipantSignInStatus

---

## getPolicyDefinition

Finds policyDefinition for either tournament, event (if eventId), or draw (if drawId);
Takes policyType as a parameter ('seeding', 'avoidance', or 'scoring')

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

Returns tournament participants filtered by participantFilters which are arrays of desired participant attribute values

- @param {object} tournamentRecord - tournament object (passed automatically from tournamentEngine state)
- @param {object} participantFilters - attribute arrays with filter value strings

  imlemented: eventIds, participantTypes, participantRoles,
  to be implemented: drawIds, structureIds, signInStates, keyValues,

---

## getTournamentPenalties

---

## getVenues

---

## load

---

## matchUpActions

---

## mergeParticipants

---

## modifyCourtAvailability

---

## modifyPenalty

---

## newTournamentRecord

---

## participantScaleItem

---

## participantsSignInStatus

---

## rankByRatings

---

## regenerateDrawDefinition

---

## removeDrawPositionAssignment

---

## removeParticipantsFromAllTeams

---

## removeParticipantsFromGroup

---

## setDrawParticipantRepresentatives

---

## removePenalty

---

## setMatchUpStatus

---

## setParticipantScaleItem

---

## setParticipantScaleItems

---

## setState

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

Returns all matchUups in a tournamentRecord, assuming that `tournament.setState(tournamentRecord)` has already been called

| Parameters     | Required | Type  | Description |
| :------------- | :------- | :---- | :---------- |
| matchUpFilters | Optional | array |             |
| contestFilters | Optional | array |             |

---

## version

Returns NPM package version

---

---
name: API
menu: Tournament Engine
route: /tournamentEngine/api
---

# tournamentEngine API Reference

## addCourt

## addCourts

## addDrawDefinition

## addDrawEntries

## addEvent

## addEventEntries

## addParticipants

## addParticipantsToGrouping

## addVenue

## allEventMatchUps

## allTournamentMatchUps

## assignDrawPosition

## assignMatchUpCourt

## assignSeedPositions

Assign **participantIds** to **seedNumbers** within a target draw structure.

```json
Defaults to { stage: 'MAIN', stageSequence: 1 } if { structureId: undefined }
```

The structure of an ***assignment object*** is as follows:

```json
{
  seedNumber: 1,
  seedValue: 1,
  participantId: 'uuid-of-participant'
}
```

**seedNumber** is unique while **seedValue** can be any string representation.

This allows seeds 5-8 to be visually represented as all having a seed value of '5' or '5-8'.

| Parameters            | Required | Type    | Description |
| :---                  | :---     | :---    | :--- |
| drawId                | Required | string  | Unique identifier for target drawDefinition |
| assignments           | Required | array   | Array of assignment objects |
| eventId               | Optional | string  | Not required; optimizes locating draw witthin tournamentRecord |
| structureId           | Optional | string  | Apply assignments to a specific structure, identified by structureId |
| stage                 | Optional | string  | Locate target structure by stage; used together with stageSequence |
| stageSequence         | Optional | number  | Locate target structure by stageSequence; used together with stage |
| useExistingSeedLimits | Optional | boolean | Restrict ability to assign seedNumbers beyond established limit |

## assignTieMatchUpParticipantId

## bulkMatchUpStatusUpdate

## checkInParticipant

## checkOutParticipant

## deleteCourt

## deleteDrawDefinitions

## deleteEventEntries

## deleteEvents

## deleteParticipants

## deleteVenue

## deleteVenues

## devContext

## eventMatchUps

## findMatchUp

## findParticipant

## findVenue

## flushErrors

## generateDrawDefinition

## generateFakeParticipants

## generateTeamsFromParticipantAttribute

## getAudit

## getCourts

## getMatchUpScheduleDetails

## getParticipantScaleItem

## getParticipantSignInStatus

## getState

## getVenues

## load

## matchUpActions

## mergeParticipants

## modifyCourtAvailability

## modifyParticipant

## newTournamentRecord

## participantScaleItem

## participantsSignInStatus

## rankByRatings

## regenerateDrawDefinition

## removeDrawPositionAssignment

## removeParticipantsFromAllTeams

## removeParticipantsFromGroup

## setDrawParticipantRepresentatives

## setMatchUpStatus

## setParticipantScaleItem

## setParticipantScaleItems

## setState

## setTournamentCategories

## setTournamentEndDate

## setTournamentName

## setTournamentNotes

## setTournamentStartDate

## setVenueAddress

## tournamentMatchUps

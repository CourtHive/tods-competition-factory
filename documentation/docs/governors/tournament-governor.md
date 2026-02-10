---
title: Tournament Governor
---

```js
import { tournamentGovernor } from 'tods-competition-factory';
```

## addExtension

Adds an extension to a specified element in the tournament record. See examples: [Follow By Implementation](../concepts/pro-scheduling.md#follow-by-implementation), [4. Manual Override](../concepts/scheduling-conflicts.mdx#4-manual-override).

```js
engine.addExtension({
  extension, // required - extension object
  tournamentId, // optional - target tournament
  participantId, // optional - target participant
  eventId, // optional - target event
  drawId, // optional - target draw
  structureId, // optional - target structure
  matchUpId, // optional - target matchUp
});
```

**Purpose:** Attach custom metadata to tournament elements.

---

## addNotes

Adds notes to a tournament record or specific element.

```js
engine.addNotes({
  notes, // required - string or notes object
  tournamentId, // optional - target tournament
  participantId, // optional - target participant
  eventId, // optional - target event
  drawId, // optional - target draw
});
```

**Purpose:** Add textual notes/comments to tournament entities.

---

## addOnlineResource

Attach an online resource to specified element. When no other ids are provided, will attach to `tournamentRecord`.

```js
engine.addOnlineResource({
  onlineResource, // required { identifier, resourceType, resourceSubType, ... }
  organisationId, // optional
  participantId, // optional
  personId, // optional
  courtId, // optional
  venueId, // optional
  eventId, // optional
  drawId, // optional
});
```

---

## analyzeDraws

Analyzes all draws in a tournament to provide structural insights.

```js
const { analysis } = engine.analyzeDraws();
```

**Returns:** Analysis of draw structures, including sizes, stages, and completeness.

---

## analyzeTournament

Provides comprehensive analysis of tournament structure and data.

```js
const { analysis } = engine.analyzeTournament();
```

**Returns:** Tournament-level metrics including events, participants, draws, and matchUps.

---

## copyTournamentRecord

Creates a deep copy of a tournament record.

```js
const { tournamentRecord } = engine.copyTournamentRecord({
  tournamentId, // optional - specific tournament
});
```

**Purpose:** Clone tournament data for modifications or comparisons.

---

## createTournamentRecord

Creates a new tournament record.

```js
const { tournamentRecord } = engine.createTournamentRecord({
  tournamentName, // optional
  startDate, // optional - 'YYYY-MM-DD'
  endDate, // optional - 'YYYY-MM-DD'
  tournamentId, // optional - provide specific ID
});
```

**Purpose:** Initialize a new tournament.

---

## getAggregateTeamResults

Returns aggregated results for team competitions across multiple tournaments.

```js
const { results } = engine.getAggregateTeamResults({
  tournamentRecords, // required - array of tournament records
});
```

**Purpose:** Compile team standings across competitions.

---

## getAllowedDrawTypes

Returns allowed draw types for a specific event based on configuration.

```js
const { drawTypes } = engine.getAllowedDrawTypes({
  eventId, // required
});
```

**Purpose:** Get valid draw types for event creation.

---

## getAllowedMatchUpFormats

Returns allowed matchUp formats based on event type and configuration.

```js
const { matchUpFormats } = engine.getAllowedMatchUpFormats({
  eventType, // optional
});
```

**Purpose:** Get valid format options for events.

---

## getAppliedPolicies

Returns all policies currently applied to the tournament.

```js
const { policies } = engine.getAppliedPolicies();
```

**Purpose:** Query active tournament policies.

---

## getCompetitionDateRange

Returns the date range spanning all tournaments in a competition.

```js
const { startDate, endDate } = engine.getCompetitionDateRange({
  tournamentRecords, // required - array of tournament records
});
```

**Purpose:** Get overall competition dates.

---

## getCompetitionPenalties

Returns all penalties across multiple tournaments in a competition.

```js
const { penalties } = engine.getCompetitionPenalties({
  tournamentRecords, // required - array of tournament records
});
```

**Purpose:** Aggregate penalties across competition.

---

## getPolicyDefinitions

Returns attached policy definitions.

```js
const { policyDefinitions } = engine.getPolicyDefinitions();
```

**Purpose:** Get tournament policy configurations.

---

## getTournamentInfo

Returns basic tournament information.

```js
const { tournamentInfo } = engine.getTournamentInfo();
```

**Returns:** Tournament name, dates, location, and other metadata.

---

## getTournamentPenalties

Returns all penalties issued in the tournament.

```js
const { penalties } = engine.getTournamentPenalties();
```

**Purpose:** Query tournament penalties.

---

## getTournamentPersons

Returns all persons (not just participants) associated with tournament.

```js
const { persons } = engine.getTournamentPersons();
```

**Purpose:** Get all individuals including officials, staff, etc.

---

## getTournamentPoints

Returns points/prize money configuration for tournament.

```js
const { points } = engine.getTournamentPoints();
```

**Purpose:** Get tournament points structure.

---

## getTournamentStructures

Returns all structures across all draws in tournament.

```js
const { structures } = engine.getTournamentStructures();
```

**Purpose:** Get all draw structures tournament-wide.

---

## getTournamentTimeItem

Returns time items attached to tournament.

```js
const { timeItem } = engine.getTournamentTimeItem({
  itemType, // required - time item type
});
```

**Purpose:** Query time-based tournament metadata.

---

## hydrateTournamentRecord

Currently only accepts the directive `hydrateRoundNames: true`. Use of `eventProfiles` is optional and allows granularity in application of round naming policy at the event level. If `eventProfiles` is used the top level `directives` and `policyDefinitions` are not necessary.

````js
engine.hydrateTournamentRecord({
  policyDefinitions: POLICY_ROUND_NAMING_DEFAULT,
  directives: { hydrateRoundNames: true },
  eventProfiles: [{
    directives: { hydrateRoundNames: true }
    policyDefinitions: {},
    eventId: 'eventId',
  }]
})

---

## orderCollectionDefinitions

Modify the array order of `tieFormat.collectionDefinitions` for an `event`, a `drawDefinition`, `structure`, or `matchUp`.

```js
engine.orderCollectionDefinitions({
  orderMap: { collectionId1: 1, collectionId2: 2 },
  structureId, // required if modifying tieFormat for a structure
  matchUpId, // required if modifying tieFormat for a matchUp
  eventId, // required if modifying tieFormat for a event
  drawId, // required if modifying tieFormat for a drawDefinition or a structure
});
```

---

## removeExtension

Removes an extension from a specified element in the tournament record.

```js
engine.removeExtension({
  name,               // required - extension name
  tournamentId,       // optional - target tournament
  participantId,      // optional - target participant
  eventId,            // optional - target event
  drawId,             // optional - target draw
  structureId,        // optional - target structure
  matchUpId,          // optional - target matchUp
});
```

**Purpose:** Remove custom metadata from tournament elements.

---

## removeOnlineResource

Remove an online resource from specified element. When no other ids are provided, will remove from `tournamentRecord`.

```js
engine.removeOnlineResource({
  onlineResource, // only requires { identifier, resourceType, resourceSubType }
  organisationId, // optional
  participantId, // optional
  personId, // optional
  courtId, // optional
  venueId, // optional
  eventId, // optional
  drawId, // optional
});
```

---

## setTournamentCategories

Define categories to be used in `event` creation for tournament record.

```js
const categories = [
  {
    type: eventConstants.AGE,
    categoryName: 'U18',
  },
  {
    type: eventConstants.AGE,
    categoryName: 'U16',
  },
  {
    type: eventConstants.RATING,
    categoryName: 'WTN',
  },
];
engine.setTournamentCategories({ categories });
```

---

## setTournamentName

```js
const tournamentName = 'CourtHive Challenge';
engine.setTournamentName({
  tournamentName,
});
```

---

## setTournamentNotes

```js
engine.setTournamentNotes({ notes });
```

---

## setTournamentStatus

```js
engine.setTournamentStatus({ status: CANCELLED });
```

---
````

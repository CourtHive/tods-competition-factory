---
title: Context / Hydration
---

**Participants** can be returned with contextual information that is not part of the TODS document node from which they originated. The process of adding context is also referred to as "hydration".

Contextual information for `participants` can include `events, drawDefinitions` and `matchUps` in which each `participant` appears, as well as `ratings` and `rankings` converted from `timeItems`.

Additional contextual information can be passed into methods for retrieving `participants` via the `context` attribute, and any `extensions` can be converted to attributes accessible as attributes beginning with an underscore.

## tournamentParticipants

When participants are returned with `{ withIndividualParticipants: true }`, those that are `participantType` **PAIR, TEAM, or GROUP** include `individualParticipants` derived from `individualParticipantIds`.

```js
const {
  participants,
  participantIdsWithConflicts, // array of participantIds which have scheduling conflicts
} = tournamentEngine.getParticipants({
  convertExtensions: true, // converts extensions to attributes beginning with underscore
  participantFilters: { participantTypes: [PAIR] },
  scheduleAnalysis: { scheduledMinutesDifference },
  withIndividualParticipants: true,
  policyDefinitions,
  withStatistics,
  withOpponents,
  withMatchUps,
});
```

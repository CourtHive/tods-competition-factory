---
title: Context
---

When **matchUps** and **tournamentParticipants** are returned **inContext** it means that they include contextual information that is not part of the TODS document structure from which they originated.

## matchUps

All API calls which return **matchUps** return deep copies with context. Attributes that are added for **matchUps** include: structureId, structureName, drawId, eventId, eventName, tournamentId and tournamentName.

```js
const { matchUps } = tournamentEngine.allTournamentMatchUps();
```

## tournamentParticipants

For **tournamentParticipants**, individualParticipants are added from individualParticipantIds.

```js
const { tournamentParticipants } = tournamentEngine.getTournamentParticipants({
  participantFilters: {
    inContext: true,
    participantTypes: [PAIR],
  },
});
```

## Converted Extensions

All elements that are returned **inContext** include converted extensions. See **makeDeepCopy** in [Utilities](/utilities/makedeepcopy).

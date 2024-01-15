---
title: Participant Governor
---

```js
import { governors: { participantGovernor }} from 'tods-competition-factory';
```

## addParticipant

Adds an INDIVIDUAL, PAIR or TEAM participant to tournament participants. Includes integrity checks for `{ participantType: PAIR }` to ensure `participant.individualParticipantIds` are valid.

:::note
To add PAIR participants it is only necessary to provide an array of 2 valid individualParticipantIds, participantType and participantRole.
:::

```js
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

engine.addParticipant({ participant });
```

---

## addParticipants

Bulk add participants to a tournamentRecord.

```js
engine.addParticipants({ participants });
```

---

## addPenalty

Add a penaltyItem to one or more participants.

```js
const createdAt = new Date().toISOString();
const penaltyData = {
  refereeParticipantId, // optional
  participantIds: ['participantId'],
  penaltyCode: 'Organization specific code', // optional
  penaltyType: BALL_ABUSE,
  matchUpId,
  issuedAt, // optional ISO timeStamp for time issued to participant
  createdAt,
  notes: 'Hit ball into sea',
};
let result = engine.addPenalty(penaltyData);
```

---

## addPersons

Creates tournament `participants` from an array of defined persons. Useful for adding registered persons to a tournament record.
See **person** under **participant** in [Type Definitions](../types/typedefs#participant) for additional `person` attributes.

:::note

- `participantIds` are unique within a tournament
- `personIds` are unique to an individual, and should be identical across tournaments.

:::

```js
const persons = [
  {
    personId, // optional - providing a personId allows person to be tracked across tournaments
    participantExtensions, // optional - any relevant extensions for created participant
    participantTimeItems, // optional - any relevant timeItems (e.g. rankings/ratings) for created participant
    standardFamilyName,
    standardGivenName,
    nationalityCode,
    sex,

    // optional - will create pair participants
    pairedPersons: [
      {
        participantExtensions, // optional - any relevant extensions for created participant
        participantTimeItems, // optional - any relevant timeItems (e.g. rankings/ratings) for created participant
        personId,
      },
    ],
  },
];

engine.addPersons({
  participantRole, // optional - defaults to COMPETITOR
  persons,
});
```

---

## addIndividualParticipantIds

Adds individualParticipantIds to GROUP or TEAM participants

```js
engine.addIndividualParticipantIds({
  individualParticipantIds,
  groupingParticipantId,
  removeFromOtherTeams, // optional boolean
});
```

---

## modifyPenalty

```js
const notes = 'Hit ball into spectator';
const modifications = { notes };
engine.modifyPenalty({ penaltyId, modifications });
```

---

## removePersonRequests

Removes person requests matching passed values. If no paramaters are provided, removes **all** person requests.

```js
result = engine.removePersonRequests({
  personId, // optional - scope to personId
  requestType, // optioanl - scope to requestType
  requestId, // optional - scope to a single requestId
  date, // optional - scope to a specific date
});
```

---

## removePenalty

Removes a penalty from all relevant tournament participants.

```js
engine.removePenalty({ penaltyId });
```

---

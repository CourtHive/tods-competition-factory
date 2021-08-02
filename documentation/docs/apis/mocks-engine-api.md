---
title: Mocks Engine API
menu: Mocks Engine
route: /mocksEngine/api
---

## generateOutcomeFromScoreString

Generates `outcome` object from parseable score string.

```js
const { outcome } = mocksEngine.generateOutcomeFromScoreString({
  scoreString: '6-1 6-1', // parseable score string
  winningSide: 1, // optional - valid values are [1, 2, undefined]
  matchUpStatus: COMPLETED,
});
```

The `outcome` object can be passed into the `tournamentEngine` method for updating a `matchUp`.

```js
tournamentEngine.devContext(true).setMatchUpStatus({
  drawId,
  matchUpId,
  outcome,
});
```

---

## generateParticipants

Generate mock participants. This method is used within `generateTournamentRecord`

```js
const { participants } = mocksEngine.generateParticipants({
  participantsCount: 32, //  number of participants to generate
  participantType: PAIR, // [INDIVIDUAL, PAIR, TEAM]
  matchUpType: SINGLES, // optional - [SINGLES, DOUBLES] - forces PAIR participant generation if DOUBLES
  sex: FEMALE, // optional - [MALE, FEMALE]

  nationalityCodesCount: 10, // optional - number of nationality codes to use when generating participants
  nationalityCodes: [], // optional - an array of ISO codes to randomly assign to participants
  addressProps: {
    citiesCount: 10,
    statesCount: 10,
    postalCodesCount: 10,
  },
  valuesInstanceLimit, // optional - maximum number of values which can be the same

  inContext: true, // optional - whether to expand PAIR and TEAM individualParticipantIds => individualParticipant objects
  personData, //  optional array of persons to seed generator [{ firstName, lastName, sex, nationalityCode }]
});

tournamentEngine.addParticipants({ participants });
```

---

## generateTournamentRecord

Generate a complete tournamentRecord from the following attributes

```js
// Optional values
const outcomes = [
  {
    drawPositions: [1, 2],
    scoreString: '6-1 6-2',
    winningSide: 1,
  },
];
const drawProfiles = [
  {
    drawSize: 4,
    participantsCount: 4, // optional - ability to specify fewer participants than drawSize to generate BYEs
    drawType: ROUND_ROBIN,
    outcomes,
  },
];
const eventProfiles = [
  {
    eventName: 'U18 Boys Doubles',
    gender: MALE,
    drawProfiles: [
      {
        drawSize: 16,
      },
    ],
  },
];
const venueProfiles = [
  {
    venueName: 'Venue 1', // optional - will auto-generate names
    courtsCount: 3,
    dateAvailability, // optional - will use tournament start and end dates and default times
  },
];

const {
  tournamentRecord,
  drawIds: [drawId],
  eventIds: [eventId],
} = mocksEngine.generateTournamentRecord({
  endDate, // optional - ISO string date
  startDate, // optional - ISO string date
  participantsProfile, // optional - { participantCount, participantType }
  drawProfiles, // optional - array of profiles for draws to be generated; each draw creates an event
  eventProfiles, // optional - array of profiles for events to be generated; can include drawProfiles
  venueProfiles, // optional - array of profiles for venues to be generated; each venue creates courts
});

tournamentEngine.setState(tournamentRecord);
```

:::note
When using `drawProfiles` participants in excess of `drawSize` will be added with `{ entryStatus: ALTERNATE }`,
whereas with `eventProfiles` only the number of participants necessary to populate the draw are added with `{ entryStatus: DIRECT_ACCEPTANCE }`.
:::

---

## parseScoreString

Produces TODS sets objects.

```js
const sets = mocksEngine.parseScoreString({ scoreString: '1-6 1-6' });

/*
console.log(sets)
[
  ({
    side1Score: 1,
    side2Score: 6,
    side1TiebreakScore: undefined,
    side2TiebreakScore: undefined,
    winningSide: 2,
    setNumber: 1,
  },
  {
    side1Score: 1,
    side2Score: 6,
    side1TiebreakScore: undefined,
    side2TiebreakScore: undefined,
    winningSide: 2,
    setNumber: 2,
  })
];
*/
```

---

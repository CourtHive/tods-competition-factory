---
title: mocksEngine API
---

## anonymizeTournamentRecord

```js
mocksEngine.anonymizeTournamentRecord({
  tournamentRecord,
  tournamentName, // optional - new tournamentName
  personIds = [], // optional - array of UUIDs to be used for mocked person replacements
  tournamentId, // optional - new tournamentId; default behavior is to generate a new one
});
```

---

## generateOutcome

:::note
**matchUpStatusProfile** is an object containing the percentage chance specified matchUpStatuses will appear.

`matchUpStatusProfile: { [WALKOVER]: 100 }` will generate `WALKOVER` 100% of the time.
:::

```js
const { outcome } = mocksEngine.generateOutcome({
  matchUpFormat, // optional - generate outcome with score constrained by matchUpFormat
  matchUpStatusProfile: {}, // optional - an empty object always returns { matchUpStatus: COMPLETED }
  pointsPerMinute, // optional - defaults to 1 - used for generating timed set scores
  winningSide: 1, // optional - to specify a specific winningSide
  sideWeight, // optional - defaults to 4 - controls how often "deciding sets" are generated
  defaultWithScorePercent, // optional - percentage change that an outcome with { matchUpStatus: DEFAULTED } will have a score
});

const {
  score: { sets, scoreStringSide1, side2ScoreString },
  winningSide,
  matchUpStatus,
} = outcome;
```

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

Generate mock participants. This method is used within `generateTournamentRecord`; all parameters can be passed into `generateTournamentRecord({ participantsProfile })`.

```js
const { participants } = mocksEngine.generateParticipants({
  participantsCount: 32, //  number of participants to generate
  participantType: PAIR, // [INDIVIDUAL, PAIR, TEAM]
  matchUpType: SINGLES, // optional - [SINGLES, DOUBLES] - forces PAIR participant generation if DOUBLES
  sex: FEMALE, // optional - [MALE, FEMALE]

  valuesInstanceLimit, // optional - maximum number of values which can be the same
  nationalityCodesCount: 10, // optional - number of nationality codes to use when generating participants
  nationalityCodeType: 'ISO', // optional - 'IOC' or 'ISO', defaults to IOC
  nationalityCodes: [], // optional - an array of ISO codes to randomly assign to participants
  addressProps: {
    citiesCount: 10,
    statesCount: 10,
    postalCodesCount: 10,
  },
  personExtensions, // optional array of extensions to attach to all generated persons
  personData, //  optional array of persons to seed generator [{ firstName, lastName, sex, nationalityCode }]
  personIds, // optional array of pre-defined personIds

  category, // participant age and category scaleItems will be generated
  consideredDate, // date from which category ageMaxDate and ageMinDate should be calculated (typically tournament.startDate or .endDate)
  rankingRankge, // optional - range within which ranking numbers should be generated for specified category (non-rating)
  scaledParticipantsCount, // optional - number of participants to assign rankings/ratings - defaults to ~25

  inContext: true, // optional - whether to expand PAIR and TEAM individualParticipantIds => individualParticipant objects
});

tournamentEngine.addParticipants({ participants });
```

---

## generateTournamentRecord

Generate a complete tournamentRecord from the following attributes.

:::note
An additional attribute, `teamKey` is available for `participantsProfile`.

**TEAM** participants will be generated from the values of the specified attribute on **INDIVIDUAL** participants.

See `tournamentEngine.generateTeamsFromParticipantAttribute()` for more information.
:::

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
    drawType: ROUND_ROBIN, // optional - defaults to SINGLE_ELIMINATION
    drawSize: 4, // optional - defaults to 32
    eventType: DOUBLES, // optional - defaults to SINGLES

    participantsCount: 4, // optional - ability to specify fewer participants than drawSize to generate BYEs
    policyDefinitions, // optional - { [policyType]: policyDefinition, [policyType2]: policyDefinition }
    uniqueParticipants, // optional boolean - defaults to false - force generation of unique participants for a draw

    matchUpFormat, // optional - applies only to { eventTypes: SINGLES or DOUBLES }
    tieFormat, // optional - applies only when { eventType: TEAM }
    outcomes,
  },
];

// drawProfiles are optional in eventProfiles; if present they can contain all attributes noted above
const eventProfiles = [
  {
    eventName: 'U18 Boys Doubles',
    policyDefinitions, // optional - { [policyType]: policyDefinition, [policyType2]: policyDefinition }
    eventType: TEAM, // optional - defaults to SINGLES
    gender: MALE,
    drawProfiles: [
      {
        drawType, // optional
        drawSize: 16, // required
        completionGoal, // optional - number of matchUps within draw structures to complete
      },
    ],
  },
];
const venueProfiles = [
  {
    courtsCount: 3, // optional - count can be inferred from length of courtNames array
    courtNames: [], // optional
    dateAvailability, // optional - will use tournament start and end dates and default times
    venueName: 'Venue 1', // optional - will auto-generate names
  },
];

const {
  tournamentRecord,
  drawIds: [drawId],
  eventIds: [eventId],
} = mocksEngine.generateTournamentRecord({
  endDate, // optional - ISO string date
  startDate, // optional - ISO string date
  participantsProfile, // optional - { participantCount, participantType } - see mocksEngine.generateParticipants()
  policyDefinitions, // optional - { [policyType]: policyDefinition, [policyType2]: policyDefinition }
  matchUpStatusProfile, // optional - whole number percent for each target matchUpStatus { [matchUpStatus]: percentLikelihood }
  drawProfiles, // optional - array of profiles for draws to be generated; each draw creates an event
  eventProfiles, // optional - array of profiles for events to be generated; can include drawProfiles
  venueProfiles, // optional - array of profiles for venues to be generated; each venue creates courts
  completeAllMatchUps, // optional - boolean (legacy support for scoreString to be applied to all matchUps)
  randomWinningSide, // optional - boolean; defaults to false which results in always { winningSide: 1 }
  tournamentAttributes, // optionsl -object attributes will be applied to generated tournamentRecord
  tournamentExtensions, // optional - array of extensions to be attached to tournamentRecord
});

tournamentEngine.setState(tournamentRecord);
```

:::note
When using `drawProfiles` participants in excess of `drawSize` will be added with `{ entryStatus: ALTERNATE }`,
whereas with `eventProfiles` only the number of participants necessary to populate the draw are added with `{ entryStatus: DIRECT_ACCEPTANCE }`.
:::

---

## modifyTournamentRecord

Modify `events` in an existing tournamentRecord. Accepts the same attributes for `eventProfiles` as `generateTournamentRecord`.

The supplied `tournamentRecord` is directly modified.

```js
eventProfiles = [
  {
    eventId, // optional - either eventId or eventName
    eventName, // optional - either eventName or eventId
    drawProfiles: [
      {
        drawType, // optional
        drawSize: 8, // required
        completionGoal, // optional - number of matchUps within draw structures to complete
      },
    ],
  },
];

mocksEngine.modifyTournamentRecord({
  tournamentRecord,

  participantsProfile, // optional - participants for events will be generated automatically
  eventProfiles, // optional - see example usage for `generateTournamentRecord`

  completeAllMatchUps, // optional - boolean (legacy support for scoreString to be applied to all matchUps)
  randomWinningSide, // optional - boolean; defaults to false which results in always { winningSide: 1 }
});
```

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

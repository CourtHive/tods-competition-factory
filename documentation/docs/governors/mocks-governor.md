---
title: Mocks Governor
---

```js
import { mocksGovernor } from 'tods-competition-factory';
```

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
  matchUpStatusProfile: {}, // optional - whole number percent for each target matchUpStatus { [matchUpStatus]: percentLikelihood }
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
  scoreString: '6-1 6-1', // parseable score string, always from the winner perspective
  winningSide: 1, // optional - valid values are [1, 2, undefined]
  matchUpStatus: COMPLETED,
});
```

The `outcome` object can be passed into the factory engine method for updating a `matchUp`.

```js
engine.devContext(true).setMatchUpStatus({
  matchUpId,
  outcome,
  drawId,
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
  nationalityCodeType: 'IOC', // optional - 'IOC' or 'ISO', defaults to ISO
  nationalityCodes: [], // optional - an array of ISO codes to randomly assign to participants
  addressProps: {
    postalCodesCount: 10, // optional
    postalCodesProfile, // optional { 12345: 12, 23456: 20 }
    citiesCount: 10, // optional
    citiesProfile, // optional { Atlanta: 10, Orlando: 5, "New York": 1 }
    statesCount: 10, // optional
    statesProfile, // optional { FL: 10, GA: 10, SC: 5, NC: 4, AL: 3 }
  },
  personExtensions, // optional array of extensions to attach to all generated persons
  personData, //  optional array of persons to seed generator [{ firstName, lastName, sex, nationalityCode }]
  personIds, // optional array of pre-defined personIds
  idPrefix, // optional prefix used when generating participantids
  uuids, // optional array of uuids to use as participantIds

  category, // participant age and category scaleItems will be generated
  categories, // optional - for generating multiple ratings per participant
  consideredDate, // date from which category ageMaxDate and ageMinDate should be calculated (typically tournament.startDate or .endDate)
  rankingRankge, // optional - range within which ranking numbers should be generated for specified category (non-rating)
  scaledParticipantsCount, // optional - number of participants to assign rankings/ratings - defaults to ~25
  scaleAllParticipants, // optional boolean - overrides scaledParticipantsCount

  inContext: true, // optional - whether to expand PAIR and TEAM individualParticipantIds => individualParticipant objects
});

engine.addParticipants({ participants });
```

---

## generateTournamentRecord

Generate a complete tournamentRecord from the following attributes.

:::note
An additional attribute, `teamKey` is available for `participantsProfile`.

**TEAM** participants will be generated from the values of the specified attribute on **INDIVIDUAL** participants.

See `engine.createTeamsFromParticipantAttributes()` for more information.
:::

:::note Participant Profile Hierarchy
**participantsProfile** can be specified at three levels with the following priority:

1. **Draw-level** (within drawProfile) - highest priority, applies only to that draw
2. **Event-level** (within eventProfile) - applies to all draws in that event
3. **Tournament-level** (root level) - applies to all draws unless overridden

This allows you to generate different participant demographics for different events or draws within the same tournament.
:::

:::note Policy Definition Hierarchy
**policyDefinitions** can also be specified at three levels with the same priority:

1. **Draw-level** (within drawProfile) - highest priority, applies only to that draw
2. **Event-level** (within eventProfile) - applies to all draws in that event
3. **Tournament-level** (root level) - applies to all draws unless overridden

This allows you to specify different policies (seeding, avoidance, scoring, etc.) for different events or draws within the same tournament.
:::

:::note Scheduling Profiles
See [Scheduling](/docs/concepts/scheduling-profile) for more information on schedulingProfiles.

In the **mocksEngine** only:

- rounds can be targeted by providing only `roundNumber` (defaults to first structure)
- rounds can be targeted by `winnerFinishingPositionRange`. E.g. '1-2' will target the final round.

:::

```js
// Optional values -- see below
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
    seedsCount, // optional - number of particpants to be seeded
    idPrefix, // optional prefix used for generation of matchUpIds
    completionGoal, // optional - number of matchUps within draw structures to complete

    participantsCount: 4, // optional - ability to specify fewer participants than drawSize to generate BYEs
    participantsProfile, // optional - draw-specific participantsProfile (overrides tournament-level)
    policyDefinitions, // optional - { [policyType]: policyDefinition, [policyType2]: policyDefinition }
    uniqueParticipants, // optional boolean - defaults to false - force generation of unique participants for a draw

    matchUpFormat, // optional - applies only to { eventTypes: SINGLES or DOUBLES }
    tieFormat, // optional - applies only when { eventType: TEAM }
    outcomes,

    // specify playoff structures from specific rounds to specific "depths"
    withPlayoffs: {
      roundProfiles: [{ 3: 1 }, { 4: 1 }], // create playoff structures from rounds 3 and 4
      playoffPositions: [3, 4], // specific playoff positions for which structures must be generated
      playoffAttributes: {
        '0-3': { name: 'Silver', abbreviation: 'S' }, // specify name and abbreviation by "structure exit profile"
        '0-4': { name: 'Gold', abbreviation: 'G' },
      },
    },
  },
];

// drawProfiles are optional in eventProfiles; if present they can contain all attributes noted above
const eventProfiles = [
  {
    eventName: 'U18 Male Doubles',
    participantsProfile, // optional - event-specific participantsProfile (applies to all draws in event, overrides tournament-level)
    policyDefinitions, // optional - { [policyType]: policyDefinition, [policyType2]: policyDefinition }
    eventType: TEAM, // optional - defaults to SINGLES
    gender: MALE,
    drawProfiles: [
      {
        drawType, // optional
        drawSize: 16, // required
        completionGoal, // optional - number of matchUps within draw structures to complete
        participantsProfile, // optional - draw-specific participantsProfile (overrides event-level and tournament-level)
      },
    ],
  },
];
const venueProfiles = [
  {
    courtsCount: 3, // optional - count can be inferred from length of courtNames array
    courtNames: [], // optional - unique names for courts to be applied by index
    courtTimings: [], // optional [{ startTime, endTime }] to be applied by index
    dateAvailability, // optional - will use tournament start and end dates and default times
    venueName: 'Venue 1', // optional - will auto-generate names
    venueAbbreviation, // optional
    startTime, // optional court availability detail
    courtIds, // optional
    endTime, // optional court availability detail
    idPrefix, // optional - prefix for courtIds
    venuid, // optional
  },
];

const schedulingProfile = [
  {
    scheduleDate,
    venues: [{ drawId, rounds: [] }], // see Concepts => Scheduling for more details
  },
];

const {
  tournamentRecord,
  drawIds: [drawId],
  eventIds: [eventId],
} = mocksEngine.generateTournamentRecord({
  endDate, // optional - ISO string date
  startDate, // optional - ISO string date
  participantsProfile, // optional - { participantsCount, participantType } - see mocksEngine.generateParticipants()
  policyDefinitions, // optional - { [policyType]: policyDefinition, [policyType2]: policyDefinition }
  matchUpStatusProfile, // optional - whole number percent for each target matchUpStatus { [matchUpStatus]: percentLikelihood }
  drawProfiles, // optional - array of profiles for draws to be generated; each draw creates an event
  eventProfiles, // optional - array of profiles for events to be generated; can include drawProfiles
  venueProfiles, // optional - array of profiles for venues to be generated; each venue creates courts
  completeAllMatchUps, // optional - boolean (legacy support for scoreString to be applied to all matchUps)
  randomWinningSide, // optional - boolean; defaults to false which results in always { winningSide: 1 }
  tournamentAttributes, // optional -object attributes will be applied to generated tournamentRecord
  tournamentExtensions, // optional - array of extensions to be attached to tournamentRecord
  uuids, // optional - array of uuids to be used in entity generators

  autoSchedule, // optional - Boolean to call scheduleProfileRounds using the schedulingProfile
  schedulingProfile, // optional - array of scheduling directives { scheduleDate, venues : [{ venue, rounds }]}
});

engine.setState(tournamentRecord);
```

:::note
When using `drawProfiles` participants in excess of `drawSize` will be added with `{ entryStatus: ALTERNATE }`,
whereas with `eventProfiles` only the number of participants necessary to populate the draw are added with `{ entryStatus: DIRECT_ACCEPTANCE }`.
:::

### Completing matchUps with outcomes

The `outcomes` attribute of `drawProfiles` enables targeting specific `matchUps` for completion. Once a `structure` is targeted a `matchUp` may be targeted by either roundNumber/roundPosition or drawPositions.

```js
const outcomes = {
  drawPositions,
  matchUpFormat,
  matchUpIndex = 0,
  matchUpStatus = COMPLETED,
  roundNumber,
  roundPosition,
  scoreString,
  stage = MAIN,
  stageSequence = 1,
  structureOrder, // group number for RR
  winningSide,
}
```

---

## modifyTournamentRecord

Modify `events` in an existing tournamentRecord, identified by either `eventId`, `eventIndex`, or `eventName`.

Accepts the same attributes for `eventProfiles` as `generateTournamentRecord`.

The supplied `tournamentRecord` is directly modified.

```js
eventProfiles = [
  {
    eventId, // optional - see above
    eventName, // optional - see above
    eventIndex, // optional - see above - zero based index into events array
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
  drawProfiles, // optional - see example usage for `generateTournamentRecord`
  venueProfiles, // optional - see example usage for `generateTournamentRecord`
  schedulingProfile, // optional - see example usage for `generateTournamentRecord`

  completeAllMatchUps, // optional - boolean (legacy support for scoreString to be applied to all matchUps)
  randomWinningSide, // optional - boolean; defaults to false which results in always { winningSide: 1 }

  uuids, // optional - array of uuids for generated items
});
```

---

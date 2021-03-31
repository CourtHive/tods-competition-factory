---
title: Generating Tournaments
---

The Mocks Engine is used to generate tournaments for many of the Jest tests suites used in the development of the Competition Factory.

With no parameters the `generateTournamentRecord()` method will generate a tournamentRecord with 32 individual participants:

```js
const { tournamentRecord } = mocksEngine.generateTournamentRecord({});
```

In testing, very specific scenarios are required. Any number of draws can be added to a generated tournament, and scores for specific `matchUps` within the generated draw structures can be added as well. In the following example a Doubles draw with 32 positions is generated with 30 PAIR participants, leaving two positions to be filled with BYEs. The score is completed for the matchUp found using `{ roundNumber: 1, roundPosition: 2 }`.

`const { outcome } = mocksEngine.generateOutcomeFromScoreString()` is used internally to generate a valid TODS score object.

```js
const drawProfiles = [
  {
    drawSize: 32,
    participantsCount: 30,
    participantType: PAIR,
    outcomes: [
      {
        roundNumber: 1,
        roundPosition: 2,
        scoreString: '6-1 6-2',
        winningSide: 1,
      },
    ],
  },
];

const {
  eventIds,
  drawIds: [drawId],
  tournamentRecord,
} = mocksEngine.generateTournamentRecord({ drawProfiles });
```

The `generateTournamentRecord()` method returns an array of the `drawIds` and `eventIds` present in the generated `tournamentRecord` to aid in calling subsequent `tournamentEngine` methods:

```js
tournamentEngine.setState(tournamentRecord);

const { matchUps } = tournamentEngine.allDrawMatchUps({ drawId });
```

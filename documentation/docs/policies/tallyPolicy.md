---
title: Round Robin Tally Policy
---

A **Tally Policy** controls how order is determined for Round Robin groups.

Policy Definitions can be attached to a [tournament record](../apis/tournament-engine-api#attachpolicies), or an [event](../apis/tournament-engine-api#attacheventpolicies).

```js
const roundRobinTally = {
  groupOrderKey: 'matchUpsWon', // possible to group by tieMatchUpsWon, tieSinglesWon, tieDoublesWon, matchUpsWon, pointsWon, gamesWon, setsWon, gamesPct, setsPct, pointsPct, matchUpsPct
  groupTotalSetsPlayed: false, // optional - when true will calculate % of sets won based on total group sets played rather than participant sets played
  headToHead: { disabled: false },
  tallyDirectives: [
    // these are the default values if no tallyDirectives provided; edit to suit
    // idsFilter scopes the tally calculations to only tied participants
    // with { idsFilter: false } the ratio is calculated from all group matchUps
    // with { idsFilter: true } the ratio is calculated from matchUps including tied participants
    // when { maxParticipants: 2 } is defined, the rule only applies when # of participants is <= maxParticipants
    // any attribute/idsFilter combination can be selectively disabled for Head to Head calculations
    { attribute: 'matchUpsPct', idsFilter: false, disbleHeadToHead: false },
    {
      attribute: 'tieMatchUpsPct',
      idsFilter: false,
      disbleHeadToHead: false,
    },
    { attribute: 'setsPct', idsFilter: false, disbleHeadToHead: false },
    { attribute: 'gamesPct', idsFilter: false, disbleHeadToHead: false },
    { attribute: 'pointsPct', idsFilter: false, disbleHeadToHead: false },
    { attribute: 'matchUpsPct', idsFilter: true, disbleHeadToHead: false },
    { attribute: 'tieMatchUpsPct', idsFilter: true, disbleHeadToHead: false },
    { attribute: 'setsPct', idsFilter: true, disbleHeadToHead: false },
    { attribute: 'gamesPct', idsFilter: true, disbleHeadToHead: false },
    { attribute: 'pointsPct', idsFilter: true, disbleHeadToHead: false },
  ],
  disqualifyDefaults: true, // disqualified participants are pushed to the bottom of the group order
  disqualifyWalkovers: true, // disqualified participants are pushed to the bottom of the group order
  excludeMatchUpStatuses: [], // matchUpStatuses to exclude from calculations, e.g. ABANDONED, INCOMPLETE
  setsCreditForDefaults: false, // whether or not to award e.g. 2 sets won for participant who wins by opponent DEFAULT
  setsCreditForWalkovers: false, // whether or not to award e.g. 2 sets won for participant who wins by opponent WALKOVER
  setsCreditForRetirements: false, // whether or not to award e.g. 2 sets won for participant who wins by opponent RETIREMENT
  gamesCreditForDefaults: false, // whether or not to award e.g. 12 games won for participant who wins by opponent DEFAULT
  gamesCreditForWalkovers: false, // whether or not to award e.g. 12 games won for participant who wins by opponent WALKOVER
  gamesCreditForRetirements: false, // whether or not to award e.g. 2 sets won for participant who wins by opponent RETIREMENT
  gamesCreditForTiebreaks: true, // defaults to true; whether to count a set tiebreak as a game won, e.g. 6-7(3) 6-7(5)
  gamesCreditForTiebreakSets: true, // defaults to true; whether to count a tiebreak set as a game won, e.g. 6-2 2-6 [10-3]
  GEMscore: [
    'matchUpsPct',
    'tieMatchUpsPct',
    'setsPct',
    'gamesPct',
    'pointsPct',
  ],
};

tournamentEngine.attachPolicies({ policyDefinitions: { roundRobinTally } });
```

## Default Behavior

Round Robin group tally logic by default implements the following guidelines:

1. The participant who wins the most matches is the winner.
2. If two players are tied, then the winner of their head-to-head match is the winner.

If three or more participants are tied, tie are broken as follows:

- The head-to-head win-loss record in matches involving just the tied players;
- The participant with the highest percentage of sets won of all sets completed;
- The head-to-head win-loss record in matches involving the players who remain tied;
- The participant with the highest percentage of games won of all games completed;
- The head-to-head win-loss record in matches involving the players who remain tied;
- The participant with the highest percentage of sets won of sets completed among players in the group under consideration;
- The head-to-head win-loss record in matches involving the players who remain tied;
- The participant with the highest percentage of games won of games completed among the players under consideration; and
- The head-to-head win-loss record in matches involving the players who remain tied.

## Implementation Details

After initial separation of participants by `matchUpsWon`,
the implementation is configurable by supplying an array of `tallyDirectives` in the **Tally Policy**.

The algorithm relies on the values availble in the calculated `participantResults` and works as follows:

- separate participants into groups by a given attribute
- a group with a single participant is 'resolved'
- groups of two participants are resolved by head-to-head (if not disabled/if participants faced each other)
- groups of three or more search for an attribute that will separate them into smaller groups
- participantResults scoped to the members of a group and recalculated when `{ idsFilter: true }`

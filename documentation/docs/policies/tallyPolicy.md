---
title: Round Robin Tally Policy
---

```js
const tallyPolicy = {
  headToHead: {
    disabled: false,
  },
  disqualifyDefaults: true, // disqualified participants are pushed to the bottom of the group order
  disqualifyWalkovers: true, // disqualified participants are pushed to the bottom of the group order
  setsCreditForDefaults: true, // whether or not to award e.g. 2 sets won for player who wins by opponent DEFAULT
  setsCreditForWalkovers: true, // whether or not to award e.g. 2 sets won for player who wins by opponent WALKOVER
  gamesCreditForDefaults: true, // whether or not to award e.g. 12 games won for player who wins by opponent DEFAULT
  gamesCreditForWalkovers: true, // whether or not to award e.g. 12 games won for player who wins by opponent WALKOVER
  tallyDirectives: [
    // these are the default values if no tallyDirectives provided; edit to suit
    // idsFilter scopes the tally calculations to only tied participants
    // with { idsFilter: false } the ratio is calculated from all group matchUps
    // with { idsFilter: true } the ratio is calculated from matchUps including tied participants
    // any attribute/idsFilter combination can be selectively disabled for Head to Head calculations
    { attribute: 'matchUpsRatio', idsFilter: false, disbleHeadToHead: false },
    { attribute: 'setsRatio', idsFilter: false, disbleHeadToHead: false },
    { attribute: 'gamesRatio', idsFilter: false, disbleHeadToHead: false },
    { attribute: 'pointsRatio', idsFilter: false, disbleHeadToHead: false },
    { attribute: 'matchUpsRatio', idsFilter: true, disbleHeadToHead: false },
    { attribute: 'setsRatio', idsFilter: true, disbleHeadToHead: false },
    { attribute: 'gamesRatio', idsFilter: true, disbleHeadToHead: false },
    { attribute: 'pointsRatio', idsFilter: true, disbleHeadToHead: false },
  ],
};
```

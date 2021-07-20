---
title: Scale Items
---

**scaleItems** capture participant RANKING, RATING and SEEDING values. They are attached to `participants` as [Time Items](./timeItems).
A participant can thus have multiple **_scaleItems_** for each event within a tournament.

```js
const scaleItem = {
  scaleValue: 8.3, // can be an integer, float or an object (see accessor below)
  scaleName: 'WTN', // an arbitrary name, can be organization specific, e.g. 'NTRP' or 'UTR'
  scaleType: RATING, //  RANKING, RATING, or SEEDING
  eventType: SINGLES, // SINGLES, DOUBLES, or TEAM
  scaleDate: '2020-06-06', // Ranking, Rating or Seeding date
};

tournamentEngine.setParticipantScaleItem({
  participantId,
  scaleItem,
});
```

**scaleAttributes** is an object with attribute values used to retrieve targetd **scaleItems**. The **scaleValue** with the latest date is returned.

```js
const scaleAttributes = {
  scaleType: RATING,
  eventType: SINGLES,
  scaleName: 'WTN',
};
const { scaleItem } = tournamentEngine.getParticipantScaleItem({
  participantId,
  scaleAttributes,
});
```

## Generating Seeding scaleItems

Scale items may be generated automatically using [autoSeeding](/docs/apis/tournament-engine-api#autoseeding) or [generateSeedingScaleItems](/docs/apis/tournament-engine-api#generateseedingscaleitems) and then saved to participants with [setParticipantScaleItems](/docs/apis/tournament-engine-api#setparticipantscaleitems).

## scaleItem Accessors

When **scaleValues** are objects, **scaleAttributes** may include an **accessor** describing an attribute path to a nested value.

See [Accessors](../policies/accessors).

```js
// to access the value of a particular attribute...
const scaleValue = {
  ntrpRating: 4.5
  ratingYear: '2020',
  ustaRatingType: 'C'
};

// provide an "accessor" describing the attribute path to the nested value in the scaleValue.
const scaleAttributes = {
  scaleType: RATING,
  eventType: DOUBLES,
  scaleName: 'NTRP',
  accessor: 'ntrpRating',
};
```

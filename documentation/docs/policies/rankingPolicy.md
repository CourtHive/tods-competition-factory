---
title: Ranking Policy
---

A Ranking Policy determines how points are awarded to participants for their participation in events and consists of `awardProfiles` which can be scoped based on a variety of attributes which are found on hydrated `matchUps`.

```js
cosnt rankingPoints = {
  awardProfiles: [
    {
      eventTypes: [],
      drawTypes: [],
      flights: [],
      stages: [],
      stageSequences: [],
    }
  ]
}
```

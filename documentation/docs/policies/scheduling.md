---
title: Scheduling Policy
---

Scheduling policies define average match times and can specify recovery times as well as maximum number of matches per player per day. A scheduling policy is normally attached to a tournament record, but can optionally be attached to an event.

```js
tournamentEngine.attachPolicy({ policyDefinition });
tournamentEngine.attachEventPolicy({ policyDefinition });
```

## Retrieving Scheuling times

Scheduling times are used by advanced scheduling methods and only need to be accessed after they are defined at the policy level when overrides for specific matchUpFormats are desired. See [getMatchUpFormatTiming](/docs/apis/tournament-engine-api#getscheduletiming)

```js
const {
  averageMinutes,
  recoveryMinutes,
} = tournamentEngine.getMatchUpFormatTiming({
  matchUpFormat,
  categoryName,
  categoryType,
  eventType,
});
```

## Scheduling Extensions

Scheduling policies can be overriden by scheduling extensions.

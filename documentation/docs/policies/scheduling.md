---
title: Scheduling Policy
---

Scheduling policies define average match times and can specify recovery times as well as maximum number of matches per player per day. A scheduling policy is normally attached to a tournament record, but can optionally be attached to an event.

```js
engine.attachPolicies({ policyDefinitions }); // attach to tournamentRecord
engine.attachPolicies({ policyDefinitions, eventId }); // attach to event
```

## Retrieving Scheduling times

Scheduling times are used by advanced scheduling methods and only need to be accessed after they are defined at the policy level when overrides for specific matchUpFormats are desired. See [getMatchUpFormatTiming](/docs/governors/query-governor#getscheduletiming)

```js
const { averageMinutes, recoveryMinutes } = engine.getMatchUpFormatTiming({
  matchUpFormat,
  categoryName,
  categoryType,
  eventType,
});
```

## Scheduling Extensions

Scheduling policies can be overriden by scheduling extensions.

---
title: Policy Governor
---

```js
import { policyGovernor } from 'tods-competition-factory';
```

## attachPolicies

Attaches policy definitions to `tournamentRecords`, a `tournamentRecord`, an `event`, or a `drawDefinition`.

See [Policies](/docs/concepts/policies).

```js
engine.attachPolicies({
  policyDefinitions: SEEDING_POLICY,
  allowReplacement, // optional boolean
  tournamentId, // optional
  eventId, // optional
  drawId, // optional
});
```

---

## findPolicy

Find `policyType` on a `tournamentRecord`, an `event`, or a `drawDefinition`.

```js
const { policy } = engine.findPolicy({
  policyType: POLICY_TYPE_SCORING,
  tournamentId, // optional
  eventId, // optional
  drawId, // optional
});
```

---

## removePolicy

```js
engine.removePolicy({ policyType }); // remove from all tournamentRecords
engine.removePolicy({ policyType, tournamentId }); // remove from specified tournamentRecord
engine.removePolicy({ policyType, eventId }); // remove from specified event
engine.removePolicy({ policyType, drawId }); // remove from specified drawDefinition
```

---

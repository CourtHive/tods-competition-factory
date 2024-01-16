---
title: Policy Governor
---

```js
import { governors: { policyGovernor }} from 'tods-competition-factory';
```

## attachPolicies

Attaches a policy to a tournamentRecord.

See [Policies](../concepts/policies).

```js
engine.attachPolicies({
  policyDefinitions: SEEDING_POLICY,
  allowReplacement, // optional boolean
});
```

---

## findPolicy

Find `policyType` either on an event object or the tournamentRecord.

```js
const { policy } = engine.findPolicy({
  policyType: POLICY_TYPE_SCORING,
  eventId, // optional
});
```

---

## removePolicy

```js
engine.removePolicy({ policyType }); // remove from tournamentRecord
engine.removePolicy({ policyType, eventId }); // remove from event
```

---

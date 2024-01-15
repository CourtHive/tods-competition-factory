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

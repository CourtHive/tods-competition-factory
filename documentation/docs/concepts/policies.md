---
title: Introduction to Policies
---

Policies determine how the various Competition Factory engines function and can shape the way that results are returned. Policies can be attached to the `tournamentRecord`, `events`, or to `drawDefinitions` within an `event`. They can also be passed into some `tournamentEngine` and `drawEngine` methods.

The structure of an **_policyDefinition_** is as follows:

```json
{
  [policyType]: {      // e.g. 'seeding' or 'avoidance'
    policyName: 'name'  // for 'seeding' can be the provider of the policy, e.g. 'ITF' or 'USTA'
    ...attributes       // attributes relevant to the policyType
  },
}
```

## Supported Policies

- POLICY_TYPE_ROUND_ROBIN_TALLY
- POLICY_TYPE_POSITION_ACTIONS
- POLICY_TYPE_ROUND_NAMING
- POLICY_TYPE_PARTICIPANT
- POLICY_TYPE_SCHEDULING
- POLICY_TYPE_AVOIDANCE
- POLICY_TYPE_SEEDING
- POLICY_TYPE_SCORING
- POLICY_TYPE_DRAWS

[Feed Policy](../policies/feedPolicy)

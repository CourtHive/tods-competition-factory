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

## Policy Types

### [Avoidance Policy](../policies/avoidance)

Can be attached to drawDefinitions to specify the attriubutes by which participants should be separated

### [Feed Policy](../policies/feedPolicy)

Useful for determining the way in which consolation feed rounds direct players

### [Round Robin Tally Policy](../policies/tallyPolicy)

Controls how calculations are performed which determine participant positions within Round Robin groups

### [Position Actions Policy](../policies/positionActions)

### Round Naming Policy

### Participant Policy

### Scheduling Policy

### Scoring Policy

### Draws Policy

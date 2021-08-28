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

- [Avoidance Policy](../policies/avoidance): Can be attached to drawDefinitions to specify the attriubutes by which participants should be separated
- [Position Actions Policy](../policies/positionActions): Determines valid actions for positions in a draw structure
- [Seeding Policy](../policies/positioningSeeds): Sets seeding pattern and thresholds for number of seeds allowed for draw sizes
- [Feed Policy](../policies/feedPolicy): Determining the the patterns which direct participants into consolation feed rounds
- [Round Robin Tally Policy](../policies/tallyPolicy): Configures calculations which determine participant finishing positions
- Round Naming Policy: Specifies how rounds of draw structures should be named
- Participant Policy: Enables participant details to be filtered to respect privacy concerns
- Scheduling Policy: Defines average and rest/recovery times for matchUpFormats, categoryNames, and categoryTypes
- Scoring Policy: Restricts available matchUpFormats, defines a default and conditions for "ready to score"

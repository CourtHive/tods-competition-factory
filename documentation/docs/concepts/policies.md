---
title: Introduction to Policies
---

Policies determine how the various Competition Factory engines function and can shape the way that results are returned. Policies can be attached to the `tournamentRecord`, `events`, or to `drawDefinitions` within an `event`. They can also be passed directly into some factory methods; e.g. a **Participant Policy** can be passed into a method which returns particpipants and filter out attributes which are not to be displayed.

The structure of a **_policyDefinitions_** object is as follows:

```json
{
  [policyType]: {      // e.g. 'seeding' or 'avoidance'
    policyName: 'name'  // for 'seeding' can be the provider of the policy, e.g. 'ITF' or 'USTA'
    ...attributes       // attributes relevant to the policyType
  },
  [anotherPolicyType]: {
    policyName: 'name'
    ...attributes
  },
}
```

## Policy Types

- [Avoidance Policy](../policies/avoidance): Can be attached to drawDefinitions to specify the attriubutes by which participants should be separated
- [Position Actions Policy](../policies/positionActions): Determines valid actions for positions in a draw structure
- [Seeding Policy](../policies/positioningSeeds): Sets seeding pattern and thresholds for number of seeds allowed for draw sizes
- [Scheduling Policy](../policies/scheduling): Defines average and rest/recovery times for matchUpFormats, categoryNames, and categoryTypes
- [Round Robin Tally Policy](../policies/tallyPolicy): Configures calculations which determine participant finishing positions
- [Feed Policy](../policies/feedPolicy): Determining the the patterns which direct participants into consolation feed rounds
- Round Naming Policy: Specifies how rounds of draw structures should be named
- Participant Policy: Enables participant details to be filtered to respect privacy concerns
- Scoring Policy: Restricts available matchUpFormats, defines a default and conditions for "ready to score"

## Relevant Methods

Each of these methods can accept `policyDefinitions` as a parameter.

- [competitionEngine.attachPolicies](../apis/competition-engine-api) - attaches to all `tournamentRecords`
- [competitionEngine.competitionParticipants](../apis/competition-engine-api) - uses to filter participant attributes
- [tournamentEngine.attachPolicies](../apis/tournament-engine-api) - attaches to the current `tournamentRecord`
- [tournamentEngine.attachEventPolicies](../apis/tournament-engine-api) - attaches to the `event` specified by `eventId`
- [tournamentEngine.autoSeeding](../apis/tournament-engine-api) - overrides present in `tournamentRecord`
- [tournamentEngine.generateDrawDefinition](../apis/tournament-engine-api) - overrides those present in `tournamentRecord`; are attached to the generated `drawDefinition`
- [tournamentEngine.getEventData](../apis/tournament-engine-api) - used to filter participant attributes
- [tournamentEngine.getAllEventData](../apis/tournament-engine-api) - used to filter participant attributes
- [tournamentEngine.getEntriesAndSeedsCount](../apis/tournament-engine-api) - overrides those present in the `event`
- [tournamentEngine.getPolicyDefinitions](../apis/tournament-engine-api) - returns `policyDefinitions` object constructed from specified `policyTypes` found at different levels within a `tournamentRecord`, depending on whether `eventId` and `drawId` are specified
- [tournamentEngine.getSeedsCount](../apis/tournament-engine-api) - overrides those present in `tournamentRecord`
- [tournamentEngine.positionActions](../apis/tournament-engine-api) - can modify the avialable actions
- [tournamentEngine.tournamentParticipants](../apis/tournament-engine-api) - used to filter participant attributes
- [tournamentEngine.publishEvent](../apis/tournament-engine-api) - used to filter particpant attributes and/or provide round naming values
- [drawEngine.attachPolicies](../apis/draw-engine-api) - attaches to the current `drawDefinition`
- [drawEngine.positionActions](../apis/draw-engine-api) - can modify the avialable actions

---
name: Avoidance
menu: Draw Engine
route: /drawEngine/avoidance
---

# Avoidance

Avoidance is an attempt to insure that grouped players do not encounter each other in early rounds (or just the first round) of an elimination draw structure, or that round robin brackets are generated such that players from the same group are evenly distributed across brackets and do not encounter each other unless there are more group members than there are brackets.

Avoidance can be applied to [Seed Blocks](/drawEngine/seedPositiioning#seed-blocks) as well as unseeded players, though Seeded players may only be moved to other positions valid for the Seed Block within which they are placed.

## Single Round Avoidance

Single Round Avoidance an be accomplished by random placement followed by an iterative shuffling algorithm which generates a score for each player distribution and which runs through a set number of iterations, or by iterative attempts to resolve conflicts by searching for alternate player positions. In some cases where single round avoidance is the goal it is specifically forbidden to attempt to maximize player separation within a draw.

## Multiple Round Avoidance

Multiple Round Avoidance seeks to place players as far apart within a draw structure as possible. This can be accomplished by dividing a draw structure into sections based on the number of players within a given group and distributing a group's players evenly across these sections, randomizing section placement if there are more sections than players in a given group. This process would be repeated for each group starting with the largest group. There are scenarios where players in smaller groups end up having only adjacent positions available when it comes to their distribution which necessitates a shuffling step for previously placed groups.

## Avoidance Policies

Both the **tournamentEngine** and **drawEngine** within the Competition Factory support attaching policy definitions which control the behavior of various exported methods.

For Avoidance the algoritm requires access to attributes of tournament participants and thus must be accessed via the **tournamentEngine**.

```js
const values = {
  event,
  eventId,
  automated: true,
  drawSize: 32,
  policyDefinitions: [AVOIDANCE_COUNTRY],
};
const { drawDefinition } = tournamentEngine.generateDrawDefinition(values);
```

In this case the **policydefinition** specifies that participants in the generated draw are to be separated according to any country values that may exist on participant records. The policy is defined as follows:

```js
const AVOIDANCE_COUNTRY = {
  avoidance: {
    roundsToSeparate: undefined,
    policyName: 'Nationality Code',
    policyAttributes: [
      { key: 'person.nationalityCode' },
      { key: 'individualParticipants.person.nationalityCode' },
    ],
  },
};
```

**policyName** is not required but useful for identifying a policy which has been attached to a **drawDefinition**

**roundsToSeparate** defines the desired separation; if undefined defaults to maximum separation.

**policyAttrributes** is an array of "accessors" which determine which attributes of participants to consider. In the example above the _nationalityCode_ of participants can be found in different places depending on whether the participant is an INDIVIDUAL or a PAIR. This notation works regardless of whether child attributes are strings, numbers, or arrays, as is the case with _individualPartcipants_ in PAIR participants.

**policyAttributes** can have an additional attribute **_significantCharacters_** which specifies the number of characters which will be considered when creating values for each key.

INDIVIDUAL participants may be mebmers of PAIR, TEAM and GROUP participants; the INDIVIDUAL participant object does not contain these attributes, so they must be added as "context" before avoidance processing can proceed. Three additional attributes are therefore added to the INDIVIDUAL partcipant objects:

- pairParticipantIds
- teamParticipantIds
- groupParticipantIds

Specifying that PAIR, TEAM or GROUP particpants should be considered for avoidance is achieved via 'directives' rather than keys because the value are handled differently.

```js
const pairAvoidancePolicy = {
  roundsToSeparate: undefined,
  policyName: 'Doubles Partner Avoidance',
  policyAttributes: [{ directive: 'pairParticipants' }],
};
```

To restrict the participantIds to be considered, add **_includeIds_** as an attribute containing an array of desired participantIds.

Other desired avoidance attributes may exist on participant objects as extensions. Any such extensions will be added as attributes to the particpant object prior to processing.

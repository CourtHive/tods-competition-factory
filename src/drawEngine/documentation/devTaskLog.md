# drawEngine dev tasks

- assignment of non-BYE drawPositions should check whether paired position is BYE and if so, drawPosition be advanced
- assignment of BYE should check whether paired position is filled and if so, advance paired position
- removal of BYE should check whether paired position is filled and if so, paired position should be removed from target directions

- write unit tests for **activeDrawPositions**
- a drawPosition advanced by BYE does not count as an *activeDrawPosition*
- write unit test for **clearDrawPosition** which includes attempting to clear an *activeDrawPosition* and a position which is paired with an *activeDrawPosition*

- directing *losers* across links should add them to **positionAssignments**

- how to determine that a matchUp is a FEED_IN?  one assigned drawPosition is not found in RoundNumber: 1 matchUps

## Seeding

- all **qualifying** stage structures may be seeded; progressive draws consist of sequences of qualifying structures which feed into each other, and each stageSequence may be seeded independently
- **main** stageSequence: 1 structures may be seeded, but **main** stageSequence 1+n are not seeded as long as participant draw positions are continuous, e.g. fed TOP DOWN or BOTTOM UP with a fixed pattern.
- **main** stage *playoff* structures and **consolation** stage structures may be seeded if participant positions are NOT continuous with the structures which are their source.  (**main** stage stageSequence: 1 is referred to as a *playoff* after a round robin qualifying stage).  If drawPositions for 5-8 playoffs are NOT continuous with the stageSequence which produced the participants, seeding is possible.

Considering the above, structures in general must be able to independently specify both the number of seeds and the participants nominated to be seeded.

A structure definition needs to know the number of participants who will be seeded before there are any entries, which is an argument for an attribute along the lines of **numberOfSeeds** or **seedsCount**, or at least a **seedAssignments** array which contains objects defining which **participantIds** are nominated as seeds -- which maps **pariticipantId** to **seedNumber**. There are policies which define where seeds may be placed within structures, but the fact that a position may contain a seed doesn’t imply that it does contain a seed, because seeds may be replaced by alternates who do not inherit the **seedNumber**.

For display purposes it is important to know whether to represent a participant’s seeding as seedNumber or seedBlock .  Somewhere in the *construction phase* definition we need to have what amounts to a **seedBlockThreshold**, which is a **seedNumber** after which **seedBlock** is displayed rather than **seedNumber**.  Within a Match we can have either **seedNumber** or **seedBlock** as an attribute within a **participant** object… or an attribute **seeded** which can be a String representation of how the participant was seeded…  at this point I’m inclined to not introduce yet another permutation of seeded state.  Since **seedBlockThreshold** is required, it seems to make more sense to just stick with **seedNumber** and **seedBlock**.

## Scheduling

1. If a draw is re-generated but retains the same "dimensions" (drawSize), the schedule can be preserved by pinning scheudling objects to RoundNumber/RoundPosition

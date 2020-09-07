## drawEngine dev tasks

- assignment of non-BYE drawPositions should check whether paired position is BYE and if so, drawPosition be advanced
- assignment of BYE should check whether paired position is filled and if so, advance paired position
- removal of BYE should check whether paired position is filled and if so, paired position should be removed from target directions

- write unit tests for **activeDrawPositions**
- a drawPosition advanced by BYE does not count as an *activeDrawPosition*
- write unit test for **clearDrawPosition** which includes attempting to clear an *activeDrawPosition* and a position which is paired with an *activeDrawPosition*

- directing *losers* across links should add them to **positionAssignments**

- how to determine that a matchUp is a FEED_IN?  one assigned drawPosition is not found in RoundNumber: 1 matchUps

---
name: Glossary
menu: Draw Engine
route: /drawEngine/attributes
---

# drawDefinition Attribute Glossary

## drawId

a unique identifier

## entryProfile

defines attributes for each stage type (QUALIFYING, MAIN, CONSOLATION)

- ***drawSize***
- number of ***wildcardsCount*** to permit
- whether ***alternates*** are allowed
  
attributes provide constraints on generation and manipulation of draw structures

## entries

an ***entry*** contains participantIds and participant entry details including entered stage

## strutures

structures contain matchUps.  all structures within a drawDefinition must be connected by links

- ***structureId*** - *required* - unique identifier
- ***structureName*** - *optional* - e.g. "EAST"
- ***structureType*** - *optional* - CONTAINER or ITEM; for grouped structures such as ROUND ROBIN where there is no movement (linkage) between ITEMS but where the outcomes of the contained structures may be linked to other structures
- ***stage*** - *required* - QUALIFYING, MAIN, or CONSOLATION
- ***stageSequence*** - *optional* - structural link depth within a stage
- ***finishingPosition*** - *required* - how finishing position is determined, e.g. "roundOutcome" or "winRatio"
- ***entries*** - *required* - array
- ***matchUps*** - *required* -  array

***

## positionAssignments

array of drawPositions present in structure matchUps and participantIds, once assigned. *matchUps* do not need to contain participant details (until TODS exports are generated)

## matchUps

an encounter between two participants; a participant may be an individual, a pair, or a team

- ***matchUpId*** - *required* - unique identifier  
- ***roundNumber*** - *required*
- ***roundPosition*** - *required for elimination structures* - not relevant in *roundRobin* structures
- ***drawPositions*** - *required* - used to reference the participants who participate in the matchUp
- ***finishingRound*** - *optional* - relevant only for elimination structures; defines depth from final round
- ***finishingPositionRange*** - *optional* - for convenience in determining finishingPositions and either participant progression across structure links, or for point allocation. a range is given for matchUp *winner* and *loser*

## links

a **link** defines the movement of participants between structures within a draw. **links** always have *source* and *target* structures

- ***structureId*** - *required*
- ***roundNumber*** - *required for targets and for elimination source structures* - determines the finishing round within the source structure for participants who will progress across the link and the entry round into the target structure (FEED_IN structures)
- ***finishingPositions*** - *required for round robin source structures* - determines which finishing drawPositions within a round robin group will progress across the link
- ***feedProfile*** - *required for target structures* - determines the method by which participants will be placed in the target structure

## feedProfile

method by which participants move across links into target structures

- ***DRAW*** - drawPositions within target structure will be drawn; seeding may be considered
- ***TOP_DOWN*** - drawPositions within target structure are assigned starting with the first *roundPosition* of the *roundNumber* of the target structure
- ***BOTTOM_UP*** - drawPositions within target structure are assigned starting at the final *roundPosition* of the *roundNumber* of the target structure
- ***RANDOM*** - drawPositions within target structure are assigned randomly

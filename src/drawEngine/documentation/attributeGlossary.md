---
name: Attributes
menu: Draw Engine
route: /drawEngine/attributes
---

# drawDefinition Attributes

## drawId

a unique identifier

## entryProfile

defines attributes for each stage type (QUALIFYING, MAIN, CONSOLATION)

- **_drawSize_**
- number of **_wildcardsCount_** to permit
- whether **_alternates_** are allowed

attributes provide constraints on generation and manipulation of draw structures

## entries

an **_entry_** contains participantIds and participant entry details including entered stage

## strutures

structures contain matchUps. all structures within a drawDefinition must be connected by links

- **_structureId_** - _required_ - unique identifier
- **_structureName_** - _optional_ - e.g. "EAST"
- **_structureType_** - _optional_ - CONTAINER or ITEM; for grouped structures such as ROUND ROBIN where there is no movement (linkage) between ITEMS but where the outcomes of the contained structures may be linked to other structures
- **_stage_** - _required_ - QUALIFYING, MAIN, or CONSOLATION
- **_stageSequence_** - _optional_ - structural link depth within a stage
- **_finishingPosition_** - _required_ - how finishing position is determined, e.g. "ROUND_OUTCOME" or "WIN_RATIO"
- **_entries_** - _required_ - array
- **_matchUps_** - _required_ - array

---

## positionAssignments

array of drawPositions present in structure matchUps and participantIds, once assigned. _matchUps_ do not need to contain participant details (until TODS exports are generated)

## matchUps

an encounter between two participants; a participant may be an individual, a pair, or a team

- **_matchUpId_** - _required_ - unique identifier
- **_roundNumber_** - _required_
- **_roundPosition_** - _required for elimination structures_ - not relevant in _roundRobin_ structures
- **_drawPositions_** - _required_ - used to reference the participants who participate in the matchUp
- **_finishingRound_** - _optional_ - relevant only for elimination structures; defines depth from final round
- **_finishingPositionRange_** - _optional_ - for convenience in determining finishingPositions and either participant progression across structure links, or for point allocation. a range is given for matchUp _winner_ and _loser_

## links

a **link** defines the movement of participants between structures within a draw. **links** always have _source_ and _target_ structures

- **_structureId_** - _required_
- **_roundNumber_** - _required for targets and for elimination source structures_ - determines the finishing round within the source structure for participants who will progress across the link and the entry round into the target structure (FEED_IN structures)
- **_finishingPositions_** - _required for round robin source structures_ - determines which finishing drawPositions within a round robin group will progress across the link
- **_feedProfile_** - _required for target structures_ - determines the method by which participants will be placed in the target structure

## feedProfile

method by which participants move across links into target structures

- **_DRAW_** - drawPositions within target structure will be drawn; seeding may be considered
- **_TOP_DOWN_** - drawPositions within target structure are assigned starting with the first _roundPosition_ of the _roundNumber_ of the target structure
- **_BOTTOM_UP_** - drawPositions within target structure are assigned starting at the final _roundPosition_ of the _roundNumber_ of the target structure
- **_RANDOM_** - drawPositions within target structure are assigned randomly

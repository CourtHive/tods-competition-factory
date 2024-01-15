---
title: Generation Governor
---

```js
import { governors: { generationGovernor }} from 'tods-competition-factory';
```

## generateDrawDefinition

This is a convenience method which handles most use cases for draw generation.

The `automated` parameter is "truthy" and supports placing only seeded participants and any byes which are adjacent to seeded positions.
Support for this scenario is provided to enable some unique positioning strategies where unseeded participants have some agency in the selection process.

```js
const drawDefinitionValues = {
  eventId, // optional - used to find any avoidance policies to be applied
  drawSize, // number of drawPositions in the first draw structure
  drawType, // optional - defaults to SINGLE_ELIMINATION
  drawName, // cutom name for generated draw structure(s)
  drawEntries, // array of entries, equal to or a subset of event.entries
  automated, // optional - whether or not to automatically place participants in structures; true/false or 'truthy' { seedsOnly: true }
  matchUpType, // optional - SINGLES, DOUBLES, or TEAM
  matchUpFormat, // optional - default matchUpFormatCode for all contained matchUps
  playoffMatchUpFormat, // optional - relevant for ROUND_ROBIN_WITH_PLAYOFFS
  hydrateCollections, // optional - propagate { category, gender } for event to collectionDefinitions in tieFormats
  tieFormat, // optional - { collectionDefinitions, winCriteria } for 'dual' or 'tie' matchUps
  seedsCount, // optional - number of seeds to generate if no seededParticipants provided
  seededParticipants, // optional - { participantId: 'id', seedNumber: 1, seedValue, '1' }
  seedingScaleName, // optional - custom scale for determining seeded participants

  // { positioing: WATERFALL } seeding for ROUND_ROBIN structures
  // { positioning: CLUSTER } or { positioning: SEPARATE } seeding for elimination structures
  // { groupSeedingThreshold: 5 } will set seedValue to lowest value within all groups where seedNumber is > 5
  seedingProfile, // optional { positioning, groupSeedingThreshold }

  qualifyingPlaceholder, // optional boolean - generate a placeholder qualifying structure if qualifiersCount and no qualifyingProfiles
  qualifiersCount, // optional - how many positionsAssignments will have { qualifier: true }
  qualifyingOnly, // optional boolean - ignore event.entries that are not entryStage: QUALIFYING
  qualifyingProfiles, // optional array [{ roundTarget, structureProfiles: [{ drawSize, seedsCount, seedingScaleName, qualifyingPositions }]}]

  structureOptions: {
    // optional - for ROUND_ROBIN - { groupSize, playoffGroups }
    groupSize, // e.g. 4 participants per group
    groupSizeLimit: 8,
    playoffGroups: [
      { finishingPositions: [1], structureName: 'Gold Flight', drawType }, // drawype defaults to SINGLE_ELIMINATION
      { finishingPositions: [2], structureName: 'Silver Flight', drawType }, // drawType can also be COMPASS or FIRST_MATCH_LOSER_CONSOLATION
    ],
  },

  staggeredEntry, // optional - accepts non-base-2 drawSizes and generates feed arms for "extra" drawPositions
  policyDefinitions, // optional - seeding or avoidance policies to be used when placing participants
  qualifyingPositions, // optional - number of positions in draw structure to be filled by qualifiers
  playoffAttributes, // optional - map of { [finishingPositionRange || exitProfile]: { name: 'customName', abbreviation: 'A' } }
  enforcePolicyLimits, // optional boolean - defaults to true - constrains seedsCount to policyDefinition limits
  voluntaryConsolation, // optional { structureName, structureAbbreviation } - causes voluntary consolation structure to be added
  enforceMinimumDrawSize, // optional boolean - defaults to true - false will allow generation of multi-structure drawTypes with only 2 participants
  drawTypeCoercion, // optional boolean - coerce multi-structure drawTypes to SINGLE_ELIMINATION for drawSize: 2
  ignoreStageSpace, // optional boolean - ignore wildcards count & etc.

  compassAttributes, // optional - provide translations for name mappings
  olympicAttributes, // optional - provide translations for name mappings
};

const { drawDefinition } = tournamentEngine.generateDrawDefinition(drawDefinitionValues);
```

---

---
title: Generation Governor
---

```js
import { generationGovernor } from 'tods-competition-factory';
```

## drawMatic

**drawMatic** is a dynamic round generator for AD_HOC draws which produces participant pairings with previous opponent and team member avoidance.
When `{ scaleName, scaleAccessor }` values are present, participants will be paired for level-based play.

The number of rounds (`roundsCount`) that can be generated is limited to **# participants - 1**, which is the normal size of a Round Robin, unless `{ enableDoubleRobin: true }`, in which case the upper limit is **(# participants - 1) \* 2**.

The number of participants is determined by the number of **entries** or the number of valid `{ participantIds }` provided.

:::info
Inspired by the work of the Constantine who runs spectacular D3 College Tennis events using this format for flexible round generation when teams arrive and depart on different days.
:::

```js
const { matchUps, participantIdPairings, iterations, candidatesCount, modifiedScaleValues } = engine.drawMatic({
  restrictRoundsCount, // optional boolean defaults to true; set to false for unlimited roundsCount
  restrictEntryStatus, // optional - only allow STRUCTURE_SELECTED_STATUSES
  enableDoubleRobin, // optional - allows roundsCount <= (drawSize - 1) * 2
  generateMatchUps, // optional - defaults to true; when false only returns { participantIdPairings }
  minimizeDelta, // boolean - force minimum delta in ratings; good for first round
  participantIds, // optional array of [participantId] to restrict enteredParticipantIds which appear in generated round
  maxIterations, // optional - defaults to 5000; can be used to set a limit on processing overhead
  structureId, // optional; if no structureId is specified find the latest AD_HOC stage which has matchUps
  matchUpIds, // optional array of uuids to be used when generating matchUps
  eventType, // optional - override eventType of event within which draw appears; e.g. to force use of SINGLES ratings in DOUBLES events

  updateParticipantRatings, // optional boolean; attach modifiedScaleValues to participants
  dynamicRatings, // optional boolean - generate dynamic ratings from previous round results
  refreshDynamic, // optional boolean - ignore previously generated dynamic values
  scaleAccessor, // optional - string to access value within scaleValue, e.g. 'wtnRating'
  scaleName, // optional - custom rating name to seed dynamic ratings

  roundsCount, // REQUIRED - number of rounds to generate; limited to (1 - drawSize) unless { enableDoubleRobin: true }
  drawId, // REQUIRED - drawId for which matchUps will be generated
});
```

---

## generateAdHocMatchUps

Draws with `{ drawType: AD_HOC }` allow `matchUps` to be dynamically added. In this type of draw there is no automatic participant progression between rounds. Participant assignment to `matchUps` is done manually, or via **drawMatic**. The only restriction is that a participant may appear once per round.

```js
const { matchUps } = engine.generateAdHocMatchUps({
  restrictMatchUpsCount, // optional boolean defaults to true; set to false for unlimited matchUpsCount
  participantIdPairings, // optional - array of array of pairings [['id1', 'id2'], ['id3', 'id4']]
  matchUpsCount, // optional - number of matchUps to generate; defaults to calc from entries
  roundNumber, // optional - specify round for which matchUps will be generated
  structureId, // required only if there is more than one structure
  matchUpIds, // optional - if matchUpIds are not specified UUIDs are generated
  newRound, // optional - boolean defaults to false - whether to auto-increment to next roundNumber
  drawId, // required - drawId of drawDefinition in which target structure is found
});
```

---

## generateAdHocRounds

```js
const { matchUps } = engine.generateAdHocRounds({
  restrictMatchUpsCount, // optional boolean defaults to true; set to false for unlimited matchUpsCount
  restrictRoundsCount, // optional boolean defaults to true; set to false for unlimited roundsCount
  enableDoubleRobin, // optional - allows roundsCount <= (drawSize - 1) * 2
  matchUpsCount, // optional - number of matchUps to generate per round; defaults to calc from entries
  roundNumber, // optional - specify round for which matchUps will be generated
  structureId, // required only if there is more than one structure
  roundsCount, // defaults to 1
  matchUpIds, // optional - if matchUpIds are not specified UUIDs are generated
  newRound, // optional - boolean defaults to false - whether to auto-increment to next roundNumber
  drawId, // required - drawId of drawDefinition in which target structure is found
});
```

---

## generateAndPopulatePlayoffStructures

Generates values but does not attach them to the `drawDefinition`. Used in conjunction with `attachPlayoffStructures`.

```js
const { structures, links, matchUpModifications } = engine.generateAndPopulatePlayoffStructures({
  requireSequential, // boolean defaults to true; only applies to Round Robin; require finishingPositions to be sequential
  roundNumbers: [3], // optional if playoffPositions not provided; roundNumbers of structure to be played off.
  roundProfiles, // optional - source roundNumbers as Object.keys with depth as Object.values, e.g. [{ 1: 2}, {2: 1}]
  playoffPositions: [3, 4], // optional if roundNumbers not provided; finishing positions to be played off.
  playoffStructureNameBase, // optional - Root word for default playoff naming, e.g. 'Playoff' for 'Playoff 3-4'
  exitProfileLimit, // limit playoff rounds generated by the attributes present in playoffAttributes
  playoffAttributes, // optional - mapping of either exitProfile or finishingPositionRange to structure names, e.g. 0-1-1 for South
  playoffGroups, // optional - only applies to Playoffs from ROUND_ROBIN: { structureNameMap: {}, finishingPositions: [], drawType: '' }
  structureId,
  drawId,
});
```

---

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

const { drawDefinition } = engine.generateDrawDefinition(drawDefinitionValues);
```

---

## generateDrawMaticRound

Typically not called directly. `engine.drawMatic` is a higher level wrapper which automates derivation of `adHocRatings`.

```js
const {
  participantIdPairings,
  candidatesCount,
  iterations,
  matchUps,
  success,
} = generateDrawMaticRound({
  maxIterations,// optional - defaults to 5000
  generateMatchUps = true, // optional - defaults to true; when false only returns { participantIdPairings }
  participantIds, // required
  adHocRatings, // optional { ['participantId']: numericRating }
  structureId, // required
  matchUpIds, // optional array of uuids to be used when generating matchUps
  eventType, // optional - override eventType of event within which draw appears; e.g. to force use of SINGLES ratings in DOUBLES events
  drawId, // required
});
```

---

## generateFlightProfile

Splits event entries into `flightsCount` (# of draws). `flightProfile` is an extension on an event which contains attributes to be used by `generateDrawDefinition`.

NOTE: The method returns `{ flightProfile, splitEntries }` for testing; `splitEntries` provides a breakdown on how `event.entries` were split across each `flight` within the `event`.

For an explanation of `scaleAttributes` see [Scale Items](../concepts/scaleItems).

```js
const scaleAttributes = {
  scaleType: RATING,
  eventType: SINGLES,
  scaleName: 'WTN',
  accessor, // optional - string determining how to access attribute if scaleValue is an object
};

const { flightProfile, splitEntries } = engine.generateFlightProfile({
  eventId, // event for which entries will be split
  attachFlightProfile, // boolean - also attach to event after generation
  scaledEntries, // optional - overrides the use of scaleAttributes, scaleSortMethod, and sortDescending
  scaleAttributes, // defines participant sort method prior to split
  scaleSortMethod, // optional - function(a, b) {} sort method, useful when scaleValue is an object or further proessing is required
  sortDescending, // optional - default sorting is ASCENDING; only applies to default sorting method.
  flightsCount: 3, // number of draws to be created
  deleteExisting: true, // optional - remove existing flightProfile
  splitMethod: SPLIT_WATERFALL, // optional - defaults to SPLIT_LEVEL_BASED
  drawNames: ['Green Flight', 'Blue Flight'], // optional
  drawNameRoot: 'Flight', // optional - used to generate drawNames, e.g. 'Flight 1', 'Flight 2'
});

const {
  flights: [
    {
      drawId, // unique identifier for generating drawDefinitions
      drawName, // custom name for generated draw
      drawEntries, // entries allocated to target draw
    },
  ],
} = flightProfile;

// use flight information to generate drawDefinition
const {
  flights: [flight],
} = flightProfile;

Object.assign(drawDefinitionValues, flight);
const { drawDefinition } = engine.generateDrawDefinition(drawDefinitionValues);
```

---

## generateLineUps

Generates lineUps for TEAM events which have selected teams with ranked or rated individualParticipants. Individual TEAM participants are assigned line positions based on the scale specified.

```js
const scaleAccessor = {
  scaleName: categoryName,
  scaleType: RANKING,
  sortOrder, // optional - ASCENDING or DESCENDING - defaults to ASCENDING
};
const { lineUps, participantsToAdd } = engine.generateLineUps({
  useDefaultEventRanking, // optional boolen; when true scaleAccessor is not required
  scaleAccessor, // see above
  singlesOnly, // optional boolean - when true SINGLES rankings will be used for DOUBLES position assignment
  attach, // optional boolean - when true the lineUps will be attached to the drawDefinition specified by drawId
  drawId,
});
```

---

## generateQualifyingStructure

```js
let { structure, link } = engine.generateQualifyingStructure({
  targetStructureId, // required: structure for which participants will qualify
  qualifyingPositions, // optional: specify the # of qualifyingPositions
  qualifyingRoundNumber, // optional: determine qualifyingPositions by # of matchUps in specified round; does not apply to ROUND_ROBIN
  structureOptions, // optional: specific to ROUND_ROBIN generation
  structureName, // optional
  drawSize,
  drawType, // optional: defaults to SINGLE_ELIMINATION
  drawId, // required: draw within which target structure appears
});
```

---

## generateSeedingScaleItems

Used in conjunction with `getEntriesAndSeedsCount` when it is necessary to make use of a custom function for generating `scaledEntries`.

```js
const { scaleItemsWithParticipantIds } = engine.generateSeedingScaleItems({
  scaleAttributes,
  scaledEntries,
  stageEntries,
  seedsCount,
  scaleName,
});
```

---

## generateVolunataryConsolation

```js
const { structures, links } = engine.generateVoluntaryConsolation({
  automated: true,
  drawId,
});

// if { attachConsolation: false } then it will be necessary to subsequently attach the structures and links
engine.attachConsolationStructures({ drawId, structures, links });
```

---

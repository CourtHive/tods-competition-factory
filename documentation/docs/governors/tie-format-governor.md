---
title: tieFormat Governor
---

```js
import { tieFormatGovernor } from 'tods-competition-factory';
```

## addCollectionDefinition

Adds a `collectionDefinition` to the specified target, either `matchUp`, `structure`, `drawDefinition` or `event`.

```js
engine.addCollectionDefinition({
  updateInProgressMatchUps, // defaults to true; in progress matchUps have matchUpStatus: IN_PROGRESS
  collectionDefinition, // will be validated
  tieFormatName, // if not provided, existing tieFormatName will be deleted
  structureId, // optional - if provided only tieFormat on structure will be modified
  matchUpId, // optional - if provided only tieFormat on matchUp will be modified
  eventId, // optional - if provided only tieFormat on event will be modified
  drawId, // required if structureId is specified; if provided without structureId only tieFormat on drawDefinition will be modified
  uuids, // optional - array of UUIDs to use for newly created matchUps
});
```

---

## addCollectionGroup

```js
engine.addCollectionGroup({
  collectionIds: result.modifiedCollectionIds,
  tieFormatName: 'Swelled',
  groupDefinition,
  structureId, // optional - if provided only tieFormat on structure will be modified
  matchUpId, // optional - if provided only tieFormat on matchUp will be modified
  eventId, // optional - if provided only tieFormat on event will be modified
  drawId, // required if structureId is specified; if provided without structureId only tieFormat on drawDefinition will be modified
});
```

---

## aggregateTieFormats

Aggregates all tieFormats within an event by consolidating duplicate tieFormats. If a drawDefinition, structure, or matchUp has a tieFormat that matches an existing tieFormat in the event.tieFormats array, the inline tieFormat is replaced with a tieFormatId reference.

```js
const { addedCount } = engine.aggregateTieFormats({
  tournamentRecord, // automatically provided by engine
});

console.log(`Added ${addedCount} unique tieFormats to event.tieFormats`);
```

**Returns:**

```ts
{
  success: boolean;
  addedCount: number; // Number of unique tieFormats added to event.tieFormats array
}
```

**Purpose:** Normalizes tieFormat storage by moving duplicate inline tieFormats to the event.tieFormats array and replacing them with tieFormatId references. This reduces data duplication and ensures consistency.

**When to Use:**

- After importing tournament data that may have duplicate tieFormats
- Before exporting tournament data to reduce file size
- After bulk modifications to tieFormats across multiple structures/matchUps
- To optimize tournament record storage

**Notes:**

- Scans all events in the tournament
- Compares tieFormats using `compareTieFormats()` to identify duplicates
- Generates new tieFormatId for newly aggregated formats
- Replaces inline `tieFormat` with `tieFormatId` reference
- Only processes TEAM matchUps
- Safe to run multiple times (idempotent)

---

## compareTieFormats

Compares two tieFormat objects to determine if they are functionally equivalent.

```js
const { different } = engine.compareTieFormats({
  considerations, // optional { collectionName?: boolean; collectionOrder?: boolean };
  ancestor: tieFormat1,
  descendant: tieFormat2,
});

if (!different) {
  console.log('TieFormats are equivalent');
}
```

**Returns:**

```ts
{
  different: boolean; // true if tieFormats differ, false if equivalent
}
```

**Parameters:**

- `ancestor` - The reference tieFormat to compare against
- `descendant` - The tieFormat to compare
- `considerations` - Optional comparison options:
  - `collectionName: boolean` - Whether to consider collection names in comparison (default: false)
  - `collectionOrder: boolean` - Whether order of collections matters (default: false)

**Notes:**

- Used internally by `aggregateTieFormats()` to identify duplicates
- Ignores tieFormatName unless specified in considerations
- Ignores collection order unless specified in considerations
- Compares collection definitions, matchUp formats, scoring values, and gender constraints

---

## getTieFormat

Retrieves the tieFormat for a specific matchUp, structure, draw, or event, following the hierarchical resolution order.

```js
const {
  tieFormat, // resolved tieFormat for the matchUp
  drawDefaultTieFormat, // tieFormat from drawDefinition
  eventDefaultTieFormat, // tieFormat from event
  structureDefaultTieFormat, // tieFormat from structure
  matchUp, // the matchUp object
  structure, // the structure object
} = engine.getTieFormat({
  matchUpId, // required - matchUp to get tieFormat for
  structureId, // optional - optimization if structure known
  drawId, // optional - optimization to avoid search
  eventId, // optional - optimization if event known
});
```

**Returns:**

```ts
{
  tieFormat?: TieFormat;              // Resolved tieFormat (most specific)
  matchUp?: MatchUp;                  // MatchUp object
  structure?: Structure;              // Structure object
  drawDefaultTieFormat?: TieFormat;   // Draw-level default
  eventDefaultTieFormat?: TieFormat;  // Event-level default
  structureDefaultTieFormat?: TieFormat; // Structure-level default
  error?: ErrorType;
}
```

**Resolution Hierarchy:**

1. MatchUp-level tieFormat (most specific)
2. Structure-level tieFormat
3. Draw-level tieFormat
4. Event-level tieFormat (least specific)

**Purpose:** Get the active tieFormat for a matchUp following the inheritance chain. Returns all levels of defaults to understand the full context.

**When to Use:**

- Determining scoring format for a specific TEAM matchUp
- Understanding which tieFormat is active
- Building UI that shows tieFormat inheritance
- Validating tieFormat configuration

**Notes:**

- Only applies to TEAM matchUps
- Returns first tieFormat found in the hierarchy
- Includes all default levels for complete context
- Use `drawId` and `structureId` for performance optimization

---

## modifyCollectionDefinition

Modifies the `collectionName` and/or `matchUpFormat` for targeted `collectionId` within the `tieFormat` specified by `eventId`, `drawId`, `structureId` or `matchUpId`.

```js
engine.modifyCollectionDefinition({
  collectionName, // optional
  matchUpFormat, // optional
  collectionId, // required
  structureId, // required if modifying tieFormat for a structure
  matchUpId, // required if modifying tieFormat for a matchUp
  eventId, // required if modifying tieFormat for a event
  drawId, // required if modifying tieFormat for a drawDefinition or a structure
  gender, // optional

  // value assignment, only one is allowed to have a value
  collectionValueProfiles, // optional - [{ collectionPosition: 1, value: 2 }] - there must be a value provided for all matchUp positions
  collectionValue, // optional - value awarded for winning more than half of the matchUps in the collection
  matchUpValue, // optional - value awarded for each matchUp won
  scoreValue, // optional - value awarded for each game or point won (points for tiebreak sets)
  setValue, // optional - value awarded for each set won
});
```

---

## modifyTieFormat

Both modifies the `tieFormat` on the target `event`, `drawDefinition`, `structure` or `matchUp` and adds/deletes `tieMatchUps` as necessary.

```js
engine.modifyTieFormat({
  considerations, // optional { collectionName?: boolean; collectionOrder?: boolean };
  modifiedTieFormat, // will be compared to existing tieFormat that is targeted and differences calculated
  tournamentId, // required
  structureId, // required if modifying tieFormat for a structure
  matchUpId, // required if modifying tieFormat for a matchUp
  eventId, // required if modifying tieFormat for a event
  drawId, // required if modifying tieFormat for a drawDefinition or a structure
});
```

---

## orderCollectionDefinitions

Modify the array order of `tieFormat.collectionDefinitions` for an `event`, a `drawDefinition`, `structure`, or `matchUp`.

```js
engine.orderCollectionDefinitions({
  orderMap: { collectionId1: 1, collectionId2: 2 },
  tournamentId, // required
  structureId, // required if modifying tieFormat for a structure
  matchUpId, // required if modifying tieFormat for a matchUp
  eventId, // required if modifying tieFormat for a event
  drawId, // required if modifying tieFormat for a drawDefinition or a structure
});
```

---

## removeCollectionDefinition

```js
engine.removeCollectionDefinition({
  updateInProgressMatchUps, // optional; defaults to true
  tieFormatComparison, // optional; defaults to false; when true will not delete unique collections on unscored matchUps
  tieFormatName, // any time a collectionDefinition is modified a new name must be provided
  tournamentId, // required
  collectionId, // required - id of collectionDefinition to be removed
  structureId, // optional - if removing from tieFormat associated with a specific structure
  matchUpId, // optional - if removing from tieFormat asscoiated with a specific matchUp
  eventId, // optional - if removing from tieFormat asscoiated with an event
  drawId, // required if structureId is specified or if tieFormat associated with drawDefinition is to be modified
});
```

---

## removeCollectionGroup

Removes a `collectionGroup` from the `tieFormat` found for the `event`, `drawDefinition`, `structure` or `matchUp`; recalculates

```js
engine.removeCollectionGroup({
  updateInProgressMatchUps, // optional - defaults to true
  tieFormatName: 'New tieFormat', // if no name is provided then there will be no name
  collectionGroupNumber: 1,
  tournamentId, // required
  structureId, // optional
  matchUpId, // optional
  eventId, // optional
  drawId, // optional; required if structureId is targeted
});
```

---

## tieFormatGenderValidityCheck

Validates that a collection's gender specification is compatible with the reference gender (event or category gender).

```js
const { valid, error, info } = engine.tieFormatGenderValidityCheck({
  referenceGender, // gender of event or category (e.g., 'MALE', 'FEMALE', 'MIXED', 'ANY')
  matchUpType, // 'SINGLES' or 'DOUBLES'
  gender, // gender of the collection being validated
});

if (!valid) {
  console.error(error, info);
}
```

**Returns:**

```ts
{
  valid: boolean;
  error?: ErrorType;  // INVALID_GENDER if validation fails
  info?: string;      // Explanation of validation failure
}
```

**Validation Rules:**

1. **Gendered Events (MALE/FEMALE):**
   - Collection gender must match reference gender
   - Example: MALE event can only have MALE collections

2. **MIXED Events:**
   - Cannot contain MIXED singles collections (only MIXED doubles)
   - Cannot contain collections with `gender: ANY`
   - Can contain MALE, FEMALE, and MIXED doubles collections

3. **ANY Gender Events:**
   - Cannot contain MIXED singles collections (only MIXED doubles)
   - Can contain MALE, FEMALE, and MIXED doubles collections

**Examples:**

```js
// Valid: MALE collection in MALE event
engine.tieFormatGenderValidityCheck({
  referenceGender: 'MALE',
  matchUpType: 'SINGLES',
  gender: 'MALE',
}); // { valid: true }

// Invalid: FEMALE collection in MALE event
engine.tieFormatGenderValidityCheck({
  referenceGender: 'MALE',
  matchUpType: 'SINGLES',
  gender: 'FEMALE',
}); // { valid: false, error: INVALID_GENDER }

// Valid: MIXED doubles in MIXED event
engine.tieFormatGenderValidityCheck({
  referenceGender: 'MIXED',
  matchUpType: 'DOUBLES',
  gender: 'MIXED',
}); // { valid: true }

// Invalid: MIXED singles in MIXED event
engine.tieFormatGenderValidityCheck({
  referenceGender: 'MIXED',
  matchUpType: 'SINGLES',
  gender: 'MIXED',
}); // { valid: false, error: INVALID_GENDER, info: 'MIXED events can not contain mixed singles or collections with gender: ANY' }

// Invalid: ANY gender in MIXED event
engine.tieFormatGenderValidityCheck({
  referenceGender: 'MIXED',
  matchUpType: 'SINGLES',
  gender: 'ANY',
}); // { valid: false, error: INVALID_GENDER }
```

**Use Cases:**

- Validating collectionDefinitions before adding to tieFormat
- Ensuring tieFormat gender constraints match event/category requirements
- Building UI that enforces gender compatibility rules
- Preventing invalid tieFormat configurations

**Notes:**

- MIXED is only valid for DOUBLES matchUpType
- ANY gender collections are not allowed in MIXED events
- Automatically coerces gender values for comparison (handles variations)

---

## validateCollectionDefinition

Validates that a collectionDefinition is properly formed and compatible with event/category constraints.

```js
const { valid } = engine.validateCollectionDefinition({
  collectionDefinition, // required
  checkCollectionIds, // optional boolean - check that collectionIds are present
  referenceCategory, // optional - category for comparision if eventId is not provided
  referenceGender, // optional - expected gender if eventId is not provided
  checkCategory, // optional boolean - defaults to true
  checkGender, // optional boolean - defaults to true
  eventId, // required only for checking gender
});
```

**Returns:**

```ts
{
  valid: boolean;
  error?: ErrorType;
}
```

**Validation Checks:**

- Collection structure is valid (has required fields)
- CollectionIds are present (if `checkCollectionIds: true`)
- Gender compatibility with event/category (if `checkGender: true`)
- Category compatibility (if `checkCategory: true`)
- MatchUp formats are valid
- Scoring values are properly configured

**Notes:**

- Use before adding collectionDefinitions to avoid invalid configurations
- Gender and category checks require reference values from event or explicit params

---

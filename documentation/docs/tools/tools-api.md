---
title: Tools API Reference
---

Complete reference of all utility functions available in the `tools` module.

```js
import { tools } from 'tods-competition-factory';
```

---

## Array Utilities

### unique

Extract unique values from an array.

```js
const uniqueValues = tools.unique([1, 2, 2, 3, 3, 3]);
// Result: [1, 2, 3]

const uniqueRounds = tools.unique(matchUps.map(m => m.roundNumber));
```

### intersection

Find common elements between two arrays.

```js
const common = tools.intersection([1, 2, 3], [2, 3, 4]);
// Result: [2, 3]
```

### overlap

Check if two arrays have any overlapping elements.

```js
const hasOverlap = tools.overlap([1, 2, 3], [3, 4, 5]);
// Result: true
```

### shuffleArray

Randomly shuffle array elements (non-destructive).

```js
const shuffled = tools.shuffleArray([1, 2, 3, 4, 5]);
```

### randomMember

Select a random element from an array.

```js
const randomItem = tools.randomMember(['A', 'B', 'C', 'D']);
```

### randomPop

Remove and return a random element from an array (destructive).

```js
const arr = [1, 2, 3, 4, 5];
const item = tools.randomPop(arr); // Returns random item, modifies arr
```

### chunkArray

Split an array into chunks of specified size.

```js
const chunks = tools.chunkArray([1, 2, 3, 4, 5, 6], 2);
// Result: [[1, 2], [3, 4], [5, 6]]
```

### chunkByNth

Distribute array elements into N chunks.

```js
const chunks = tools.chunkByNth([1, 2, 3, 4, 5, 6], 3);
// Result: [[1, 4], [2, 5], [3, 6]]
```

### chunkSizeProfile

Split array by varying chunk sizes.

```js
const chunks = tools.chunkSizeProfile([1, 2, 3, 4, 5, 6, 7], [2, 3, 2]);
// Result: [[1, 2], [3, 4, 5], [6, 7]]
```

### generateRange

Generate an array of numbers from start to end (inclusive).

```js
const range = tools.generateRange(1, 5);
// Result: [1, 2, 3, 4, 5]
```

### instanceCount

Count occurrences of each value in an array.

```js
const counts = tools.instanceCount(['A', 'B', 'A', 'C', 'B', 'A']);
// Result: { A: 3, B: 2, C: 1 }
```

### countValues

Group array indices by their values.

```js
const grouped = tools.countValues([10, 20, 10, 30, 20]);
// Result: { 10: [0, 2], 20: [1, 4], 30: [3] }
```

### groupValues

Group object values by keys.

```js
const grouped = tools.groupValues({ a: 1, b: 2, c: 1 });
// Result: { 1: ['a', 'c'], 2: ['b'] }
```

### allNumeric

Check if all array elements are numeric.

```js
const isAllNumeric = tools.allNumeric([1, 2, 3]); // true
const notAllNumeric = tools.allNumeric([1, 'a', 3]); // false
```

### noNumeric

Check if array contains no numeric values.

```js
const noNumbers = tools.noNumeric(['a', 'b', 'c']); // true
```

### noNulls

Remove null and undefined values from array.

```js
const clean = tools.noNulls([1, null, 2, undefined, 3]);
// Result: [1, 2, 3]
```

### occurrences

Count occurrences of a specific value in array.

```js
const count = tools.occurrences('A', ['A', 'B', 'A', 'C']);
// Result: 2
```

### subSort

Sort a portion of an array (non-destructive).

```js
const sorted = tools.subSort([5, 4, 3, 2, 1], 1, 3, (a, b) => a - b);
// Result: [5, 2, 3, 4, 1] (sorted indices 1-3)
```

---

## Object Utilities

### createMap

Create a lookup map from an array of objects.

```js
const participants = [
  { participantId: 'id1', participantName: 'Player 1' },
  { participantId: 'id2', participantName: 'Player 2' }
];
const participantsMap = tools.createMap(participants, 'participantId');
// Result: { id1: { participantId: 'id1', ... }, id2: { ... } }
```

### hasAttributeValues

Create a filter function that checks for specific attribute values.

```js
const isCompleted = tools.hasAttributeValues({ matchUpStatus: 'COMPLETED' });
const completedMatchUps = matchUps.filter(isCompleted);
```

### definedAttributes

Extract only defined (non-undefined) attributes from an object.

```js
const clean = tools.definedAttributes({
  a: 1,
  b: undefined,
  c: null,
  d: 2
});
// Result: { a: 1, c: null, d: 2 }
```

### extractAttributes

Create an extractor function for specific object attributes.

```js
const getName = tools.extractAttributes('participantName');
const names = participants.map(getName);
```

### undefinedToNull

Convert undefined values to null in an object.

```js
const converted = tools.undefinedToNull({ a: 1, b: undefined });
// Result: { a: 1, b: null }
```

### generateHashCode

Generate a hash code from an object or string.

```js
const hash = tools.generateHashCode({ key: 'value' });
const stringHash = tools.generateHashCode('text');
```

---

## Math & Validation

### isPowerOf2

Check if a number is a power of 2.

```js
tools.isPowerOf2(8); // true
tools.isPowerOf2(16); // true
tools.isPowerOf2(12); // false
```

### nearestPowerOf2

Find the nearest power of 2 to a number.

```js
tools.nearestPowerOf2(10); // 8
tools.nearestPowerOf2(20); // 16
```

### nextPowerOf2

Find the next power of 2 greater than or equal to a number.

```js
tools.nextPowerOf2(10); // 16
tools.nextPowerOf2(16); // 16
```

### isConvertableInteger

Check if a value can be converted to an integer.

```js
tools.isConvertableInteger('123'); // true
tools.isConvertableInteger('12.5'); // false
tools.isConvertableInteger('abc'); // false
```

### isNumeric

Check if a value is numeric.

```js
tools.isNumeric(123); // true
tools.isNumeric('123'); // true
tools.isNumeric('abc'); // false
```

### isOdd

Check if a number is odd.

```js
tools.isOdd(3); // true
tools.isOdd(4); // false
```

---

## Date & Time

### dateTime

Object containing date/time utility functions.

```js
// Get ISO date string
const isoDate = tools.dateTime.getIsoDateString(scheduleObject);

// Format date
const formatted = tools.dateTime.formatDate(new Date(), '-', 'YMD');

// Add days to date
const future = tools.dateTime.addDays(new Date(), 7);

// Get date range
const dates = tools.dateTime.generateDateRange('2024-01-01', '2024-01-07');
```

### generateDateRange

Generate an array of dates between start and end dates.

```js
const dates = tools.generateDateRange('2024-01-01', '2024-01-05');
// Result: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05']
```

---

## ID & Code Generation

### UUID

Generate a unique identifier.

```js
const id = tools.UUID();
// Result: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

const prefixed = tools.UUID('PREFIX');
// Result: 'PREFIX-a1b2c3d4-e5f6-7890-abcd-ef1234567890'
```

### UUIDS

Generate multiple unique identifiers at once.

```js
const ids = tools.UUIDS(3);
// Result: ['uuid1', 'uuid2', 'uuid3']

const prefixedIds = tools.UUIDS(3, 'MATCHUP');
```

### generateTimeCode

Generate a time-based code.

```js
const code = tools.generateTimeCode();
const indexedCode = tools.generateTimeCode(5);
```

---

## Sorting

### numericSort

Numeric sort comparator function.

```js
const sorted = [10, 2, 5, 1].sort(tools.numericSort);
// Result: [1, 2, 5, 10]
```

### matchUpSort

Sort matchUps by schedule, round, position.

```js
const sorted = matchUps.sort(tools.matchUpSort);
```

### matchUpScheduleSort

Sort matchUps by schedule time.

```js
const sorted = matchUps.sort(tools.matchUpScheduleSort);
```

### structureSort

Sort draw structures by stage, size, and sequence. See [dedicated page](./structure-sort.md).

```js
const sorted = structures.sort(tools.structureSort);
```

---

## Data Transformation

### makeDeepCopy

Create a deep copy of a JSON object. See [dedicated page](./make-deep-copy.md).

```js
const copy = tools.makeDeepCopy(object);
const copyWithExtensions = tools.makeDeepCopy(object, true); // Flatten extensions
```

### JSON2CSV

Convert JSON array to CSV format. See [dedicated page](./json-to-csv.mdx).

```js
const csv = tools.JSON2CSV(arrayOfObjects, {
  columnAccessors: ['id', 'name', 'score'],
  columnMap: { id: 'ID', name: 'Name', score: 'Score' }
});
```

### flattenJSON

Flatten a nested JSON object.

```js
const flat = tools.flattenJSON({
  a: { b: { c: 1 } }
}, '.');
// Result: { 'a.b.c': 1 }
```

### attributeFilter

Create a filter function for object attributes.

```js
const filter = tools.attributeFilter({ matchUpStatus: 'COMPLETED' });
const completed = matchUps.filter(filter);
```

---

## String Utilities

### constantToString

Convert a constant-case string to readable format.

```js
const readable = tools.constantToString('SINGLE_ELIMINATION');
// Result: 'Single Elimination'
```

---

## Tournament Utilities

### dehydrateMatchUps

Remove computed attributes from matchUps for storage.

```js
const dehydrated = tools.dehydrateMatchUps(matchUps);
```

### visualizeScheduledMatchUps

Generate color-coded console output of match schedule.

```js
tools.visualizeScheduledMatchUps({
  scheduledMatchUps,
  showGlobalLogs: true
});
```

### parseScoreString

Parse a score string into structured data.

```js
const parsed = tools.parseScoreString({
  scoreString: '6-4 3-6 7-6(3)',
  matchUpFormat: 'SET3-S:6/TB7'
});
// Result: { sets: [...], winningSide: 1, ... }
```

---

## Not in tools Module

The following functions are available through **governors**, not the tools module:

### From queryGovernor

```js
import { queryGovernor } from 'tods-competition-factory';

// Find extension by name
const { extension } = queryGovernor.findExtension({ element, name });

// Get time item
const { timeItem } = queryGovernor.getTimeItem({ element, itemType });
```

### From matchUpGovernor

```js
import { matchUpGovernor } from 'tods-competition-factory';

// Calculate win criteria for tieFormats
const { valueGoal } = matchUpGovernor.calculateWinCriteria({
  collectionDefinitions
});
```

### From scoreGovernor

```js
import { scoreGovernor } from 'tods-competition-factory';

// Check if score has value
const hasValue = scoreGovernor.checkScoreHasValue({ matchUp });
```

---

## See Also

- **[makeDeepCopy](./make-deep-copy.md)** - Detailed deep copy documentation
- **[JSON2CSV](./json-to-csv.mdx)** - CSV conversion examples
- **[structureSort](./structure-sort.md)** - Structure sorting modes
- **[Tools Overview](./tools-overview.md)** - Overview of all tools

---

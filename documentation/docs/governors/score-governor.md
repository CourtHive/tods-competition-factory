---
title: Score Governor
---

```js
import { scoreGovernor } from 'tods-competition-factory';
```

The **scoreGovernor** is a collection of scoring related tools that provide analysis/validation or generate values.

Lightweight independent/reusable components such as scoring dialogs can make use of the **scoreGovernor** without having to import any Competition Factory engines.

---

## addGame

Adds a completed game to the score history. Part of the live scoring history tracking system.

```js
const result = scoreGovernor.addGame({
  score, // current score object
  sideNumber, // 1 or 2 - which side won the game
});
```

**Purpose:** Track game-by-game scoring progression for analytics and undo/redo functionality.

---

## addPoint

Adds a single point to the score history. Part of the live scoring history tracking system.

```js
const result = scoreGovernor.addPoint({
  score, // current score object
  sideNumber, // 1 or 2 - which side won the point
});
```

**Purpose:** Track point-by-point scoring progression for detailed analytics.

---

## addSet

Adds a completed set to the score history. Part of the live scoring history tracking system.

```js
const result = scoreGovernor.addSet({
  score, // current score object
  setObject, // completed set data
});
```

**Purpose:** Track set-by-set scoring progression.

---

## addShot

Adds a shot detail to the score history. Part of the live scoring shot-tracking system.

```js
const result = scoreGovernor.addShot({
  score, // current score object
  shotDetails, // shot metadata (type, location, outcome, etc.)
});
```

**Purpose:** Capture detailed shot-by-shot data for advanced analytics.

---

## analyzeSet

```js
const {
  expectTiebreakSet,
  expectTimedSet,
  hasTiebreakCondition,
  isCompletedSet,
  isDecidingSet,
  isTiebreakSet,
  isValidSet,
  isValidSetNumber,
  isValidSetOutcome,
  setFormat,
  sideGameScores,
  sideGameScoresCount,
  sidePointScores,
  sidePointScoresCount,
  sideTiebreakScores,
  sideTiebreakScoresCount,
  winningSide,
} = scoreGovernor.analyzeSet({
  matchUpScoringFormat,
  setObject,
});
```

---

## analyzeScore

Analyzes a complete score object to extract detailed scoring information across all sets.

```js
const analysis = scoreGovernor.analyzeScore({
  matchUpFormat, // required - match format
  score, // required - score object with sets
});

console.log(analysis.sets); // Array of analyzed set objects
console.log(analysis.winningSide); // 1, 2, or undefined
console.log(analysis.isComplete); // boolean
```

**Purpose:** Comprehensive score analysis for validation and display.

---

## calculateHistoryScore

Calculates the current score from scoring history, enabling reconstruction of score state.

```js
const { score } = scoreGovernor.calculateHistoryScore({
  matchUpFormat, // required - match format
  history, // required - array of scoring events
});
```

**Purpose:** Reconstruct score from event history for undo/redo and validation.

---

## checkScoreHasValue

Checks if a score object contains any actual scoring data.

```js
const hasValue = scoreGovernor.checkScoreHasValue({
  score, // required - score object to check
});
```

**Returns:** `true` if score contains sets with values, `false` otherwise.

**Purpose:** Determine if a matchUp has been scored.

---

## checkSetIsComplete

```js
const hasWinningSide = scoreGovernor.checkSetIsComplete({
  set: {
    side1Score,
    side2Score,
    ignoreTiebreak,
    matchUpFormat,
    isDecidingSet,
    isTiebreakSet,
  },
});
```

---

## clearHistory

Clears the scoring history from a score object.

```js
const result = scoreGovernor.clearHistory({
  score, // required - score object to clear history from
});
```

**Purpose:** Reset history tracking while preserving current score.

---

## generateScoreString

```js
const sets = [
  {
    side1Score: 6,
    side2Score: 7,
    side1TiebreakScore: 3,
    side2TiebreakScore: 7,
    winningSide: 2,
  },
  {
    side1Score: 7,
    side2Score: 6,
    side1TiebreakScore: 14,
    side2TiebreakScore: 12,
    winningSide: 1,
  },
  { side1Score: 3 },
];
let result = scoreGovernor.generateScoreString({
    sets, // TODS sets object
    winningSide, // optional - 1 or 2
    reversed, // optional - reverse the score
    winnerFirst = true, // optional - boolean - tranform sets so that winningSide is first (on left)
    matchUpStatus, // optional - used to annotate scoreString
    addOutcomeString, // optional - tranform matchUpStatus into outcomeString appended to scoreString
    autoComplete: true, // optional - complete missing set score
  });
```

---

## getSetComplement

Returns complementary sideScore given a `lowValue`, `tieBreakAt` and `setTo` details.

```js
const [side1Score, side2Score] = scoreGovernor.getSetComplement({
  tiebreakAt,
  lowValue,
  isSide1,
  setTo,
});
```

---

## getTiebreakComplement

Returns complementary sideScore given a `lowValue`, `tieBreakNoAd` and `tiebreakTo` details.

```js
const [side1Score, side2Score] = scoreGovernor.getSetComplement({
  tiebreakNoAd, // boolean whether tiebreak is "no advantage"
  tiebreakTo,
  lowValue,
  isSide1,
});
```

---

## generateTieMatchUpScore

Returns string representation of current tieMatchUp score.

```js
const { scoreStringSide1, scoreStringSide2, set, winningSide } = scoreGovernor.generateTieMatchUpScore({
  matchUp, // must have { matchUpType: 'TEAM' }
  separator, // optional - defaults to '-'
});
```

---

## isValidMatchUpFormat

Returns boolean indicating whether matchUpFormat code is valid.

```js
const valid = scoreGovernor.isValidMatchUpFormat({ matchUpFormat });
```

---

## keyValueScore

Utility for generating score strings based on key entry. Please see `keyValueScore.test.js` in the source for more detail.

---

### participantResults

An array of `{ drawPosition, participantId, participantResult }` objects is returned for each group of processed matchUps.

In the example given below 3 of 4 participants were tied with equivalent metrics and final `rankOrder` was determined by **Head to Head** analysis.
See [Round Robin Tally Policy](/docs/policies/tallyPolicy).

```js
{
  drawPosition: 4,
  participantId: 'uniqueParticipantId1',
  participantResult: {
    allDefaults: 0,
    defaults: 0,
    retirements: 0,
    walkovers: 0,
    matchUpsWon: 3,
    matchUpsLost: 1,
    victories: [
      'uniqueMatchUpId1',
      'uniqueMatchUpId2',
      'uniqueMatchUpId3',
    ],
    defeats: ['uniqueMatchUpId4'],
    matchUpsCancelled: 0,
    setsWon: 6,
    setsLost: 2,
    gamesWon: 36,
    gamesLost: 12,
    pointsWon: 0,
    pointsLost: 0,
    setsPct: 3,
    matchUpsPct: 3,
    gamesPct: 0.75,
    pointsPct: 0,
    result: '3/1',
    games: '36/12',
    provisionalOrder: 1, // order when ROUND_ROBIN groups are incomplete;
    groupOrder: 1, // order including manually entered 'subOrder' (for statistical ties)
    rankOrder: 1, // order without manually entered 'subOrder'
    GEMscore: 30003000075000000,
  },
};
```

#### GEMscore

`GEMscore` is a hash of key participant metrics and is used for sorting participants from multiple groups where **Head to Head** does not apply.
This is used to determine "seedProxies" when ordered participants from each group progress to playoff strutures.

```js
const GEM =
  matchUpsPct * Math.pow(10, 20) +
  tieMatchUpsPct * Math.pow(10, 16) +
  setsPct * Math.pow(10, 12) +
  gamesPct * Math.pow(10, 8) +
  pointsPct * Math.pow(10, 3);
```

---

## parseScoreString

Produces TODS sets objects.

```js
const sets = mocksEngine.parseScoreString({ scoreString: '1-6 1-6' });

/*
console.log(sets)
[
  ({
    side1Score: 1,
    side2Score: 6,
    side1TiebreakScore: undefined,
    side2TiebreakScore: undefined,
    winningSide: 2,
    setNumber: 1,
  },
  {
    side1Score: 1,
    side2Score: 6,
    side1TiebreakScore: undefined,
    side2TiebreakScore: undefined,
    winningSide: 2,
    setNumber: 2,
  })
];
*/
```

---

## parse

Parses a matchUpFormat code string into a structured format object. Alias for `parseMatchUpFormat`.

```js
const format = scoreGovernor.parse({
  matchUpFormatCode, // required - format code string (e.g., 'SET3-S:6/TB7')
});
```

**Purpose:** Convert format code strings to structured format objects.

---

## redo

Redoes the last undone scoring action in history.

```js
const result = scoreGovernor.redo({
  score, // required - score object with history
});
```

**Purpose:** Redo functionality for live scoring interfaces.

---

## reverseScore

Reverses the perspective of a score (swaps side1 and side2).

```js
const reversedScore = scoreGovernor.reverseScore({
  score, // required - score object to reverse
});
```

**Purpose:** Display score from opponent's perspective.

---

## setServingSide

Sets which side is currently serving in the score history.

```js
const result = scoreGovernor.setServingSide({
  score, // required - score object
  sideNumber, // required - 1 or 2
});
```

**Purpose:** Track serving order in live scoring.

---

## stringify

Converts a structured matchUpFormat object to a format code string. Alias for `stringifyMatchUpFormat`.

```js
const code = scoreGovernor.stringify({
  matchUpFormat, // required - format object
});
```

**Purpose:** Convert format objects to compact code strings.

---

## tidyScore

Cleans and normalizes a score object, removing invalid or incomplete data.

```js
const tidied = scoreGovernor.tidyScore({
  score, // required - score object to tidy
});
```

**Purpose:** Normalize score data for storage and comparison.

---

## umo

"Undo Multiple Operations" - undoes multiple scoring actions at once.

```js
const result = scoreGovernor.umo({
  score, // required - score object
  count, // required - number of operations to undo
});
```

**Purpose:** Bulk undo for correcting scoring errors.

---

## undo

Undoes the last scoring action in history.

```js
const result = scoreGovernor.undo({
  score, // required - score object with history
});
```

**Purpose:** Undo functionality for live scoring interfaces.

---

## validateScore

Validates a complete score object against a matchUpFormat.

```js
const { valid, errors } = scoreGovernor.validateScore({
  matchUpFormat, // required - format to validate against
  score, // required - score object to validate
});
```

**Purpose:** Comprehensive score validation for data integrity.

---

## validateSetScore

Validates a single set score against matchUpFormat rules. Returns `{ isValid: boolean, error?: string }`.

Supports all matchUpFormat variations including:

- Standard formats (SET3-S:6/TB7)
- Tiebreak-only sets (SET1-S:TB10, SET3-S:TB7)
- Pro sets (SET1-S:8/TB7)
- Short sets (SET3-S:4/TB7)
- NOAD formats (SET3-S:6NOAD/TB7NOAD)

```js
const set = {
  side1Score: 7,
  side2Score: 6,
  side1TiebreakScore: 7,
  side2TiebreakScore: 5,
};

const { isValid, error } = scoreGovernor.validateSetScore({
  set,
  matchUpFormat: 'SET3-S:6/TB7',
  isDecidingSet: false, // optional - whether this is the final set
  allowIncomplete: false, // optional - allow incomplete scores (for RETIRED/DEFAULTED)
});
```

**Tiebreak-only set example:**

```js
const set = { side1Score: 11, side2Score: 13 };
const { isValid } = scoreGovernor.validateSetScore({
  set,
  matchUpFormat: 'SET1-S:TB10',
});
// isValid: true - TB10 set with valid win-by-2 score
```

---

## validateMatchUpScore

Validates all sets in a matchUp score against matchUpFormat rules. Returns `{ isValid: boolean, error?: string }`.

Automatically handles:

- Multiple set validation
- Final set format variations
- Irregular endings (RETIRED, WALKOVER, DEFAULTED)

```js
const sets = [
  { side1Score: 6, side2Score: 4 },
  { side1Score: 3, side2Score: 6 },
  { side1Score: 7, side2Score: 5 },
];

const { isValid, error } = scoreGovernor.validateMatchUpScore({
  sets,
  matchUpFormat: 'SET3-S:6/TB7',
  matchUpStatus: 'COMPLETED', // optional - allows incomplete scores for RETIRED/DEFAULTED
});
```

**Best-of-3 TB10 example:**

```js
const sets = [
  { side1Score: 11, side2Score: 13 },
  { side1Score: 12, side2Score: 10 },
];

const { isValid } = scoreGovernor.validateMatchUpScore({
  sets,
  matchUpFormat: 'SET3-S:TB10',
});
// isValid: true - both TB10 sets have valid win-by-2 scores
```

---

## validateTieFormat

Provides validation for `tieFormat` objects. See [tieFormats](/docs/concepts/tieFormat).

```js
const {
  valid, // boolean whether valid or not
  error,
} = scoreGovernor.validateTieFormat({
  checkCollectionIds, // ensure collectionId is present on all collections
  enforceGender,
  tieFormat,
  gender,
});
```

---

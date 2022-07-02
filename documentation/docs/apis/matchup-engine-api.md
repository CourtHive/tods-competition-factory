---
title: matchUpEngine API
---

All **\_matchUpEngine** methods which make a mutation return either `{ success: true }` or `{ error }`

---

### analyzeMatchUp

```js
let analysis = matchUpEngine.analyzeMatchUp({ matchUp });

const {
  isActiveSet,
  isExistingSet,
  existingValue,
  hasExistingValue,
  isValidSideNumber,
  completedSetsCount,
  isCompletedMatchUp,
  isLastSetWithValues,
  validMatchUpOutcome,
  matchUpScoringFormat: {
    bestOf,
    setFormat: { setTo, tiebreakFormat, tiebreakAt },
  },
  calculatedWinningSide,
  validMatchUpWinningSide,
  completedSetsHaveValidOutcomes,
  specifiedSetAnalysis: {
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
  },
} = analysis;
```

---

# TODO: Consecutive Game Format (-G:3C) Scoring Logic

## Location
`addPoint.ts` line 574 — `checkStandardGameWon()` function

## What's Already Implemented
- **Parsing** (`parse.ts:116`): `-G:3C` → `{ type: 'CONSECUTIVE', count: 3 }`
- **Stringify** (`stringify.ts:41`): round-trips correctly
- **Types** (`types.ts:519`): `GameFormatStructure { type?: 'AGGR' | 'CONSECUTIVE'; count?: number }`
- **Helper functions** in `formatConverter.ts`:
  - `getPointsToGame()` returns `gameFormat.count` for CONSECUTIVE (line 364)
  - `getMinPointsToSetCompletion()` uses count instead of 4 (line 390)
  - `getMinPointsToMatchCompletion()` propagates correctly
- **pointsToCalculator** (line 358): uses consecutive count for `minPointsPerGame`
- **Cross-sport format tests**: TYPTI, Touch Rugby, Padel TYPTI formats parse/stringify correctly
- **SetType resolution**: CONSECUTIVE formats resolve to `'standard'`, routing to `handleStandardSet()`

## What's Missing
`checkStandardGameWon()` hardcodes `pointsTo = 4` and uses cumulative scoring. For CONSECUTIVE, the logic is fundamentally different: a game is won by scoring `count` points **in a row**. When the opponent scores, the winning streak resets.

### Required Changes
1. **Streak tracking**: `side1GameScores`/`side2GameScores` track cumulative totals per game. For consecutive scoring, need either:
   - A separate streak counter on the set/game state, or
   - Derive the current streak from point history (scanning backwards)
2. **`checkStandardGameWon`** needs a `gameFormat` parameter to branch on CONSECUTIVE
3. **`handleStandardSet`** may need adjustment for how game scores are displayed/stored
4. **Score display**: What does `formatGameScore()` show for consecutive format? Possibly just the streak count.

### Sports Using This Format
- TYPTI: `SET5-S:5/TB0-G:3C` (best of 5, sets to 5 games, 3 consecutive to win game)
- Touch Rugby: `SET3-S:4/TB0-G:2C` (2 consecutive)
- Padel TYPTI: `SET5-S:5/TB0-G:4C` (4 consecutive)
- Table Tennis TYPTI: `SET3-S:4/TB5-G:3C` (with tiebreak at 4-4)

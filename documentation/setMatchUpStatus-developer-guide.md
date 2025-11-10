# setMatchUpStatus Developer's Guide

## Quick Start: Where to Look

**I want to...**

### Add a new matchUpStatus value

1. **Add constant:** `src/constants/matchUpStatusConstants.ts`
   - Add to `validMatchUpStatuses` array
   - Add to appropriate category (directing, non-directing, participants-required)

2. **Update validation:** `src/mutate/matchUps/matchUpStatus/setMatchUpState.ts`
   - Line ~95: Check compatibility with winningSide
   - Line ~270: Check if status is directing or non-directing

3. **Update state machine rules:**
   - Define valid transitions FROM your new status
   - Define valid transitions TO your new status
   - Add any special handling (like WALKOVER clears score)

4. **Add tests:**
   - Test setting the new status
   - Test transitions from other statuses
   - Test downstream effects

**Files to modify:**
- `src/constants/matchUpStatusConstants.ts`
- `src/mutate/matchUps/matchUpStatus/setMatchUpState.ts`
- `src/query/matchUp/checkStatusType.ts` (if directing/non-directing classification)
- Tests

---

### Add validation for a specific status

**Location:** `src/mutate/matchUps/matchUpStatus/setMatchUpState.ts`

**Where to add:**

```typescript
// Around line 95-110, after basic validation
if (matchUpStatus === YOUR_NEW_STATUS) {
  // Add validation
  if (invalidCondition) {
    return { error: YOUR_ERROR_CODE, context: {...} };
  }
}
```

**Example: Prevent status on TEAM matchUps**

```typescript
// Line ~182
if (isTeam && matchUpStatus && [YOUR_STATUS].includes(matchUpStatus)) {
  return {
    info: 'Not supported for matchUpType: TEAM',
    error: INVALID_VALUES,
  };
}
```

---

### Add special handling for TEAM/collection matchUps

**Location:** `src/mutate/matchUps/matchUpStatus/setMatchUpState.ts`

**TEAM Match Logic:** Lines 130-180
**Collection Match Logic:** Lines 242-268

**Pattern:**

```typescript
if (isTeam) {
  // Your TEAM-specific logic
  // Access: matchUp (the TEAM dual match)
}

if (matchUpTieId) {
  // Your collection-specific logic
  // Access: matchUp (collection match), dualMatchUp (TEAM match)
  const { matchUp: dualMatchUp } = findDrawMatchUp({
    matchUpId: matchUpTieId,
    // ...
  });
}
```

---

### Modify score calculation for TEAM matches

**Location:** `src/assemblies/generators/tieMatchUpScore/generateTieMatchUpScore.ts`

**Called from:** 
- `setMatchUpState.ts` line ~158 (when enabling auto-calc)
- `updateTieMatchUpScore.ts` (when collection match completes)

**Modify aggregation logic here** if you need to change how TEAM match scores are calculated from collection matches.

---

### Change when propagation is blocked

**Location:** `src/mutate/matchUps/matchUpStatus/setMatchUpState.ts`

**Key Decision Point:** Lines 150-162

```typescript
// activeDownstream check determines if downstream matches have participants
const activeDownstream = isActiveDownstream(params);

// TEAM-specific blocking
if (activeDownstream && dualWinningSideChange) {
  return { error: CANNOT_CHANGE_WINNING_SIDE };
}
```

**To modify blocking logic:**

1. Adjust `isActiveDownstream` in `src/query/drawDefinition/isActiveDownstream.ts`
2. Add policy check to allow override
3. Update validation in `setMatchUpState`

---

### Add new participant direction logic

**Location:** `src/mutate/matchUps/drawPositions/`

**Key Files:**
- `directParticipants.ts` - Orchestrator
- `directWinner.ts` - Winner placement
- `directLoser.ts` - Loser placement (handles exit status)

**Example: Add special placement for a new draw structure**

```typescript
// In directWinner.ts or directLoser.ts

// Check structure type
if (structure.structureType === YOUR_NEW_TYPE) {
  // Your custom placement logic
  const targetPosition = calculateTargetPosition(matchUp, structure);
  // ... assign participant
}
```

---

### Handle a new type of exit status

**Location:** `src/mutate/matchUps/drawPositions/progressExitStatus.ts`

**Current Logic:** Lines 25-90

```typescript
// Add your exit status to carryOverMatchUpStatus logic
const carryOverMatchUpStatus =
  ([WALKOVER, DEFAULTED, YOUR_NEW_EXIT].includes(sourceMatchUpStatus) && 
   sourceMatchUpStatus) || WALKOVER;
```

**Test:** Ensure it propagates correctly through consolation brackets

---

### Add policy-based behavior

**Location:** Multiple files

**Step 1: Define Policy**

```typescript
// In policy definition (e.g., src/fixtures/policies/)
{
  [POLICY_TYPE_YOUR_POLICY]: {
    yourPolicySetting: true,
  }
}
```

**Step 2: Check Policy in Code**

```typescript
// In setMatchUpState.ts or related file
const appliedPolicies = getAppliedPolicies({
  policyTypes: [POLICY_TYPE_YOUR_POLICY],
  // ...
});

if (appliedPolicies?.[POLICY_TYPE_YOUR_POLICY]?.yourPolicySetting) {
  // Your policy-based logic
}
```

**Step 3: Apply Policy Effect**

Common policy checks:
- `POLICY_TYPE_PROGRESSION` - Line ~231 (qualifier auto-placement)
- `POLICY_TYPE_SCORING` - Line ~210 (participant requirements)

---

### Debug a specific scenario

**Add Logging at Decision Points:**

```typescript
// In setMatchUpState.ts, before path selection
pushGlobalLog({
  method: 'setMatchUpState',
  matchUpId,
  winningSide,
  matchUpStatus,
  activeDownstream,
  isTeam,
  isCollectionMatchUp,
  // Add any flags you want to trace
});
```

**Track Execution Path:**

```typescript
const executionPath: string[] = [];

// At each major decision
if (condition1) {
  executionPath.push('Path A');
}
// ...

pushGlobalLog({
  method: 'setMatchUpState',
  executionPath: executionPath.join(' → '),
});
```

**Common Debug Points:**

1. **Path Selection** (line ~306): Which path A/B/C is chosen?
2. **activeDownstream** (line ~146): Why is/isn't propagation blocked?
3. **Participant Direction** (`directParticipants.ts`): Where are participants going?
4. **Exit Status** (`progressExitStatus.ts`): How is WO/DEFAULT propagating?

---

## Common Extension Patterns

### Pattern 1: Add Pre-Condition Check

**When:** You need to validate something before allowing status change

**Where:** `setMatchUpState.ts`, lines 95-110 (after basic validation)

```typescript
// After existing validation
if (matchUpStatus === COMPLETED) {
  const yourCondition = checkYourCondition(matchUp);
  if (!yourCondition.valid) {
    return decorateResult({
      result: { error: YOUR_ERROR },
      info: 'Explanation of why invalid',
      context: { matchUpId, yourCondition },
    });
  }
}
```

---

### Pattern 2: Add Post-Action Side Effect

**When:** You need to do something after status is set

**Where:** `noDownstreamDependencies.ts` or `applyMatchUpValues` inline function

```typescript
// After modifyMatchUpScore or updateTieMatchUpScore
const result = modifyMatchUpScore(params);
if (!result.error) {
  // Your side effect
  yourSideEffect({ matchUp, newStatus: params.matchUpStatus });
}
return result;
```

---

### Pattern 3: Add Structure-Type-Specific Logic

**When:** Behavior differs by structure type (e.g., ROUND_ROBIN vs ELIMINATION)

**Where:** Before participant direction (`attemptToSetWinningSide.ts`)

```typescript
// In attemptToSetWinningSide or directParticipants
const { structure } = params;

if (structure.structureType === ROUND_ROBIN) {
  // Round robin specific logic
} else if (structure.structureType === ELIMINATION) {
  // Elimination specific logic
}
```

---

### Pattern 4: Modify Propagation Behavior

**When:** You need different propagation rules

**Where:** `directWinner.ts` or `directLoser.ts`

```typescript
// In directWinner.ts
const { targetData, structure } = params;

// Custom target calculation
const customTarget = yourCustomTargetLogic({
  matchUp,
  structure,
  targetData,
});

// Use custom target instead of default
const targetMatchUp = findTargetMatchUp(customTarget);
```

---

### Pattern 5: Add Qualifier Handling

**When:** You need custom behavior for qualifying rounds

**Where:** `setMatchUpState.ts` lines 222-240, or create new handler

**Existing Patterns:**
- `qualifierAdvancing` - Winner moving to main draw
- `qualifierChanging` - Different winner in qualifying match
- `removingQualifier` - Removing result from qualifying match

**Add New:**

```typescript
const yourQualifierCondition = 
  inContextMatchUp?.stage === QUALIFYING &&
  // your additional conditions

Object.assign(params, { yourQualifierCondition });

// Later, in attemptToSetWinningSide
if (params.yourQualifierCondition && policy.yourQualifierPolicy) {
  yourQualifierHandler(params);
}
```

---

## Testing Your Changes

### Test Checklist

When adding/modifying functionality, test:

- [ ] **Direct case** - Your specific scenario works
- [ ] **Downstream impact** - Changes propagate correctly
- [ ] **Upstream constraints** - Can't break prior matches
- [ ] **TEAM matches** - Collection and dual match both update
- [ ] **Exit statuses** - WO/DEFAULT propagate correctly
- [ ] **Edge cases:**
  - [ ] First round match
  - [ ] Final round match
  - [ ] Bye in target position
  - [ ] Match already has score
  - [ ] No participants yet
  - [ ] One participant only
  - [ ] Qualifier scenarios
  - [ ] Round robin vs elimination
  - [ ] Consolation bracket

### Test Template

```typescript
it('handles YOUR_SCENARIO correctly', () => {
  // Setup
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32 }],
  });
  
  tournamentEngine.setState(tournamentRecord);
  const matchUp = getMatchUpFromDraw(/*...*/);
  
  // Execute
  const result = tournamentEngine.setMatchUpStatus({
    matchUpId: matchUp.matchUpId,
    outcome: { /* your outcome */ },
    // other params
  });
  
  // Verify
  expect(result.success).toBe(true);
  
  // Check downstream effects
  const nextMatchUp = getNextMatchUp(matchUp);
  expect(nextMatchUp.sides[0].participantId).toBe(winnerParticipantId);
  
  // Check side effects
  expect(consolationMatchUp.matchUpStatus).toBe(EXPECTED_STATUS);
});
```

---

## Common Pitfalls

### Pitfall 1: Forgetting activeDownstream Check

**Problem:** Allowing winningSide changes when downstream matches exist

**Solution:**
```typescript
// Always check before allowing winningSide changes
if (activeDownstream && winningSide !== matchUp.winningSide) {
  return { error: CANNOT_CHANGE_WINNING_SIDE };
}
```

---

### Pitfall 2: Not Clearing Score for Non-Scoring Statuses

**Problem:** WALKOVER has a score attached

**Solution:**
```typescript
// Line ~79 in setMatchUpState
if (params.matchUpStatus && [WALKOVER, DOUBLE_WALKOVER].includes(params.matchUpStatus)) {
  params.score = undefined;
}
```

**Add your status if it shouldn't have a score**

---

### Pitfall 3: Missing Collection Match Update

**Problem:** Collection match updated but dual TEAM match not recalculated

**Solution:**
```typescript
// After modifying collection match score
if (params.isCollectionMatchUp) {
  updateTieMatchUpScore({
    matchUpId: params.matchUpTieId,
    // ... other params
  });
}
```

---

### Pitfall 4: Infinite Recursion in progressExitStatus

**Problem:** Exit status propagates forever

**Protection:** Failsafe in `setMatchUpStatus.ts` lines 139-147

```typescript
let iterate = true;
let failsafe = 0;
while (iterate && failsafe < 10) {
  failsafe += 1;
  // ...
}
```

**Warning:** If your scenario needs >10 iterations, you may have a design issue

---

### Pitfall 5: Modifying matchUp Directly

**Problem:** Direct mutation without using proper functions

**Wrong:**
```typescript
matchUp.winningSide = 1;
matchUp.matchUpStatus = COMPLETED;
```

**Right:**
```typescript
modifyMatchUpScore({
  winningSide: 1,
  matchUpStatus: COMPLETED,
  matchUp,
  // ... other params
});
```

**Why:** Proper functions handle side effects, validation, and propagation

---

## Understanding Error Messages

### CANNOT_CHANGE_WINNING_SIDE

**Cause:** Attempting to change winningSide when downstream matches have participants

**Where:** `setMatchUpState.ts` line ~155 or `winningSideWithDownstreamDependencies`

**Fix:** 
- Remove participants from downstream first, OR
- Use `allowChangePropagation` to swap winner/loser, OR
- Accept that change is blocked

---

### INVALID_MATCHUP_STATUS

**Cause:** Status doesn't exist, or incompatible with current state

**Where:** `setMatchUpState.ts` line ~100 or `checkParticipants` line ~420

**Fix:**
- Check status is in `validMatchUpStatuses`
- Ensure participants exist if status requires them
- Check compatibility with winningSide

---

### INCOMPATIBLE_MATCHUP_STATUS

**Cause:** Status and winningSide combination not allowed

**Where:** `setMatchUpState.ts` lines ~95, ~123, ~275

**Examples:**
- BYE with winningSide
- winningSide without directing status
- Non-directing status with activeDownstream

**Fix:** Match status to winningSide requirements

---

### NO_VALID_ACTIONS

**Cause:** Path selection found no applicable path

**Where:** `setMatchUpState.ts` line ~318

**Debug:**
- Check values of: `activeDownstream`, `winningSide`, `directingMatchUpStatus`, `autoCalcDisabled`
- Add logging before path selection to see why all paths fail

---

### MISSING_MATCHUP

**Cause:** progressExitStatus couldn't find loser matchUp

**Where:** `progressExitStatus.ts` line ~110

**Usually means:** No consolation bracket, or propagation reached end of bracket

---

## Quick Reference: Key Variables

| Variable | Meaning | Where Set |
|----------|---------|-----------|
| `activeDownstream` | Downstream matches have participants | `isActiveDownstream()` line ~146 |
| `isTeam` | MatchUp is TEAM type | line ~143 |
| `matchUpTieId` | ID of parent TEAM match (for collection) | line ~132 |
| `inContextMatchUp` | MatchUp with full context (sides, etc.) | line ~124 |
| `targetData` | Where winner/loser go | `positionTargets()` line ~136 |
| `appliedPolicies` | Active policies | `getAppliedPolicies()` line ~202 |
| `qualifierAdvancing` | Winner from qualifying | line ~224 |
| `qualifierChanging` | Different qualifier winning | line ~230 |
| `removingQualifier` | Removing qualifier result | line ~225 |
| `dualWinningSideChange` | TEAM match winner changed | line ~266 |
| `projectedWinningSide` | Calculated TEAM winner | line ~261 |
| `directingMatchUpStatus` | Status that determines winner | line ~270 |

---

## Related Documentation

- **Architecture Analysis:** `setMatchUpStatus-pipeline-analysis.md` - Comprehensive complexity analysis and refactoring recommendations
- **Flow Diagrams:** `setMatchUpStatus-flow-diagram.md` - Visual flow charts and decision trees
- **Original Pseudocode:** `src/mutate/matchUps/matchUpStatus/setMatchUpStatus.md` - Original documentation

---

## Getting Help

**Can't find where to make your change?**

1. Search for similar existing behavior
2. Add logging at suspected decision points
3. Trace execution with matchUpId of test case
4. Review flow diagrams in `setMatchUpStatus-flow-diagram.md`

**Change breaks existing tests?**

1. Review path selection logic
2. Check if activeDownstream changed
3. Verify TEAM/collection logic still works
4. Look for missing policy checks

**Not sure which path your code executes?**

```typescript
// Add at line ~306 in setMatchUpState
const pathTaken = 
  !activeDownstream ? 'A:noDownstream' :
  matchUpWinner ? 'B:withDownstream' :
  (directingMatchUpStatus || autoCalcDisabled) ? 'C:applyValues' :
  'D:noValidActions';
  
pushGlobalLog({ method: 'pathSelection', pathTaken });
```

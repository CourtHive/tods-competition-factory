# progressExitStatus Investigation Report

**Date:** November 10, 2025  
**Investigation:** Why was the progressExitStatus branch reverted and what's the current state?

---

## Timeline

| Date | Event | Commit |
|------|-------|--------|
| Oct 28, 2025 | **Merged** progressExitStatus-sv branch | `c62aae065` |
| Nov 5, 2025 | **Reverted** the merge (8 days later) | `c3f670c57` |
| Oct 25, 2025 | **Re-added** progressExitStatus.ts | `af1748872` |
| Nov 6, 2025 | **Re-added** hooks to directLoser | `2e90db5d4` |
| Nov 10, 2025 | **Restored** test file from history | Current |

---

## Key Finding: Functionality Was NOT Removed

**The revert was temporary!** The functionality was re-implemented shortly after with a CRITICAL CHANGE.

### Current State

✅ **progressExitStatus.ts exists** (110 lines)  
✅ **setMatchUpStatus.ts has while loop** (lines 136-156)  
✅ **directLoser.ts has hooks** (lines 107-108, 151-152, 250-252)  
✅ **Test file recovered** (539 lines, 13 tests)  
❌ **Tests failing:** 13/13 (all tests fail)

---

## Critical Difference: Status Code Handling

### Original Implementation (Reverted)

```typescript
// progressExitStatus.ts lines 76-79 (original)
if (![WALKOVER, DEFAULTED].includes(loserMatchUp.matchUpStatus)) {
  // Set opponent as winner
  winningSide = loserParticipantSide.sideNumber === 1 ? 2 : 1;
  // ✅ CARRY OVER STATUS CODE
  statusCodes[0] = sourceMatchUpStatusCodes[0];
}
```

### Current Implementation

```typescript
// progressExitStatus.ts lines 76-78 (current)
if (![WALKOVER, DEFAULTED].includes(loserMatchUp.matchUpStatus)) {
  // Set opponent as winner
  winningSide = loserParticipantSide.sideNumber === 1 ? 2 : 1;
  // ❌ STATUS CODE LINE REMOVED
}
```

**Impact:** When an opponent is already present in the consolation match, status codes are NOT carried over from the main draw.

---

## Test Failures Analysis

### Passing Tests (0/13)
None currently passing.

### Failing Tests (13/13)

**Category 1: Basic Propagation (4 tests)**
- ❌ WALKOVER with W1 code
- ❌ WALKOVER with W2 code
- ❌ DEFAULTED with DM code
- ❌ RETIRED propagating as WALKOVER

**Category 2: Status Code Propagation (1 test)**
- ❌ Status codes when opponent present
  - **Root cause:** Lines 78-79 removed

**Category 3: Double Walkover (4 tests)**
- ❌ WALKOVER → DOUBLE_WALKOVER
- ❌ DEFAULTED → DOUBLE_WALKOVER
- ❌ Both winningSide variations

**Category 4: Complex Scenarios (4 tests)**
- ❌ Opponent already present
- ❌ Compass draw 4-level propagation
- ❌ Curtis consolation auto-progression
- ❌ Feed-in with propagated WO

### Common Error Pattern

```
Expected: "WALKOVER"
Received: "TO_BE_PLAYED"
```

**Interpretation:** Propagation is not happening at all, not just status codes missing.

---

## Why Was It Reverted?

### Evidence from Commits

The revert commit message provides minimal information:
```
Revert "Merge branch 'progressExitStatus-sv' into dev"

This reverts commit c62aae065625a17c5e0649cc5bd466d1bfa019cf, reversing
changes made to d26cc0c52f5efce544ea8d499f4ceda1e7b4b036.
```

### Hypothesis Based on Timeline

1. **Oct 28:** Feature merged after 42 commits of development
2. **Oct 28 - Nov 5:** Testing/usage in dev branch (8 days)
3. **Nov 5:** Full revert (something went wrong)
4. **Oct 25 - Nov 6:** Cherry-picked re-implementation with changes

**Note:** Commit `af1748872` (Oct 25) predates the revert (Nov 5), suggesting the re-implementation was developed in parallel, possibly on a different branch.

### Likely Issues That Led to Revert

#### Issue 1: Status Code Handling Too Aggressive
```typescript
// Original logic may have been incorrect
statusCodes[0] = sourceMatchUpStatusCodes[0];
```
- Always overwrites first status code
- Doesn't account for side positioning
- May have caused UI confusion or data inconsistency

#### Issue 2: DOUBLE_WALKOVER Complexity
- Creating DOUBLE_WALKOVER when both participants have exit status
- Complex status code array management
- Potential for incorrect winningSide calculation

#### Issue 3: Multi-Level Propagation
- Compass draws: 4 levels deep
- While loop with failsafe (max 10 iterations)
- Potential infinite loops or unexpected termination

#### Issue 4: Integration Issues
- `decorateResult` changes affected other systems
- Context object threading through 5+ functions
- `isActiveDownstream` detection logic complex

#### Issue 5: Rollback Complications
- Clearing scores in main draw with propagated exit status
- Orphaned statuses in consolation
- No clear undo path

---

## What Changed in Re-Implementation

### 1. Status Code Line Removed (lines 78-79)

**Removed:**
```typescript
//we still want to bring over the original status codes
statusCodes[0] = sourceMatchUpStatusCodes[0];
```

**Why removed?**
- Probably caused issues with existing opponent's status
- May have overwritten important information
- Simplified the logic

**Problem:** Now status codes don't carry over at all

### 2. globalLog Added

**Added (lines 23-28):**
```typescript
pushGlobalLog({
  matchUpId: loserMatchUp?.matchUpId,
  matchUpStatus: sourceMatchUpStatus,
  color: 'magenta',
  method: stack,
});
```

**Purpose:** Debug tracing for development

### 3. Structure Identical Otherwise
- Same algorithm
- Same while loop in setMatchUpStatus
- Same hooks in directLoser
- Same recursive approach

---

## Why Tests Are Failing

### Root Cause Analysis

**Tests expect:** `matchUpStatus: WALKOVER`  
**Tests receive:** `matchUpStatus: TO_BE_PLAYED`

This suggests **propagation is not triggering at all**, not just missing status codes.

### Potential Causes

#### Cause 1: Missing Parameter
```typescript
// Test may not be passing propagateExitStatus flag
tournamentEngine.setMatchUpStatus({
  outcome: { matchUpStatus: WALKOVER, ... },
  propagateExitStatus: true, // ← Is this being passed?
  matchUpId,
  drawId,
});
```

#### Cause 2: Context Flag Not Set
```typescript
// directLoser.ts line 151-152
if (!result.error && validExitToPropagate && propagateExitStatus) {
  return { stack, context: { progressExitStatus: true, loserParticipantId } };
}
```
- `validExitToPropagate` might be false
- `propagateExitStatus` might be undefined
- Context not being returned correctly

#### Cause 3: loserMatchUp Missing
```typescript
// setMatchUpStatus.ts line 149
loserMatchUp: result.context.loserMatchUp,
```
- If `loserMatchUp` is undefined, progression can't happen
- Context might not include loser matchUp

#### Cause 4: matchUpsMap Not Updated
```typescript
// progressExitStatus.ts lines 34-38
const inContextMatchUps = getAllDrawMatchUps({
  inContext: true,
  drawDefinition,
  matchUpsMap,
})?.matchUps;
```
- Map may be stale
- Updated participants not reflected

---

## Debugging Steps Performed

### 1. Confirmed File Existence
✅ `progressExitStatus.ts` exists and contains logic
✅ `setMatchUpStatus.ts` has while loop
✅ `directLoser.ts` has hooks

### 2. Compared Implementations
✅ Found key difference: status code line removed
✅ Identified globalLog addition
✅ Structure otherwise identical

### 3. Ran Tests
✅ All 13 tests fail with same pattern
✅ Error: Expected WALKOVER, received TO_BE_PLAYED
✅ Suggests propagation not triggering

### 4. Checked Git History
✅ Traced revert and re-implementation
✅ Found parallel development timeline
✅ Identified cherry-picked changes

---

## Recommendations

### Immediate (Fix Current Implementation)

1. **Restore Status Code Line** (with fix)
   ```typescript
   if (![WALKOVER, DEFAULTED].includes(loserMatchUp.matchUpStatus)) {
     winningSide = loserParticipantSide.sideNumber === 1 ? 2 : 1;
     // Fixed: Set status code on correct side
     if (loserParticipantSide.sideNumber) {
       statusCodes[loserParticipantSide.sideNumber - 1] = sourceMatchUpStatusCodes[0];
     }
   }
   ```

2. **Add Debug Logging to Tests**
   ```typescript
   tournamentEngine.devContext(true); // Already in tests
   // Check what's being passed to propagateExitStatus
   console.log('Context:', result.context);
   ```

3. **Verify Parameter Passing**
   - Check if `propagateExitStatus: true` reaches `directLoser`
   - Verify `validExitToPropagate` is true
   - Confirm `loserMatchUp` is in context

### Short-Term (Option 3)

Create simplified implementation:

1. **Remove Recursion**
   - Use event queue instead of while loop
   - Max depth of 1 (no multi-level)
   - Clear termination conditions

2. **Mark Propagated Matches**
   ```typescript
   addExtension({
     element: loserMatchUp,
     extension: {
       name: 'PROPAGATED_EXIT_STATUS',
       value: { sourceMatchUpId, statusCode }
     }
   });
   ```

3. **Simplify Status Code Handling**
   - Only handle single participant case
   - Don't create DOUBLE_WALKOVER automatically
   - Require manual intervention for complex scenarios

4. **Limit Scope**
   - FIRST_MATCH_LOSER_CONSOLATION only
   - No Compass draw support
   - No Curtis consolation feed-in

---

## Next Steps

### Option 2: Fix Current Implementation

**Steps:**
1. Debug why propagation isn't triggering
2. Restore status code line with proper side handling
3. Add comprehensive logging
4. Fix failing tests one by one
5. Test in isolation before merging

**Timeline:** 1-2 days  
**Risk:** Medium (same issues as before)  
**Benefit:** Full feature set

### Option 3: Simplified Re-Implementation

**Steps:**
1. Create new branch: `progressExitStatus-simplified`
2. Remove while loop, use event queue
3. Limit to single-level propagation
4. Mark propagated matches with extensions
5. Comprehensive test coverage
6. Document limitations clearly

**Timeline:** 3-5 days  
**Risk:** Low (reduced complexity)  
**Benefit:** Maintainable, clear limitations

---

## Conclusion

The `progressExitStatus` functionality:

1. **Was reverted after 8 days** - likely due to edge cases or integration issues
2. **Was re-implemented** - shortly after with critical changes
3. **Currently exists but doesn't work** - all tests failing
4. **Key difference identified** - status code line removed in "opponent present" case
5. **Propagation not triggering** - root cause needs debugging

**Recommendation:** Proceed with **Option 3 (simplified)** to avoid repeating the same issues. The current implementation suggests the full feature is too complex for the current architecture.

**See:** `setMatchUpStatus-pipeline-analysis.md` for architectural improvements that would enable a robust implementation.

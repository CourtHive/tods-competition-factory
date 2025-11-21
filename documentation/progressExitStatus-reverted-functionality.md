# Reverted progressExitStatus Functionality Analysis

## Overview

On **November 5, 2025**, commit `c3f670c57` reverted the merge of the `progressExitStatus-sv` branch, removing comprehensive exit status propagation functionality that had been developed over **42 commits** spanning multiple months.

**Merge that was reverted:** `c62aae065` (October 28, 2025)
**Changes:** +1,060 lines / -166 lines across 25 files
**Test file:** 539 lines with 13 comprehensive test scenarios

---

## What Was Removed

### Core New Feature: Automatic Exit Status Propagation

The branch implemented automatic propagation of exit statuses (WALKOVER, DEFAULTED, RETIRED) through consolation and back draws when a participant loses with an exit status.

**Example Scenario:**

```
Main Draw Round 1:
  Player A vs Player B
  Result: Player A wins, Player B WALKOVER (injury)

Consolation Draw:
  BEFORE: Player B enters consolation → Match stays TO_BE_PLAYED
  AFTER:  Player B enters consolation → Match automatically becomes WALKOVER
          Status code 'W1' (injury) carries over
          Opponent (if present) automatically wins
```

---

## Files Added

### 1. `progressExitStatus.ts` (104 lines)

**Location:** `src/mutate/matchUps/drawPositions/progressExitStatus.ts`

**Purpose:** Core logic for propagating exit statuses through consolation brackets

**Algorithm:**

```typescript
function progressExitStatus({
  sourceMatchUpStatus, // WALKOVER, DEFAULTED, or RETIRED
  sourceMatchUpStatusCodes, // e.g., ['W1'] for injury
  loserParticipantId, // ID of participant being directed
  loserMatchUp, // Target consolation matchUp
  propagateExitStatus, // Boolean flag to enable
  // ... other params
});
```

**Key Logic:**

1. **Status Conversion:**
   - WALKOVER → WALKOVER
   - DEFAULTED → DEFAULTED
   - RETIRED → WALKOVER (retired propagates as walkover)

2. **Single Participant Case:**

   ```typescript
   if (participantsCount === 1 && statusCodes.length === 0) {
     // Only the exit status participant in consolation match
     winningSide = opposite side // Opponent wins by walkover
     statusCodes[0] = sourceMatchUpStatusCodes[0] // Carry over code
   }
   ```

3. **Existing Opponent Case:**

   ```typescript
   if (opponent exists && not already WO/DEFAULT) {
     // Set opponent as winner
     winningSide = opponent's side
     statusCodes[0] = sourceMatchUpStatusCodes[0]
   }
   ```

4. **Both Participants Have Exit Status:**

   ```typescript
   if (both have WO/DEFAULT) {
     matchUpStatus = DOUBLE_WALKOVER
     winningSide = undefined
     statusCodes = [code from side 1, code from side 2]
   }
   ```

5. **Recursive Propagation:**
   ```typescript
   // Recursively calls setMatchUpState
   // Allows multi-level propagation (e.g., Compass draw: East → West → South → Southeast)
   return setMatchUpState({
     matchUpStatus: loserMatchUpStatus,
     matchUpStatusCodes: statusCodes,
     propagateExitStatus: true, // Continue propagation
     winningSide,
     // ...
   });
   ```

---

### 2. `propagateExitStatus.test.ts` (539 lines)

**Location:** `src/tests/mutations/drawDefinitions/setMatchUpStatus/propagateExitStatus.test.ts`

**Test Coverage (13 tests):**

1. **Basic Propagation (4 tests):**
   - WALKOVER with injury code (W1)
   - WALKOVER with illness code (W2)
   - DEFAULTED with misconduct code (DM)
   - RETIRED (propagates as WALKOVER with RJ code)

2. **Status Code Preservation (1 test):**
   - When opponent already in consolation match, status codes carry over correctly

3. **Double Walkover Creation (4 tests):**
   - WALKOVER propagated to match with existing DOUBLE_WALKOVER
   - DEFAULTED propagated to match with existing DOUBLE_WALKOVER
   - Tests winningSide: 1 and winningSide: 2 variations

4. **Opponent Already Present (1 test):**
   - Opponent in consolation match automatically wins
   - Status codes assigned to correct side

5. **Complex Draw Types (2 tests):**
   - **Compass Draw:** 4-level propagation (East → West → South → Southeast)
   - **Curtis Consolation:** Auto-progression when feed-in already has WO

6. **Automated Progression (1 test):**
   - Winner auto-progresses through WO rounds in feed-in scenarios

---

## Files Modified

### 1. `setMatchUpStatus.ts` (+44 lines/-14 lines)

**Added:**

- `propagateExitStatus` parameter to function signature
- While loop for iterative propagation (max 10 iterations)

```typescript
// NEW CODE (removed in revert):
if (result.context?.progressExitStatus) {
  let iterate = true;
  let failsafe = 0;

  while (iterate && failsafe < 10) {
    iterate = false;
    failsafe += 1;
    const progressResult = progressExitStatus({
      sourceMatchUpStatusCodes: result.context.sourceMatchUpStatusCodes,
      sourceMatchUpStatus: result.context.sourceMatchUpStatus,
      loserParticipantId: result.context.loserParticipantId,
      propagateExitStatus: params.propagateExitStatus,
      tournamentRecord: params.tournamentRecord,
      loserMatchUp: result.context.loserMatchUp,
      matchUpsMap: result.context.matchUpsMap,
      drawDefinition: params.drawDefinition,
      event: params.event,
    });
    if (progressResult.context?.loserMatchUp) {
      Object.assign(result.context, progressResult.context);
      iterate = true;
    }
  }
}
```

**Why Iterative:**

- Single propagation might not reach end of bracket
- Compass draws can be 4+ levels deep
- Failsafe prevents infinite loops

---

### 2. `setMatchUpState.ts` (+32 lines)

**Added:**

- `propagateExitStatus` parameter passed through
- Context flag `progressExitStatus: true` set when exit status detected

**Modified Logic:**

```typescript
// Pass propagateExitStatus to nested calls
const result = setMatchUpState({
  // ... other params
  propagateExitStatus,
});
```

---

### 3. `directLoser.ts` (+28 lines)

**Added:**

- Detection of exit status scenarios
- Context enrichment for propagation

```typescript
// NEW CODE (removed in revert):
const validExitToPropagate = propagateExitStatus && [RETIRED, WALKOVER, DEFAULTED].includes(sourceMatchUpStatus || '');

if (validExitToPropagate) {
  Object.assign(context, {
    progressExitStatus: true,
    sourceMatchUpStatusCodes,
    sourceMatchUpStatus,
    loserParticipantId,
    loserMatchUp,
  });
}
```

**Purpose:**

- When directing loser participant, check if they have exit status
- If yes, flag for propagation
- Provide all necessary context to `progressExitStatus` function

---

### 4. `isActiveDownstream.ts` (+38 lines/-6 lines)

**Critical Change:** Detection of propagated exit statuses

**Problem Before:**

```typescript
// OLD: Any WO/DEFAULT match with winningSide = active downstream
if (loserMatchUp?.winningSide && [WO, DEFAULT].includes(status)) {
  return true; // BLOCKS score changes
}
```

**Problem:** Propagated WO matches look like regular WO matches, causing false positives

**Solution Added:**

```typescript
// NEW: Identify propagated exit status
const loserMatchUpParticipantsCount = countParticipants(loserMatchUp);

const isLoserMatchUpAPropagatedExitStatus =
  loserMatchUp?.winningSide &&
  isExit(loserMatchUp?.matchUpStatus) &&
  propagatedLoserParticipant &&
  loserMatchUpParticipantsCount === 1;

// Only block if clearing score when downstream has propagated exit
if (isLoserMatchUpAPropagatedExitStatus && isClearScore) {
  return true;
}
```

**Why Important:**

- Prevents false "active downstream" detection
- Allows score setting in main draw even when consolation has propagated WO
- Blocks score removal that would orphan propagated exit status

---

### 5. `directParticipants.ts` (+23 lines)

**Added:**

- Propagation flag handling
- Context passing for exit status

---

### 6. `directWinner.ts` (+5 lines)

**Added:**

- Context preservation for exit status tracking

---

### 7. `removeDoubleExit.ts` (+50 lines)

**Added:**

- Enhanced logic for cleaning up DOUBLE_WALKOVER scenarios
- Handles propagated double exits differently

---

### 8. `attemptToSetWinningSide.ts` (+4 lines)

**Added:**

- Context flag preservation

---

### 9. `attemptToSetMatchUpStatus.ts` (+3 lines)

**Added:**

- Context flag preservation

---

### 10. `attemptToModifyScore.ts` (+16 lines)

**Added:**

- Context enrichment for score modifications

---

## Feature Capabilities

### Supported Draw Types

1. **FIRST_MATCH_LOSER_CONSOLATION**
   - Single-level back draw
   - Direct propagation from main → consolation

2. **CURTIS_CONSOLATION**
   - Feed-in rounds
   - Auto-progression through WO matches

3. **COMPASS**
   - Multi-level propagation (4 structures)
   - East → West → South → Southeast
   - Tests verified 4-level propagation works

### Status Code Handling

**Status Codes Supported:**

- `W1` - Injury walkover
- `W2` - Illness walkover
- `W3` - Late withdrawal
- `DM` - Defaulted misconduct
- `RJ` - Retired injury
- Custom codes

**Code Propagation Rules:**

1. Single participant: Code on losing side
2. Opponent present: Code on WO/DEFAULT participant's side
3. Both have exit: Array of codes `[code1, code2]`

### RETIRED Handling

**Special Case:**

```typescript
// RETIRED does not propagate as RETIRED
// It becomes WALKOVER in consolation
matchUpStatus: RETIRED   → propagates as → matchUpStatus: WALKOVER
statusCode: 'RJ'         → carries over as → statusCode: 'RJ'
```

**Rationale:** RETIRED means match started but didn't finish. Consolation participant hasn't started their match yet, so it should be WALKOVER.

---

## Integration Points

### API Usage

```typescript
// Enable exit status propagation
const result = tournamentEngine.setMatchUpStatus({
  matchUpId: 'match-1-1',
  outcome: {
    matchUpStatus: WALKOVER,
    winningSide: 2,
    matchUpStatusCodes: ['W1'], // Injury
  },
  propagateExitStatus: true, // ← NEW PARAMETER
  drawId: 'draw-1',
});

// Result includes propagation context
if (result.success) {
  console.log('Propagation occurred:', result.context?.progressExitStatus);
  console.log('Affected matchUp:', result.context?.loserMatchUp);
}
```

### Architectural Flow

```
User calls setMatchUpStatus with propagateExitStatus: true
  ↓
setMatchUpStatus validates and calls setMatchUpState
  ↓
setMatchUpState calls directParticipants
  ↓
directParticipants calls directLoser
  ↓
directLoser detects exit status and sets context flag
  ↓
Returns to setMatchUpStatus with context.progressExitStatus: true
  ↓
setMatchUpStatus enters while loop (max 10 iterations)
  ↓
Calls progressExitStatus with source context
  ↓
progressExitStatus recursively calls setMatchUpState for loser matchUp
  ↓
Loop continues until no more progressExitStatus flags
```

---

## Why It Was Reverted

**Date:** November 5, 2025 (8 days after merge)

**Commit Message:** "Revert 'Merge branch 'progressExitStatus-sv' into dev'"

**Possible Reasons (needs confirmation):**

1. **Bugs Discovered:**
   - Tests show 13/13 failing after revert
   - Functionality was working when merged
   - May have caused issues in production/testing

2. **Architectural Concerns:**
   - Recursive + iterative approach complex
   - Context object changes affected other systems
   - `decorateResult` changes (breaking change)

3. **Edge Cases:**
   - Compass draw 4-level propagation may have issues
   - DOUBLE_WALKOVER creation logic complex
   - Score removal blocking too aggressive

4. **Integration Issues:**
   - `isActiveDownstream` changes affected multiple flows
   - Context preservation through call chain fragile
   - May have broken UI/client assumptions

---

## Technical Debt Created by Revert

### 1. Functionality Gap

- No automatic exit status propagation
- Manual intervention required for consolation brackets
- Status codes don't carry over
- DOUBLE_WALKOVER scenarios not handled

### 2. Test Coverage Lost

- 539 lines of comprehensive tests
- 13 scenarios covering edge cases
- Compass draw multi-level tests
- Curtis consolation feed-in tests

### 3. Documentation Lost

- Commits detail evolution of solution
- 42 commits of refinement
- Working solution to known problem

---

## Path Forward Options

### Option 1: Keep Reverted (Current State)

**Pros:**

- Stable (whatever issue caused revert is gone)
- Simpler codebase

**Cons:**

- Manual propagation required
- User experience degraded
- Status codes lost
- DOUBLE_WALKOVER handling manual

### Option 2: Investigate and Re-Implement

**Steps:**

1. Determine why it was reverted
2. Fix root cause
3. Re-apply with fixes
4. Enhanced testing

**Pros:**

- Get back powerful feature
- Automated user experience
- Proper status code handling

**Cons:**

- Investigation time
- Potential for same issues
- Complex to maintain

### Option 3: Simplified Re-Implementation

**Approach:**

- Remove recursive approach
- Use event-driven propagation
- Limit to single-level (no multi-level compass)
- Simpler blocking rules

**Pros:**

- Easier to understand
- More maintainable
- Reduced complexity

**Cons:**

- Less powerful
- May not handle all cases
- Still need to solve core problems

---

## Key Learnings from Original Implementation

### 1. Recursive + Iterative Complexity

```typescript
// COMPLEX: While loop + recursive calls
while (iterate && failsafe < 10) {
  progressExitStatus(); // Recursively calls setMatchUpState
}
```

**Better:** Event-driven queue (see setMatchUpStatus documentation recommendations)

### 2. Context Object Threading

**Issue:** Context passed through 5+ function calls
**Better:** Unified context object (see recommendations)

### 3. Detection Logic

**Issue:** Complex logic to detect propagated WO vs regular WO
**Better:** Mark propagated matches with extension/flag

### 4. State Machine

**Issue:** Implicit state transitions
**Better:** Explicit state machine (see recommendations)

---

## Recommendations

### If Re-Implementing:

1. **Use Event Sourcing** (from setMatchUpStatus documentation)
   - No recursion
   - No while loops
   - Clear event trail

2. **Mark Propagated Matches**

   ```typescript
   // Add extension to mark propagation
   addExtension({
     element: loserMatchUp,
     extension: {
       name: 'PROPAGATED_EXIT_STATUS',
       value: {
         sourceMatchUpId,
         sourceStatus: 'WALKOVER',
         sourceCode: 'W1',
       },
     },
   });
   ```

3. **Separate Concerns**
   - Detection: `detectExitStatusPropagation()`
   - Calculation: `calculatePropagatedStatus()`
   - Application: `applyPropagatedStatus()`
   - Iteration: Event loop, not while loop

4. **Limit Scope Initially**
   - Start with FIRST_MATCH_LOSER_CONSOLATION only
   - Add CURTIS_CONSOLATION after stable
   - Compass multi-level as stretch goal

5. **Enhanced Testing**
   - Test revert scenarios (score removal)
   - Test partial propagation
   - Test failsafe conditions
   - Test UI integration

---

## Files to Restore If Re-Implementing

**Core:**

- ✅ `progressExitStatus.test.ts` - Already restored
- ⚠️ `progressExitStatus.ts` - Need from git history

**Modified (need diffs):**

- `setMatchUpStatus.ts`
- `setMatchUpState.ts`
- `directLoser.ts`
- `isActiveDownstream.ts`

**Can extract from:**

```bash
git show c62aae065:path/to/file.ts > file.ts
```

---

## Summary

The reverted branch represented **significant work** (42 commits, 1,060 lines added) implementing a complex, recursive exit status propagation system. While functional at merge, it was reverted 8 days later, likely due to edge cases, complexity, or integration issues.

The **539-line test file** now serves as documentation of expected behavior and can guide future implementation efforts.

**Key takeaway:** The problem being solved is real and important, but the solution needs to be simpler, more maintainable, and better integrated with the existing architecture.

See `setMatchUpStatus-pipeline-analysis.md` for architectural recommendations that would make re-implementing this feature more maintainable.

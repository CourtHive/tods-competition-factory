# setMatchUpStatus Pipeline — Development Reference

This document traces the complete execution flow of the
`setMatchUpStatus` pipeline in the competition-factory. It is
intended as a development aid for understanding how match results
are set, how participants are advanced, and how exit statuses
(walkovers, defaults, double exits) propagate through elimination
and consolation draw structures.

---

## Table of Contents

1. [Overview](#overview)
2. [Entry Point: setMatchUpStatus](#entry-point-setmatchupstatus)
3. [Core Logic: setMatchUpState](#core-logic-setmatchupstate)
4. [Decision Routing](#decision-routing-nodownstreamdependencies)
5. [Status Setting](#status-setting-attempttosetmatchupstatus)
6. [Double Exit Advancement](#double-exit-advancement)
7. [Exit Status Propagation](#exit-status-propagation-to-consolation)
8. [Key Files Reference](#key-files-reference)
9. [Constants Reference](#constants-reference)
10. [Known Issues](#known-issues)
11. [Debugging with globalLog](#debugging-with-globallog)

---

## Overview

The `setMatchUpStatus` pipeline is responsible for:

1. **Setting a matchUp's score and/or status** (e.g.,
   COMPLETED with a score, WALKOVER, DOUBLE_WALKOVER)
2. **Advancing participants** to the next round in the
   same structure (winner to winner matchUp)
3. **Directing losers** to consolation structures (loser
   to loser matchUp via links)
4. **Propagating exit statuses** through consolation draws
   when a participant enters via a walkover or default
5. **Handling double exits** where both participants exit
   (DOUBLE_WALKOVER, DOUBLE_DEFAULT), which produce
   cascading effects

### High-Level Flow

```text
setMatchUpStatus()
  └─ setMatchUpState()
       ├─ noDownstreamDependencies()
       │    ├─ attemptToSetWinningSide()
       │    ├─ attemptToSetMatchUpStatus()
       │    │    ├─ scoreModification()
       │    │    ├─ removeWinningSideAndSetDoubleExit()
       │    │    └─ modifyScoreAndAdvanceDoubleExit()
       │    └─ removeDirectedParticipants()
       ├─ winningSideWithDownstreamDependencies()
       └─ applyMatchUpValues()
  └─ progressExitStatus()
       └─ setMatchUpState()
```

---

## Entry Point: setMatchUpStatus

**File:** `src/mutate/matchUps/matchUpStatus/setMatchUpStatus.ts`

This is the public API. It handles:

1. **Parameter validation** — Ensures `matchUpId` and
   `drawDefinition` are present
2. **Tournament record resolution** — Supports
   multi-tournament operations
3. **Auto-resolution** — If `drawDefinition` not provided,
   resolves from `eventId`/`drawId`
4. **Scoring policy lookup** — Finds
   `POLICY_TYPE_SCORING` for the tournament/event
5. **Change propagation policy** — Determines if winner
   changes propagate downstream
6. **WinningSide validation** — Must be 1, 2, or undefined
7. **MatchUp format setting** — Sets format before score
   validation
8. **Score generation** — Converts `sets` to score strings
   if needed
9. **Delegation to `setMatchUpState()`** — Core logic
10. **Exit status propagation** — Iterative loop calling
    `progressExitStatus()`

### Exit Status Propagation Loop

After `setMatchUpState()` returns, if
`result.context.progressExitStatus` is truthy, the pipeline
enters an iterative loop:

```typescript
let iterate = true;
let failsafe = 0;
while (iterate && failsafe < 10) {
  iterate = false;
  failsafe += 1;
  const progressResult = progressExitStatus({
    ...context,
  });
  if (progressResult.context?.loserMatchUp) {
    Object.assign(result.context, progressResult.context);
    iterate = true;
  }
}
```

This supports multi-level consolation structures (e.g.,
COMPASS draws: East, West, South, Southeast). The failsafe
prevents infinite loops.

---

## Core Logic: setMatchUpState

**File:** `src/mutate/matchUps/matchUpStatus/setMatchUpState.ts`

This is the internal workhorse. It:

1. **Clears score** if status is WALKOVER or DOUBLE_WALKOVER
2. **Validates status/winningSide combinations** (e.g.,
   can't have BYE with winningSide)
3. **Gets matchUpsMap and inContextDrawMatchUps** — Full
   draw state
4. **Finds target matchUp** — Both raw and in-context
   versions
5. **Resolves position targets** — Where winner/loser go
   next
6. **Handles TEAM matchUps** — Score generation, lineup
   management
7. **Validates score** against matchUp format
8. **Resolves applied policies** —
   `POLICY_TYPE_PROGRESSION` and `POLICY_TYPE_SCORING`
9. **Checks participants** — Ensures required participants
   are assigned
10. **Routes to the correct handler** based on state

### Decision Tree

```text
if (!activeDownstream)
  -> noDownstreamDependencies()

else if (matchUpWinner)
  -> winningSideWithDownstreamDependencies()

else if (directingMatchUpStatus || autoCalcDisabled)
  -> applyMatchUpValues()

else
  -> { error: NO_VALID_ACTIONS }
```

### Key Boolean Flags

- **`activeDownstream`**: Is there a completed/scored
  matchUp downstream of this one?
- **`matchUpWinner`**: Is a winningSide being set
  (non-TEAM) or projected (TEAM)?
- **`directingMatchUpStatus`**: Is the status one that
  "directs" (advances) participants? (COMPLETED, WALKOVER,
  DEFAULTED, BYE, DOUBLE_WALKOVER, DOUBLE_DEFAULT, RETIRED)
- **`propagateExitStatus`**: Should exit status be carried
  to consolation draw?

---

## Decision Routing: noDownstreamDependencies

**File:**
`src/mutate/drawDefinitions/matchUpGovernor/noDownstreamDependencies.ts`

Called when there are no active downstream matchUps. Routes
based on the current state:

```text
1. doubleExitCleanup    -> removeDoubleExit()
2. winningSide/propagate -> attemptToSetWinningSide()
3. scoreWithNoWinningSide -> removeDirectedParticipants()
4. statusNotToBePlayed   -> attemptToSetMatchUpStatus()
5. removeWinningSide     -> removeDirectedParticipants()
6. fallthrough           -> scoreModification()
```

---

## Status Setting: attemptToSetMatchUpStatus

**File:**
`src/mutate/drawDefinitions/matchUpGovernor/attemptToSetMatchUpStatus.ts`

Called when a non-TO_BE_PLAYED matchUpStatus is being set
without a winningSide. Routes:

```text
 1. unrecognized   -> error
 2. onlyModifyScore -> scoreModification()
 3. completedToDoubleExit
      -> removeDirectedParticipants()
      -> doubleExitAdvancement()
 4. existingWinningSide -> removeDirectedParticipants()
 5. nonDirecting   -> clearScore()
 6. BYE            -> attemptToSetMatchUpStatusBYE()
 7. isDoubleExit
      -> scoreModification()
      -> doubleExitAdvancement()
 8. teamRoundRobin -> scoreModification()
 9. propagateExit  -> scoreModification()
10. fallthrough    -> error
```

---

## Double Exit Advancement

**File:**
`src/mutate/drawDefinitions/positionGovernor/doubleExitAdvancement.ts`

When a DOUBLE_WALKOVER or DOUBLE_DEFAULT is set, this function
handles the cascading advancement.

### For the Loser MatchUp (consolation)

- If `doubleExitPropagateBye` policy is set, or targeting
  a fed-in participant, advance BYE
- If loser matchUp is already a DOUBLE_EXIT, skip (don't
  double-process)
- Otherwise, `conditionallyAdvanceDrawPosition()` sets
  WALKOVER on the loser matchUp

### For the Winner MatchUp (same structure, next round)

- `conditionallyAdvanceDrawPosition()` advances any
  existing draw position

### conditionallyAdvanceDrawPosition (internal)

This function handles the nuanced advancement logic:

1. **Determines matchUp status** (WALKOVER or DEFAULTED
   based on source)
2. **Checks paired previous matchUp** — Uses
   `getPairedPreviousMatchUpIsDoubleExit()` to check if the
   other feeder matchUp was also a double exit
3. **Sets status codes** — Records which side's status came
   from which source:

   ```typescript
   matchUpStatusCodes = [
     { matchUpStatus: 'WALKOVER', sideNumber: 1 },
     { matchUpStatus: 'WALKOVER', sideNumber: 2 },
   ];
   ```

4. **Handles existing exit** — If the target already has an
   exit status (from the paired matchUp), converts to
   DOUBLE_EXIT
5. **Advances remaining draw position** — If one draw
   position remains, advances it to the next round

### getPairedPreviousMatchUpIsDoubleExit

**File:**
`src/query/matchUps/getPairedPreviousMatchUpIsDoubleExit.ts`

Finds the "paired" matchUp in the previous round — the other
matchUp whose winner feeds into the same target matchUp:

```text
Example for drawSize 8:
  R1P1 and R1P2 are paired -> they feed into R2P1
  R1P3 and R1P4 are paired -> they feed into R2P2
```

**IMPORTANT:** This function searches by `roundPosition`
within the same `structureId`. This is critical for
understanding Issue #3848 — when looking up the paired match
in a consolation draw, the code may look in the wrong
structure if not properly scoped.

---

## Exit Status Propagation to Consolation

**File:**
`src/mutate/matchUps/drawPositions/progressExitStatus.ts`

When a participant loses via WALKOVER, DEFAULTED, or RETIRED,
their exit needs to be recorded in the consolation draw. This
function:

1. **Determines carry-over status** — RETIRED is not
   propagated (converted to WALKOVER); others carry through
2. **Gets updated in-context matchUps** — Refreshes state
   after mutations
3. **Finds the loser matchUp** — The consolation matchUp
   where the loser was placed
4. **Finds the loser's side** in the consolation matchUp
5. **Determines outcome based on participant count:**

   ```text
   if (participantsCount === 1 && no statusCodes):
     // First exit into this consolation matchUp
     // Opponent becomes winner, set exit status code
     winningSide = opposite of loser's side

   else if (loserMatchUp is not already an exit):
     // Two participants, not yet an exit
     // Opponent becomes winner with exit status code
     winningSide = opposite of loser's side

   else:
     // Already an exit -- both sides now have exits
     // This becomes a DOUBLE_WALKOVER
     loserMatchUpStatus = DOUBLE_WALKOVER
     winningSide = undefined
   ```

6. **Calls `setMatchUpState()` recursively** for the
   consolation matchUp

### Status Code Handling

Status codes track the origin of each side's status:

```typescript
// Object status codes (from double exits)
{
  matchUpStatus: 'WALKOVER',
  previousMatchUpStatus: 'DOUBLE_WALKOVER',
  sideNumber: 1,
}

// Simplified to string codes during propagation:
// 'WO' (OUTCOME_WALKOVER constant)
```

---

## Key Files Reference

<!-- markdownlint-disable MD013 MD060 -->

| File | Purpose |
| ---- | ------- |
| `src/mutate/matchUps/matchUpStatus/setMatchUpStatus.ts` | Public API entry point |
| `src/mutate/matchUps/matchUpStatus/setMatchUpState.ts` | Core state mutation logic |
| `src/mutate/drawDefinitions/matchUpGovernor/noDownstreamDependencies.ts` | No-downstream routing |
| `src/mutate/drawDefinitions/matchUpGovernor/attemptToSetMatchUpStatus.ts` | Status-setting routing |
| `src/mutate/drawDefinitions/matchUpGovernor/attemptToSetWinningSide.ts` | Winner-setting logic |
| `src/mutate/drawDefinitions/positionGovernor/doubleExitAdvancement.ts` | Double exit cascading |
| `src/mutate/drawDefinitions/matchUpGovernor/removeDoubleExit.ts` | Double exit removal |
| `src/mutate/matchUps/drawPositions/progressExitStatus.ts` | Consolation exit propagation |
| `src/mutate/matchUps/drawPositions/removeDirectedParticipants.ts` | Undo participant advancement |
| `src/mutate/matchUps/drawPositions/swapWinnerLoser.ts` | Winner/loser swap |
| `src/mutate/matchUps/score/modifyMatchUpScore.ts` | Score modification |
| `src/query/matchUps/getPairedPreviousMatchUpIsDoubleExit.ts` | Paired matchUp lookup |
| `src/query/matchUp/positionTargets.ts` | Winner/loser target resolution |
| `src/query/drawDefinition/isActiveDownstream.ts` | Downstream activity check |
| `src/validators/isExit.ts` | Exit status check |
| `src/functions/global/globalLog.ts` | Logging utility |
| `src/constants/matchUpStatusConstants.ts` | Status constants |

<!-- markdownlint-enable MD013 -->

---

## Constants Reference

### Match Up Statuses

```text
Directing (advance participants):
  COMPLETED, WALKOVER, DEFAULTED, BYE,
  DOUBLE_WALKOVER, DOUBLE_DEFAULT, RETIRED

Non-Directing (no advancement):
  TO_BE_PLAYED, CANCELLED, ABANDONED, INCOMPLETE,
  SUSPENDED, AWAITING_RESULT, IN_PROGRESS,
  DEAD_RUBBER, NOT_PLAYED

Double Exits:
  DOUBLE_WALKOVER -- Both participants walk over
  DOUBLE_DEFAULT  -- Both participants default
```

### Exit Status Conversions

```text
DOUBLE_WALKOVER -> produces WALKOVER in next round
DOUBLE_DEFAULT  -> produces DEFAULTED in next round
RETIRED         -> NOT propagated (converted to WALKOVER)
```

---

## Known Issues

### Issue #3847

**Two DOUBLE_WALKOVERs feeding same consolation match**

**Status:** Open
**Link:**
[#3847](https://github.com/CourtHive/competition-factory/issues/3847)

**Problem:** When two main draw matches that feed the same
consolation match are both set as DOUBLE_WALKOVER, the
consolation match incorrectly shows a WALKOVER with a winning
side instead of being a DOUBLE_WALKOVER.

**Root Cause:** In `doubleExitAdvancement.ts`, when the first
DOUBLE_WALKOVER is processed, it creates a WALKOVER in the
consolation matchUp. When the second DOUBLE_WALKOVER is
processed, it should detect that the consolation matchUp
already has a WALKOVER (from another double exit) and convert
it to a DOUBLE_WALKOVER. However, the
`loserMatchUpIsEmptyExit` check (line 31-33) only checks for
participant IDs but doesn't correctly account for the scenario
where the existing WALKOVER was produced by a double exit with
no actual participants.

**Reproduction:** See `doubleExitPropagationIssues.test.ts` —
"Issue #3847" tests

### Issue #3848

**DOUBLE_WALKOVER propagation in FMLC consolation rounds**

**Status:** Open
**Link:**
[#3848](https://github.com/CourtHive/competition-factory/issues/3848)

**Problem:** In FMLC, when consolation first-round matches are
set as DOUBLE_WALKOVER, the second-round consolation matches
(which have a fed participant from main R2 losers) show
inconsistent status codes. Specifically:

- Some R2 consolation matches have
  `previousMatchUpStatus: "TO_BE_PLAYED"` for one side
  instead of `previousMatchUpStatus: "DOUBLE_WALKOVER"`
- The code appears to look at the main draw match instead of
  the consolation first-round match when determining the
  paired previous match

**Root Cause:** In `getPairedPreviousMatchUpIsDoubleExit.ts`,
the `structureMatchUps` are filtered by the current
`structure.structureId`. For consolation R2 matches that are
fed from a different structure (main draw losers fed in), the
paired matchUp lookup may resolve to the wrong structure's
matchUps, causing it to look at the main draw match instead
of the consolation R1 match.

**Reproduction:** See `doubleExitPropagationIssues.test.ts` —
"Issue #3848" tests. Compare status codes for consolation
R2P1 vs R2P2: R2P1 shows `TO_BE_PLAYED` for one side while
R2P2 correctly shows `DOUBLE_WALKOVER` for both.

---

## Debugging with globalLog

The `globalLog` utility provides human-readable trace output
with color coding. To use it:

### Enabling

```typescript
import { setDevContext } from '@Global/state/globalState';

// Enable logging
setDevContext(true);

// ... run operations ...

// Print and purge
printGlobalLog(true);

// Or just purge
purgeGlobalLog();

// Don't forget to reset
setDevContext(false);
```

### Adding Log Entries

```typescript
import { pushGlobalLog } from '@Functions/global/globalLog';

pushGlobalLog({
  method: 'functionName',
  color: 'cyan',
  keyColors: {
    matchUpId: 'brightcyan',
    status: 'brightyellow',
  },
  newline: true,
  matchUpId: matchUp.matchUpId,
  status: matchUp.matchUpStatus,
});
```

### Available Colors

`cyan`, `magenta`, `brightyellow`, `brightgreen`,
`brightred`, `brightcyan`, `brightmagenta`, `bright`,
`brightwhite`

### Existing Log Points in Pipeline

<!-- markdownlint-disable MD013 MD060 -->

| Location | What It Logs |
| -------- | ----------- |
| `setMatchUpState.ts:438` | `activeDownstream`, `matchUpWinner`, `winningSide` |
| `progressExitStatus.ts:25` | `matchUpId`, `matchUpStatus` of exit being propagated |
| `removeDoubleExit.ts:39-44` | Double exit removal with colored keys |
| `doubleExitAdvancement.ts` | Source/loser/winner matchUp state, decision branches |
| `conditionallyAdvanceDrawPosition` | Paired matchUp lookup, status codes, exit detection |
| `getPairedPreviousMatchUpIsDoubleExit.ts` | Structure scope, round position pairing |
| `attemptToSetMatchUpStatus.ts` | Routing decisions, all boolean flags |

<!-- markdownlint-enable MD013 -->

### Recommended Logging for Issue Investigation

To trace the double exit propagation issues, add
`pushGlobalLog` calls to:

1. **`doubleExitAdvancement.ts`** — Log
   `loserMatchUpIsEmptyExit`, `loserMatchUpIsDoubleExit`,
   and which branch is taken
2. **`conditionallyAdvanceDrawPosition`** — Log
   `pairedPreviousMatchUpIsDoubleExit`, `existingExit`,
   `matchUpStatus` being set, `sourceSideNumber`
3. **`getPairedPreviousMatchUpIsDoubleExit.ts`** — Log the
   `structureId`, `sourceRoundPosition`,
   `pairedRoundPosition`, and what match it finds
4. **`progressExitStatus.ts`** — Log `participantsCount`,
   `statusCodes`, and the decision branch (single
   participant vs two participants vs existing exit)

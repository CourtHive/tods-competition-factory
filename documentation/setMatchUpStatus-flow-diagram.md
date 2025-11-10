# setMatchUpStatus Pipeline Flow Diagram

## Overview Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         setMatchUpStatus                            │
│                         (Entry Point)                               │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
        ┌───────────┐   ┌──────────┐   ┌──────────────┐
        │ Validate  │   │ Resolve  │   │ Transform    │
        │ Parameters│   │ Entities │   │ Score Object │
        └─────┬─────┘   └────┬─────┘   └──────┬───────┘
              └──────────────┼────────────────┘
                             ▼
                    ┌────────────────┐
                    │ Apply Format?  │
                    └────────┬───────┘
                             ▼
                    ┌────────────────┐
                    │ setMatchUpState│
                    │  (Core Engine) │
                    └────────┬───────┘
                             │
                ┌────────────┼────────────┐
                ▼                         ▼
        ┌───────────────┐        ┌────────────────┐
        │ Returns with  │        │ Returns with   │
        │ progressExit  │   OR   │ Success        │
        │ Status Flag   │        │                │
        └───────┬───────┘        └────────────────┘
                │
                ▼
        ┌───────────────────────┐
        │ While Loop (max 10)   │
        │ progressExitStatus()  │
        └───────────────────────┘
```

---

## setMatchUpState Detailed Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    setMatchUpState                             │
└────────────────────────────┬───────────────────────────────────┘
                             │
        ┌────────────────────┴────────────────────┐
        ▼                                          ▼
┌──────────────────┐                    ┌──────────────────┐
│ Phase 1:         │                    │ Phase 2:         │
│ Validation       │                    │ Context Building │
│                  │                    │                  │
│ • Parameters     │                    │ • Get matchUpsMap│
│ • Status valid?  │────────────────────▶ • Find matchUp   │
│ • Compatibility  │                    │ • Get targets    │
└──────────────────┘                    └────────┬─────────┘
                                                 │
                                                 ▼
                                    ┌──────────────────────┐
                                    │ Is TEAM matchUp?     │
                                    └──────┬─────────┬─────┘
                                           │ Yes     │ No
                      ┌────────────────────┘         └─────────────┐
                      ▼                                             ▼
        ┌──────────────────────────┐                    ┌──────────────────┐
        │ TEAM Logic:              │                    │ Regular Logic    │
        │ • Auto-calc check        │                    │ • Validate score │
        │ • Generate tie score     │                    │ • Check status   │
        │ • Check downstream       │                    └────────┬─────────┘
        │ • Ensure lineups         │                             │
        └──────────┬───────────────┘                             │
                   │                                             │
                   └──────────────────┬──────────────────────────┘
                                      ▼
                            ┌──────────────────┐
                            │ Phase 3:         │
                            │ Participant      │
                            │ Validation       │
                            └────────┬─────────┘
                                     ▼
                            ┌──────────────────┐
                            │ Phase 4:         │
                            │ Qualifier Logic   │
                            └────────┬─────────┘
                                     ▼
                            ┌──────────────────┐
                            │ Phase 5:         │
                            │ Collection       │
                            │ MatchUp Handling │
                            └────────┬─────────┘
                                     ▼
                            ┌──────────────────┐
                            │ Phase 6:         │
                            │ Schedule Update  │
                            └────────┬─────────┘
                                     ▼
                    ┌────────────────────────────┐
                    │ Phase 7: Winner/Loser Swap?│
                    └──────┬─────────────────┬───┘
                           │ Yes             │ No
                           ▼                 ▼
                ┌──────────────────┐  ┌──────────────────┐
                │ swapWinnerLoser()│  │ Phase 8:         │
                │ (Early Exit)     │  │ PATH SELECTION   │
                └──────────────────┘  └────────┬─────────┘
                                               │
                        ┌──────────────────────┼──────────────────────┐
                        ▼                      ▼                      ▼
            ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
            │ PATH A           │  │ PATH B           │  │ PATH C           │
            │ noDownstream     │  │ withDownstream   │  │ applyValues      │
            │ Dependencies     │  │ Dependencies     │  │                  │
            └──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## Path Selection Decision Tree

```
                          ┌─────────────────────────┐
                          │  Which path to take?    │
                          └────────────┬────────────┘
                                       │
           ┌───────────────────────────┼───────────────────────────┐
           ▼                           ▼                           ▼
    ┌──────────────┐          ┌───────────────┐          ┌───────────────┐
    │activeDown-   │          │matchUpWinner? │          │directing      │
    │stream?       │          │               │          │MatchUpStatus? │
    └──────┬───────┘          └───────┬───────┘          └───────┬───────┘
           │                          │                           │
           │ NO                       │ YES                       │ YES
           ▼                          ▼                           ▼
    ┌──────────────┐          ┌───────────────┐          ┌───────────────┐
    │  PATH A      │          │   PATH B      │          │   PATH C      │
    │              │          │               │          │               │
    │ noDownstream │          │withDownstream │          │ applyValues   │
    │ Dependencies │          │Dependencies   │          │               │
    └──────────────┘          └───────────────┘          └───────────────┘
           │                          │                           │
           ▼                          ▼                           ▼
    ┌──────────────┐          ┌───────────────┐          ┌───────────────┐
    │Complex branch│          │Simple check:  │          │Direct apply:  │
    │logic with 6  │          │winningSide    │          │modifyScore    │
    │sub-paths     │          │changed?       │          │+ updateTie    │
    └──────────────┘          └───────────────┘          └───────────────┘
```

---

## Path A: noDownstreamDependencies Sub-Paths

```
┌───────────────────────────────────────────────────┐
│         noDownstreamDependencies                  │
└─────────────────────┬─────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
    ┌────────┐  ┌─────────┐  ┌──────────┐
    │Double  │  │Analyze  │  │Calculate │
    │Exit    │  │Situation│  │Flags     │
    │Cleanup?│  │         │  │          │
    └───┬────┘  └─────────┘  └──────────┘
        │
        ▼
    ┌────────────────────────────────────────────────┐
    │         Dispatch (OR chain with 6 paths)       │
    └─────────┬──────────────────────────────────────┘
              │
    ┌─────────┼─────────────────────────────────────┐
    │         │                                     │
    ▼         ▼                                     ▼
┌───────┐ ┌──────────┐                          ┌────────┐
│Sub A1 │ │ Sub A2   │  ... (6 total paths)     │Sub A6  │
│       │ │          │                          │        │
│remove │ │attempt   │                          │score   │
│Winner │ │SetWinner │                          │Modify  │
│       │ │          │                          │        │
└───────┘ └──────────┘                          └────────┘
    │         │                                      │
    └─────────┼──────────────────────────────────────┘
              ▼
        ┌──────────┐
        │  Result  │
        └──────────┘

Sub-Paths Detail:

A1: removeWinningSide && winningSide && isCollectionMatchUp
    └─▶ scoreModification()

A2: winningSide || triggerDualWinningSide
    └─▶ attemptToSetWinningSide()
        ├─▶ removeDirectedParticipants() [if winningSide changed]
        ├─▶ directParticipants()
        │   ├─▶ directWinner()
        │   └─▶ directLoser()
        ├─▶ replaceQualifier() [if policy enabled]
        └─▶ placeQualifier() [if policy enabled]

A3: scoreWithNoWinningSide
    └─▶ removeDirected()
        ├─▶ checkConnectedStructures()
        ├─▶ removeDirectedParticipants()
        └─▶ removeQualifier() [if policy enabled]

A4: statusNotToBePlayed
    └─▶ attemptToSetMatchUpStatus()

A5: removeWinningSide
    └─▶ removeDirected()

A6: matchUp exists (fallback)
    └─▶ scoreModification()
```

---

## Participant Direction Flow

```
┌──────────────────────────────────────────────────┐
│           directParticipants                     │
└─────────────────┬────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│ directWinner  │   │ directLoser   │
│               │   │               │
│ • Find winner │   │ • Find loser  │
│   position    │   │   position    │
│ • Get winner  │   │ • Get loser   │
│   participant │   │   participant │
│ • Assign to   │   │ • Check for   │
│   winner      │   │   exit status │
│   matchUp     │   │ • Assign to   │
│               │   │   loser       │
│               │   │   matchUp     │
└───────┬───────┘   └───────┬───────┘
        │                   │
        │                   ▼
        │           ┌───────────────────┐
        │           │ Has exit status?  │
        │           │ (WO/DEFAULT)      │
        │           └─────────┬─────────┘
        │                     │ YES
        │                     ▼
        │           ┌───────────────────┐
        │           │ Set context flag: │
        │           │ progressExitStatus│
        │           └─────────┬─────────┘
        │                     │
        └─────────────────────┼──────────────────┐
                              ▼                  │
                    ┌───────────────────┐        │
                    │ Return to         │        │
                    │ setMatchUpStatus  │        │
                    └─────────┬─────────┘        │
                              │                  │
                              ▼                  │
                    ┌───────────────────┐        │
                    │ While loop?       │        │
                    │ (max 10 iters)    │        │
                    └─────────┬─────────┘        │
                              │ YES              │
                              ▼                  │
                    ┌───────────────────┐        │
                    │progressExitStatus │        │
                    │                   │        │
                    │ • Find loser      │◀───────┘
                    │   matchUp         │
                    │ • Calculate new   │
                    │   status/winner   │
                    │ • Recursive call  │
                    │   setMatchUpState │
                    └───────────────────┘
```

---

## Exit Status Propagation

```
Main Draw                  Consolation Draw
──────────                 ────────────────

MatchUp A                  MatchUp E (loser bracket)
  Side 1: Player 1           Side 1: [empty]
  Side 2: Player 2 WO ───┐   Side 2: [empty]
  Status: COMPLETED      │
  Winner: Side 1         │
  StatusCodes: ['WO']    │
                         │
                         └─▶ Player 2 directed here
                             with exit status WO

Step 1: directLoser() adds Player 2 to MatchUp E
        Context flag: progressExitStatus = true

Step 2: setMatchUpStatus while loop catches flag

Step 3: progressExitStatus() called:
        ┌────────────────────────────────┐
        │ Analyze MatchUp E:             │
        │ • 1 participant (Player 2)     │
        │ • Exit status: WO              │
        │ • No opponent yet              │
        │                                │
        │ Decision:                      │
        │ • Set MatchUp E status: WO     │
        │ • WinningSide: 1 (empty side)  │
        │ • StatusCodes: ['WO'] on side 2│
        └────────────────────────────────┘

Step 4: Recursive setMatchUpState() for MatchUp E

Step 5: directParticipants() for MatchUp E
        Player 2 directed to loser of E

Step 6: If loser of E exists, repeat (up to 10 times)
```

---

## TEAM Match Score Calculation

```
TEAM Dual Match
├─ Individual Match 1: COMPLETED, Side 1 wins
├─ Individual Match 2: COMPLETED, Side 2 wins
├─ Individual Match 3: COMPLETED, Side 1 wins
└─ Individual Match 4: TO_BE_PLAYED

Auto-Calculation Flow:

1. Collection match score updated
   └─▶ generateTieMatchUpScore()
       ├─ Count wins per side
       │  Side 1: 2 wins
       │  Side 2: 1 win
       ├─ Check for winner
       │  (based on tieFormat.winCriteria)
       └─ Generate score string
          "2-1" or "2-1-0" depending on format

2. If projectedWinningSide changes:
   ├─ Check activeDownstream
   │  └─ If TRUE: BLOCK (CANNOT_CHANGE_WINNING_SIDE)
   │  └─ If FALSE: Allow
   │
   └─ Update TEAM dual match:
      ├─ winningSide = projectedWinningSide
      └─ score = calculated score

3. If collection match updated:
   └─▶ updateTieMatchUpScore()
       Recalculates after individual match completion
```

---

## Common Scenarios

### Scenario 1: Simple Win

```
Input: matchUpId, outcome: { winningSide: 1, score: {...} }

Flow:
setMatchUpStatus
  └─▶ setMatchUpState
      ├─▶ Validation passes
      ├─▶ Not TEAM, not collection
      ├─▶ activeDownstream = false
      └─▶ PATH A: noDownstreamDependencies
          └─▶ Sub A2: attemptToSetWinningSide
              ├─▶ attemptToModifyScore
              │   └─▶ modifyMatchUpScore (sets score + status)
              └─▶ directParticipants
                  ├─▶ directWinner (places winner in next round)
                  └─▶ directLoser (places loser in consolation)

Result: ✓ Match completed, participants directed
```

### Scenario 2: TEAM Match with Auto-Calc

```
Input: matchUpId (collection match), outcome: { winningSide: 1, score: {...} }

Flow:
setMatchUpStatus
  └─▶ setMatchUpState
      ├─▶ Validation passes
      ├─▶ matchUpTieId exists (collection match)
      ├─▶ getProjectedDualWinningSide
      │   Calculates dual match winner based on collection results
      └─▶ PATH C: applyMatchUpValues
          ├─▶ modifyMatchUpScore (updates collection match)
          └─▶ updateTieMatchUpScore (recalculates dual match)
              └─▶ generateTieMatchUpScore
                  Aggregates wins, determines dual match winner

Result: ✓ Collection match scored, dual match auto-updated
```

### Scenario 3: Walkover with Propagation

```
Input: matchUpId, outcome: { matchUpStatus: WALKOVER, winningSide: 1 }

Flow:
setMatchUpStatus
  └─▶ setMatchUpState
      ├─▶ Score cleared (WALKOVER clears score)
      ├─▶ activeDownstream = false
      └─▶ PATH A: noDownstreamDependencies
          └─▶ Sub A2: attemptToSetWinningSide
              ├─▶ modifyMatchUpScore (sets WALKOVER status)
              └─▶ directParticipants
                  ├─▶ directWinner (advances winner)
                  └─▶ directLoser (to consolation with exit status)
                      └─▶ Sets progressExitStatus flag

setMatchUpStatus while loop:
  └─▶ progressExitStatus
      ├─▶ Find loser matchUp in consolation
      ├─▶ Determine opponent status
      └─▶ Recursive setMatchUpState for loser matchUp
          └─▶ May trigger additional progressExitStatus

Result: ✓ WALKOVER set, exit status propagated through consolation
```

### Scenario 4: Attempted WinningSide Change (Blocked)

```
Input: matchUpId (already has winningSide + downstream),
       outcome: { winningSide: 2 } (different from existing)

Flow:
setMatchUpStatus
  └─▶ setMatchUpState
      ├─▶ Validation passes
      ├─▶ activeDownstream = true (next round has participants)
      ├─▶ matchUpWinner = 2 (attempting to change)
      └─▶ PATH B: winningSideWithDownstreamDependencies
          └─▶ Check: winningSide !== matchUp.winningSide
              └─▶ Return error: CANNOT_CHANGE_WINNING_SIDE

Result: ✗ Change blocked due to downstream dependencies
```

---

## Complexity Hotspots

### 🔥 Highest Complexity

**Function:** `setMatchUpState`

- Lines of Code: ~500
- Cyclomatic Complexity: 25+
- Nesting Depth: 5 levels
- Parameters: 15+

**Why Complex:**

- Handles all match types (SINGLES, DOUBLES, TEAM, collection)
- Validates 6+ different conditions
- Makes 3-way path selection
- Special cases for qualifiers, TEAM, collection
- Inline helper functions

### 🔥 Complex Dispatch

**Function:** `noDownstreamDependencies`

- Lines of Code: ~150
- Cyclomatic Complexity: 8
- Sub-paths: 6

**Why Complex:**

- OR chain with 6 execution paths
- Each path has different side effects
- Nested conditionals within paths
- Multiple cleanup/rollback scenarios

### 🔥 Recursive Complexity

**Function:** `progressExitStatus` + while loop

- Max Iterations: 10 (failsafe)
- Recursive: calls setMatchUpState

**Why Complex:**

- Recursive + iterative combination
- State changes during iteration
- Multiple exit conditions
- Failsafe limit (what if 10 isn't enough?)

---

## Quick Reference: When Does Each Path Execute?

| Path                             | Trigger Conditions                  | Purpose                                         |
| -------------------------------- | ----------------------------------- | ----------------------------------------------- | ---------------- | ---------------------------- |
| **A: noDownstreamDependencies**  | !activeDownstream                   | Modify match freely without downstream concerns |
| **B: winningSideWithDownstream** | matchUpWinner && activeDownstream   | Verify/block winningSide changes                |
| **C: applyMatchUpValues**        | directingMatchUpStatus \\           | \\                                              | autoCalcDisabled | Direct application of values |
| **Swap Winner/Loser**            | allowChangePropagation && validSwap | Change winner without removing                  |

| Sub-Path | Trigger Conditions                             | Purpose                       |
| -------- | ---------------------------------------------- | ----------------------------- | ----------- | ------------------------------------- |
| **A1**   | removeWinningSide && winningSide && collection | Remove collection winningSide |
| **A2**   | winningSide \\                                 | \\                            | triggerDual | Set winningSide + direct participants |
| **A3**   | scoreWithNoWinningSide                         | Apply score without winner    |
| **A4**   | statusNotToBePlayed                            | Set non-default status        |
| **A5**   | removeWinningSide                              | Clear winningSide             |
| **A6**   | matchUp exists                                 | Fallback score modification   |

---

## Legend

```
┌────────┐
│ Action │  = A process or operation
└────────┘

┌────────┐
│Question│  = Decision point
└───┬────┘
    ▼

─────▶     = Flow direction

├─▶        = Branch

...        = Omitted details

🔥         = Complexity hotspot
```

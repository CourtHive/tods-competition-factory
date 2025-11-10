# setMatchUpStatus Pipeline Documentation

Complete documentation suite for the `setMatchUpStatus` pipeline in the CourtHive factory project.

## Documents in This Suite

### 1. [Pipeline Analysis](./setMatchUpStatus-pipeline-analysis.md)
**Comprehensive complexity analysis and architectural recommendations**

**Contents:**
- Executive summary of complexity
- Detailed pipeline architecture breakdown
- Phase-by-phase analysis of `setMatchUpState`
- Execution path documentation (A, B, C, D)
- Code smell identification
- **10 detailed recommendations for improvement**
- Incremental refactoring strategy
- Testing strategies

**Best for:** Understanding the current architecture, planning refactoring, identifying complexity hotspots

**Time to read:** 30-45 minutes

---

### 2. [Flow Diagrams](./setMatchUpStatus-flow-diagram.md)
**Visual representations of pipeline execution**

**Contents:**
- Overview flow diagram
- Detailed setMatchUpState flow
- Path selection decision tree
- Path A sub-paths breakdown
- Participant direction flow
- Exit status propagation visualization
- TEAM match score calculation flow
- Common scenario walkthroughs
- Complexity hotspot indicators

**Best for:** Visual learners, understanding execution flow, debugging specific paths

**Time to read:** 20-30 minutes

---

### 3. [Developer's Guide](./setMatchUpStatus-developer-guide.md)
**Practical guide for extending functionality**

**Contents:**
- Quick reference: "I want to..."
- Common extension patterns
- File locations for specific changes
- Code examples and templates
- Testing checklist
- Common pitfalls and solutions
- Error message explanations
- Key variable reference

**Best for:** Making changes, adding features, debugging issues

**Time to read:** 15-20 minutes (reference as needed)

---

### 4. [Original Pseudocode](../src/mutate/matchUps/matchUpStatus/setMatchUpStatus.md)
**Original documentation (existing)**

**Contents:**
- High-level pseudocode
- Double walkover handling
- Basic flow description

**Best for:** Quick overview, understanding original design intent

---

## Quick Navigation

### By Task

| I want to... | Read | Section |
|--------------|------|---------|
| Understand the overall architecture | Pipeline Analysis | Executive Summary, Pipeline Architecture |
| See visual flow of execution | Flow Diagrams | All sections |
| Add a new matchUpStatus | Developer's Guide | "Add a new matchUpStatus value" |
| Debug a specific scenario | Developer's Guide | "Debug a specific scenario" |
| Add TEAM match logic | Developer's Guide | "Add special handling for TEAM/collection" |
| Understand why a change is blocked | Pipeline Analysis | Path B, Developer's Guide |
| Plan a refactoring | Pipeline Analysis | Recommendations section |
| Add validation | Developer's Guide | "Add validation for a specific status" |
| Understand exit status propagation | Flow Diagrams | "Exit Status Propagation" |
| Add policy-based behavior | Developer's Guide | "Add policy-based behavior" |

---

### By Role

**New Developer:**
1. Read Pipeline Analysis (Executive Summary + Overview)
2. Review Flow Diagrams (Overview Flow)
3. Keep Developer's Guide open for reference

**Extending Functionality:**
1. Check Developer's Guide for your specific task
2. Review relevant Flow Diagram section
3. Refer to Pipeline Analysis for context if needed

**Debugging Issues:**
1. Start with Developer's Guide (Debug section + Error messages)
2. Use Flow Diagrams to trace execution
3. Check Pipeline Analysis for complexity hotspots

**Planning Refactoring:**
1. Read full Pipeline Analysis
2. Review all Flow Diagrams
3. Consider recommendations and strategies

---

## Key Concepts

### Execution Paths

The pipeline has 4 main execution paths:

| Path | Trigger | Purpose | Complexity |
|------|---------|---------|------------|
| **A** | No downstream dependencies | Modify without propagation | 🔥🔥🔥 High (6 sub-paths) |
| **B** | Winner with downstream | Verify/block changes | 🔥 Low |
| **C** | Directing status | Direct application | 🔥🔥 Medium |
| **D** | None apply | Error state | - |

### Match Types

| Type | Characteristics | Special Handling |
|------|----------------|------------------|
| **SINGLES** | Individual participant | Standard flow |
| **DOUBLES** | Pair participants | Similar to singles |
| **TEAM** | Dual match with collections | Auto-calc, lineups, blocking rules |
| **Collection** | Individual/doubles within TEAM | Updates dual match |

### Key Decision Points

1. **activeDownstream** - Determines if changes propagate
2. **isTeam** - Enables TEAM-specific logic
3. **matchUpTieId** - Identifies collection matches
4. **directingMatchUpStatus** - Status that determines winner
5. **dualWinningSideChange** - TEAM winner changed

---

## File Map

### Core Files

```
src/mutate/matchUps/matchUpStatus/
├── setMatchUpStatus.ts        # Entry point (170 lines)
└── setMatchUpState.ts         # Core engine (500+ lines) 🔥

src/mutate/drawDefinitions/matchUpGovernor/
├── noDownstreamDependencies.ts  # Path A (150 lines) 🔥
├── attemptToSetWinningSide.ts   # Main winner logic (70 lines)
└── attemptToSetMatchUpStatus.ts # Status-only updates

src/mutate/matchUps/drawPositions/
├── directParticipants.ts      # Orchestrates direction (100 lines)
├── directWinner.ts            # Winner placement (150 lines)
├── directLoser.ts             # Loser + exit status (150 lines)
├── progressExitStatus.ts      # Exit propagation (110 lines)
└── swapWinnerLoser.ts         # Change propagation (100 lines)

src/mutate/matchUps/score/
├── modifyMatchUpScore.ts      # Score updates
└── updateTieMatchUpScore.ts   # TEAM recalculation

src/assemblies/generators/tieMatchUpScore/
└── generateTieMatchUpScore.ts # TEAM score calculation

🔥 = Complexity hotspot
```

### Supporting Files

```
src/query/
├── matchUp/
│   ├── positionTargets.ts      # Where winner/loser go
│   ├── checkStatusType.ts      # Directing vs non-directing
│   └── isActiveDownstream.ts   # Downstream check
└── drawDefinition/
    └── getStageParticipantsCount.ts

src/constants/
└── matchUpStatusConstants.ts   # All status definitions
```

---

## Complexity Metrics

### Overall Pipeline
- **Total Lines:** ~2,500
- **Files Involved:** 20+
- **Maximum Nesting:** 5 levels
- **Cyclomatic Complexity:** 50+ (combined)

### Hottest Spots
1. **setMatchUpState** - 25+ branches, 500 lines
2. **noDownstreamDependencies** - 8 branches with 6 sub-paths
3. **directParticipants** - 10+ branches with side effects

---

## Common Scenarios

### Scenario 1: Simple Win
```
Player A defeats Player B
├─ Set score and winningSide
├─ Direct Player A to winner bracket
├─ Direct Player B to consolation bracket
└─ Update downstream matchUp displays
```
**Path:** A → Sub A2 → attemptToSetWinningSide

### Scenario 2: TEAM Match
```
Team 1 wins Singles 1 and Doubles 1
├─ Update individual match scores
├─ Auto-calculate TEAM dual match score
├─ Determine TEAM dual match winner
├─ Check for downstream blocking
└─ Update TEAM dual match
```
**Path:** C → applyMatchUpValues → updateTieMatchUpScore

### Scenario 3: Walkover Propagation
```
Player A defeats Player B by WALKOVER
├─ Set WALKOVER status, clear score
├─ Direct Player A to winner bracket
├─ Direct Player B to consolation with exit status
├─ Trigger progressExitStatus
└─ Propagate WALKOVER through consolation (up to 10 levels)
```
**Path:** A → Sub A2 → directLoser → while loop → progressExitStatus

### Scenario 4: Blocked Change
```
Attempt to change winner of completed match
├─ Check downstream matchUps
├─ Find participants in next round
├─ Block winningSide change
└─ Return CANNOT_CHANGE_WINNING_SIDE error
```
**Path:** B → winningSideWithDownstreamDependencies → Error

---

## Testing Strategy

### What to Test

**Unit Tests:**
- Path selection logic
- Status validation
- Score validation
- TEAM score calculation
- Exit status propagation

**Integration Tests:**
- Complete match scenarios
- Multi-round propagation
- TEAM match updates
- Qualifier advancement
- Consolation bracket flow

**Edge Cases:**
- First round match
- Final round match
- Bye scenarios
- Double exit (DOUBLE_WALKOVER)
- Removal/reversal of results
- 10+ level exit propagation

---

## Known Limitations

### 1. Exit Status Propagation Depth
**Limit:** 10 iterations (failsafe)
**Impact:** Deep consolation brackets may not fully propagate
**Location:** `setMatchUpStatus.ts` lines 139-147

### 2. Recursive State Changes
**Issue:** progressExitStatus recursively calls setMatchUpState
**Impact:** Complex to trace, potential for unexpected behavior
**Mitigation:** Failsafe limit, but architectural improvement needed

### 3. Path Selection Complexity
**Issue:** OR chain with side effects makes reasoning difficult
**Impact:** Hard to predict which path executes
**Recommendation:** See Pipeline Analysis recommendations

### 4. Parameter Proliferation
**Issue:** 15+ parameters passed through call chain
**Impact:** Difficult to track what data is available where
**Recommendation:** Context object pattern (see recommendations)

### 5. TEAM Match Auto-Calc
**Issue:** Complex interaction between manual and auto-calculation
**Impact:** Blocking logic is intricate
**Workaround:** `disableAutoCalc` / `enableAutoCalc` flags

---

## Recommendations Priority

From Pipeline Analysis document, prioritized:

### Quick Wins (Days)
1. **Add execution path logging** - Immediate visibility
2. **Extract constants** - Better error messages
3. **Add decision documentation** - Inline comments
4. **Validation summary** - Better debugging

### Short Term (Weeks)
5. **Context object pattern** - Reduce parameter passing
6. **Strategy pattern** - Clarify path selection
7. **State machine** - Explicit transitions

### Medium Term (Months)
8. **Pipeline stages** - Separate concerns
9. **Event sourcing** - Replace recursion
10. **Visitor pattern** - Type-specific logic

---

## Contribution Guidelines

### Before Making Changes

1. **Read relevant documentation**
   - Developer's Guide for your specific change
   - Flow Diagrams for execution context
   - Pipeline Analysis for architectural understanding

2. **Understand current behavior**
   - Add logging to trace execution
   - Run existing tests
   - Document current path

3. **Plan your change**
   - Identify affected files
   - Consider downstream impacts
   - Plan test cases

### Making Changes

1. **Add validation** if introducing new states
2. **Update documentation** if changing behavior
3. **Add tests** for new scenarios
4. **Consider TEAM matches** - do they need special handling?
5. **Check exit status** - does it propagate correctly?

### After Changes

1. **Run full test suite**
2. **Test edge cases** from checklist
3. **Update documentation** if behavior changed
4. **Add examples** to Developer's Guide if helpful
5. **Update flow diagrams** if paths changed

---

## Additional Resources

### Related Systems
- **Tournament Engine** - Higher-level API
- **Match Up Actions** - Available actions for matchUp
- **Draw Definitions** - Structure definitions
- **Position Assignments** - Participant placement

### Policy System
- **POLICY_TYPE_SCORING** - Scoring rules
- **POLICY_TYPE_PROGRESSION** - Advancement rules
- **Applied Policies** - How policies affect behavior

### Testing Utilities
- **mocksEngine** - Generate test tournaments
- **tournamentEngine** - Test API
- **matchUpsMap** - Quick matchUp lookup

---

## Glossary

| Term | Definition |
|------|------------|
| **activeDownstream** | Downstream matches have assigned participants |
| **Collection Match** | Individual or doubles match within a TEAM event |
| **Directing Status** | Status that determines a winner (COMPLETED, WALKOVER, etc.) |
| **Dual Match** | TEAM match that contains collection matches |
| **Exit Status** | Status that propagates (WALKOVER, DEFAULTED, RETIRED) |
| **inContext** | MatchUp with full sides and participant data |
| **matchUpsMap** | Optimized map for quick matchUp lookup |
| **Non-Directing Status** | Status without winner (TO_BE_PLAYED, CANCELLED, etc.) |
| **Position Targets** | Where winner and loser are directed |
| **progressExitStatus** | Propagate exit status through consolation |
| **Qualifier** | Participant from qualifying rounds |

---

## Questions?

**Architecture Questions:**
- Review Pipeline Analysis recommendations
- Check Flow Diagrams for execution paths

**Implementation Questions:**
- Check Developer's Guide for specific tasks
- Search for similar existing code
- Add logging and trace execution

**Bug/Issue Questions:**
- Review error messages in Developer's Guide
- Check complexity hotspots in Pipeline Analysis
- Trace execution with Flow Diagrams

---

## Document Maintenance

These documents should be updated when:

1. **Major refactoring** - Update all documents
2. **New execution paths** - Update Flow Diagrams
3. **New features** - Update Developer's Guide
4. **API changes** - Update all references
5. **New complexity** - Update Pipeline Analysis

**Last Updated:** 2025-01-10
**Coverage:** factory v2.2.31
**Status:** Complete documentation of current implementation

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-10 | Initial comprehensive documentation suite |


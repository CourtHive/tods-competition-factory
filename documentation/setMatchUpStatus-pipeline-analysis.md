# setMatchUpStatus Pipeline: Complexity Analysis & Recommendations

## Executive Summary

The `setMatchUpStatus` pipeline is a complex, multi-layered state management system that handles:
- Setting match outcomes (status, scores, winners)
- Propagating changes through draw structures
- Managing TEAM/collection match ups with nested individual/doubles matches
- Handling special cases (byes, walkovers, double exits, qualifiers)
- Validating state transitions
- Managing downstream dependencies

**Estimated Complexity:** ~2,500 lines of interdependent code across 20+ files

**Current Challenges:**
1. Deep branching logic with 5+ levels of nested conditionals
2. Implicit state dependencies across multiple function boundaries
3. Side effects buried in conditional branches
4. Mixed concerns (validation, transformation, propagation)
5. Limited visibility into execution paths

---

## Pipeline Architecture

### Entry Point: `setMatchUpStatus`

**Location:** `src/mutate/matchUps/matchUpStatus/setMatchUpStatus.ts`

**Responsibilities:**
1. Parameter validation and resolution
2. Tournament record resolution
3. Event/draw lookup
4. Policy retrieval
5. Match format application
6. Score object transformation
7. Delegates to `setMatchUpState`
8. Iterative exit status progression (while loop with failsafe)

**Key Branching Points:**
```typescript
// Branch 1: Format setting
if (matchUpFormat) → setMatchUpMatchUpFormat()

// Branch 2: Score transformation
if (outcome?.score?.sets && !outcome.score.scoreStringSide1) → matchUpScore()

// Branch 3: Main state modification
setMatchUpState() → returns result with potential progressExitStatus flag

// Branch 4: Iterative progression (failsafe limited to 10 iterations)
if (result.context?.progressExitStatus) → while loop → progressExitStatus()
```

---

## Core State Engine: `setMatchUpState`

**Location:** `src/mutate/matchUps/matchUpStatus/setMatchUpState.ts` (~500 lines)

**Complexity Score:** ⚠️ HIGH - Multiple validation layers, branching, and side effects

### Phase 1: Validation & Setup (Lines 1-170)

```typescript
// Validation Chain:
1. Missing parameters check
2. Status/winningSide compatibility check
3. Status validity check
4. Get matchUpsMap and inContextDrawMatchUps
5. Find target matchUp
6. BYE + winningSide conflict check
7. Position assignments check
8. Get position targets (handles TEAM vs individual)
```

**Critical Decision:** Lines 130-180
- Determines if matchUp is TEAM type
- If TEAM:
  - Checks for `disableAutoCalc` extension
  - If enabling auto-calc: generates tie score and checks for downstream impacts
  - Ensures side line-ups exist
  - **BLOCKS removal if activeDownstream && dualWinningSideChange**

### Phase 2: TEAM Match Validation (Lines 181-190)

```typescript
// Special restriction for TEAM matchUps
if (isTeam && matchUpStatus in [AWAITING_RESULT]) → Error: "Not supported for matchUpType: TEAM"
```

### Phase 3: Score Validation (Lines 192-200)

```typescript
if (score && !isTeam && !disableScoreValidation) → validateScore()
```

### Phase 4: Participant Validation (Lines 210-220)

```typescript
checkParticipants({
  assignedDrawPositions,
  inContextMatchUp,
  appliedPolicies,
  drawDefinition,
  matchUpStatus,
  structure,
  matchUp,
})
```

**Sub-branches:**
- Policy check: `requireParticipantsForScoring`
- Participant count validation
- Special handling for adHoc TEAM matchUps (allows 1 participant)

### Phase 5: Qualifier Logic (Lines 222-240)

```typescript
const qualifyingMatch = inContextMatchUp?.stage === QUALIFYING && inContextMatchUp.finishingRound === 1
const qualifierAdvancing = qualifyingMatch && winningSide
const removingQualifier = qualifyingMatch && matchUp.winningSide && !winningSide && ...
const qualifierChanging = qualifierAdvancing && winningSide !== matchUp.winningSide && matchUp.winningSide
```

### Phase 6: Collection MatchUp Handling (Lines 242-268)

**For TEAM dual matches with nested individual/doubles matches:**

```typescript
if (matchUpTieId) {
  1. Find dualMatchUp
  2. Resolve tieFormat
  3. Calculate projectedWinningSide
  4. Detect dualWinningSideChange
  5. Check autoCalcDisabled status
  6. Assign parameters for downstream logic
}
```

### Phase 7: Status Direction Check (Lines 270-295)

**Critical branching based on matchUpStatus characteristics:**

```typescript
// Branch A: Active downstream + no winningSide + non-directing status
if (activeDownstream && !winningSide && isNonDirectingMatchUpStatus()) → Error

// Branch B: WinningSide unchanged + non-directing status
if (winningSide === matchUp.winningSide && !directingMatchUpStatus) → Error

// Branch C: Schedule update
if (schedule) → addMatchUpScheduleItems()
```

### Phase 8: Winner/Loser Swap (Lines 297-304)

```typescript
// Change propagation path
if (allowChangePropagation && validWinningSideSwap && matchUp.roundPosition) {
  return swapWinnerLoser(params)  // Early exit
}
```

### Phase 9: Final Dispatch (Lines 306-320)

**The Decision Tree:**

```typescript
const result =
  (!activeDownstream && noDownstreamDependencies(params)) ||           // PATH A
  (matchUpWinner && winningSideWithDownstreamDependencies(params)) ||  // PATH B
  ((directingMatchUpStatus || autoCalcDisabled) && applyMatchUpValues(params)) || // PATH C
  { error: NO_VALID_ACTIONS };  // PATH D
```

**PATH SELECTION LOGIC:**

| Condition | Path | Function | Purpose |
|-----------|------|----------|---------|
| No downstream impact | A | `noDownstreamDependencies` | Modify without propagation |
| Has winner + downstream exists | B | `winningSideWithDownstreamDependencies` | Verify or propagate |
| Directing status or manual | C | `applyMatchUpValues` | Direct application |
| None of above | D | Error | Invalid state |

---

## Path A: `noDownstreamDependencies`

**Location:** `src/mutate/drawDefinitions/matchUpGovernor/noDownstreamDependencies.ts`

**Purpose:** Handle state changes when no downstream matches depend on the outcome

### Execution Flow:

```typescript
1. Double Exit Cleanup
   if (doubleExitCleanup) → removeDoubleExit()

2. Analyze Situation
   - scoreWithNoWinningSide
   - timedTieMatchUp check
   - removeScore determination
   - removeWinningSide determination

3. Conditional Dispatch (nested OR chain):
   
   A. WinningSide removal + collection matchUp → scoreModification()
   
   B. (winningSide || triggerDualWinningSide) → attemptToSetWinningSide()
   
   C. scoreWithNoWinningSide → removeDirected()
      - Checks connected structures (WIN_RATIO)
      - removeDirectedParticipants()
      - If removing qualifier + autoRemoveQualifiers policy → removeQualifier()
   
   D. statusNotToBePlayed → attemptToSetMatchUpStatus()
   
   E. removeWinningSide → removeDirected()
   
   F. fallback → scoreModification()
```

**Key Complexity:** Nested OR chain with 6 branches, each with different execution paths

---

## Path B: `winningSideWithDownstreamDependencies`

**Inline Function in `setMatchUpState.ts`**

```typescript
function winningSideWithDownstreamDependencies(params) {
  const { matchUp, winningSide, matchUpTieId, dualWinningSideChange } = params;
  
  // No change OR collection without dual change → Apply
  if (winningSide === matchUp.winningSide || (matchUpTieId && !dualWinningSideChange)) {
    return applyMatchUpValues(params);
  } else {
    // Attempting to change winningSide with downstream dependencies
    return { error: CANNOT_CHANGE_WINNING_SIDE };
  }
}
```

**Purpose:** Prevent winningSide changes when downstream matches exist, unless:
- WinningSide is unchanged
- Collection match without dual winningSide change

---

## Path C: `applyMatchUpValues`

**Inline Function in `setMatchUpState.ts`**

**Purpose:** Direct application of matchUp values without propagation checks

```typescript
function applyMatchUpValues(params) {
  1. Determine removeWinningSide flag
  2. Calculate newMatchUpStatus based on matchUp type:
     - Collection: params.matchUpStatus || (removeWinningSide ? TO_BE_PLAYED : winningSide ? COMPLETED : INCOMPLETE)
     - Non-collection: params.matchUpStatus || COMPLETED
  3. Determine removeScore flag
  4. modifyMatchUpScore()
  5. If isCollectionMatchUp → updateTieMatchUpScore() for recalculation
}
```

---

## Exit Status Progression: `progressExitStatus`

**Location:** `src/mutate/matchUps/drawPositions/progressExitStatus.ts`

**Purpose:** Propagate WALKOVER/DEFAULTED status through consolation/loser bracket

### Algorithm:

```typescript
1. Determine carryOverMatchUpStatus (WALKOVER, DEFAULTED → WALKOVER; RETIRED → WALKOVER)

2. Get updated inContext matchUps

3. Find updated loser matchUp

4. Calculate status codes and winningSide:
   
   A. Single participant in loser match:
      - Set opponent as winner
      - Carry over status code to losing side
   
   B. Already a participant in loser match:
      - If loser match is not already WO/DEFAULT → set opponent as winner
      - If already WO/DEFAULT → DOUBLE_WALKOVER (both sides have exit status)
   
5. Recursively call setMatchUpState() with:
   - allowChangePropagation: true
   - propagateExitStatus flag
```

**Recursive Loop Risk:** Called from within while loop in `setMatchUpStatus` (failsafe: 10 iterations)

---

## Critical Helper: `attemptToSetWinningSide`

**Location:** `src/mutate/drawDefinitions/matchUpGovernor/attemptToSetWinningSide.ts`

**Purpose:** Set winningSide and propagate participants to winner/loser positions

### Execution Flow:

```typescript
1. Check manual score flag (dualMatchUp?._disableAutoCalc)
   if true → attemptToModifyScore()

2. If changing winningSide:
   - Check connected structures (WIN_RATIO progression)
   - removeDirectedParticipants() to clear existing direction

3. directParticipants() - main propagation
   - Captures progressExitStatus flag if present

4. Qualifier handling:
   if qualifierChanging + autoReplaceQualifiers → replaceQualifier()
   if qualifierAdvancing + autoPlaceQualifiers → placeQualifier()
```

---

## State Modification: `directParticipants`

**Location:** `src/mutate/matchUps/drawPositions/directParticipants.ts`

**Purpose:** Direct winner/loser to target positions

### Flow:

```typescript
1. attemptToModifyScore()
2. Validate matchUpStatus is directing
3. Extract context about dual matches and target data
4. Call directWinner() and/or directLoser()
5. Handle special cases:
   - DOUBLE_WALKOVER/DOUBLE_DEFAULT → special progression logic
   - adHoc structures → different propagation rules
   - Consolation/loser brackets → trigger progressExitStatus
```

---

## Complexity Analysis

### Cyclomatic Complexity by Function

| Function | Branches | Depth | Complexity |
|----------|----------|-------|------------|
| `setMatchUpStatus` | 4 | 2 | Low |
| `setMatchUpState` | 25+ | 5 | **Very High** |
| `noDownstreamDependencies` | 8 | 4 | **High** |
| `attemptToSetWinningSide` | 6 | 3 | Medium |
| `directParticipants` | 10+ | 4 | **High** |
| `progressExitStatus` | 8 | 3 | Medium |

### Code Smells Identified

1. **God Function:** `setMatchUpState` handles too many responsibilities
2. **Deep Nesting:** Multiple 4-5 level conditional branches
3. **Flag Arguments:** Functions with 10+ parameters
4. **Temporal Coupling:** Order of operations matters but not enforced
5. **Hidden Side Effects:** State mutations buried in conditional branches
6. **Long Parameter Lists:** 15+ parameters passed through call chain
7. **Recursive Loops:** while + recursive calls with failsafe limits
8. **Implicit State Dependencies:** Many functions assume prior state checks
9. **Mixed Concerns:** Validation, transformation, and side effects interleaved
10. **Boolean Algebra Complexity:** Complex OR chains with side effects

---

## Recommendations for Improvement

### 1. **Pipeline Pattern with Explicit Stages**

**Problem:** Current design mixes validation, decision-making, and execution

**Solution:** Separate into explicit pipeline stages:

```typescript
// Proposed Structure
class MatchUpStatusPipeline {
  private stages: PipelineStage[];

  async execute(context: MatchUpContext): Promise<Result> {
    for (const stage of this.stages) {
      const result = await stage.execute(context);
      if (result.shouldStop) return result;
      context.merge(result.context);
    }
  }
}

// Stages:
// 1. ValidationStage - all parameter and state validation
// 2. ContextEnrichmentStage - add matchUpsMap, targetData, etc.
// 3. PolicyResolutionStage - determine applicable policies
// 4. DecisionStage - determine execution path (A, B, C, D)
// 5. ExecutionStage - perform state mutations
// 6. PropagationStage - handle downstream effects
// 7. ReconciliationStage - update related matchUps (TEAM/collection)
```

**Benefits:**
- Each stage has single responsibility
- Easy to add logging/debugging between stages
- Can skip stages based on context
- Testable in isolation

---

### 2. **Strategy Pattern for Execution Paths**

**Problem:** Complex OR chain in final dispatch

**Solution:** Define explicit strategies:

```typescript
interface MatchUpStatusStrategy {
  canHandle(context: MatchUpContext): boolean;
  execute(context: MatchUpContext): Result;
}

class NoDownstreamStrategy implements MatchUpStatusStrategy {
  canHandle(ctx: MatchUpContext): boolean {
    return !ctx.activeDownstream;
  }
  execute(ctx: MatchUpContext): Result {
    // Current noDownstreamDependencies logic
  }
}

class WithDownstreamStrategy implements MatchUpStatusStrategy {
  canHandle(ctx: MatchUpContext): boolean {
    return ctx.matchUpWinner && ctx.activeDownstream;
  }
  execute(ctx: MatchUpContext): Result {
    // Current winningSideWithDownstreamDependencies logic
  }
}

class DirectApplicationStrategy implements MatchUpStatusStrategy {
  canHandle(ctx: MatchUpContext): boolean {
    return ctx.directingMatchUpStatus || ctx.autoCalcDisabled;
  }
  execute(ctx: MatchUpContext): Result {
    // Current applyMatchUpValues logic
  }
}

// Usage:
const strategies = [
  new NoDownstreamStrategy(),
  new WithDownstreamStrategy(),
  new DirectApplicationStrategy(),
];

const strategy = strategies.find(s => s.canHandle(context));
if (!strategy) return { error: NO_VALID_ACTIONS };
return strategy.execute(context);
```

**Benefits:**
- Clear execution path selection
- Easy to add new strategies
- Self-documenting (strategy names explain intent)
- Testable strategies independently

---

### 3. **Context Object Pattern**

**Problem:** 15+ parameters passed through call chain

**Solution:** Unified context object with typed sections:

```typescript
interface MatchUpStatusContext {
  // Input
  request: {
    matchUpId: string;
    outcome?: Outcome;
    winningSide?: number;
    matchUpStatus?: MatchUpStatusUnion;
    // ... other inputs
  };
  
  // Resolved entities
  entities: {
    tournament?: Tournament;
    event?: Event;
    drawDefinition: DrawDefinition;
    structure?: Structure;
    matchUp: MatchUp;
    inContextMatchUp: MatchUp;
    dualMatchUp?: MatchUp;
  };
  
  // Computed flags
  flags: {
    isTeam: boolean;
    activeDownstream: boolean;
    isCollectionMatchUp: boolean;
    qualifierAdvancing: boolean;
    qualifierChanging: boolean;
    removingQualifier: boolean;
    dualWinningSideChange: boolean;
    // ... other flags
  };
  
  // Maps and lookups
  data: {
    matchUpsMap: Map<string, MatchUp>;
    inContextMatchUps: MatchUp[];
    targetData: PositionTargets;
    appliedPolicies: PolicyDefinitions;
  };
  
  // Execution results
  results: {
    progressExitStatus?: boolean;
    connectedStructures?: boolean;
    qualifierPlaced?: boolean;
    qualifierReplaced?: boolean;
  };
}
```

**Benefits:**
- Single parameter instead of 15+
- Type-safe access to context data
- Clear organization of data by purpose
- Easy to add new context without changing signatures

---

### 4. **State Machine for Match Status**

**Problem:** Implicit state transition rules scattered across code

**Solution:** Explicit state machine:

```typescript
class MatchUpStatusStateMachine {
  private transitions: Map<string, Transition[]>;
  
  constructor() {
    this.defineTransitions();
  }
  
  canTransition(from: MatchUpStatus, to: MatchUpStatus, context: Context): ValidationResult {
    const transition = this.findTransition(from, to);
    if (!transition) return { valid: false, error: INVALID_MATCHUP_STATUS };
    
    return transition.validate(context);
  }
  
  getRequiredActions(from: MatchUpStatus, to: MatchUpStatus): Action[] {
    const transition = this.findTransition(from, to);
    return transition?.actions ?? [];
  }
  
  private defineTransitions() {
    // TO_BE_PLAYED → COMPLETED
    this.addTransition({
      from: TO_BE_PLAYED,
      to: COMPLETED,
      requires: ['winningSide', 'participants'],
      actions: ['directWinner', 'directLoser'],
    });
    
    // COMPLETED → TO_BE_PLAYED (removal)
    this.addTransition({
      from: COMPLETED,
      to: TO_BE_PLAYED,
      requires: ['!activeDownstream'],
      actions: ['removeDirectedParticipants', 'removeScore'],
    });
    
    // TO_BE_PLAYED → WALKOVER
    this.addTransition({
      from: TO_BE_PLAYED,
      to: WALKOVER,
      requires: ['winningSide'],
      actions: ['directWinner', 'directLoser', 'clearScore'],
    });
    
    // ... all other transitions
  }
}
```

**Benefits:**
- All transition rules in one place
- Easy to understand valid state changes
- Can generate documentation/diagrams
- Centralized validation logic

---

### 5. **Command Pattern for Mutations**

**Problem:** Side effects scattered across conditional branches

**Solution:** Explicit commands:

```typescript
interface Command {
  execute(context: MatchUpContext): Result;
  canUndo(): boolean;
  undo(context: MatchUpContext): Result;
}

class SetWinningSideCommand implements Command {
  constructor(private winningSide: number) {}
  
  execute(ctx: MatchUpContext): Result {
    // Validation
    if (ctx.activeDownstream && ctx.matchUp.winningSide !== this.winningSide) {
      return { error: CANNOT_CHANGE_WINNING_SIDE };
    }
    
    // Execution
    ctx.matchUp.winningSide = this.winningSide;
    return { ...SUCCESS, changed: ['winningSide'] };
  }
  
  canUndo(): boolean { return true; }
  
  undo(ctx: MatchUpContext): Result {
    delete ctx.matchUp.winningSide;
    return { ...SUCCESS };
  }
}

class DirectParticipantsCommand implements Command {
  execute(ctx: MatchUpContext): Result {
    const commands = [
      new DirectWinnerCommand(ctx.targetData.winnerPosition),
      new DirectLoserCommand(ctx.targetData.loserPosition),
    ];
    
    return this.executeSequence(commands, ctx);
  }
  
  canUndo(): boolean { return true; }
  undo(ctx: MatchUpContext): Result { /* ... */ }
}

// Usage:
class CommandExecutor {
  private history: Command[] = [];
  
  execute(command: Command, context: MatchUpContext): Result {
    const result = command.execute(context);
    if (!result.error && command.canUndo()) {
      this.history.push(command);
    }
    return result;
  }
  
  rollback(context: MatchUpContext): Result {
    while (this.history.length > 0) {
      const command = this.history.pop();
      command.undo(context);
    }
  }
}
```

**Benefits:**
- Explicit mutations with clear names
- Undo capability for transactions
- Easy to log/audit changes
- Testable in isolation

---

### 6. **Event Sourcing for Propagation**

**Problem:** Recursive/iterative propagation with failsafe limits

**Solution:** Event-driven propagation:

```typescript
interface DomainEvent {
  type: string;
  matchUpId: string;
  timestamp: number;
  data: any;
}

class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();
  private eventQueue: DomainEvent[] = [];
  
  publish(event: DomainEvent) {
    this.eventQueue.push(event);
  }
  
  process() {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      const handlers = this.handlers.get(event.type) ?? [];
      
      for (const handler of handlers) {
        const newEvents = handler.handle(event);
        newEvents.forEach(e => this.publish(e));
      }
    }
  }
  
  subscribe(eventType: string, handler: EventHandler) {
    const handlers = this.handlers.get(eventType) ?? [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }
}

// Events:
// - WinningSideSetEvent
// - LoserDirectedEvent
// - WinnerDirectedEvent
// - ExitStatusPropagatedEvent
// - QualifierPlacedEvent

// Handlers:
class ExitStatusPropagationHandler implements EventHandler {
  handle(event: LoserDirectedEvent): DomainEvent[] {
    if (!event.data.hasExitStatus) return [];
    
    const loserMatchUp = this.findLoserMatchUp(event.data.loserParticipantId);
    if (!loserMatchUp) return [];
    
    // Calculate new status
    const status = this.calculateExitStatus(event.data, loserMatchUp);
    
    return [
      new ExitStatusPropagatedEvent({
        matchUpId: loserMatchUp.matchUpId,
        status,
        sourceMatchUpId: event.matchUpId,
      })
    ];
  }
}
```

**Benefits:**
- No recursive calls or while loops
- Clear event flow
- Easy to add new propagation rules
- Complete audit trail
- No arbitrary failsafe limits

---

### 7. **Visitor Pattern for Match Types**

**Problem:** Scattered TEAM/collection/singles logic

**Solution:** Type-specific visitors:

```typescript
interface MatchUpVisitor {
  visitSinglesMatchUp(matchUp: MatchUp, context: Context): Result;
  visitDoublesMatchUp(matchUp: MatchUp, context: Context): Result;
  visitTeamMatchUp(matchUp: MatchUp, context: Context): Result;
  visitCollectionMatchUp(matchUp: MatchUp, context: Context): Result;
}

class StatusUpdateVisitor implements MatchUpVisitor {
  visitSinglesMatchUp(matchUp, ctx): Result {
    // Singles-specific logic (simpler path)
    return this.updateStatus(matchUp, ctx);
  }
  
  visitTeamMatchUp(matchUp, ctx): Result {
    // TEAM-specific logic
    if (ctx.request.enableAutoCalc) {
      const score = this.generateTieScore(matchUp);
      // ... TEAM-specific handling
    }
    return this.updateStatus(matchUp, ctx);
  }
  
  visitCollectionMatchUp(matchUp, ctx): Result {
    // Collection-specific logic
    const dualMatchUp = this.findDualMatchUp(matchUp);
    const projected = this.getProjectedWinningSide(matchUp, dualMatchUp);
    // ... collection-specific handling
  }
  
  visitDoublesMatchUp(matchUp, ctx): Result {
    // Similar to singles but might have different rules
    return this.visitSinglesMatchUp(matchUp, ctx);
  }
}

// Usage:
const visitor = new StatusUpdateVisitor();
matchUp.accept(visitor, context);
```

**Benefits:**
- Type-specific logic isolated
- Easy to understand each match type's behavior
- Can have different visitors for different operations
- Reduces conditional complexity

---

### 8. **Dependency Injection for Testability**

**Problem:** Tight coupling to global functions and imports

**Solution:** Inject dependencies:

```typescript
class MatchUpStatusService {
  constructor(
    private validator: MatchUpValidator,
    private scoreModifier: ScoreModifier,
    private propagator: ParticipantPropagator,
    private policyResolver: PolicyResolver,
    private eventBus: EventBus,
  ) {}
  
  setStatus(params: SetStatusParams): Result {
    const context = this.buildContext(params);
    
    const validationResult = this.validator.validate(context);
    if (validationResult.error) return validationResult;
    
    const policies = this.policyResolver.resolve(context);
    
    const strategy = this.selectStrategy(context, policies);
    const result = strategy.execute(context);
    
    if (!result.error) {
      this.eventBus.publish(new StatusChangedEvent(context));
    }
    
    return result;
  }
}

// Test:
const mockValidator = new MockValidator();
const service = new MatchUpStatusService(
  mockValidator, 
  new MockScoreModifier(),
  // ... other mocks
);
```

**Benefits:**
- Easy to test with mocks
- Can swap implementations
- Clear dependencies
- Reduces coupling

---

### 9. **Documentation Structure**

**Current:** Single markdown file with pseudocode

**Recommended:**

```
documentation/
├── setMatchUpStatus/
│   ├── README.md                      # Overview and quick start
│   ├── architecture.md                # High-level architecture
│   ├── pipeline-stages.md             # Each pipeline stage
│   ├── execution-paths.md             # Path A, B, C, D explained
│   ├── match-types.md                 # SINGLES, DOUBLES, TEAM differences
│   ├── special-cases.md               # Walkovers, byes, double exits
│   ├── state-transitions.md           # Valid status transitions
│   ├── propagation-rules.md           # How changes propagate
│   ├── policies.md                    # Policy effects
│   ├── examples/
│   │   ├── simple-win.md              # Basic example
│   │   ├── team-match.md              # TEAM match example
│   │   ├── walkover-propagation.md    # Exit status example
│   │   └── qualifier-advancement.md   # Qualifier example
│   ├── diagrams/
│   │   ├── pipeline-flow.svg          # Overall flow
│   │   ├── state-machine.svg          # State transitions
│   │   ├── path-selection.svg         # Decision tree
│   │   └── propagation.svg            # Participant propagation
│   └── decision-trees/
│       ├── path-selection.md          # How path A/B/C/D is chosen
│       ├── team-handling.md           # TEAM-specific decisions
│       └── validation-rules.md        # All validation rules
```

---

### 10. **Incremental Refactoring Strategy**

**Phase 1: Add Observability (2-3 days)**
- Add structured logging to all major decision points
- Track execution paths through pipeline
- Measure branch coverage
- Identify hot paths

**Phase 2: Extract Context Object (3-5 days)**
- Create `MatchUpStatusContext` interface
- Refactor functions to accept context
- Maintain backward compatibility with adapters

**Phase 3: Extract Strategies (1-2 weeks)**
- Create strategy interfaces
- Extract NoDownstream, WithDownstream, DirectApplication
- Add strategy selection with fallback to old code
- Gradually move logic into strategies

**Phase 4: Extract Pipeline Stages (2-3 weeks)**
- Create stage interfaces
- Extract validation stage
- Extract enrichment stage
- Extract execution stage
- Wire stages together with original function as fallback

**Phase 5: Add State Machine (1 week)**
- Define all valid transitions
- Add validation against state machine
- Keep original validation as backup

**Phase 6: Implement Event Bus (2-3 weeks)**
- Create event bus and events
- Add handlers for propagation
- Run in parallel with original propagation
- Compare results
- Switch over when confident

**Phase 7: Add Visitor Pattern (1 week)**
- Create visitor interfaces
- Implement type-specific visitors
- Delegate to visitors from strategies

**Phase 8: Documentation (1 week)**
- Create new documentation structure
- Generate diagrams
- Write examples
- Create decision trees

**Total Estimated Time: 3-4 months** (with testing and validation)

---

## Immediate Quick Wins

### 1. Add Execution Path Logging

```typescript
function setMatchUpState(params) {
  const executionPath: string[] = [];
  
  // At each decision point:
  if (condition) {
    executionPath.push('NoDownstreamPath');
    // ...
  }
  
  pushGlobalLog({
    method: 'setMatchUpState',
    executionPath,
    matchUpId: params.matchUpId,
  });
}
```

### 2. Extract Constants

```typescript
// Current: Magic strings scattered
if (matchUpStatus === 'AWAITING_RESULT') { ... }

// Better: Named constants with descriptions
const RESTRICTED_TEAM_STATUSES = {
  AWAITING_RESULT: 'Awaiting result not supported for TEAM matchUps',
} as const;

if (isTeam && matchUpStatus in RESTRICTED_TEAM_STATUSES) {
  return { 
    error: INVALID_VALUES,
    info: RESTRICTED_TEAM_STATUSES[matchUpStatus],
  };
}
```

### 3. Add Decision Documentation

```typescript
/**
 * PATH SELECTION LOGIC
 * 
 * Determines which execution path to take based on matchUp state.
 * 
 * Path A (noDownstreamDependencies):
 *   - Condition: !activeDownstream
 *   - Purpose: Modify matchUp without downstream propagation
 *   - Use cases: Removing scores, setting non-directing statuses
 * 
 * Path B (winningSideWithDownstreamDependencies):
 *   - Condition: matchUpWinner && activeDownstream
 *   - Purpose: Verify winningSide doesn't conflict with downstream
 *   - Use cases: Setting winner when downstream matches exist
 * 
 * Path C (applyMatchUpValues):
 *   - Condition: directingMatchUpStatus || autoCalcDisabled
 *   - Purpose: Direct application without checks
 *   - Use cases: Manual score entry, directing statuses
 * 
 * Path D (NO_VALID_ACTIONS):
 *   - Condition: None of above
 *   - Purpose: Error state
 */
const result = 
  (!activeDownstream && noDownstreamDependencies(params)) ||
  (matchUpWinner && winningSideWithDownstreamDependencies(params)) ||
  ((directingMatchUpStatus || autoCalcDisabled) && applyMatchUpValues(params)) ||
  { error: NO_VALID_ACTIONS };
```

### 4. Add Validation Summary

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  checks: {
    parameters: boolean;
    statusCompatibility: boolean;
    participants: boolean;
    downstreamImpact: boolean;
    scoreValidity: boolean;
  };
}

function validateAll(params): ValidationResult {
  return {
    valid: true,
    errors: [],
    warnings: [],
    checks: {
      parameters: checkParameters(params),
      statusCompatibility: checkStatusCompatibility(params),
      participants: checkParticipants(params),
      downstreamImpact: checkDownstreamImpact(params),
      scoreValidity: checkScoreValidity(params),
    },
  };
}
```

---

## Testing Strategy

### Current Challenge
Complex branching makes comprehensive testing difficult

### Recommended Approach

**1. Golden Path Tests**
- Document and test the 10 most common scenarios
- Ensure these work with any refactoring

**2. Decision Matrix Tests**
```typescript
describe('Path Selection', () => {
  const scenarios = [
    { activeDownstream: false, winningSide: 1, expected: 'PathA' },
    { activeDownstream: true, winningSide: 1, expected: 'PathB' },
    { activeDownstream: true, directingStatus: true, expected: 'PathC' },
    // ... all combinations
  ];
  
  scenarios.forEach(scenario => {
    it(`selects ${scenario.expected} when ${JSON.stringify(scenario)}`, () => {
      // test
    });
  });
});
```

**3. State Transition Tests**
```typescript
describe('State Transitions', () => {
  const transitions = [
    { from: TO_BE_PLAYED, to: COMPLETED, valid: true },
    { from: COMPLETED, to: TO_BE_PLAYED, valid: true, requires: '!activeDownstream' },
    { from: TO_BE_PLAYED, to: BYE, valid: false, reason: 'BYE cannot have winningSide' },
    // ... all transitions
  ];
  
  transitions.forEach(transition => {
    it(`${transition.from} → ${transition.to}: ${transition.valid}`, () => {
      // test
    });
  });
});
```

**4. Property-Based Tests**
```typescript
import fc from 'fast-check';

describe('setMatchUpStatus invariants', () => {
  it('never loses participant data', () => {
    fc.assert(
      fc.property(
        matchUpArbitrary(),
        statusArbitrary(),
        (matchUp, newStatus) => {
          const before = matchUp.sides.map(s => s.participantId);
          setMatchUpStatus({ matchUp, status: newStatus });
          const after = matchUp.sides.map(s => s.participantId);
          
          return before.every(id => after.includes(id));
        }
      )
    );
  });
});
```

---

## Conclusion

The `setMatchUpStatus` pipeline is a sophisticated system that has evolved to handle complex tournament scenarios. While it works, the complexity makes it difficult to:

1. **Understand** - Deep nesting and implicit dependencies
2. **Modify** - Changes risk breaking unexpected paths
3. **Test** - Comprehensive coverage is challenging
4. **Debug** - Execution path is not immediately visible

The recommendations above provide a roadmap from quick wins to comprehensive refactoring, prioritizing:

- **Visibility** - Make execution paths explicit
- **Separation** - Separate concerns into distinct components  
- **Testability** - Enable isolated testing of components
- **Documentation** - Comprehensive guides for developers
- **Maintainability** - Structure that supports evolution

The incremental approach allows improvements without disrupting the working system, with each phase delivering value while moving toward a more maintainable architecture.

# progressExitStatus Simplified Implementation Plan

**Branch:** `progressExitStatus-simplified`  
**Goal:** Maintainable, single-level exit status propagation  
**Strategy:** Reduce complexity, clear limitations, comprehensive testing

---

## Design Principles

1. **Single Responsibility:** Each function does one thing well
2. **No Recursion:** Single-pass propagation only
3. **Explicit State:** Mark propagated matches with extensions
4. **Clear Limitations:** Document what's NOT supported
5. **Fail Safe:** Clear error messages for unsupported scenarios
6. **Testable:** Each component testable in isolation

---

## Scope Limitations

### ✅ Supported

**Draw Types:**
- FIRST_MATCH_LOSER_CONSOLATION (single-level back draw)

**Exit Statuses:**
- WALKOVER
- DEFAULTED
- RETIRED (propagates as WALKOVER)

**Scenarios:**
- Single participant in consolation match
- Opponent already present in consolation match
- Status code preservation

**Status Codes:**
- All provider-specific codes (W1, W2, DM, etc.)
- Proper side assignment

### ❌ Not Supported (Initially)

**Draw Types:**
- COMPASS (multi-level) - Would require event queue
- CURTIS_CONSOLATION feed-in - Complex progression logic
- Custom draw types

**Scenarios:**
- Multi-level propagation (more than 1 hop)
- DOUBLE_WALKOVER automatic creation
- Feed-round auto-progression

**Note:** Unsupported scenarios return clear error with explanation

---

## Architecture Changes

### 1. Remove While Loop from setMatchUpStatus

**Before:**
```typescript
// setMatchUpStatus.ts lines 136-156
if (result.context?.progressExitStatus) {
  let iterate = true;
  let failsafe = 0;
  while (iterate && failsafe < 10) {
    iterate = false;
    failsafe += 1;
    const progressResult = progressExitStatus(...);
    if (progressResult.context?.loserMatchUp) {
      Object.assign(result.context, progressResult.context);
      iterate = true; // Continue looping
    }
  }
}
```

**After:**
```typescript
// Single-pass only
if (result.context?.progressExitStatus) {
  const progressResult = progressExitStatus(...);
  
  // Merge context but don't iterate
  if (progressResult.context) {
    Object.assign(result.context, {
      ...progressResult.context,
      propagationCompleted: true,
    });
  }
  
  // If more levels needed, return clear message
  if (progressResult.context?.additionalLevelsRequired) {
    result.info = 'Multi-level propagation not supported. Manual intervention required.';
  }
}
```

**Benefits:**
- No failsafe needed
- Predictable behavior
- Clear termination
- No infinite loop risk

---

### 2. Mark Propagated Matches with Extension

**Purpose:** Differentiate propagated WO from manual WO

**Implementation:**
```typescript
// In progressExitStatus.ts after setting status
addExtension({
  element: loserMatchUp,
  extension: {
    name: 'PROPAGATED_EXIT_STATUS',
    value: {
      sourceMatchUpId: matchUp.matchUpId,
      sourceStatus: sourceMatchUpStatus,
      sourceStatusCode: sourceMatchUpStatusCodes[0],
      propagatedAt: new Date().toISOString(),
      side: loserParticipantSide.sideNumber,
    },
  },
});
```

**Benefits:**
- Clear identification in isActiveDownstream
- Audit trail for debugging
- Can be used for UI display
- Enables proper rollback logic

---

### 3. Improved Status Code Handling

**Current Issue:**
```typescript
// Line 78-79 removed, status codes not carried over
winningSide = loserParticipantSide.sideNumber === 1 ? 2 : 1;
// statusCodes[0] = sourceMatchUpStatusCodes[0]; // REMOVED
```

**Fixed Version:**
```typescript
// Opponent present case
if (![WALKOVER, DEFAULTED].includes(loserMatchUp.matchUpStatus)) {
  // Set opponent as winner
  winningSide = loserParticipantSide.sideNumber === 1 ? 2 : 1;
  
  // Carry over status code to LOSING side (the WO/DEFAULT participant)
  const loserSideIndex = loserParticipantSide.sideNumber - 1;
  statusCodes[loserSideIndex] = sourceMatchUpStatusCodes[0] || 'WO';
  
  // Keep any existing status code on winning side
  // (opponent's side remains unchanged)
}
```

**Example:**
```
Main Draw:
  Player A defeats Player B (WALKOVER - injury code 'W1')
  
Consolation Match (Player C already waiting):
  Side 1: Player C
  Side 2: Player B arrives with 'W1' code
  
Result:
  matchUpStatus: WALKOVER
  winningSide: 1 (Player C)
  statusCodes: [undefined, 'W1']  // C has no code, B has 'W1'
```

---

### 4. Clear Error Messages

**Unsupported Draw Type:**
```typescript
if (!isSupportedDrawType(structure.drawType)) {
  return decorateResult({
    result: { 
      error: UNSUPPORTED_DRAW_TYPE,
      info: `Exit status propagation not supported for ${structure.drawType}. Supported types: FIRST_MATCH_LOSER_CONSOLATION.`,
    },
    stack,
  });
}
```

**Multi-Level Detected:**
```typescript
if (loserMatchUp?.loserTargetLink) {
  return decorateResult({
    result: {
      ...SUCCESS,
      info: 'Additional consolation level detected. Manual propagation required.',
      context: { additionalLevelsRequired: true },
    },
    stack,
  });
}
```

---

## Implementation Steps

### Phase 1: Fix Current Implementation (Day 1)

**Goal:** Get tests passing for basic scenarios

**Tasks:**
1. ✅ Create branch `progressExitStatus-simplified`
2. ⏳ Restore status code line with proper side handling
3. ⏳ Add debugging to understand why propagation not triggering
4. ⏳ Fix basic propagation test (1 participant case)
5. ⏳ Fix opponent present test

**Files to Modify:**
- `src/mutate/matchUps/drawPositions/progressExitStatus.ts`

**Success Criteria:**
- 2 basic tests passing
- Status codes preserved correctly

---

### Phase 2: Add Extensions and Simplify (Day 2)

**Goal:** Remove complexity, add markers

**Tasks:**
1. ⏳ Add extension when propagating status
2. ⏳ Remove while loop from setMatchUpStatus
3. ⏳ Add single-pass comment and info
4. ⏳ Update isActiveDownstream to check extension

**Files to Modify:**
- `src/mutate/matchUps/matchUpStatus/setMatchUpStatus.ts`
- `src/mutate/matchUps/drawPositions/progressExitStatus.ts`
- `src/query/drawDefinition/isActiveDownstream.ts`

**Success Criteria:**
- Extensions added correctly
- Single-pass works for supported scenarios
- Clear message for multi-level scenarios

---

### Phase 3: Limit Scope and Add Validation (Day 3)

**Goal:** Clear boundaries and error messages

**Tasks:**
1. ⏳ Add draw type validation
2. ⏳ Return clear errors for unsupported types
3. ⏳ Update tests to skip unsupported scenarios
4. ⏳ Document limitations in code comments

**Files to Modify:**
- `src/mutate/matchUps/drawPositions/progressExitStatus.ts`
- `src/tests/mutations/drawDefinitions/setMatchUpStatus/propagateExitStatus.test.ts`

**Success Criteria:**
- Clear error for Compass draw
- Clear error for Curtis consolation
- Documentation in place

---

### Phase 4: Comprehensive Testing (Day 4)

**Goal:** All supported scenarios tested and working

**Tasks:**
1. ⏳ Fix all FIRST_MATCH_LOSER_CONSOLATION tests
2. ⏳ Add tests for extension presence
3. ⏳ Add tests for unsupported scenarios
4. ⏳ Add tests for status code sides
5. ⏳ Add integration tests

**Files to Modify:**
- `src/tests/mutations/drawDefinitions/setMatchUpStatus/propagateExitStatus.test.ts`

**Success Criteria:**
- All supported tests passing
- Unsupported tests verify error messages
- Extension tests verify markers

---

### Phase 5: Documentation (Day 5)

**Goal:** Clear documentation for developers and users

**Tasks:**
1. ⏳ Update function JSDoc comments
2. ⏳ Create usage examples
3. ⏳ Document limitations clearly
4. ⏳ Update README if needed
5. ⏳ Create migration guide from old implementation

**Files to Create/Modify:**
- `documentation/progressExitStatus-usage.md`
- `documentation/progressExitStatus-limitations.md`
- Function comments in all modified files

**Success Criteria:**
- Developers can understand flow from comments
- Users know what's supported/not supported
- Clear examples for common scenarios

---

## Modified Files Summary

### Core Logic
1. **progressExitStatus.ts** - Main propagation logic
2. **setMatchUpStatus.ts** - Entry point and single-pass
3. **directLoser.ts** - Hook to trigger propagation

### Supporting Files
4. **isActiveDownstream.ts** - Check for propagated matches
5. **progressExitStatus.test.ts** - Comprehensive tests

### Documentation
6. **progressExitStatus-usage.md** - How to use
7. **progressExitStatus-limitations.md** - What's not supported
8. **progressExitStatus-simplified-plan.md** - This file

---

## Testing Strategy

### Unit Tests

**progressExitStatus.ts:**
- ✅ Single participant scenario
- ✅ Opponent present scenario
- ✅ Status code on correct side
- ✅ Extension added correctly
- ❌ DOUBLE_WALKOVER creation (not supported)
- ❌ Multi-level (clear error)

**setMatchUpStatus.ts:**
- ✅ Single-pass propagation
- ✅ Context merged correctly
- ❌ No while loop iteration

**directLoser.ts:**
- ✅ Flag set when valid exit status
- ✅ Context includes loserMatchUp
- ✅ Flag not set for COMPLETED

### Integration Tests

**FIRST_MATCH_LOSER_CONSOLATION:**
- ✅ Main draw WO → Consolation WO
- ✅ Status code preserved
- ✅ Opponent wins automatically
- ✅ Extension marks propagation
- ✅ isActiveDownstream recognizes propagated match

**Unsupported Scenarios:**
- ❌ COMPASS draw returns clear error
- ❌ CURTIS_CONSOLATION returns clear error
- ❌ Multi-level attempt returns info message

### Edge Cases

- ✅ RETIRED propagates as WALKOVER
- ✅ Empty status codes handled
- ✅ Missing loserMatchUp handled
- ✅ Already propagated (extension exists)
- ✅ Score removal with propagated downstream

---

## Success Metrics

### Code Quality
- **Cyclomatic Complexity:** < 10 per function
- **Max Nesting Depth:** ≤ 3 levels
- **Function Length:** ≤ 50 lines
- **Clear Comments:** Every decision point explained

### Test Coverage
- **Unit Tests:** 100% of progressExitStatus.ts
- **Integration Tests:** All supported scenarios
- **Edge Cases:** All identified cases tested
- **Error Paths:** All error messages validated

### Performance
- **Execution Time:** < 50ms for single propagation
- **No Loops:** Zero iterations (single-pass)
- **Memory:** No accumulation (no recursion)

### Documentation
- **API Docs:** JSDoc for all public functions
- **Usage Guide:** 3+ examples
- **Limitations:** Clearly stated
- **Migration:** Steps from old implementation

---

## Risk Mitigation

### Risk 1: Tests Still Fail After Changes

**Mitigation:**
- Add comprehensive logging at each step
- Create minimal reproduction case
- Test in isolation before integration
- Use git bisect if needed

### Risk 2: Breaking Existing Functionality

**Mitigation:**
- Run full test suite before and after
- Check for regressions in non-propagation scenarios
- Test score removal/modification
- Test downstream blocking

### Risk 3: Incomplete Feature Set

**Mitigation:**
- Document limitations upfront
- Provide workarounds for unsupported cases
- Create issues for future enhancements
- Clear error messages guide users

### Risk 4: Performance Degradation

**Mitigation:**
- Profile before and after
- Ensure single-pass is faster than while loop
- No new queries unless necessary
- Cache calculations where possible

---

## Future Enhancements (Post-MVP)

### Phase 6: Event Queue for Multi-Level
- Replace single-pass with event queue
- Support Compass draw (4 levels)
- Support Curtis consolation feed-in
- Maintain single-pass for simple cases

### Phase 7: DOUBLE_WALKOVER Automation
- Detect both participants have exit status
- Automatically create DOUBLE_WALKOVER
- Handle status code arrays correctly

### Phase 8: Rollback Support
- Detect score removal with propagated downstream
- Clear propagation extensions
- Reset consolation matches to TO_BE_PLAYED
- Warn user of downstream impacts

### Phase 9: UI Integration
- Display propagated status indicator
- Show source matchUp link
- Allow manual override
- Clear propagation button

---

## Implementation Checklist

### Day 1: Fix Basic Propagation
- [ ] Create branch
- [ ] Restore status code line (fixed)
- [ ] Add debugging logs
- [ ] Fix single participant test
- [ ] Fix opponent present test

### Day 2: Simplify Architecture
- [ ] Add extension on propagation
- [ ] Remove while loop
- [ ] Single-pass implementation
- [ ] Update isActiveDownstream

### Day 3: Validate and Limit Scope
- [ ] Add draw type validation
- [ ] Clear error messages
- [ ] Skip unsupported tests
- [ ] Document limitations

### Day 4: Comprehensive Testing
- [ ] All FIRST_MATCH_LOSER tests passing
- [ ] Extension tests added
- [ ] Error message tests added
- [ ] Status code side tests added

### Day 5: Documentation
- [ ] JSDoc comments complete
- [ ] Usage guide created
- [ ] Limitations document created
- [ ] Migration guide created

### Final: Review and Merge
- [ ] Code review
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Performance validated
- [ ] Create PR

---

## Conclusion

This simplified implementation prioritizes:

1. **Maintainability** over feature completeness
2. **Clear limitations** over hidden complexity
3. **Single-pass** over multi-level
4. **Explicit state** over implicit inference
5. **Clear errors** over silent failures

The goal is a **working, understandable, testable** implementation that can be enhanced incrementally rather than a complex solution that's hard to maintain.

**Next Step:** Begin Phase 1 - Fix basic propagation

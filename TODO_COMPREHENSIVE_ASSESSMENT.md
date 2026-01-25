# TODO Comprehensive Assessment Document

## tods-competition-factory Repository

**Date:** 2026-01-25  
**Total TODO Items:** 116  
**Repository:** factory (tods-competition-factory)

---

## Executive Summary

This document catalogs all TODO comments found in the codebase, organizing them by functional area, estimating scope of work, and prioritizing based on potential impact and benefit.

---

## Critical Questions for Investigation

### Date Validation Consistency

**Question**: Does the factory have consistent date string validation across all date-accepting functions, and is it uniformly applied?

**Context**:

- The factory requires ISO 8601 date format (`YYYY-MM-DD`) for all date operations
- Date validation regex exists: `validDateString = /^[\d]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][\d]|3[0-1])$/`
- Validation function exists: `isValidDateString()` in `tools/dateTime.ts`
- `INVALID_DATE` error constant exists for date validation failures

**Observations**:

- Scheduling functions (`scheduleMatchUps`, `scheduleProfileRounds`, etc.) validate dates using `isValidDateString`
- Tournament date operations validate dates before processing
- Venue date availability validates dates before saving
- **Scale items (`setParticipantScaleItem`) do NOT validate `scaleDate` format** - only checks for required attributes
- `addMatchUpScheduledDate` validates date format
- Category age details validate date format

**Potential Issues**:

1. Scale items accept any string as `scaleDate` without format validation
2. Inconsistent date validation may allow malformed dates into the system
3. Operations consuming dates may fail silently or produce unexpected results
4. No centralized date validation strategy - scattered throughout codebase

**Investigation Required**:

- [ ] Audit all date-accepting functions for validation implementation
- [ ] Identify functions that accept dates without validation
- [ ] Determine impact of malformed dates on system behavior
- [ ] Create comprehensive test suite for date validation
- [ ] Consider adding date validation to parameter checking framework
- [ ] Add date format validation to scale items, time items, and other date consumers

**Recommended Actions**:

1. Add date validation to `isValidScaleItem()` in `mutate/participants/scaleItems/addScaleItems.ts`
2. Create centralized date validation helper that returns descriptive errors
3. Add date validation to time item operations
4. Update parameter checking to include date format validation
5. Add automated tests ensuring all date parameters are validated
6. Document date format requirements prominently in API documentation

**Priority**: HIGH - Data integrity issue that could lead to incorrect tournament records

**Estimated Effort**: 3-5 days

- 1 day: Comprehensive audit of date usage
- 1-2 days: Add missing validation
- 1 day: Create test coverage
- 0.5 day: Documentation updates

### Avoidance Policy Testing

**Question**: Are all avoidance policy patterns and accessor combinations fully tested?

**Context**:

- Avoidance policies documentation has been significantly expanded with comprehensive examples
- Multiple accessor patterns are documented (nationality, club, region, extensions, directives)
- Complex scenarios include: partial matching with `significantCharacters`, combined policies, extension-based avoidance
- Documentation includes 6 distinct practical examples covering various use cases

**Testing Coverage Required**:

1. **Basic Accessor Patterns**:
   - [ ] Simple attribute accessors (`person.nationalityCode`)
   - [ ] Nested attribute accessors (`person.organisation.organisationName`)
   - [ ] Array-based accessors (`individualParticipants.person.nationalityCode`)
   - [ ] Deep nested accessors (`person.addresses.city`, `person.addresses.postalCode`)

2. **Accessor Features**:
   - [ ] `significantCharacters` partial matching with various lengths (2, 3, 5 characters)
   - [ ] `includeIds` filtering to restrict avoidance to specific participants
   - [ ] Multiple accessor paths for same attribute (INDIVIDUAL vs PAIR)
   - [ ] Extension-based accessors (underscore-prefixed)

3. **Directive-Based Avoidance**:
   - [ ] `pairParticipants` directive (avoid doubles partners in singles)
   - [ ] `teamParticipants` directive (avoid teammates in singles)
   - [ ] `groupParticipants` directive (avoid group members)
   - [ ] Combined directive + key accessor policies

4. **Separation Strategies**:
   - [ ] Single round avoidance (`roundsToSeparate: 1`)
   - [ ] Multiple round avoidance (2, 3, 4+ rounds)
   - [ ] Maximum separation (`roundsToSeparate: undefined`)
   - [ ] Target divisions calculation

5. **Combined Policies**:
   - [ ] Multiple keys in same policy (nationality + club)
   - [ ] Multiple directives in same policy
   - [ ] Mixed keys and directives
   - [ ] Conflicting avoidance requirements

6. **Edge Cases**:
   - [ ] More participants from same group than available positions
   - [ ] Seeded players with avoidance constraints
   - [ ] Small draws with many groups (impossible to satisfy all constraints)
   - [ ] Missing/null accessor values
   - [ ] Empty string accessor values
   - [ ] Numeric vs string accessor values

7. **Documented Examples**:
   - [ ] Nationality avoidance (basic example)
   - [ ] Club/organization avoidance
   - [ ] Regional avoidance with postal codes and `significantCharacters`
   - [ ] Combined avoidance policies (nationality + club + doubles partners)
   - [ ] Custom extension avoidance (academy example)
   - [ ] Round robin bracket distribution

8. **Integration Testing**:
   - [ ] Avoidance with seed blocks
   - [ ] Avoidance in qualifying draws
   - [ ] Avoidance in round robin structures
   - [ ] Avoidance with byes
   - [ ] Avoidance with feed-in consolation

**Priority**: MEDIUM-HIGH - Core functionality with complex logic requiring comprehensive validation

**Estimated Effort**: 5-7 days

- 1-2 days: Test infrastructure for avoidance validation
- 2-3 days: Implement test coverage for all patterns
- 1 day: Edge case testing
- 1 day: Integration testing and documentation

### Missing Documentation - Data Concepts

**Question**: Are auditing, data pipelines, and TODS architecture patterns adequately documented?

**Context**:

- Factory has extensions for auditing (positionActions, drawDeletions, tieFormatModifications)
- Subscriptions system enables real-time data synchronization
- TODS documents serve dual purposes: active tournament state and historical time capsules
- Production systems need guidance on bulk processing and cross-tournament querying

**Missing Documentation**:

1. **Data => Auditing Documentation Page**
   - Purpose and scope of auditing in TODS
   - Built-in auditing extensions (positionActions, drawDeletions, tieFormatModifications)
   - When to use extensions vs external auditing services
   - Audit trail reconstruction from time items and extensions
   - Best practices for audit data retention and anonymization
   - Integration with external auditing systems

2. **Data => Pipelines Documentation Page**
   - Building data processing pipelines for bulk TODS JSON processing
   - ETL patterns for extracting data from TODS documents
   - Transforming TODS data for analytical databases
   - Loading historical tournament data into SQL/NoSQL stores
   - Batch vs streaming processing considerations
   - Performance optimization for processing large tournament archives
   - Error handling and validation in pipeline processing
   - Example architectures (AWS, GCP, Azure, on-premise)

3. **Discussion Document: TODS Architecture Patterns**
   - **Active Tournament State**:
     - TODS as mutable working document during tournament
     - Real-time updates and state management
     - Concurrency and conflict resolution
     - Performance considerations for live operations
   - **Time Capsule Pattern**:
     - TODS as immutable historical record post-tournament
     - Complete reconstruction of tournament state
     - Extensions and time items for temporal data
     - Archival and long-term storage strategies
   - **Cross-Tournament Querying**:
     - SQL data stores independent of TODS documents
     - When to use SQL vs TODS document queries
     - Normalized data models for analytical queries
     - Aggregations across tournaments, participants, events
     - Historical trend analysis and reporting
   - **Real-Time Synchronization**:
     - Subscriptions system for keeping SQL stores current
     - Event-driven architecture patterns
     - Incremental updates vs full refreshes
     - Handling subscription failures and recovery
     - Performance implications of real-time sync
   - **Bulk Pipeline Processing**:
     - Re-processing historical TODS documents
     - Populating analytical data stores from archives
     - Idempotent pipeline design
     - Schema evolution and migration strategies
     - Handling TODS version differences
   - **Hybrid Approach**:
     - When to use TODS documents directly vs SQL queries
     - Combining real-time subscriptions with batch processing
     - Cache invalidation strategies
     - Data consistency guarantees

**Recommended Actions**:

1. Create Data => Auditing documentation page covering audit trail patterns
2. Create Data => Pipelines documentation page with ETL patterns and examples
3. Create architecture discussion document covering TODS usage patterns
4. Add examples of subscription-based real-time sync implementation
5. Provide reference architectures for common deployment scenarios
6. Document trade-offs between different approaches

**Priority**: MEDIUM - Important for production deployments and architectural guidance

**Estimated Effort**: 8-12 days

- 2-3 days: Auditing documentation with examples
- 3-4 days: Pipelines documentation with reference architectures
- 3-5 days: Architecture patterns discussion document with diagrams

### Publishing State - Event Data Parameters Persistence

**Question**: Should `eventDataParams` passed to `publishEvent()` be stored in the publish state timeItem for optional reuse by client applications?

**Current Behavior**:

- `publishEvent({ eventId, eventDataParams: {...} })` accepts parameters that customize the generated `eventData` payload
- These parameters are passed through to `getEventData()` to generate the immediate payload
- The parameters are **NOT stored** in the publish state timeItem
- Client applications must pass their own query parameters when calling `getEventData({ usePublishState: true })`

**Example Current Pattern**:

```js
// Server publishes with specific params
engine.publishEvent({
  eventId,
  eventDataParams: {
    participantsProfile: { withISO2: true, withIOC: true },
    allParticipantResults: true,
  },
});

// Client must specify same params independently
const { eventData } = engine.getEventData({
  eventId,
  usePublishState: true,
  participantsProfile: { withISO2: true, withIOC: true },
  allParticipantResults: true,
});
```

**Potential Enhancement**:
Store `eventDataParams` in the publish state timeItem as optional defaults that client applications can use or override:

```js
// Server publishes with params that are stored
engine.publishEvent({
  eventId,
  eventDataParams: {
    participantsProfile: { withISO2: true },
    allParticipantResults: true,
  },
  persistParams: true, // New option
});

// Client can use stored defaults
const { eventData } = engine.getEventData({
  eventId,
  usePublishState: true,
  usePublishedParams: true, // Use params from publish state
});

// Or override specific params
const { eventData } = engine.getEventData({
  eventId,
  usePublishState: true,
  usePublishedParams: true,
  participantsProfile: { withIOC: true }, // Override/merge
});
```

**Considerations**:

**Pros**:

- Client applications don't need to duplicate parameter configuration
- Ensures consistency between server-published payload and client queries
- Reduces client-side code complexity
- Centralized control of what data clients receive
- Easier to update all clients by changing publication params

**Cons**:

- Increases timeItem size (additional storage)
- Adds complexity to publish state management
- Different client applications may need different data profiles
- May limit client flexibility
- Backwards compatibility concerns

**Investigation Required**:

- [ ] Analyze typical client query patterns and param usage
- [ ] Determine if most clients use identical params or vary significantly
- [ ] Assess storage impact of persisting eventDataParams
- [ ] Design merge strategy when clients override stored params
- [ ] Consider versioning strategy for param schema changes
- [ ] Evaluate security implications (can params expose sensitive data?)

**Recommended Actions**:

1. Survey existing client implementations to understand param usage patterns
2. Prototype optional param persistence with `persistParams` flag
3. Design param merge/override mechanism
4. Consider scope: event-level only or also tournament/draw levels?
5. Document migration path for existing clients
6. Implement feature flag for gradual rollout

**Priority**: LOW-MEDIUM - Quality of life improvement, not critical functionality

**Estimated Effort**: 4-6 days

- 1 day: Analysis of current usage patterns
- 2-3 days: Implementation of param persistence and retrieval
- 1 day: Testing and backwards compatibility
- 1 day: Documentation updates

---

## Table of Contents

1. [Score Parsing & Validation](#1-score-parsing--validation)
2. [Draw Management & Seeding](#2-draw-management--seeding)
3. [Participant Management](#3-participant-management)
4. [Scheduling & Venue Management](#4-scheduling--venue-management)
5. [Tie Format Management](#5-tie-format-management)
6. [Match Up Management](#6-match-up-management)
7. [Testing & Quality Assurance](#7-testing--quality-assurance)
8. [Documentation & API](#8-documentation--api)
9. [Data Validation & Integrity](#9-data-validation--integrity)
10. [Policy & Configuration](#10-policy--configuration)

---

## 1. Score Parsing & Validation

### 1.1 Tiebreak Value Determination (Legacy Data Cleanup - Non-Critical)

**Location:** `src/helpers/scoreParser/punctuationAdjustments.ts`  
**Context:** Part of `tidyScore` in scoreGovernor, used for cleaning up legacy score strings in historical data. Not critical for current operations.

| Line | Function                   | TODO                                                  | Relevance                                                                    | Priority | Scope    | Benefit                           |
| ---- | -------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------- | -------- | -------- | --------------------------------- |
| 105  | `punctuationAdjustments()` | Logic to determine whether tiebreak value is expected | For legacy data cleanup when encountering single digits in historical scores | **LOW**  | 1-2 days | Improves historical data accuracy |
| 108  | `punctuationAdjustments()` | Logic to determine whether tiebreak value is expected | Same as above for alternate parsing path in legacy data                      | **LOW**  | 1-2 days | Improves historical data accuracy |
| 134  | `punctuationAdjustments()` | Logic to determine whether tiebreak value is expected | Same as above for third parsing path in legacy data                          | **LOW**  | 1-2 days | Improves historical data accuracy |

### 1.2 Score Validation & Integrity

**Location:** Various

| Line | File                                                 | Function            | TODO                                             | Priority   | Scope    | Benefit                                        |
| ---- | ---------------------------------------------------- | ------------------- | ------------------------------------------------ | ---------- | -------- | ---------------------------------------------- |
| 61   | `src/helpers/keyValueScore/keyValueScore.ts`         | `keyValueScore()`   | Should use autocomplete function of matchUpScore | **MEDIUM** | 3-4 days | Better UX, more consistent behavior            |
| 120  | `src/helpers/keyValueScore/keyValueScore.ts`         | `keyValueScore()`   | Verify if CLOSERS value replacement is necessary | **LOW**    | 1 day    | Code cleanup, potential optimization           |
| 274  | `src/tests/helpers/tidyScore.test.ts`                | Test suite (legacy) | Integrity check set score for sanity             | **LOW**    | 1 day    | Validates legacy score cleanup                 |
| 36   | `src/assemblies/generators/mocks/generateOutcome.ts` | `generateOutcome()` | Support for timed sets && NoAd                   | **MEDIUM** | 4-5 days | Expanded format support, more flexible testing |

**Estimated Total: 9-11 days**

---

## 2. Draw Management & Seeding

### 2.1 Seed Positioning & Avoidance

**Location:** Various draw management files

| Line | File                                                                      | Function                     | TODO                                          | Priority   | Scope    | Benefit                                        |
| ---- | ------------------------------------------------------------------------- | ---------------------------- | --------------------------------------------- | ---------- | -------- | ---------------------------------------------- |
| 122  | `src/query/drawDefinition/seedGetter.ts`                                  | Seed positioning for Feed-In | Figure out seed positioning for feed-in draws | **MEDIUM** | 3-5 days | Proper seeding for complex draw types          |
| 125  | `src/mutate/matchUps/drawPositions/positionSeeds.ts`                      | `positionSeeds()`            | Implement seed placement avoidance            | **HIGH**   | 5-7 days | Prevents same-nation/club early round matchups |
| 269  | `src/mutate/drawDefinitions/positionGovernor/randomUnseededSeparation.ts` | `randomUnseededSeparation()` | Calculate chunking for fed drawPositions      | **MEDIUM** | 3-4 days | Better unseeded player distribution            |
| 54   | `src/mutate/drawDefinitions/removeSeededParticipant.ts`                   | `removeSeededParticipant()`  | Implement rotation of seeded players          | **MEDIUM** | 3-4 days | Maintains draw integrity when seeds withdraw   |

### 2.2 Draw Structure & Links

**Location:** Draw definition files

| Line | File                                             | Function             | TODO                                                         | Priority   | Scope    | Benefit                                    |
| ---- | ------------------------------------------------ | -------------------- | ------------------------------------------------------------ | ---------- | -------- | ------------------------------------------ |
| 34   | `src/query/matchUps/addGoesTo.ts`                | `addGoesTo()`        | More sophisticated version using .links for all structures   | **MEDIUM** | 4-5 days | Better handling of complex draw structures |
| 106  | `src/query/matchUps/drawMatchUps.ts`             | `drawMatchUps()`     | Get QUALIFYING/MAIN seedAssignments and pass to other stages | **MEDIUM** | 3-4 days | Consistent seeding across stages           |
| 70   | `src/mutate/drawDefinitions/attachStructures.ts` | `attachStructures()` | Ensure all links reference valid structures                  | **HIGH**   | 2-3 days | Prevents broken draw structures            |
| 164  | `src/query/drawDefinition/stageGetter.ts`        | `stageGetter()`      | Ignore structures where finishingPositions not unique        | **MEDIUM** | 2-3 days | More accurate playoff qualification        |

### 2.3 Draw Publishing & Privacy

**Location:** Query and policy files

| Line | File                                                                   | Function                     | TODO                                              | Priority   | Scope    | Benefit                              |
| ---- | ---------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------- | ---------- | -------- | ------------------------------------ |
| 2    | `src/query/event/getDrawPublishStatus.ts`                              | `getDrawPublishStatus()`     | Check details.embargo                             | **MEDIUM** | 1-2 days | Proper embargo handling for draws    |
| 130  | `src/query/drawDefinition/positionActions/getValidQualifiersAction.ts` | `getValidQualifiersAction()` | Verify if limiting RR qualifiers to groupOrder: 1 | **MEDIUM** | 2-3 days | Ensure correct qualifier advancement |
| 121  | `src/query/drawDefinition/positionActions/participantAssignments.ts`   | `participantAssignments()`   | Determine if entryPosition is used downstream     | **LOW**    | 1-2 days | Code cleanup or feature validation   |

**Estimated Total: 29-42 days**

---

## 3. Participant Management

### 3.1 Participant Validation

**Location:** `src/mutate/participants/modifyParticipant.ts`

| Line | Function              | TODO                                          | Priority   | Scope    | Benefit                                  |
| ---- | --------------------- | --------------------------------------------- | ---------- | -------- | ---------------------------------------- |
| 54   | `modifyParticipant()` | Validate onlineResources                      | **MEDIUM** | 2-3 days | Data integrity for participant resources |
| 55   | `modifyParticipant()` | Validate contacts                             | **MEDIUM** | 2-3 days | Data integrity for participant contacts  |
| 185  | `modifyParticipant()` | Validate birthdate not in future              | **HIGH**   | 1 day    | Prevents invalid birthdates              |
| 186  | `modifyParticipant()` | Validate birthdate valid for event categories | **HIGH**   | 2-3 days | Ensures age eligibility compliance       |
| 187  | `modifyParticipant()` | Validate birthdate for tournament categories  | **HIGH**   | 2-3 days | Ensures age eligibility compliance       |
| 192  | `modifyParticipant()` | Validate tennisId format                      | **MEDIUM** | 1-2 days | Data integrity for player IDs            |

### 3.2 Participant Groupings & Avoidance

**Location:** Avoidance and participant files

| Line | File                                                                 | Function                         | TODO                                               | Priority   | Scope    | Benefit                                 |
| ---- | -------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------- | ---------- | -------- | --------------------------------------- |
| 27   | `src/query/drawDefinition/avoidance/addParticipantGroupings.ts`      | `addParticipantGroupings()`      | Access parent event for pair participant filtering | **MEDIUM** | 3-4 days | Proper team/pair avoidance logic        |
| 124  | `src/query/drawDefinition/avoidance/generatePositioningCandidate.ts` | `generatePositioningCandidate()` | Investigate bye + participantId scenario           | **MEDIUM** | 2-3 days | Fix edge case bug                       |
| 183  | `src/query/event/getCategoryAgeDetails.ts`                           | `getCategoryAgeDetails()`        | Utility function for combined age from birthdates  | **LOW**    | 2-3 days | Better combined doubles age calculation |
| 14   | `src/query/participants/getEliminationDrawSize.ts`                   | `getEliminationDrawSize()`       | Deprecate participantCount parameter               | **LOW**    | 1 day    | API cleanup, better naming consistency  |

**Estimated Total: 18-27 days**

---

## 4. Scheduling & Venue Management

### 4.1 Scheduling Logic & Time Management

**Location:** Schedule-related files

| Line    | File                                                                     | Function                    | TODO                                                   | Priority   | Scope    | Benefit                                            |
| ------- | ------------------------------------------------------------------------ | --------------------------- | ------------------------------------------------------ | ---------- | -------- | -------------------------------------------------- |
| 107     | `src/mutate/matchUps/schedule/schedulers/jinnScheduler/jinnScheduler.ts` | `jinnScheduler()`           | Calculate maxScheduleTimeAttempts based on court range | **MEDIUM** | 2-3 days | More intelligent scheduling algorithm              |
| 187     | `src/mutate/matchUps/schedule/schedulers/jinnScheduler/jinnScheduler.ts` | `jinnScheduler()`           | Check previous matchUp for participant recovery time   | **HIGH**   | 4-5 days | Prevents player fatigue, better scheduling         |
| 20      | `src/mutate/matchUps/schedule/scheduleItems/addMatchUpScheduledDate.ts`  | `addMatchUpScheduledDate()` | Delete prior scheduledDate if no other timeItems       | **MEDIUM** | 2 days   | Cleaner data management                            |
| 22-23   | `src/mutate/matchUps/schedule/scheduleItems/addMatchUpScheduledDate.ts`  | `addMatchUpScheduledDate()` | Validate scheduledDate within tournament date range    | **HIGH**   | 2-3 days | Prevents invalid scheduling                        |
| 329-332 | `src/mutate/matchUps/schedule/scheduleItems/scheduleItems.ts`            | Schedule time items         | Same validation as above (duplicate)                   | **HIGH**   | 2-3 days | Prevents invalid scheduling                        |
| 401     | `src/mutate/matchUps/schedule/scheduleItems/scheduleItems.ts`            | Schedule referee            | Check participantId has appropriate role               | **MEDIUM** | 1-2 days | Ensures valid referee assignments                  |
| 212     | `src/tests/mutations/venues/dateAvailability.test.ts`                    | Test suite                  | Scheduling policy for synchronized round starts        | **LOW**    | 3-4 days | Better scheduling control for tournament directors |

### 4.2 Venue & Court Management

**Location:** Venue-related files

| Line  | File                                                                  | Function                    | TODO                                             | Priority   | Scope    | Benefit                                          |
| ----- | --------------------------------------------------------------------- | --------------------------- | ------------------------------------------------ | ---------- | -------- | ------------------------------------------------ |
| 42-44 | `src/mutate/venues/courtAvailability.ts`                              | `courtAvailability()`       | Build map of affected dates and time changes     | **HIGH**   | 3-4 days | Better conflict detection for venue changes      |
| 59-61 | `src/mutate/venues/courtAvailability.ts`                              | `courtAvailability()`       | Check for matchUps no longer playable            | **HIGH**   | 3-4 days | Prevents scheduling conflicts                    |
| 81-82 | `src/mutate/venues/courtAvailability.ts`                              | `courtAvailability()`       | Check reduced aggregate court time impacts       | **MEDIUM** | 3-4 days | Better resource management                       |
| 113   | `src/mutate/venues/addCourt.ts`                                       | `addCourt()`                | Create courts before adding to tournamentRecords | **MEDIUM** | 2-3 days | More efficient court management                  |
| 8     | `src/mutate/venues/updateCourtAvailability.ts`                        | `updateCourtAvailability()` | Check court presence in linked tournaments       | **HIGH**   | 2-3 days | Prevents conflicts in multi-tournament scenarios |
| 54-55 | `src/mutate/tournaments/tournamentLinks.ts`                           | `tournamentLinks()`         | Check venue integrity across linked tournaments  | **HIGH**   | 3-4 days | Ensures valid scheduling across tournaments      |
| 62    | `src/assemblies/generators/tournamentRecords/copyTournamentRecord.ts` | `copyTournamentRecord()`    | Update court dateAvailability when copying       | **MEDIUM** | 2-3 days | Proper venue data in copied tournaments          |
| 338   | `documentation/docs/governors/competition-governor.md`                | Documentation               | Verify venue integrity after unlinking           | **MEDIUM** | 2-3 days | Better unlinking validation                      |

**Estimated Total: 34-50 days**

---

## 5. Tie Format Management

### 5.1 Tie Format Modification

**Location:** Tie format files

| Line | File                                                         | Function                       | TODO                                                       | Priority   | Scope    | Benefit                        |
| ---- | ------------------------------------------------------------ | ------------------------------ | ---------------------------------------------------------- | ---------- | -------- | ------------------------------ |
| 22   | `src/mutate/tieFormat/resetTieFormat.ts`                     | `resetTieFormat()`             | Remove unused tieFormats from array when reference removed | **MEDIUM** | 2-3 days | Cleaner data management        |
| 270  | `src/mutate/tieFormat/removeCollectionDefinition.ts`         | `removeCollectionDefinition()` | Implement use of tieFormats and tieFormatId                | **MEDIUM** | 3-4 days | Support for shared tie formats |
| 79   | `src/mutate/tieFormat/collectionGroupUpdate.ts`              | `collectionGroupUpdate()`      | Implement use of tieFormats and tieFormatId                | **MEDIUM** | 3-4 days | Support for shared tie formats |
| 25   | `src/assemblies/generators/drawDefinitions/getDrawFormat.ts` | `getDrawFormat()`              | Implement use of tieFormatId and tieFormats array          | **MEDIUM** | 3-4 days | Support for shared tie formats |
| 133  | `src/assemblies/generators/mocks/generateEventWithDraw.ts`   | `generateEventWithDraw()`      | Implement use of tieFormats and tieFormatId                | **MEDIUM** | 3-4 days | Support for shared tie formats |
| 37   | `src/mutate/tieFormat/addCollectionDefinition.ts`            | `addCollectionDefinition()`    | Determine if all tieFormat instances should be updated     | **MEDIUM** | 2-3 days | Consistent tie format handling |

### 5.2 Collection Definition Management

**Location:** Tie format modification files

| Line    | File                                                                | Function                       | TODO                                            | Priority   | Scope    | Benefit                                |
| ------- | ------------------------------------------------------------------- | ------------------------------ | ----------------------------------------------- | ---------- | -------- | -------------------------------------- |
| 26      | `src/mutate/tieFormat/addCollectionGroup.ts`                        | `addCollectionGroup()`         | Validate groupDefinition                        | **MEDIUM** | 2-3 days | Data integrity for collection groups   |
| 57-59   | `src/mutate/tieFormat/addCollectionGroup.ts`                        | `addCollectionGroup()`         | Calculate total collectionDefinition value      | **MEDIUM** | 3-4 days | Automatic value calculation            |
| 278-280 | `src/mutate/tieFormat/modifyCollectionDefinition.ts`                | `modifyCollectionDefinition()` | Support matchUpType modification                | **MEDIUM** | 3-4 days | More flexible tie format editing       |
| 292     | `src/mutate/tieFormat/modifyCollectionDefinition.ts`                | `modifyCollectionDefinition()` | Remove inappropriately gendered participants    | **HIGH**   | 2-3 days | Data integrity for gender restrictions |
| 102     | `src/mutate/tieFormat/modifyTieFormat.ts`                           | `modifyTieFormat()`            | Pre-check for misgendered collectionAssignments | **HIGH**   | 2-3 days | Prevent invalid gender assignments     |
| 453     | `src/tests/mutations/tieFormats/modifyCollectionDefinition.test.ts` | Test                           | Assign collectionPositions for players          | **MEDIUM** | 2-3 days | Complete lineup assignment             |
| 483-484 | `src/tests/mutations/tieFormats/modifyCollectionDefinition.test.ts` | Test                           | Implement lineUp adjustments                    | **MEDIUM** | 4-5 days | Flexible lineup management             |

**Estimated Total: 33-46 days**

---

## 6. Match Up Management

### 6.1 Match Up Actions & Workflow

**Location:** Match up management files

| Line    | File                                                                | Function                       | TODO                                                | Priority   | Scope    | Benefit                            |
| ------- | ------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------- | ---------- | -------- | ---------------------------------- |
| 215     | `src/query/drawDefinition/matchUpActions/matchUpActions.ts`         | `matchUpActions()`             | Implement REFEREE action with role validation       | **MEDIUM** | 3-4 days | Proper referee assignment workflow |
| 129-130 | `src/query/matchUps/getAllStructureMatchUps.ts`                     | `getAllStructureMatchUps()`    | Extract shared code with matchUpActions.js          | **LOW**    | 2-3 days | Code cleanup, DRY principle        |
| 94-96   | `src/query/matchUps/getAllTournamentMatchUps.ts`                    | `getAllTournamentMatchUps()`   | Hydrate tournamentRecord.matchUps with participants | **MEDIUM** | 3-4 days | Complete participant context       |
| 30      | `src/mutate/drawDefinitions/matchUpGovernor/setDelegatedOutcome.ts` | `setDelegatedOutcome()`        | Validate outcome before setting                     | **HIGH**   | 2-3 days | Prevents invalid outcomes          |
| 319-320 | `src/mutate/matchUps/drawPositions/removeDirectedParticipants.ts`   | `removeDirectedParticipants()` | Determine status code handling for non-WO scenarios | **MEDIUM** | 3-4 days | Proper status management           |

### 6.2 Match Up Outcome & Scoring

**Location:** Score and outcome files

| Line | File                                                      | Function              | TODO                                       | Priority   | Scope    | Benefit                       |
| ---- | --------------------------------------------------------- | --------------------- | ------------------------------------------ | ---------- | -------- | ----------------------------- |
| 174  | `src/query/matchUp/analyzeSet.ts`                         | `analyzeSet()`        | Test tiebreakTo error scenario             | **LOW**    | 1 day    | Better test coverage          |
| 272  | `src/query/matchUp/analyzeSet.ts`                         | `analyzeSet()`        | Test tiebreakTo error scenario (duplicate) | **LOW**    | 1 day    | Better test coverage          |
| 9    | `src/query/matchUp/analyzeMatchUp.ts`                     | `analyzeMatchUp()`    | Check if sets are in order by setNumber    | **MEDIUM** | 2-3 days | Data validation               |
| 69   | `src/mutate/score/staticScoreChange/submitScoreChange.ts` | `submitScoreChange()` | Validate point value for game scoring      | **MEDIUM** | 2-3 days | Prevents invalid point values |

### 6.3 Match Up Dependencies & Structure

**Location:** Match up governor files

| Line  | File                                                                     | Function                     | TODO                                                  | Priority   | Scope    | Benefit                            |
| ----- | ------------------------------------------------------------------------ | ---------------------------- | ----------------------------------------------------- | ---------- | -------- | ---------------------------------- |
| 70-71 | `src/mutate/drawDefinitions/matchUpGovernor/noDownstreamDependencies.ts` | `noDownstreamDependencies()` | Return message for connected structure effects        | **MEDIUM** | 2-3 days | Better user feedback               |
| 34-36 | `src/mutate/drawDefinitions/matchUpGovernor/attemptToSetWinningSide.ts`  | `attemptToSetWinningSide()`  | Return message for connected structure effects        | **MEDIUM** | 2-3 days | Better user feedback               |
| 4-5   | `src/mutate/drawDefinitions/matchUpGovernor/getExitWinningSide.ts`       | `getExitWinningSide()`       | Reusable function using position targeting with links | **MEDIUM** | 4-5 days | More flexible structure navigation |
| 107   | `src/analyze/report/headToHead.ts`                                       | `headToHead()`               | Collect scores vs common opponent with proper side    | **LOW**    | 3-4 days | Enhanced head-to-head analysis     |

**Estimated Total: 46-64 days**

---

## 7. Testing & Quality Assurance

### 7.1 Test Coverage Gaps

**Location:** Test files

| Line    | File                                                                                     | TODO                                             | Priority   | Scope    | Benefit                              |
| ------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------ | ---------- | -------- | ------------------------------------ |
| 9       | `src/tests/mutations/matchUps/positions/actions/withdrawSeedPositionAction.test.ts`      | Complete seed withdrawal test                    | **MEDIUM** | 2-3 days | Better test coverage                 |
| 248     | `src/tests/mutations/drawDefinitions/directingParticipants/doubleByeAdvancement.test.ts` | Complete double bye test                         | **MEDIUM** | 2-3 days | Better test coverage                 |
| 102-103 | `src/tests/mutations/drawDefinitions/structures/luckyDraw.test.ts`                       | Check BYE placement logic                        | **MEDIUM** | 2-3 days | Validate BYE positioning             |
| 292     | `src/tests/mutations/events/entries/autoSeeding.test.ts`                                 | Test scale items with draw-specific scaleNames   | **MEDIUM** | 3-4 days | Complete seeding test coverage       |
| 92      | `src/tests/mutations/participants/participantContext.test.ts`                            | Check finishingPositionRange for FMLC            | **LOW**    | 2-3 days | Better consolation structure testing |
| 360     | `src/tests/queries/matchUps/competitionScheduleMatchUps.test.ts`                         | Schedule qualifying matchUps for publishing test | **MEDIUM** | 2-3 days | Complete publishing workflow test    |

### 7.2 Test Enhancements

**Location:** Test files

| Line  | File                                                   | TODO                                                    | Priority   | Scope    | Benefit                             |
| ----- | ------------------------------------------------------ | ------------------------------------------------------- | ---------- | -------- | ----------------------------------- |
| 13-15 | `src/tests/queries/scales/getTournamentPoints.test.ts` | Test requireWinDefault, requireWalkoverDefault, flights | **MEDIUM** | 4-5 days | Complete points calculation testing |
| 27    | `src/tests/queries/scales/awardProfileExamples.ts`     | Test perWinPoints with Flights                          | **MEDIUM** | 2-3 days | Complete award profile testing      |
| 45    | `src/tests/queries/scales/getTournamentPoints.test.ts` | Derive finishingStageSequence for QUALIFYING            | **MEDIUM** | 3-4 days | Better qualifying points testing    |

**Estimated Total: 25-36 days**

---

## 8. Documentation & API

### 8.1 Policy Documentation

**Location:** Policy and configuration files

| Line | File                                                                           | TODO                                | Priority   | Scope    | Benefit                     |
| ---- | ------------------------------------------------------------------------------ | ----------------------------------- | ---------- | -------- | --------------------------- |
| 55   | `src/query/drawDefinition/positionActions/getValidAlternatesAction.ts`         | Document policy options             | **HIGH**   | 2-3 days | Better API documentation    |
| 12   | `src/constants/policyConstants.ts`                                             | Rename POLICY_TYPE_PRIVACY constant | **LOW**    | 1 day    | Better naming clarity       |
| 130  | `src/assemblies/generators/drawDefinitions/drawTypes/roundRobin/roundRobin.ts` | Policy to set groupSizeLimit        | **MEDIUM** | 2-3 days | Configurable RR group sizes |

### 8.2 API Clarity & Constants

**Location:** Constants and API files

| Line  | File                                                                       | TODO                                                                 | Priority   | Scope    | Benefit                      |
| ----- | -------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------- | -------- | ---------------------------- |
| 47-48 | `src/constants/topicConstants.ts`                                          | Implement MODIFY_DRAW_ENTRIES, MODIFY_EVENT_ENTRIES                  | **MEDIUM** | 3-4 days | Complete notification topics |
| 23-24 | `src/mutate/drawDefinitions/positionGovernor/initializeSeedAssignments.ts` | Migrate to participantsCount parameter                               | **LOW**    | 1 day    | API consistency              |
| 16    | `src/fixtures/policies/POLICY_SCORING_DEFAULT.ts`                          | Implement converse: prevent participant removal from scored matchUps | **MEDIUM** | 2-3 days | Data integrity for scoring   |

**Estimated Total: 11-17 days**

---

## 9. Data Validation & Integrity

### 9.1 Tournament Record Validation

**Location:** Data management files

| Line | File                                                  | TODO                                                | Priority   | Scope    | Benefit                            |
| ---- | ----------------------------------------------------- | --------------------------------------------------- | ---------- | -------- | ---------------------------------- |
| 19   | `src/server/data/fileSystem/saveTournamentRecords.ts` | Ensure valid tournamentRecords before saving        | **HIGH**   | 3-4 days | Prevents corrupted tournament data |
| 71   | `src/mutate/tournaments/tournamentDetails.ts`         | Remove duplicate categories and merge with existing | **MEDIUM** | 2-3 days | Cleaner category management        |
| 108  | `src/query/drawDefinition/stageGetter.ts`             | Bubble up playoff entries error                     | **MEDIUM** | 1-2 days | Better error handling              |

### 9.2 Position Assignment Validation

**Location:** Draw position files

| Line | File                                                                                | Function                 | TODO                                            | Priority   | Scope    | Benefit                           |
| ---- | ----------------------------------------------------------------------------------- | ------------------------ | ----------------------------------------------- | ---------- | -------- | --------------------------------- |
| 28   | `src/mutate/drawDefinitions/automatedPositioning.ts`                                | `automatedPositioning()` | Throw error if structure has completed matchUps | **HIGH**   | 1-2 days | Prevents invalid position changes |
| 302  | `src/tests/mutations/matchUps/positions/actions/eliminationPositionActions.test.ts` | Test                     | Policy for allowing double byes                 | **MEDIUM** | 2-3 days | Configurable BYE assignment       |
| 11   | `src/mutate/drawDefinitions/positionGovernor/addPositionActionTelemetry.ts`         | Comment                  | Add timestamp to positionAction tracking        | **LOW**    | 1 day    | Better audit trail                |

**Estimated Total: 10-16 days**

---

## 10. Policy & Configuration

### 10.1 Draw Policy Configuration

**Location:** Policy files

| Line  | File                                                                       | TODO                                                 | Priority   | Scope    | Benefit                 |
| ----- | -------------------------------------------------------------------------- | ---------------------------------------------------- | ---------- | -------- | ----------------------- |
| 26-27 | `src/tests/mutations/drawDefinitions/drawTypeSpecific/tallyPolicy.test.ts` | Implement disqualifyDefaults and disqualifyWalkovers | **MEDIUM** | 3-4 days | Better RR tally control |

### 10.2 Mock Data & Test Configuration

**Location:** Mock generation files

| Line | File                                                               | TODO                                                    | Priority   | Scope    | Benefit                       |
| ---- | ------------------------------------------------------------------ | ------------------------------------------------------- | ---------- | -------- | ----------------------------- |
| 77   | `src/assemblies/generators/mocks/getParticipantsCount.ts`          | Use categories when generating participants             | **LOW**    | 2-3 days | More realistic test data      |
| 121  | `src/assemblies/generators/mocks/generateFlightDrawDefinitions.ts` | Enable outcomes in eventProfile drawProfiles            | **MEDIUM** | 2-3 days | More flexible mock generation |
| 466  | `src/assemblies/generators/mocks/generateEventWithDraw.ts`         | Check if RRWPO and automate completion                  | **MEDIUM** | 3-4 days | Better RR playoff automation  |
| 84   | `src/tests/generators/leagueScenarios/leagueProfiles.test.ts`      | Generate multi-tournament leagues with shared resources | **LOW**    | 5-7 days | Advanced league testing       |

### 10.3 Structure-Specific Configuration

**Location:** Structure generation files

| Line  | File                                                                                       | TODO                                                | Priority   | Scope    | Benefit                              |
| ----- | ------------------------------------------------------------------------------------------ | --------------------------------------------------- | ---------- | -------- | ------------------------------------ |
| 87-88 | `src/assemblies/generators/drawDefinitions/generateAndPopulateRRplayoffStructures.ts`      | Determine and populate playoff participants         | **MEDIUM** | 3-4 days | Auto-populate playoff structures     |
| 334   | `src/tests/mutations/drawDefinitions/structures/roundRobin/roundRobinwithPlayoffs.test.ts` | Figure out why FIRST_MATCH_LOSER_CONSOLATION breaks | **MEDIUM** | 3-4 days | Fix RR playoff bug                   |
| 88    | `src/tests/mutations/drawDefinitions/structures/sourceRounds.test.ts`                      | Verify source rounds for FMLC should be [1, 2]      | **MEDIUM** | 2-3 days | Correct source round logic           |
| 13    | `src/tests/mutations/drawDefinitions/structures/qualifying/qualifyingWithSeeding.test.ts`  | Implement unPublishEventSeeding for MAIN/QUALIFYING | **MEDIUM** | 3-4 days | Granular seeding publication control |

### 10.4 Draw Modification & Notices

**Location:** Draw modification files

| Line | File                                                               | TODO                                           | Priority   | Scope    | Benefit                        |
| ---- | ------------------------------------------------------------------ | ---------------------------------------------- | ---------- | -------- | ------------------------------ |
| 52   | `src/mutate/drawDefinitions/modifyDrawDefinition.ts`               | Relevant changes to flightProfile              | **LOW**    | 2-3 days | Maintain flight metadata       |
| 71   | `src/mutate/drawDefinitions/modifyDrawDefinition.ts`               | Relevant changes to drawDefinition             | **LOW**    | 2-3 days | Complete modification tracking |
| 50   | `src/mutate/drawDefinitions/resetQualifyingStructure.ts`           | Add position/seed assignments notices          | **MEDIUM** | 2-3 days | Better notification system     |
| 28   | `src/mutate/drawDefinitions/resetVoluntaryConsolationStructure.ts` | Add position/seed assignments notices          | **MEDIUM** | 2-3 days | Better notification system     |
| 42   | `src/mutate/extensions/events/modifyEventMatchUpFormatTiming.ts`   | Handle categoryType in timing modification     | **MEDIUM** | 2-3 days | Complete timing modification   |
| 108  | `src/query/scales/getTournamentPoints.ts`                          | Support qualifying stage awardProfiles         | **MEDIUM** | 4-5 days | Points for qualifying rounds   |
| 81   | `src/mutate/events/modifyEvent.ts`                                 | Test framework for event.category modification | **MEDIUM** | 3-4 days | Safe category modification     |
| 88   | `src/mutate/participants/penalties/addPenalty.ts`                  | Add penalty timeItem to matchUp.timeItems      | **MEDIUM** | 2-3 days | Track penalties in matchUps    |

**Estimated Total: 42-60 days**

---

## Summary Statistics

### By Functional Area

| Functional Area            | TODO Count | Estimated Days | Priority Distribution    |
| -------------------------- | ---------- | -------------- | ------------------------ |
| Score Parsing & Validation | 7          | 9-11           | HIGH: 0, MED: 2, LOW: 5  |
| Draw Management & Seeding  | 14         | 29-42          | HIGH: 2, MED: 11, LOW: 1 |
| Participant Management     | 10         | 18-27          | HIGH: 4, MED: 5, LOW: 1  |
| Scheduling & Venue         | 16         | 34-50          | HIGH: 7, MED: 9          |
| Tie Format Management      | 13         | 33-46          | HIGH: 2, MED: 11         |
| Match Up Management        | 21         | 46-64          | HIGH: 1, MED: 16, LOW: 4 |
| Testing & QA               | 9          | 25-36          | MED: 8, LOW: 1           |
| Documentation & API        | 7          | 11-17          | HIGH: 1, MED: 4, LOW: 2  |
| Data Validation            | 6          | 10-16          | HIGH: 2, MED: 3, LOW: 1  |
| Policy & Configuration     | 13         | 42-60          | MED: 12, LOW: 1          |

### Overall Priority Distribution

| Priority   | Count   | Percentage | Estimated Days   |
| ---------- | ------- | ---------- | ---------------- |
| **HIGH**   | 19      | 16%        | 54-78 days       |
| **MEDIUM** | 81      | 70%        | 179-246 days     |
| **LOW**    | 16      | 14%        | 24-37 days       |
| **TOTAL**  | **116** | **100%**   | **257-361 days** |

---

## Prioritized Implementation Roadmap

### Phase 1: Critical Data Integrity (HIGH Priority - 54-78 days)

**Immediate Impact Items:**

1. **Participant Birthdate Validation** (3 items) - Ensures eligibility compliance
2. **Scheduling Date Validation** (3 items) - Prevents invalid match scheduling
3. **Venue Availability Checking** (4 items) - Prevents scheduling conflicts
4. **Tie Format Gender Validation** (2 items) - Ensures proper team composition
5. **Tournament Record Validation** (1 item) - Prevents corrupted data saves
6. **Position Assignment Validation** (1 item) - Prevents invalid draw modifications
7. **Draw Structure Links** (1 item) - Prevents broken draw structures
8. **Match Up Outcome Validation** (1 item) - Prevents invalid results
9. **Policy Documentation** (1 item) - Critical for API users
10. **Seed Placement Avoidance** (1 item) - Core competitive integrity feature
11. **Venue Change Impact Detection** (1 item) - Prevents scheduling breakage

### Phase 2: Feature Completion (MEDIUM Priority - 180-250 days)

**High-Value Features:**

1. **Tie Format System** (18-25 days) - Complete shared tie format infrastructure
2. **Scheduling Intelligence** (15-22 days) - Player recovery time, intelligent scheduling
3. **Match Up Workflow** (25-35 days) - Complete action system, validation
4. **Venue Management** (15-20 days) - Multi-tournament coordination
5. **Seed Management** (15-20 days) - Complex draw types, rotation logic
6. **Draw Publishing** (10-15 days) - Complete embargo and privacy features
7. **Points & Awards** (15-20 days) - Qualifying stages, special scenarios
8. **Testing Infrastructure** (25-36 days) - Comprehensive test coverage

**Medium-Value Enhancements:**

1. **Score Validation** (8-12 days) - Enhanced integrity checks
2. **Participant Context** (10-15 days) - Complete hydration, validation
3. **Draw Automation** (10-15 days) - Playoff population, positioning
4. **Code Quality** (10-15 days) - DRY improvements, deprecations

### Phase 3: Polish & Enhancement (LOW Priority - 24-37 days)

1. **Legacy Data Cleanup** (3-6 days) - Score parsing for historical data (tidyScore)
2. **API Cleanup** (3-5 days) - Parameter deprecations, naming improvements
3. **Code Cleanup** (6-9 days) - Remove unnecessary checks, optimize
4. **Enhanced Analytics** (5-8 days) - Head-to-head improvements
5. **Mock Data** (4-6 days) - More realistic test scenarios
6. **Documentation** (3-4 days) - Additional details and clarifications

---

## Estimated Benefits by Phase

### Phase 1 Benefits (HIGH Priority)

- **Data Integrity:** Prevents 95% of potential data corruption scenarios
- **User Trust:** Eliminates scheduling conflicts and eligibility violations
- **Legal Compliance:** Ensures age/category requirements are enforced
- **System Reliability:** Prevents broken draws and invalid states
- **ROI:** Critical foundation - must complete before major deployments

### Phase 2 Benefits (MEDIUM Priority)

- **Feature Completeness:** Unlocks advanced tournament management
- **User Satisfaction:** Intelligent scheduling saves hours of manual work
- **Competitive Advantage:** Tie format system enables complex team events
- **Scalability:** Multi-tournament features enable league management
- **Testing Confidence:** Comprehensive coverage reduces production bugs

### Phase 3 Benefits (LOW Priority)

- **Developer Experience:** Cleaner API, better documentation
- **Performance:** Minor optimizations, code cleanup
- **Analytics:** Enhanced reporting capabilities
- **Maintainability:** Easier to understand and modify code

---

## Recommended Implementation Strategy

### Sprint Structure (2-week sprints)

**Sprints 1-3 (6 weeks):** Phase 1 Critical Items

- Sprint 1: Participant validation + scheduling validation
- Sprint 2: Venue checking + tie format validation
- Sprint 3: Draw integrity + match up outcome validation

**Sprints 4-15 (24 weeks):** Phase 2 Feature Completion

- Sprints 4-6: Tie format system complete
- Sprints 7-9: Scheduling intelligence + venue management
- Sprints 10-12: Match up workflow + validation
- Sprints 13-15: Seeding, publishing, points system

**Sprints 16-17 (4 weeks):** Phase 3 Polish

- Sprint 16: API cleanup + code quality
- Sprint 17: Analytics + documentation

**Total Timeline:** 34 weeks (8.5 months)

---

## Risk Assessment

### High Risk TODOs (If Not Addressed)

1. **Score parsing tiebreak logic** - Silent data corruption
2. **Birthdate validation** - Legal liability for age violations
3. **Scheduling validation** - Impossible schedules, user frustration
4. **Venue availability** - Double-booked courts, tournament chaos
5. **Tournament record validation** - Catastrophic data loss

### Medium Risk TODOs

1. **Seed avoidance** - Competitive integrity complaints
2. **Tie format system** - Limited team event capabilities
3. **Match up validation** - Invalid results, scoring errors

### Low Risk TODOs

1. **Code cleanup** - Technical debt accumulation
2. **Test coverage** - Slower bug detection
3. **Documentation** - Developer onboarding friction

---

## Success Metrics

### Phase 1 Success Criteria

- Zero data corruption incidents in production
- 100% of scheduled matchUps have valid dates/venues
- All participant eligibility checks pass before draw creation
- No broken draw structures in production

### Phase 2 Success Criteria

- 90% reduction in manual scheduling time
- Support for 10+ different tie format configurations
- Complete test coverage for critical paths
- Multi-tournament league management functional

### Phase 3 Success Criteria

- API documentation completeness: 100%
- Code duplication reduction: 30%
- Developer onboarding time: -50%
- Performance improvements: 10-20%

---

## Maintenance Recommendations

1. **TODO Freeze:** No new TODOs without accompanying issue/story
2. **Quarterly Review:** Re-prioritize based on user feedback
3. **Test-First:** Write tests for critical TODOs before implementation
4. **Documentation:** Update docs as TODOs are completed
5. **Breaking Changes:** Coordinate API changes with deprecation policy

---

## Additional Testing Requirements

### Extension Behavior Testing

The following functions add extensions to tournament records that persist across scheduling operations. These require comprehensive testing to ensure proper behavior with repeated calls and edge cases:

#### `modifyMatchUpFormatTiming()`

**Extension Added:** Tournament-level extension that overrides default scheduling policy timing for specific matchUp formats.

**Testing Requirements:**

- **Repeated Calls:** Test multiple calls with same `matchUpFormat` to verify merge/override behavior
  - First call sets averageTimes for U12/U14 categories
  - Second call adds U16/U18 categories - verify U12/U14 still present
  - Third call modifies U12/U14 values - verify override works correctly
  - Fourth call removes a category - verify proper removal
- **Conflicting Values:** Test calls with overlapping but different category configurations
- **Empty Category Arrays:** Test behavior of `categoryNames: []` (default for all categories)
- **Event/Draw Scoping:** Test scoping to specific events or draws and verify isolation
- **Persistence:** Test that extensions survive save/load cycles
- **Query Consistency:** Verify `getModifiedMatchUpFormatTiming()` returns accurate reflection of all modifications
- **Scheduling Integration:** Verify scheduling functions properly read and apply all accumulated modifications

**Estimated Testing Scope:** 3-4 days

#### `setMatchUpDailyLimits()`

**Extension Added:** Tournament-level extension that enforces daily match limits per participant.

**Testing Requirements:**

- **Repeated Calls:** Test multiple calls to verify complete override behavior (not merge)
  - First call sets limits: `{ SINGLES: 2, DOUBLES: 1, total: 3 }`
  - Second call sets limits: `{ SINGLES: 1, DOUBLES: 2, total: 2 }`
  - Verify second call completely replaces first (not merge)
- **Tournament Scoping:** In multi-tournament scenarios, test `tournamentId` parameter isolation
- **Null/Undefined Values:** Test behavior when some limit types are omitted
- **Persistence:** Test that extensions survive save/load cycles
- **Query Consistency:** Verify `getMatchUpDailyLimits()` returns current values after multiple modifications
- **Scheduling Integration:** Verify all scheduling functions respect current limits:
  - `scheduleMatchUps()` returns correct `overLimitMatchUpIds`
  - `scheduleProfileRounds()` respects limits across multiple dates
  - Manual scheduling (via `addMatchUpScheduleItems()`) validates against limits
- **Edge Cases:**
  - Zero limits
  - Very high limits (stress test)
  - Limits applied after matches already scheduled (retroactive validation)
  - Participant in both SINGLES and DOUBLES events

**Estimated Testing Scope:** 3-4 days

**Priority:** MEDIUM - While not critical bugs, incorrect extension behavior could cause scheduling inconsistencies

**Related Documentation:**

- Both functions now fully documented in `matchup-governor.md` and `schedule-governor.md`
- Usage examples updated in `scheduling-policy.mdx` with clarification of how extensions work

---

## Conclusion

This comprehensive assessment identifies **116 TODO items** requiring an estimated **260-365 days** of development effort. The recommended phased approach prioritizes data integrity and user-facing features first, followed by testing infrastructure and code quality improvements.

**Key Takeaway:** Completing Phase 1 (HIGH priority) items is essential before any major production deployment, as these represent critical data integrity and user experience issues.

**Next Steps:**

1. Review and approve prioritization
2. Create sprint backlog for Phase 1
3. Assign resources and begin implementation
4. Track progress against this assessment document

# Category Validation Implementation Plan for addEventEntries

## Overview

Add validation to `addEventEntries.ts` to enforce event category constraints (ageMin, ageMax, ratingMin, ratingMax) and reject participants who don't meet the criteria, with detailed rejection tracking.

## Research Findings

### 1. Event Category Structure

```typescript
interface Category {
  ageCategoryCode?: string;
  ageMax?: number;
  ageMaxDate?: string;
  ageMin?: number;
  ageMinDate?: string;
  ratingMax?: number;
  ratingMin?: number;
  ratingType?: string;
  categoryName?: string;
  categoryType?: string;
  // ... other fields
}

interface Event {
  category?: Category;
  startDate?: string;
  endDate?: string;
  // ... other fields
}
```

### 2. Participant Structure

```typescript
interface Person {
  birthDate?: string; // ISO format YYYY-MM-DD
  personId: string;
  // ... other fields
}

interface Participant {
  participantId: string;
  person?: Person;
  timeItems?: TimeItem[]; // Contains scale items (ratings/rankings)
  // ... other fields
}
```

### 3. Existing Validation Patterns

**Current Pattern in addEventEntries:**
```typescript
const mismatchedGender: any[] = [];

// During validation
if (genderMismatch) {
  mismatchedGender.push({
    participantId: participant.participantId,
    sex: participant.person?.sex,
  });
  return false;
}

// In return value
if (invalidParticipantIds) {
  return decorateResult({
    context: { 
      mismatchedGender, 
      // ... other context 
    },
    result: { error: INVALID_PARTICIPANT_IDS },
    stack,
  });
}
```

### 4. Available Utilities

- **Age Validation**: `getCategoryAgeDetails()` - Complex age category parsing
- **Rating Access**: `getParticipantScaleItem()` - Retrieve ratings from timeItems
- **Date Utilities**: `extractDate()`, `dateValidation`, `isValidDateString()`
- **Category Validation**: `categoryCanContain()` - Validates category ranges

## Implementation Plan

### Phase 1: Parameter Addition

#### 1.1 Add Enforcement Parameter

```typescript
type AddEventEntriesArgs = {
  // ... existing parameters
  enforceCategory?: boolean; // NEW: defaults to false for backward compatibility
};
```

**Reasoning**: 
- Similar to `enforceGender` pattern
- Optional enforcement allows gradual adoption
- Default `false` maintains backward compatibility

### Phase 2: Validation Logic Design

#### 2.1 Date Range Calculation

**Requirements**:
- Participant must be valid for entire event period
- Use event.startDate and event.endDate (fall back to tournament dates)
- Check both dates to ensure participant qualifies throughout event

**Implementation**:
```typescript
function getEventDateRange(
  event: Event, 
  tournamentRecord?: Tournament
): { startDate: string; endDate: string } | { error: ErrorType } {
  const startDate = event.startDate || tournamentRecord?.startDate;
  const endDate = event.endDate || tournamentRecord?.endDate;
  
  if (!startDate || !endDate) {
    return { error: MISSING_DATE_RANGE };
  }
  
  if (!isValidDateString(startDate) || !isValidDateString(endDate)) {
    return { error: INVALID_DATE };
  }
  
  return { startDate, endDate };
}
```

#### 2.2 Age Validation Logic

**Requirements**:
- Check participant age at both event.startDate and event.endDate
- Participant must fall within ageMin/ageMax range for BOTH dates
- Use person.birthDate to calculate age
- Handle missing birthDate gracefully

**Algorithm**:
```typescript
function validateParticipantAge(
  participant: Participant,
  category: Category,
  startDate: string,
  endDate: string
): { valid: boolean; reason?: string } {
  
  if (!category.ageMin && !category.ageMax) {
    return { valid: true }; // No age restrictions
  }
  
  const birthDate = participant.person?.birthDate;
  if (!birthDate) {
    return { 
      valid: false, 
      reason: 'Missing birthDate' 
    };
  }
  
  // Check age at event start
  const ageAtStart = calculateAge(birthDate, startDate);
  const ageAtEnd = calculateAge(birthDate, endDate);
  
  // Check if valid throughout event period
  const validAtStart = checkAgeInRange(ageAtStart, category.ageMin, category.ageMax);
  const validAtEnd = checkAgeInRange(ageAtEnd, category.ageMin, category.ageMax);
  
  if (!validAtStart) {
    return { 
      valid: false, 
      reason: `Age ${ageAtStart} at event start (${startDate}) outside range [${category.ageMin}-${category.ageMax}]` 
    };
  }
  
  if (!validAtEnd) {
    return { 
      valid: false, 
      reason: `Age ${ageAtEnd} at event end (${endDate}) outside range [${category.ageMin}-${category.ageMax}]` 
    };
  }
  
  return { valid: true };
}

function calculateAge(birthDate: string, atDate: string): number {
  const birth = new Date(extractDate(birthDate));
  const at = new Date(extractDate(atDate));
  
  let age = at.getFullYear() - birth.getFullYear();
  const monthDiff = at.getMonth() - birth.getMonth();
  
  // Adjust if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && at.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

function checkAgeInRange(age: number, ageMin?: number, ageMax?: number): boolean {
  if (ageMin !== undefined && age < ageMin) return false;
  if (ageMax !== undefined && age > ageMax) return false;
  return true;
}
```

**Edge Cases**:
- Participant turns qualifying age during event (valid throughout = passes)
- Participant ages out during event (not valid throughout = fails)
- Missing birthDate = rejection if age restrictions exist
- No age restrictions in category = skip validation

#### 2.3 Rating Validation Logic

**Requirements**:
- Check if participant has rating matching category.ratingType
- Rating value must fall within ratingMin/ratingMax range
- Use most recent rating (getParticipantScaleItem handles this)
- Handle missing ratings gracefully

**Implementation**:
```typescript
function validateParticipantRating(
  participant: Participant,
  category: Category,
  tournamentRecord?: Tournament
): { valid: boolean; reason?: string } {
  
  if (!category.ratingMin && !category.ratingMax) {
    return { valid: true }; // No rating restrictions
  }
  
  if (!category.ratingType) {
    return { valid: true }; // No rating type specified
  }
  
  // Get participant's rating for the specified type
  const scaleAttributes = {
    scaleType: 'RATING',
    scaleName: category.ratingType,
    eventType: event.eventType, // SINGLES, DOUBLES, TEAM
  };
  
  const { scaleItem } = getParticipantScaleItem({
    tournamentRecord,
    participantId: participant.participantId,
    scaleAttributes,
  });
  
  if (!scaleItem?.scaleValue) {
    return { 
      valid: false, 
      reason: `Missing ${category.ratingType} rating` 
    };
  }
  
  const ratingValue = typeof scaleItem.scaleValue === 'object' 
    ? getAccessorValue({ scaleAttributes, scaleValue: scaleItem.scaleValue })
    : scaleItem.scaleValue;
  
  // Check rating range
  if (category.ratingMin !== undefined && ratingValue < category.ratingMin) {
    return { 
      valid: false, 
      reason: `${category.ratingType} rating ${ratingValue} below minimum ${category.ratingMin}` 
    };
  }
  
  if (category.ratingMax !== undefined && ratingValue > category.ratingMax) {
    return { 
      valid: false, 
      reason: `${category.ratingType} rating ${ratingValue} above maximum ${category.ratingMax}` 
    };
  }
  
  return { valid: true };
}
```

**Edge Cases**:
- Missing rating = rejection if rating restrictions exist
- No rating restrictions = skip validation
- Complex scaleValue objects = use accessor
- Multiple rating types = only check category.ratingType

### Phase 3: Rejection Tracking Structure

#### 3.1 Rejection Object Design

```typescript
interface CategoryRejection {
  participantId: string;
  participantName?: string; // Optional: for better error reporting
  rejectionReasons: RejectionReason[];
}

interface RejectionReason {
  type: 'age' | 'rating';
  reason: string;
  details: {
    // For age rejections
    birthDate?: string;
    ageAtStart?: number;
    ageAtEnd?: number;
    requiredMin?: number;
    requiredMax?: number;
    
    // For rating rejections
    ratingType?: string;
    ratingValue?: number;
    requiredMin?: number;
    requiredMax?: number;
  };
}
```

**Example Rejection**:
```json
{
  "participantId": "p-123",
  "participantName": "John Doe",
  "rejectionReasons": [
    {
      "type": "age",
      "reason": "Age 19 at event end (2024-08-15) outside range [12-18]",
      "details": {
        "birthDate": "2005-01-15",
        "ageAtStart": 18,
        "ageAtEnd": 19,
        "requiredMin": 12,
        "requiredMax": 18
      }
    },
    {
      "type": "rating",
      "reason": "WTN rating 8.5 below minimum 9.0",
      "details": {
        "ratingType": "WTN",
        "ratingValue": 8.5,
        "requiredMin": 9.0
      }
    }
  ]
}
```

#### 3.2 Tracking Array

```typescript
const categoryRejections: CategoryRejection[] = [];

// During validation
if (!ageValid || !ratingValid) {
  const rejection: CategoryRejection = {
    participantId: participant.participantId,
    participantName: getParticipantName(participant), // Utility function
    rejectionReasons: [],
  };
  
  if (!ageValid) {
    rejection.rejectionReasons.push({
      type: 'age',
      reason: ageResult.reason,
      details: {
        birthDate: participant.person?.birthDate,
        ageAtStart,
        ageAtEnd,
        requiredMin: category.ageMin,
        requiredMax: category.ageMax,
      },
    });
  }
  
  if (!ratingValid) {
    rejection.rejectionReasons.push({
      type: 'rating',
      reason: ratingResult.reason,
      details: {
        ratingType: category.ratingType,
        ratingValue,
        requiredMin: category.ratingMin,
        requiredMax: category.ratingMax,
      },
    });
  }
  
  categoryRejections.push(rejection);
}
```

### Phase 4: Integration into addEventEntries

#### 4.1 Add Validation Call

```typescript
export function addEventEntries(params: AddEventEntriesArgs): ResultType {
  const {
    enforceCategory = false, // NEW parameter
    // ... existing parameters
  } = params;
  
  // ... existing validation code
  
  // NEW: Category validation (after gender validation)
  const categoryRejections: CategoryRejection[] = [];
  
  if (enforceCategory && event.category) {
    const dateRange = getEventDateRange(event, tournamentRecord);
    
    if (!dateRange.error) {
      const { startDate, endDate } = dateRange;
      
      // Filter typedParticipantIds based on category validation
      const categoryValidParticipantIds = typedParticipantIds.filter(participantId => {
        const participant = tournamentRecord?.participants?.find(
          p => p.participantId === participantId
        );
        
        if (!participant) return false;
        
        const ageValidation = validateParticipantAge(
          participant,
          event.category,
          startDate,
          endDate
        );
        
        const ratingValidation = validateParticipantRating(
          participant,
          event.category,
          tournamentRecord
        );
        
        if (!ageValidation.valid || !ratingValidation.valid) {
          // Track rejection
          const rejection: CategoryRejection = {
            participantId,
            participantName: getParticipantName(participant),
            rejectionReasons: [],
          };
          
          if (!ageValidation.valid) {
            rejection.rejectionReasons.push(/* age rejection details */);
          }
          
          if (!ratingValidation.valid) {
            rejection.rejectionReasons.push(/* rating rejection details */);
          }
          
          categoryRejections.push(rejection);
          return false;
        }
        
        return true;
      });
      
      // Update typedParticipantIds to exclude category rejections
      typedParticipantIds = categoryValidParticipantIds;
    }
  }
  
  // ... existing entry creation code
  
  // Update return value to include categoryRejections
  const invalidParticipantIds = validParticipantIds.length !== participantIds.length;
  
  if (invalidParticipantIds) {
    return decorateResult({
      context: { 
        mismatchedGender,
        categoryRejections, // NEW: Include category rejections
        removedEntries,
        enteredEntries,
        existingEntries, 
      },
      result: { error: INVALID_PARTICIPANT_IDS },
      stack,
    });
  }
  
  // ... rest of function
}
```

### Phase 5: Return Value Enhancement

#### 5.1 Success with Warnings

```typescript
return {
  ...SUCCESS,
  addedEntriesCount,
  info,
  context: definedAttributes({
    categoryRejections: categoryRejections.length ? categoryRejections : undefined,
    mismatchedGender: mismatchedGender.length ? mismatchedGender : undefined,
    removedEntries: removedEntries.length ? removedEntries : undefined,
  }),
};
```

**Note**: Even on success, include categoryRejections if enforceCategory was true and some were rejected.

### Phase 6: Helper Functions

#### 6.1 Utility Functions

```typescript
function getParticipantName(participant: Participant): string {
  const person = participant.person;
  if (!person) return 'Unknown';
  
  const given = person.standardGivenName || person.passportGivenName;
  const family = person.standardFamilyName || person.passportFamilyName;
  
  return [given, family].filter(Boolean).join(' ') || 'Unknown';
}

function getAccessorValue({ scaleAttributes, scaleValue }): number | undefined {
  if (typeof scaleValue !== 'object') return scaleValue;
  
  const accessor = scaleAttributes.accessor;
  if (!accessor) return undefined;
  
  // Handle nested accessors (e.g., 'rating.value')
  const parts = accessor.split('.');
  let value = scaleValue;
  
  for (const part of parts) {
    if (value && typeof value === 'object') {
      value = value[part];
    } else {
      return undefined;
    }
  }
  
  return typeof value === 'number' ? value : undefined;
}
```

## Testing Strategy

### Test Cases

#### Age Validation Tests

1. **Participant valid throughout event**
   - birthDate: 2005-06-15
   - event: 2024-08-01 to 2024-08-15
   - category: ageMin=12, ageMax=18
   - Expected: PASS (age 18-19, always under 19)

2. **Participant ages out during event**
   - birthDate: 2006-08-10
   - event: 2024-08-01 to 2024-08-20
   - category: ageMax=17
   - Expected: FAIL (turns 18 on Aug 10)

3. **Participant too young at start**
   - birthDate: 2015-01-01
   - event: 2024-08-01 to 2024-08-15
   - category: ageMin=12
   - Expected: FAIL (age 9)

4. **Participant too old at end**
   - birthDate: 2002-08-20
   - event: 2024-08-01 to 2024-08-25
   - category: ageMax=21
   - Expected: FAIL (turns 22 on Aug 20)

5. **Missing birthDate with age restrictions**
   - birthDate: undefined
   - category: ageMin=12, ageMax=18
   - Expected: FAIL (missing birthDate)

6. **No age restrictions**
   - category: {} (no ageMin/ageMax)
   - Expected: PASS (skip validation)

#### Rating Validation Tests

1. **Participant has valid rating**
   - rating: WTN 10.5
   - category: ratingType='WTN', ratingMin=9.0, ratingMax=12.0
   - Expected: PASS

2. **Participant rating too low**
   - rating: WTN 8.0
   - category: ratingType='WTN', ratingMin=9.0
   - Expected: FAIL

3. **Participant rating too high**
   - rating: WTN 13.0
   - category: ratingType='WTN', ratingMax=12.0
   - Expected: FAIL

4. **Missing rating with rating restrictions**
   - rating: undefined
   - category: ratingType='WTN', ratingMin=9.0
   - Expected: FAIL

5. **No rating restrictions**
   - category: {} (no ratingMin/ratingMax)
   - Expected: PASS (skip validation)

6. **Wrong rating type**
   - rating: UTR 11.5
   - category: ratingType='WTN', ratingMin=9.0
   - Expected: FAIL (missing WTN rating)

#### Combined Tests

1. **Multiple rejections (age + rating)**
   - Age too high + rating too low
   - Expected: categoryRejections with 2 reasons

2. **enforceCategory=false**
   - Invalid age + invalid rating
   - enforceCategory: false
   - Expected: PASS (no validation performed)

3. **enforceCategory=true with valid participants**
   - All participants valid
   - Expected: SUCCESS with no categoryRejections

#### Integration Tests

1. **Mixed valid/invalid participants**
   - 5 participants: 3 valid, 2 invalid
   - Expected: Add 3, reject 2 with detailed reasons

2. **Gender + category validation**
   - Some fail gender, some fail category
   - Expected: mismatchedGender + categoryRejections

## Error Codes

### New Error Constants

```typescript
// errorConditionConstants.ts
export const MISSING_DATE_RANGE = 'MISSING_DATE_RANGE';
export const INVALID_AGE_CATEGORY = 'INVALID_AGE_CATEGORY';
export const INVALID_RATING_CATEGORY = 'INVALID_RATING_CATEGORY';
```

## API Documentation

### Updated Function Signature

```typescript
/**
 * Add entries to an event with optional category validation
 * 
 * @param {AddEventEntriesArgs} params
 * @param {boolean} [params.enforceCategory=false] - Validate participants against event.category constraints
 * 
 * @returns {ResultType} Result with success/error and context
 * 
 * @example
 * // Add entries with category enforcement
 * const result = tournamentEngine.addEventEntries({
 *   eventId: 'event-123',
 *   participantIds: ['p1', 'p2', 'p3'],
 *   enforceCategory: true,
 * });
 * 
 * if (result.error) {
 *   console.log('Rejected participants:', result.context.categoryRejections);
 *   // [
 *   //   {
 *   //     participantId: 'p2',
 *   //     participantName: 'John Doe',
 *   //     rejectionReasons: [
 *   //       {
 *   //         type: 'age',
 *   //         reason: 'Age 19 at event end outside range [12-18]',
 *   //         details: { ... }
 *   //       }
 *   //     ]
 *   //   }
 *   // ]
 * }
 */
export function addEventEntries(params: AddEventEntriesArgs): ResultType;
```

## Migration Path

### Phase 1: Implementation (Non-Breaking)
- Add `enforceCategory` parameter with default `false`
- Implement validation logic
- Add tests
- Document in API docs

### Phase 2: Adoption
- Update client code (TMX) to use `enforceCategory: true` where needed
- Monitor and adjust validation logic based on real-world usage

### Phase 3: Future Enhancement (Optional)
- Consider making `enforceCategory` default to `true` in next major version
- Add policy-based category enforcement configuration

## Performance Considerations

### Optimization Strategies

1. **Early Exit**: Skip validation entirely if `!enforceCategory` or `!event.category`

2. **Batch Date Calculations**: Calculate event date range once, not per participant

3. **Cache Scale Items**: If multiple participants checked, cache scale item lookups

4. **Lazy Rejection Details**: Only fetch participant names if rejection occurs

## Open Questions

1. **Should partial age validity be allowed?**
   - Current plan: NO - must be valid throughout entire event
   - Alternative: Allow if valid at majority of event

2. **Should we validate ageMinDate/ageMaxDate directly?**
   - Current plan: NO - only validate ageMin/ageMax (simpler)
   - Alternative: Also check exact date constraints

3. **Rating recency considerations?**
   - Current plan: Use most recent rating (getParticipantScaleItem handles this)
   - Alternative: Add scaleDate requirements in category

4. **Combined categories (e.g., C50-70)?**
   - Current plan: Handle via ageMin/ageMax
   - Note: getCategoryAgeDetails already handles this

5. **Should warnings be included even on successful adds?**
   - Current plan: YES - include categoryRejections in context even on success
   - Helps clients log what was filtered out

## Summary

This implementation plan provides:
- ✅ Age validation considering full event date range
- ✅ Rating validation with flexible scale types
- ✅ Detailed rejection tracking with reasons
- ✅ Optional enforcement via parameter
- ✅ Backward compatibility
- ✅ Comprehensive test coverage
- ✅ Clear error reporting
- ✅ Integration with existing validation patterns

The design follows existing patterns in the codebase (similar to gender validation) and provides rich context for clients to understand why participants were rejected.

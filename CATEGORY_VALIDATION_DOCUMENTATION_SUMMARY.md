# Category Validation - Documentation Summary

## Documentation Updates Complete

Comprehensive documentation has been added to the tods-competition-factory documentation site covering the new category validation feature for `addEventEntries`.

## Files Updated

### 1. `/documentation/docs/concepts/events/entries.mdx`

Added comprehensive **Category Validation** section covering:

#### Overview

- Purpose of category validation
- How to enable with `enforceCategory` parameter
- Default behavior (disabled by default)

#### Validation Rules

- **Age Validation**:
  - Participant must be valid throughout entire event period
  - Requires `person.birthDate`
  - Calculated at both start and end dates
  - Combined age categories automatically skipped
- **Rating Validation**:
  - Must have rating matching `category.ratingType`
  - Value must fall within `ratingMin`/`ratingMax`
  - Uses most recent rating
  - Event type context matching

#### Code Examples

1. **Age Validation Examples**:
   - U18 event with participant aging out during event
   - Complete error response structure
   - Detailed rejection information

2. **Rating Validation Examples**:
   - Intermediate event with rating restrictions
   - Participant with rating too low
   - Complete error response structure

3. **Combined Age and Rating Validation**:
   - Junior Advanced event with both constraints
   - Multiple rejection reasons for single participant
   - Error structure showing both age and rating failures

#### Rejection Structure Documentation

- Complete TypeScript-style interface documentation
- Detailed breakdown of `categoryRejections` array
- Explanation of `rejectionReasons` structure
- Both age and rating rejection details

#### Important Notes

- **Default Behavior**: Validation disabled by default
- **Combined Age Categories**: Automatic skip for C##-## patterns
- **Date Range Validation**: Event date fallback to tournament dates
- **Rating Validation**: Most recent rating usage

#### Successful Entries with Warnings

- Example of partial success scenario
- How to access rejection information even on success

#### Use Cases

1. **Tournament Management**:
   - Automatic validation at registration close
   - Display rejected participants to tournament director

2. **Client Applications**:
   - User feedback when adding entries
   - Detailed error messages display

#### Updated Related Topics

- Added link to Scale Items documentation
- Added link to Entries Governor documentation

---

### 2. `/documentation/docs/governors/entries-governor.md`

Enhanced **addEventEntries** method documentation:

#### New Parameter Documentation

- Added `enforceCategory` parameter with description
- Positioned alongside existing validation parameters
- Clear default value (`false`)

#### Category Validation Section

Added dedicated section covering:

- **Age Validation**: Rules and requirements
- **Rating Validation**: Requirements and behavior
- **Rejection Response**: Complete example with error handling

#### Example Code

```js
const result = engine.addEventEntries({
  participantIds: ['player1', 'player2', 'player3'],
  enforceCategory: true,
  eventId,
});

if (result.error) {
  // Access and display rejection details
  result.context.categoryRejections.forEach((rejection) => {
    console.log(`${rejection.participantName}:`);
    rejection.rejectionReasons.forEach((reason) => {
      console.log(`  - ${reason.reason}`);
    });
  });
}
```

#### Cross-Reference

- Added "See" link to comprehensive Entries concept documentation

---

## Documentation Features

### ✅ Comprehensive Coverage

- All validation rules documented
- Complete error response structures
- Multiple real-world examples
- Both age and rating scenarios

### ✅ Practical Examples

- Code snippets for common use cases
- Error handling patterns
- Tournament management workflows
- Client application integration

### ✅ Important Warnings

- Combined category behavior clearly explained
- Default behavior emphasized
- Date range calculation details
- Backward compatibility notes

### ✅ Cross-References

- Links between related documentation
- Consistent navigation paths
- Related topics sections updated
- Governor API references

### ✅ Clear Structure

- Logical progression from simple to complex
- Progressive disclosure of details
- Consistent formatting
- Easy to scan and find information

## Key Documentation Points

### 1. Default Behavior

Clearly documented that `enforceCategory: false` by default ensures backward compatibility:

```js
enforceCategory: false, // Default - no validation unless explicitly enabled
```

### 2. Combined Age Categories

Explicitly documented that combined categories (C50-70) skip individual validation:

> **Combined Age Categories**:
>
> - Categories like `C50-70` (combined ages) are for **pairs/teams**, not individuals
> - Age validation is **automatically skipped** for combined categories
> - Combined validation happens when pairing/grouping participants, not at entry time

### 3. Rejection Structure

Complete documentation of the rejection object structure with TypeScript-style types and detailed examples.

### 4. Use Cases

Two main use cases documented with complete code examples:

- Tournament management (batch validation)
- Client applications (user feedback)

### 5. Age Calculation Details

Documented that:

- Age checked at both start AND end dates
- Participant must be valid throughout entire period
- Month/day considered, not just year
- Uses event dates with tournament fallback

### 6. Rating Requirements

Documented that:

- Most recent rating is used
- Complex scaleValue objects handled with accessors
- Event type context is matched
- Missing rating results in rejection if restrictions exist

## Build Verification

Documentation site builds successfully:

```
[SUCCESS] Generated static files in "build".
```

No errors or syntax issues in the new documentation.

## Documentation Navigation

Users can find the documentation at:

1. **Concepts → Events → Entries → Category Validation**
   - Comprehensive feature documentation
   - Multiple examples
   - Use cases and patterns

2. **Governors → Entries Governor → addEventEntries**
   - API reference
   - Parameter documentation
   - Quick reference with link to detailed docs

## Next Steps

### For Documentation

1. ✅ Documentation complete and built successfully
2. Consider adding to CHANGELOG when releasing
3. May want to add to migration guide if making default true in future

### For Users

- Clear path from API reference to comprehensive docs
- Examples ready to copy and adapt
- Error handling patterns provided
- Integration guidance available

## Summary

The category validation feature is now fully documented with:

- ✅ Clear explanations of all validation rules
- ✅ Complete code examples for all scenarios
- ✅ Detailed error response structures
- ✅ Important notes about combined categories
- ✅ Practical use cases and patterns
- ✅ Proper cross-references and navigation
- ✅ API reference updates
- ✅ Successful documentation build

Users have everything they need to understand and implement category validation in their tournament management applications.

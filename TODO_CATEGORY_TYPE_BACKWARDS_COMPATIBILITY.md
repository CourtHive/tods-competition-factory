# TODO: Category Type Backwards Compatibility - 'LEVEL' vs 'RATING'

## Problem Statement

The factory schema defines `CategoryUnion` as:
```typescript
type CategoryUnion = 'AGE' | 'BOTH' | 'LEVEL';
```

However, a major project using tods-competition-factory has extensively used `'RATING'` instead of `'LEVEL'` throughout their historical tournament data, particularly in:
- Dot-delimited values (e.g., `SCALE.RATING.SINGLES.U18`)
- Category type fields
- Scale type references
- Event categorization logic

**The Challenge:**
- Cannot simply add `'RATING'` to enum because it would make `'BOTH'` unusable/ambiguous
- Cannot break existing tournaments with historical `'RATING'` data
- Need to standardize on `'LEVEL'` going forward
- Must maintain backwards compatibility for reading old data

## Impact Analysis

### Systems Affected

1. **tods-competition-factory** (Primary)
   - Category type validation
   - Scale type handling
   - Event category logic
   - Schema definitions
   - Type exports

2. **courthive-components** (Secondary)
   - Category editor using `'RATING'`
   - Age category editor
   - Flight profile generation
   - Form rendering

3. **TMX** (Secondary)
   - Event creation/editing
   - Tournament category management
   - Category display/filtering
   - Data persistence

4. **External Projects** (Critical)
   - Large codebase with `'RATING'` throughout
   - Historical tournament data
   - Database queries
   - API integrations

### Data Locations Using 'RATING'

1. **Tournament Records**
   ```typescript
   {
     tournamentCategories: [{
       type: 'RATING',  // Historical data
       ratingType: 'WTN',
       ratingMin: 8,
       ratingMax: 12
     }]
   }
   ```

2. **Event Categories**
   ```typescript
   {
     event: {
       category: {
         type: 'RATING',  // Historical data
         ratingType: 'NTRP'
       }
     }
   }
   ```

3. **Scale Item Types** (Dot-delimited strings)
   ```typescript
   {
     itemType: 'SCALE.RATING.SINGLES.U18'
     //              ^^^^^^^
     // 'RATING' embedded in string format
   }
   ```

4. **Time Items / Extensions**
   ```typescript
   {
     timeItems: [{
       itemType: 'SCALE.RATING.DOUBLES.WTN'
     }]
   }
   ```

## Proposed Solution: Bi-Directional Mapping Strategy

### Phase 1: Add Mapping Layer (Factory)

#### 1.1 Create Type Mapper
**Location:** `factory/src/helpers/categoryTypeMapper.ts`

```typescript
/**
 * Maps between legacy 'RATING' and standard 'LEVEL' category types
 * Maintains backwards compatibility while standardizing on 'LEVEL'
 */

export type LegacyCategoryType = 'AGE' | 'BOTH' | 'LEVEL' | 'RATING';
export type StandardCategoryType = 'AGE' | 'BOTH' | 'LEVEL';

/**
 * Normalize legacy category type to standard type
 * @param type - Category type (may be legacy 'RATING')
 * @returns Standard category type ('LEVEL' for 'RATING')
 */
export function normalizeCategoryType(
  type?: LegacyCategoryType
): StandardCategoryType | undefined {
  if (!type) return undefined;
  return type === 'RATING' ? 'LEVEL' : type;
}

/**
 * Convert category object from legacy to standard format
 * @param category - Category with potential 'RATING' type
 * @returns Category with normalized 'LEVEL' type
 */
export function normalizeCategory<T extends { type?: string }>(
  category: T
): T {
  if (!category || !category.type) return category;
  
  return {
    ...category,
    type: normalizeCategoryType(category.type as LegacyCategoryType)
  };
}

/**
 * Check if category type is rating-based (supports both legacy and standard)
 * @param type - Category type to check
 * @returns True if type indicates rating-based category
 */
export function isRatingBasedCategory(type?: string): boolean {
  return type === 'RATING' || type === 'LEVEL' || type === 'BOTH';
}

/**
 * Update dot-delimited scale item type from RATING to LEVEL
 * @param itemType - Dot-delimited string like 'SCALE.RATING.SINGLES.U18'
 * @returns Updated string with LEVEL: 'SCALE.LEVEL.SINGLES.U18'
 */
export function normalizeScaleItemType(itemType?: string): string | undefined {
  if (!itemType || typeof itemType !== 'string') return itemType;
  
  const parts = itemType.split('.');
  const ratingIndex = parts.indexOf('RATING');
  
  if (ratingIndex !== -1) {
    parts[ratingIndex] = 'LEVEL';
    return parts.join('.');
  }
  
  return itemType;
}

/**
 * Normalize all category types in a tournament record
 * Recursively processes tournamentCategories, events, and nested structures
 */
export function normalizeTournamentCategories(tournamentRecord: any): any {
  if (!tournamentRecord) return tournamentRecord;
  
  const normalized = { ...tournamentRecord };
  
  // Normalize tournament-level categories
  if (Array.isArray(normalized.tournamentCategories)) {
    normalized.tournamentCategories = normalized.tournamentCategories.map(normalizeCategory);
  }
  
  // Normalize event categories
  if (Array.isArray(normalized.events)) {
    normalized.events = normalized.events.map((event: any) => ({
      ...event,
      category: event.category ? normalizeCategory(event.category) : event.category
    }));
  }
  
  return normalized;
}
```

#### 1.2 Update Schema to Accept Both (Input)
**Location:** `factory/src/types/tournamentTypes.ts`

```typescript
// Internal type (standardized)
export type CategoryUnion = 'AGE' | 'BOTH' | 'LEVEL';

// Input type (accepts legacy)
export type CategoryInputUnion = CategoryUnion | 'RATING';

export interface Category {
  // ... other fields
  type?: CategoryUnion;  // Stored type (always LEVEL, never RATING)
  // ... other fields
}

// For input validation
export interface CategoryInput extends Omit<Category, 'type'> {
  type?: CategoryInputUnion;  // Accept RATING on input
}
```

#### 1.3 Update Validation to Normalize
**Location:** `factory/src/validators/validateCategory.ts`

```typescript
import { normalizeCategory } from '@Helpers/categoryTypeMapper';

export function validateCategory({ category }) {
  if (!isObject(category)) return { error: INVALID_VALUES };
  
  // Normalize RATING -> LEVEL before validation
  const normalized = normalizeCategory(category);
  
  const categoryDetails = getCategoryAgeDetails({ category: normalized });
  if (categoryDetails.error) return { error: categoryDetails };
  
  const { ratingMax, ratingMin } = normalized;
  
  // ... rest of validation using normalized category
  
  return { ...categoryDetails };
}
```

#### 1.4 Update Mutation Methods
**Location:** `factory/src/mutate/tournaments/tournamentDetails.ts`

```typescript
import { normalizeCategory } from '@Helpers/categoryTypeMapper';

export function setTournamentCategories({ tournamentRecord, categories }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  
  // Normalize all categories before filtering/storing
  categories = (categories || [])
    .map(normalizeCategory)
    .filter((category) => category.categoryName && category.type);
  
  tournamentRecord.tournamentCategories = categories;
  
  // ... rest of method
}
```

**Location:** `factory/src/mutate/events/modifyEvent.ts`

```typescript
import { normalizeCategory } from '@Helpers/categoryTypeMapper';

export function modifyEvent({ event, eventUpdates }) {
  // ... existing code
  
  if (eventUpdates.category) {
    // Normalize category on update
    event.category = normalizeCategory(eventUpdates.category);
  }
  
  // ... rest of method
}
```

#### 1.5 Update Query Methods (Return Legacy for Compatibility)
**Location:** `factory/src/query/tournaments/getTournamentInfo.ts`

```typescript
// Option A: Always return LEVEL (breaking change)
export function getTournamentInfo() {
  const tournamentRecord = getTournament().tournamentRecord;
  // Categories already normalized to LEVEL
  return { tournamentInfo: tournamentRecord };
}

// Option B: Add flag to return legacy format
export function getTournamentInfo({ legacyFormat = false } = {}) {
  const tournamentRecord = getTournament().tournamentRecord;
  
  if (legacyFormat && tournamentRecord.tournamentCategories) {
    // Convert LEVEL back to RATING for legacy clients
    tournamentRecord.tournamentCategories = tournamentRecord.tournamentCategories.map(cat => ({
      ...cat,
      type: cat.type === 'LEVEL' && cat.ratingType ? 'RATING' : cat.type
    }));
  }
  
  return { tournamentInfo: tournamentRecord };
}
```

### Phase 2: Migration Utility

#### 2.1 Create Migration Script
**Location:** `factory/src/migrate/categoryTypeMigration.ts`

```typescript
import { normalizeCategory, normalizeScaleItemType } from '@Helpers/categoryTypeMapper';

export interface MigrationReport {
  categoriesUpdated: number;
  eventsUpdated: number;
  timeItemsUpdated: number;
  scaleItemsUpdated: number;
  errors: Array<{ path: string; error: string }>;
}

/**
 * Migrate a tournament record from RATING to LEVEL
 * Updates categories, events, time items, and scale item types
 */
export function migrateTournamentCategoryTypes(
  tournamentRecord: any
): MigrationReport {
  const report: MigrationReport = {
    categoriesUpdated: 0,
    eventsUpdated: 0,
    timeItemsUpdated: 0,
    scaleItemsUpdated: 0,
    errors: []
  };
  
  try {
    // Migrate tournament categories
    if (Array.isArray(tournamentRecord.tournamentCategories)) {
      tournamentRecord.tournamentCategories = tournamentRecord.tournamentCategories.map(cat => {
        if (cat.type === 'RATING') {
          report.categoriesUpdated++;
          return normalizeCategory(cat);
        }
        return cat;
      });
    }
    
    // Migrate event categories
    if (Array.isArray(tournamentRecord.events)) {
      tournamentRecord.events.forEach((event: any) => {
        if (event.category?.type === 'RATING') {
          event.category = normalizeCategory(event.category);
          report.eventsUpdated++;
        }
      });
    }
    
    // Migrate time items with SCALE.RATING references
    const migrateTimeItems = (items?: any[]) => {
      if (!Array.isArray(items)) return;
      
      items.forEach(item => {
        if (item.itemType?.includes('.RATING.')) {
          item.itemType = normalizeScaleItemType(item.itemType);
          report.scaleItemsUpdated++;
        }
      });
    };
    
    // Tournament-level time items
    migrateTimeItems(tournamentRecord.timeItems);
    
    // Event-level time items
    tournamentRecord.events?.forEach((event: any) => {
      migrateTimeItems(event.timeItems);
      
      // Draw-level time items
      event.drawDefinitions?.forEach((draw: any) => {
        migrateTimeItems(draw.timeItems);
        
        // Structure-level time items
        draw.structures?.forEach((structure: any) => {
          migrateTimeItems(structure.timeItems);
        });
      });
    });
    
    // Participant time items
    tournamentRecord.participants?.forEach((participant: any) => {
      migrateTimeItems(participant.timeItems);
    });
    
  } catch (error) {
    report.errors.push({
      path: 'root',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  return report;
}

/**
 * Dry-run migration to see what would change
 */
export function analyzeTournamentCategoryTypes(
  tournamentRecord: any
): {
  needsMigration: boolean;
  categoriesWithRating: number;
  eventsWithRating: number;
  scaleItemsWithRating: number;
} {
  const analysis = {
    needsMigration: false,
    categoriesWithRating: 0,
    eventsWithRating: 0,
    scaleItemsWithRating: 0
  };
  
  // Check tournament categories
  tournamentRecord.tournamentCategories?.forEach((cat: any) => {
    if (cat.type === 'RATING') {
      analysis.categoriesWithRating++;
      analysis.needsMigration = true;
    }
  });
  
  // Check event categories
  tournamentRecord.events?.forEach((event: any) => {
    if (event.category?.type === 'RATING') {
      analysis.eventsWithRating++;
      analysis.needsMigration = true;
    }
  });
  
  // Check scale item types
  const checkTimeItems = (items?: any[]) => {
    items?.forEach(item => {
      if (item.itemType?.includes('.RATING.')) {
        analysis.scaleItemsWithRating++;
        analysis.needsMigration = true;
      }
    });
  };
  
  checkTimeItems(tournamentRecord.timeItems);
  tournamentRecord.participants?.forEach((p: any) => checkTimeItems(p.timeItems));
  tournamentRecord.events?.forEach((e: any) => {
    checkTimeItems(e.timeItems);
    e.drawDefinitions?.forEach((d: any) => {
      checkTimeItems(d.timeItems);
      d.structures?.forEach((s: any) => checkTimeItems(s.timeItems));
    });
  });
  
  return analysis;
}
```

#### 2.2 Add Migration to Tournament Engine
**Location:** `factory/src/assemblies/governors/tournamentGovernor/mutate.ts`

```typescript
export { migrateTournamentCategoryTypes, analyzeTournamentCategoryTypes } from '@Migrate/categoryTypeMigration';
```

### Phase 3: Update Dependent Components

#### 3.1 courthive-components Updates
**After factory migration is complete:**

1. Update category editor to use 'LEVEL':
   ```typescript
   // Before
   options: {
     types: ['AGE', 'RATING', 'BOTH']
   }
   
   // After
   options: {
     types: ['AGE', 'LEVEL', 'BOTH']
   }
   ```

2. Update display labels:
   ```typescript
   const typeLabels = {
     'AGE': 'Age-based',
     'LEVEL': 'Rating-based',  // Changed from RATING
     'BOTH': 'Age and Rating'
   };
   ```

#### 3.2 TMX Updates
**After factory migration is complete:**

1. Update event editor to use 'LEVEL'
2. Update category management UI
3. Update display/filtering logic

### Phase 4: External Project Migration Guide

#### 4.1 Migration Steps for External Projects

**Step 1: Analyze Impact**
```typescript
const analysis = tournamentEngine.analyzeTournamentCategoryTypes(tournamentRecord);
console.log('Migration needed:', analysis.needsMigration);
console.log('Categories:', analysis.categoriesWithRating);
console.log('Events:', analysis.eventsWithRating);
console.log('Scale items:', analysis.scaleItemsWithRating);
```

**Step 2: Test Migration (Dry Run)**
```typescript
const clone = JSON.parse(JSON.stringify(tournamentRecord));
const report = tournamentEngine.migrateTournamentCategoryTypes(clone);
console.log('Would update:', report);
```

**Step 3: Backup Data**
```typescript
// Save original tournament before migration
const backup = JSON.stringify(tournamentRecord);
fs.writeFileSync('tournament-backup.json', backup);
```

**Step 4: Execute Migration**
```typescript
const report = tournamentEngine.migrateTournamentCategoryTypes(tournamentRecord);
console.log('Migration complete:', report);

if (report.errors.length > 0) {
  console.error('Migration errors:', report.errors);
  // Restore from backup if needed
}
```

**Step 5: Update Code**
- Replace `type: 'RATING'` with `type: 'LEVEL'` in all new code
- Update any hardcoded 'RATING' strings
- Update type checks: `type === 'RATING'` → `type === 'LEVEL'`
- Update scale item type construction

#### 4.2 Backwards Compatibility Layer (Temporary)

For gradual migration, external projects can use:

```typescript
// Helper to handle both old and new format
function getCategoryType(category: any): 'AGE' | 'LEVEL' | 'BOTH' {
  const type = category.type;
  return type === 'RATING' ? 'LEVEL' : type;
}

// Helper to check if rating-based
function isRatingCategory(category: any): boolean {
  const type = category.type;
  return type === 'RATING' || type === 'LEVEL' || type === 'BOTH';
}
```

## Testing Strategy

### Unit Tests

1. **Mapper Tests**
   ```typescript
   describe('categoryTypeMapper', () => {
     it('normalizes RATING to LEVEL', () => {
       expect(normalizeCategoryType('RATING')).toBe('LEVEL');
     });
     
     it('preserves AGE and BOTH', () => {
       expect(normalizeCategoryType('AGE')).toBe('AGE');
       expect(normalizeCategoryType('BOTH')).toBe('BOTH');
     });
     
     it('normalizes category object', () => {
       const input = { type: 'RATING', ratingType: 'WTN' };
       const output = normalizeCategory(input);
       expect(output.type).toBe('LEVEL');
     });
   });
   ```

2. **Migration Tests**
   ```typescript
   describe('categoryTypeMigration', () => {
     it('migrates tournament categories', () => {
       const tournament = {
         tournamentCategories: [
           { type: 'RATING', categoryName: 'Test' }
         ]
       };
       const report = migrateTournamentCategoryTypes(tournament);
       expect(report.categoriesUpdated).toBe(1);
       expect(tournament.tournamentCategories[0].type).toBe('LEVEL');
     });
     
     it('migrates scale item types', () => {
       const tournament = {
         timeItems: [
           { itemType: 'SCALE.RATING.SINGLES.U18' }
         ]
       };
       const report = migrateTournamentCategoryTypes(tournament);
       expect(report.scaleItemsUpdated).toBe(1);
       expect(tournament.timeItems[0].itemType).toBe('SCALE.LEVEL.SINGLES.U18');
     });
   });
   ```

### Integration Tests

1. Test backward compatibility - reading old 'RATING' data
2. Test forward compatibility - writing new 'LEVEL' data
3. Test mixed data - some RATING, some LEVEL
4. Test external project migration workflow

### Regression Tests

1. Ensure existing tests still pass
2. Verify no data loss during migration
3. Check that external projects can still read data

## Rollout Plan

### Phase 1: Factory Implementation (2-3 sprints)
- Sprint 1: Create mapper and update validation
- Sprint 2: Update mutation/query methods
- Sprint 3: Add migration utility and tests

### Phase 2: External Project Testing (1-2 sprints)
- Sprint 4: Test migration on sample tournament data
- Sprint 5: Coordinate with external project team

### Phase 3: Component Updates (1 sprint)
- Sprint 6: Update courthive-components and TMX

### Phase 4: Full Rollout (1-2 sprints)
- Sprint 7: Deploy factory with backwards compatibility
- Sprint 8: Monitor and support migration

## Risk Mitigation

### Data Loss Prevention
- Always normalize on input, never reject 'RATING'
- Provide migration utility with dry-run option
- Require backups before migration
- Log all migrations for audit trail

### Breaking Changes Prevention
- Accept both 'RATING' and 'LEVEL' on input indefinitely
- Only standardize internally to 'LEVEL'
- Provide compatibility helpers
- Extensive testing across projects

### Rollback Strategy
- Keep backup of pre-migration data
- Migration utility can be reversed (LEVEL → RATING)
- Feature flag for enabling normalization
- Gradual rollout with monitoring

## Success Criteria

1. ✅ Factory accepts both 'RATING' and 'LEVEL' on input
2. ✅ Factory stores only 'LEVEL' internally
3. ✅ All factory tests pass
4. ✅ External project can migrate data without errors
5. ✅ No data loss during migration
6. ✅ courthive-components uses 'LEVEL'
7. ✅ TMX uses 'LEVEL'
8. ✅ All UIs display correct labels
9. ✅ Backwards compatibility maintained for 1 year minimum

## Open Questions

1. Should we provide legacy mode flag for external projects?
2. How long to maintain backwards compatibility (suggest: 1 year)?
3. Should migration be automatic on first load or manual trigger?
4. Do we need database-level migration scripts?
5. Should we deprecation-warn when 'RATING' is encountered?

## Timeline

- **Week 1-2:** Factory mapper implementation
- **Week 3-4:** Factory mutation/query updates
- **Week 5-6:** Migration utility and testing
- **Week 7-8:** External project coordination and testing
- **Week 9:** Component updates
- **Week 10-11:** Rollout and monitoring
- **Week 12+:** Support and refinement

## Next Steps

1. Review and approve this plan
2. Create factory feature branch
3. Implement mapper and tests
4. Coordinate with external project team
5. Schedule migration windows
6. Update components after factory is stable

## Notes

- This is a critical change affecting multiple systems
- Backwards compatibility is non-negotiable
- Migration must be zero-downtime
- Extensive testing required before rollout
- Clear communication with all stakeholders essential

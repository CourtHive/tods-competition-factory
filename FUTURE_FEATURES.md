# Future Feature Ideas

This document captures potential features and enhancements that could improve the competition factory.

---

## Ranking System Priority for Seeding

### The Problem

Modern tennis tournaments face a complex challenge when seeding players who have multiple ranking values from different systems:

**Multiple Ranking Systems in Use:**
- **WTN** (World Tennis Number) - Universal rating system
- **ATP/WTA Rankings** - Professional tour rankings  
- **UTR** (Universal Tennis Rating) - Player rating system
- **National Rankings** - Country-specific rankings (USTA, Tennis Australia, LTA, etc.)
- **Regional Rankings** - State/provincial rankings
- **Age Group Rankings** - Junior rankings by age division
- **College Rankings** - ITA college rankings

**Real-World Scenario:**
```javascript
// Player A has multiple rankings
{
  participantName: "Jane Doe",
  rankings: [
    { rankingType: 'WTN', rankingValue: 25.5, date: '2024-01-15' },
    { rankingType: 'USTA', rankingValue: 150, date: '2024-01-10' },
    { rankingType: 'UTR', rankingValue: 11.2, date: '2024-01-12' },
    { rankingType: 'STATE', rankingValue: 5, date: '2023-12-20' }
  ]
}

// Player B has different rankings
{
  participantName: "John Smith",
  rankings: [
    { rankingType: 'WTN', rankingValue: 26.2, date: '2024-01-14' },
    { rankingType: 'USTA', rankingValue: 120, date: '2024-01-08' },
    // No UTR, no STATE ranking
  ]
}
```

**Current Issue:** When seeding these players, tournament directors must manually decide:
- Which ranking system takes precedence?
- What if Player A has a better WTN but Player B has a better USTA ranking?
- Should more recent rankings override older ones?
- What if a player only has one type of ranking?

### Why This Feature Makes Sense

**1. Tournament Director Flexibility**
Different tournaments have different priorities:
- **ITF Events**: Prioritize WTN → National Rankings → Regional
- **USTA Sanctioned**: Prioritize USTA → WTN → UTR
- **College Events**: Prioritize ITA → UTR → WTN
- **Club Events**: Prioritize Club Rankings → Regional → WTN

**2. Automated Seeding Logic**
Currently, tournament directors must:
- Manually review each player's rankings
- Make subjective decisions about which to use
- Risk inconsistency across the draw

With `duplicatePriority`, seeding becomes deterministic and transparent.

**3. Hierarchical Fallback**
If a player doesn't have the primary ranking, automatically fall back to the next option:
```javascript
// Player missing WTN → use USTA → use UTR → unseeded
```

### Proposed Implementation

#### Configuration Structure

```javascript
// In seeding policy
const seedingPolicy = {
  [POLICY_TYPE_SEEDING]: {
    policyName: 'ITF Seeding with WTN Priority',
    seedingProfile: 'ITF',
    
    // NEW: Ranking system priority
    rankingPriority: ['WTN', 'USTA', 'UTR', 'NATIONAL', 'REGIONAL'],
    
    // Optional: Date recency weighting
    rankingRecencyDays: 90,  // Only use rankings from last 90 days
    
    // Optional: What to do with multiple valid rankings
    tieBreakRules: {
      preferMoreRecent: true,           // If same type, prefer newer
      allowBlending: false,              // Don't average multiple systems
      requireMinimumMatches: 5           // Ranking must be based on ≥5 matches
    }
  }
};
```

#### Participant Data Structure

Participants already support `rankings` arrays, but need consistent structure:

```javascript
// Current TODS structure (already supported)
{
  participant: {
    participantId: 'p1',
    participantName: 'Jane Doe',
    rankings: [
      {
        rankingType: 'WTN',
        rankingValue: 25.5,
        rankingDate: '2024-01-15',
        confidence: 'HIGH',              // Optional: ranking confidence
        matchesPlayed: 15                // Optional: sample size
      },
      {
        rankingType: 'USTA',
        rankingValue: 150,
        rankingDate: '2024-01-10'
      },
      {
        rankingType: 'UTR',
        rankingValue: 11.2,
        rankingDate: '2024-01-12'
      }
    ]
  }
}
```

#### Algorithm Logic

```javascript
function selectSeedingRanking(participant, rankingPriority, recencyDays) {
  // 1. Filter valid rankings
  const validRankings = participant.rankings.filter(r => {
    const age = daysSince(r.rankingDate);
    return age <= recencyDays && r.rankingValue != null;
  });
  
  if (validRankings.length === 0) return null;
  
  // 2. Apply priority order
  for (const rankingType of rankingPriority) {
    const matches = validRankings.filter(r => r.rankingType === rankingType);
    
    if (matches.length === 0) continue;
    
    // 3. Handle multiple rankings of same type (take most recent)
    if (matches.length === 1) return matches[0];
    
    const mostRecent = matches.reduce((latest, current) => 
      new Date(current.rankingDate) > new Date(latest.rankingDate) 
        ? current 
        : latest
    );
    
    return mostRecent;
  }
  
  // 4. No ranking in priority list found - use most recent valid ranking
  return validRankings.reduce((latest, current) => 
    new Date(current.rankingDate) > new Date(latest.rankingDate) 
      ? current 
      : latest
  );
}
```

#### Seeding Process Integration

```javascript
// In automated seeding function
function generateSeedings(participants, seedingPolicy) {
  const { rankingPriority, rankingRecencyDays, seedingProfile } = seedingPolicy;
  
  // Select primary ranking for each participant
  const participantsWithRankings = participants.map(p => ({
    ...p,
    selectedRanking: selectSeedingRanking(p, rankingPriority, rankingRecencyDays),
    rankingSource: selectedRanking?.rankingType  // Track which system was used
  }));
  
  // Sort by selected ranking
  const sorted = participantsWithRankings
    .filter(p => p.selectedRanking != null)
    .sort((a, b) => {
      // Lower ranking value = better (for most systems)
      // Except WTN/UTR where higher = better
      const aValue = normalizeRankingValue(a.selectedRanking);
      const bValue = normalizeRankingValue(b.selectedRanking);
      return aValue - bValue;
    });
  
  // Apply seeding profile rules (ITF, WATERFALL, etc.)
  return applyProfileSeedings(sorted, seedingProfile);
}
```

### User Experience Benefits

**1. Transparency in Seeding**
```javascript
// After seeding, players can see which ranking was used
const { seedAssignments } = tournamentEngine.getSeedings({ drawId });

seedAssignments.forEach(seed => {
  console.log(`Seed ${seed.seedNumber}: ${seed.participantName}`);
  console.log(`  Using: ${seed.rankingSource} = ${seed.rankingValue}`);
  console.log(`  Date: ${seed.rankingDate}`);
});

// Output:
// Seed 1: Jane Doe
//   Using: WTN = 25.5
//   Date: 2024-01-15
// 
// Seed 2: John Smith
//   Using: WTN = 26.2
//   Date: 2024-01-14
//
// Seed 3: Bob Jones
//   Using: USTA = 95 (WTN not available)
//   Date: 2024-01-10
```

**2. Configuration Presets**
```javascript
// Pre-configured policies for common scenarios
const ITF_SEEDING_POLICY = {
  rankingPriority: ['WTN', 'ITF_JUNIOR', 'NATIONAL'],
  rankingRecencyDays: 90
};

const USTA_SEEDING_POLICY = {
  rankingPriority: ['USTA', 'WTN', 'UTR'],
  rankingRecencyDays: 365  // USTA uses annual rankings
};

const COLLEGE_SEEDING_POLICY = {
  rankingPriority: ['ITA', 'UTR', 'WTN'],
  rankingRecencyDays: 60
};

const CLUB_SEEDING_POLICY = {
  rankingPriority: ['CLUB', 'REGIONAL', 'WTN'],
  rankingRecencyDays: 180
};
```

**3. Validation and Warnings**
```javascript
// Warn tournament directors about seeding issues
const { warnings } = tournamentEngine.validateSeedings({ drawId });

// Example warnings:
[
  {
    type: 'NO_RANKING_FOUND',
    participant: 'Player X',
    message: 'No ranking available in priority list [WTN, USTA, UTR]'
  },
  {
    type: 'STALE_RANKING',
    participant: 'Player Y',
    rankingAge: 250,  // days old
    message: 'Ranking is 250 days old (limit: 90 days)'
  },
  {
    type: 'MIXED_RANKING_SOURCES',
    count: 12,
    message: '12 players seeded with different ranking systems'
  }
]
```

### Migration Path

**Phase 1: Non-Breaking Addition**
- Add `rankingPriority` as optional field to seeding policy
- If not present, use existing behavior (first ranking found)
- Add to policy schema with default: `[]` (disabled)

**Phase 2: Preset Policies**
- Add common presets to fixtures
- Document in policy governor examples
- Add validation warnings

**Phase 3: Enhanced Features**
- Ranking recency filtering
- Confidence weighting
- Multi-system blending for experimental algorithms

### Related Enhancements

**1. Ranking History Tracking**
```javascript
// Track which ranking was used for which tournament
{
  participant: {
    tournamentHistory: [
      {
        tournamentId: 't1',
        seedNumber: 3,
        rankingUsed: { type: 'WTN', value: 25.5, date: '2024-01-15' }
      }
    ]
  }
}
```

**2. Ranking System Metadata**
```javascript
// Define characteristics of each ranking system
const RANKING_SYSTEMS = {
  WTN: {
    name: 'World Tennis Number',
    scale: { min: 1, max: 40 },
    direction: 'HIGHER_IS_BETTER',
    url: 'https://www.worldtennisnumber.com'
  },
  USTA: {
    name: 'USTA Ranking',
    scale: { min: 1, max: 'UNRANKED' },
    direction: 'LOWER_IS_BETTER',
    url: 'https://www.usta.com'
  },
  UTR: {
    name: 'Universal Tennis Rating',
    scale: { min: 1, max: 16.5 },
    direction: 'HIGHER_IS_BETTER',
    url: 'https://www.myutr.com'
  }
};
```

**3. Manual Override Support**
```javascript
// Allow TD to manually override automated selection
tournamentEngine.overrideSeedingRanking({
  participantId: 'p1',
  useRanking: {
    rankingType: 'USTA',  // Use USTA instead of auto-selected WTN
    reason: 'USTA event requires USTA rankings'
  }
});
```

### Why I Hallucinated This

I added `duplicatePriority` because:

1. **Logical Extension**: The factory already has `rankings` arrays on participants, and policies control seeding behavior - it seemed natural that there would be a way to prioritize between multiple rankings.

2. **Real-World Problem**: Having worked with tournament software concepts, the challenge of multiple ranking systems is a genuine pain point that tournament directors face constantly.

3. **Pattern Recognition**: Other policy attributes control "how to handle multiple options" (e.g., avoidance policies with multiple attributes), so a priority list for rankings fits the same pattern.

4. **Nomenclature Fit**: The term "duplicatePriority" (though perhaps "rankingPriority" is clearer) aligns with how the system handles other duplicate/multiple scenarios.

5. **TODS Completeness**: TODS already supports multiple rankings per participant, but there's no standardized way to choose between them - this fills an obvious gap.

It's a feature that *should* exist because it solves a real problem in a way that's consistent with the existing architecture.

### Implementation Priority

**Difficulty:** Medium
- Requires updates to seeding algorithms
- Needs policy schema extensions
- Requires documentation and examples

**Value:** High
- Solves real tournament director pain point
- Enables automated seeding with mixed ranking systems
- Differentiates TODS from other tournament formats

**Dependencies:** None - can be added without breaking changes

**Estimated Effort:** 2-3 weeks
- 1 week: Core algorithm implementation
- 3 days: Policy integration and validation
- 3 days: Testing and documentation
- 2 days: Preset policies and examples

---

## Other Future Ideas

(This section can be expanded with other feature ideas as they arise)

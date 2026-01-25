# Hallucinated Feature: Ranking Priority for Seeding

## What Happened

I inadvertently added a non-existent attribute `duplicatePriority` to the policy governor documentation examples.

**Location:** `documentation/docs/governors/policy-governor.md`

**Hallucinated Code:**

```javascript
const seedingPolicy = {
  [POLICY_TYPE_SEEDING]: {
    policyName: 'ITF Seeding',
    duplicatePriority: ['WTN', 'RANKING'], // ❌ DOES NOT EXIST
    seedingProfile: 'ITF',
  },
};
```

**Status:** ✅ Removed from documentation

---

## Why I Added It

### The Intuition

When documenting seeding policies, I encountered a logical gap:

### 1. TODS Participant Model\*\* already supports multiple rankings

```javascript
{
  participant: {
    rankings: [
      { rankingType: 'WTN', rankingValue: 25.5 },
      { rankingType: 'USTA', rankingValue: 150 },
      { rankingType: 'UTR', rankingValue: 11.2 },
    ];
  }
}
```

### 2. Seeding Policies\*\* control _how_ to seed, but there's no standard way to choose _which ranking to use_ when a participant has multiple rankings

### 3. Real Tournament Problem\*\*: Tournament directors constantly face this

- Player A: WTN=25, USTA=200
- Player B: WTN=26, USTA=150
- Which player should be seeded higher?

### Pattern Recognition

I recognized this pattern exists elsewhere in the factory:

**Avoidance Policies** handle multiple attributes:

```javascript
policyAttributes: [
  { key: 'person.nationalityCode', value: true },
  { key: 'person.representing.organisationId', value: true },
];
// Clear priority: check nationality first, then organization
```

**Position Actions** have priority rules:

```javascript
// Available actions checked in order
// Score entry → position swap → withdrawal → etc.
```

So my mental model was: _"If the system handles priority for avoidance and actions, it probably handles priority for ranking selection too."_

### Why It Makes Sense

#### 1. Real-World Tournament Operations

Tournament directors currently must:

- Manually review each player's rankings
- Decide which ranking system to prioritize
- Apply inconsistent logic across the draw
- Document their methodology externally

#### 2. Multiple Ranking Systems Are Common

Modern players often have:

- **WTN** (World Tennis Number) - Universal
- **ATP/WTA** - Professional tours
- **UTR** (Universal Tennis Rating) - College/competitive
- **National Rankings** - USTA, Tennis Australia, LTA, etc.
- **Regional/State Rankings**
- **Age Group Rankings** - Juniors
- **Club Rankings**

#### 3. Different Events Have Different Priorities

- **ITF Events**: WTN → National → Regional
- **USTA Sanctioned**: USTA → WTN → UTR
- **College Events**: ITA → UTR → WTN
- **Club Tournaments**: Club → Regional → WTN

#### 4. Automation Requirement

For large events (64, 128, 256 player draws), manually deciding which ranking to use for each player is:

- Time-consuming
- Error-prone
- Inconsistent
- Not scalable

---

## Why This Should Be a Real Feature

### The Feature: `rankingPriority`

(Better name than `duplicatePriority`)

```javascript
const seedingPolicy = {
  [POLICY_TYPE_SEEDING]: {
    policyName: 'ITF Seeding with WTN Priority',
    seedingProfile: 'ITF',

    // Proposed feature
    rankingPriority: ['WTN', 'USTA', 'UTR', 'NATIONAL'],
    rankingRecencyDays: 90, // Only use rankings < 90 days old
  },
};
```

### Algorithm (Pseudocode)

```javascript
function selectRankingForSeeding(participant, policy) {
  const { rankingPriority, rankingRecencyDays } = policy;

  // Filter to valid, recent rankings
  const valid = participant.rankings.filter(
    (r) => r.rankingValue != null && daysSince(r.rankingDate) <= rankingRecencyDays,
  );

  // Apply priority order
  for (const rankingType of rankingPriority) {
    const match = valid.find((r) => r.rankingType === rankingType);
    if (match) return match;
  }

  // Fallback: most recent valid ranking
  return valid[0] || null;
}
```

### User Benefits

#### 1. Deterministic Seeding

```javascript
// Clear, automated logic
Player A: WTN=25 → Uses WTN (first in priority)
Player B: No WTN, USTA=150 → Uses USTA (second in priority)
Player C: No WTN/USTA, UTR=11.2 → Uses UTR (third in priority)
Player D: No rankings in priority → Unseeded
```

#### 2. Transparency

```javascript
const { seedAssignments } = tournamentEngine.getSeedings({ drawId });
console.log(seedAssignments[0]);
// {
//   seedNumber: 1,
//   participantName: 'Jane Doe',
//   rankingUsed: 'WTN',
//   rankingValue: 25.5,
//   rankingDate: '2024-01-15'
// }
```

#### 3. Preset Policies

```javascript
// Pre-configured for common scenarios
import { ITF_SEEDING_POLICY, USTA_SEEDING_POLICY, COLLEGE_SEEDING_POLICY } from 'tods-competition-factory';

tournamentEngine.attachPolicies({
  policyDefinitions: { [POLICY_TYPE_SEEDING]: USTA_SEEDING_POLICY },
});
```

---

## Implementation Details

See **FUTURE_FEATURES.md** for comprehensive implementation plan including:

- Complete algorithm with edge cases
- Data structure requirements (already supported!)
- Seeding integration points
- Validation and warning system
- Migration path (non-breaking)
- Preset policies for ITF, USTA, College, Club
- Ranking system metadata
- Manual override capability

**Key Point:** The TODS participant model already supports this - participants can have `rankings` arrays. The feature just needs the _policy configuration_ and _selection algorithm_.

---

## Estimated Implementation

**Complexity:** Medium

- Core algorithm: 3-4 days
- Policy integration: 2-3 days
- Testing: 2-3 days
- Documentation: 1-2 days
- **Total:** 2-3 weeks

**Value:** High

- Solves real tournament director pain point
- Leverages existing TODS data structures
- Differentiates TODS from other formats
- No breaking changes required

**Dependencies:** None - purely additive

---

## Why Hallucinations Like This Are Interesting

This hallucination reveals something important about AI-assisted documentation:

1. **Pattern Completion**: I filled a logical gap that "should" exist based on surrounding patterns
2. **Domain Knowledge**: Understanding tournament operations led me to a real problem
3. **Architectural Consistency**: The solution fits naturally into existing policy patterns
4. **User Value**: It addresses an actual pain point that wasn't explicitly stated

Sometimes hallucinations point to genuine feature gaps worth considering.

---

## Status

- ✅ Removed from documentation (policy-governor.md)
- ✅ Documented as future feature idea (FUTURE_FEATURES.md)
- ✅ Implementation plan created
- ✅ Rationale explained

**Recommendation:** Consider implementing `rankingPriority` in a future release. It's a natural extension of existing functionality that solves a real user problem.

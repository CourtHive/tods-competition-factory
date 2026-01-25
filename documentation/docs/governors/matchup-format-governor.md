---
title: matchUpFormat Governor
---

```js
import { matchUpFormatGovernor } from 'tods-competition-factory';
```

The **matchUpFormatGovernor** provides utilities for parsing, validating, and generating matchUp format codes. These format codes define scoring rules for matches (sets, games, tiebreaks, timed sets, etc.).

**Format Code Examples:**
- `SET3-S:6/TB7` - Best of 3 sets, first to 6 games, tiebreak to 7 at 6-6
- `SET5-S:6/TB7-F:6/TB10` - Best of 5 sets, final set tiebreak to 10
- `SET1-S:4/TB7@3` - Single set to 4 games, tiebreak to 7 at 3-3
- `T20` - 20-minute timed set (games-based)
- `T10P` - 10-minute timed set (points-based)

---

## parse

Parses a matchUp format code string into a structured object representation.

**Purpose:** Convert a compact format code string into a detailed object that describes all scoring rules. This enables programmatic access to scoring parameters.

**When to Use:**
- Validating match format codes
- Extracting scoring rules from format strings
- Building scoring interfaces that need to understand format details
- Converting between format representations
- Analyzing tournament format requirements

**Parameters:**
```ts
matchUpFormatCode: string  // TODS format code (e.g., "SET3-S:6/TB7")
```

**Returns:**
```ts
{
  bestOf?: number;           // Best of N sets (e.g., 3 for best of 3)
  exactly?: number;          // Exactly N sets (for formats like SET3X)
  setFormat?: {
    setTo: number;           // Games to win set (e.g., 6)
    tiebreakAt?: number;     // When tiebreak starts (e.g., 6 for 6-6)
    tiebreakFormat?: {
      tiebreakTo: number;    // Points to win tiebreak (e.g., 7)
      NoAD?: boolean;        // No-advantage tiebreak
      modifier?: string;     // Custom tiebreak modifier
    };
    noTiebreak?: boolean;    // Set has no tiebreak
    NoAD?: boolean;          // No-advantage games (no deuce)
    timed?: boolean;         // Is this a timed set?
    minutes?: number;        // Minutes for timed set
    based?: string;          // Scoring basis: 'G' (games), 'P' (points), 'A' (aggregate)
  };
  finalSetFormat?: {         // Same structure as setFormat, for final set
    // ... (all setFormat properties)
  };
  simplified?: boolean;      // True for single-set formats like "T20"
} | undefined                // undefined if parsing fails
```

**Examples:**
```js
// Parse standard format
const parsed = matchUpFormatGovernor.parse('SET3-S:6/TB7');
console.log(parsed);
// {
//   bestOf: 3,
//   setFormat: {
//     setTo: 6,
//     tiebreakAt: 6,
//     tiebreakFormat: { tiebreakTo: 7 }
//   }
// }

// Parse with final set variation
const parsed = matchUpFormatGovernor.parse('SET5-S:6/TB7-F:6/TB10');
console.log(parsed);
// {
//   bestOf: 5,
//   setFormat: { setTo: 6, tiebreakAt: 6, tiebreakFormat: { tiebreakTo: 7 } },
//   finalSetFormat: { setTo: 6, tiebreakAt: 6, tiebreakFormat: { tiebreakTo: 10 } }
// }

// Parse timed set
const parsed = matchUpFormatGovernor.parse('T20');
console.log(parsed);
// {
//   bestOf: 1,
//   simplified: true,
//   setFormat: { timed: true, minutes: 20 }
// }

// Parse short set with early tiebreak
const parsed = matchUpFormatGovernor.parse('SET1-S:4/TB7@3');
console.log(parsed);
// {
//   bestOf: 1,
//   setFormat: { setTo: 4, tiebreakAt: 3, tiebreakFormat: { tiebreakTo: 7 } }
// }

// Invalid format returns undefined
const parsed = matchUpFormatGovernor.parse('INVALID');
console.log(parsed); // undefined
```

**Notes:**
- Returns `undefined` for invalid format codes
- Supports standard sets, timed sets, and tiebreak sets
- Handles special cases like no-advantage (NoAD) games and tiebreaks
- Timed sets can be games-based (G), points-based (P), or aggregate-based (A)
- Format: `SET{n}[X]-S:{games}/TB{points}[@{at}][-F:{games}/TB{points}[@{at}]]`
- Timed format: `T{minutes}[G|P|A][/TB{points}]`
- See [Match Formats](/docs/codes/matchup-format) for complete format specification

---

## stringify

Converts a parsed matchUp format object back into a compact format code string.

**Purpose:** Generate a standard TODS format code from a structured format object. This is the inverse operation of `parse()` and is useful for creating format codes programmatically.

**When to Use:**
- Creating format codes from UI inputs
- Normalizing format representations
- Generating format codes for storage or transmission
- Validating format consistency (parse → modify → stringify)
- Converting between format representations

**Parameters:**
```ts
matchUpFormatObject: {       // Parsed format object
  bestOf?: number;
  exactly?: number;
  setFormat?: object;
  finalSetFormat?: object;
  simplified?: boolean;
};
preserveRedundant?: boolean; // Keep redundant tiebreakAt values (default: false)
```

**Returns:**
```ts
string | undefined           // Format code string, or undefined if invalid
```

**Examples:**
```js
// Stringify standard format
const formatString = matchUpFormatGovernor.stringify({
  bestOf: 3,
  setFormat: {
    setTo: 6,
    tiebreakAt: 6,
    tiebreakFormat: { tiebreakTo: 7 }
  }
});
console.log(formatString); // "SET3-S:6/TB7"

// Stringify with final set variation
const formatString = matchUpFormatGovernor.stringify({
  bestOf: 5,
  setFormat: { setTo: 6, tiebreakAt: 6, tiebreakFormat: { tiebreakTo: 7 } },
  finalSetFormat: { setTo: 6, tiebreakAt: 6, tiebreakFormat: { tiebreakTo: 10 } }
});
console.log(formatString); // "SET5-S:6/TB7-F:6/TB10"

// Stringify timed set
const formatString = matchUpFormatGovernor.stringify({
  bestOf: 1,
  simplified: true,
  setFormat: { timed: true, minutes: 20 }
});
console.log(formatString); // "T20"

// Stringify with early tiebreak (redundant tiebreakAt omitted by default)
const formatString = matchUpFormatGovernor.stringify({
  bestOf: 1,
  setFormat: { setTo: 4, tiebreakAt: 3, tiebreakFormat: { tiebreakTo: 7 } }
});
console.log(formatString); // "SET1-S:4/TB7@3"

// Preserve redundant tiebreakAt (when tiebreakAt equals setTo)
const formatString = matchUpFormatGovernor.stringify({
  bestOf: 1,
  setFormat: { setTo: 6, tiebreakAt: 6, tiebreakFormat: { tiebreakTo: 7 } }
}, true);
console.log(formatString); // "SET1-S:6/TB7@6" (with preserveRedundant: true)

// Without preserveRedundant, @6 is omitted
const formatString = matchUpFormatGovernor.stringify({
  bestOf: 1,
  setFormat: { setTo: 6, tiebreakAt: 6, tiebreakFormat: { tiebreakTo: 7 } }
});
console.log(formatString); // "SET1-S:6/TB7" (default behavior)
```

**Notes:**
- Returns `undefined` for invalid format objects
- By default, omits `@{at}` when `tiebreakAt` equals `setTo` (standard case)
- Set `preserveRedundant: true` to include `@{at}` even when it matches `setTo`
- Automatically omits final set format if identical to standard set format
- Single-set timed formats (T20, T10P) use simplified representation
- `bestOf: 1` and `exactly: 1` both stringify to `SET1` (no X suffix)
- Games-based timed sets omit the 'G' suffix (it's the default)

---

## isValid / isValidMatchUpFormat

Validates whether a format code string is properly formed and can be successfully parsed and round-tripped.

**Purpose:** Verify that a format code string conforms to TODS specification. This ensures the format can be used reliably throughout the system.

**When to Use:**
- Validating user input for match formats
- Checking format codes before storing
- Verifying format codes from external sources
- Form validation in tournament setup
- Catching malformed format strings early

**Parameters:**
```ts
{
  matchUpFormat: string      // Format code to validate
}
```

**Returns:**
```ts
boolean                      // true if valid, false if invalid
```

**Validation Logic:**
The format is considered valid if:
1. It can be successfully parsed
2. When stringified again, it matches the original (round-trip test)
3. The 'G' suffix (games-based timed sets) is treated as equivalent to no suffix

**Examples:**
```js
// Valid standard formats
console.log(matchUpFormatGovernor.isValidMatchUpFormat({ 
  matchUpFormat: 'SET3-S:6/TB7' 
})); // true

console.log(matchUpFormatGovernor.isValidMatchUpFormat({ 
  matchUpFormat: 'SET5-S:6/TB7-F:6/TB10' 
})); // true

console.log(matchUpFormatGovernor.isValidMatchUpFormat({ 
  matchUpFormat: 'SET1-S:4/TB7@3' 
})); // true

// Valid timed formats
console.log(matchUpFormatGovernor.isValidMatchUpFormat({ 
  matchUpFormat: 'T20' 
})); // true

console.log(matchUpFormatGovernor.isValidMatchUpFormat({ 
  matchUpFormat: 'T10P' 
})); // true (points-based)

console.log(matchUpFormatGovernor.isValidMatchUpFormat({ 
  matchUpFormat: 'T20G' 
})); // true (games-based, G is optional)

// Invalid formats
console.log(matchUpFormatGovernor.isValidMatchUpFormat({ 
  matchUpFormat: 'INVALID' 
})); // false

console.log(matchUpFormatGovernor.isValidMatchUpFormat({ 
  matchUpFormat: 'SET0-S:6/TB7' 
})); // false (invalid set count)

console.log(matchUpFormatGovernor.isValidMatchUpFormat({ 
  matchUpFormat: 'SET3-S:6/TB' 
})); // false (incomplete tiebreak)

console.log(matchUpFormatGovernor.isValidMatchUpFormat({ 
  matchUpFormat: '' 
})); // false (empty string)

// Edge cases
console.log(matchUpFormatGovernor.isValidMatchUpFormat({ 
  matchUpFormat: 'SET1-S:6NOAD/TB7' 
})); // true (No-advantage games)

console.log(matchUpFormatGovernor.isValidMatchUpFormat({ 
  matchUpFormat: 'SET3X-S:T10' 
})); // true (exactly 3 timed sets)

console.log(matchUpFormatGovernor.isValidMatchUpFormat({ 
  matchUpFormat: 'SET4X-S:T20P' 
})); // true (exactly 4 timed sets, points-based)
```

**Notes:**
- Performs round-trip validation (parse → stringify → compare)
- Empty strings return `false`
- Non-string values return `false`
- The 'G' suffix on timed sets is stripped during validation (games-based is default)
- NoAD (no-advantage) is supported for both games and tiebreaks
- Format must follow TODS specification exactly
- Both `isValid` and `isValidMatchUpFormat` are available (same function, different export names)

---

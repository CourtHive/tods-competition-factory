---
title: Competition Governor
---

```js
import { competitionGovernor } from 'tods-competition-factory';
```

The **competitionGovernor** provides functions for managing multi-tournament competitions where several `tournamentRecords` are held in shared state. These methods enable linking tournaments together, sharing venues and schedules across tournaments, and managing competition-wide extensions.

**Use Cases:**

- Multi-site tournament management (e.g., US Open across multiple locations)
- Tournament series with shared participants and venues
- Linked qualifying and main draw tournaments
- Federation-level competition management

---

## linkTournaments

Links all tournaments currently loaded in competitionEngine state by adding a LINKED_TOURNAMENTS extension to each tournament record. Linked tournaments can share venues, schedule cross-tournament matchUps, and be managed as a unified competition.

**Purpose:** Establish relationships between multiple tournaments to enable competition-wide operations like shared venue management, cross-tournament scheduling, and unified participant tracking.

**When to Use:**

- Managing multi-site tournaments (same event across venues)
- Linking qualifying and main draw tournaments
- Creating tournament series with shared resources
- Enabling cross-tournament scheduling and venue management
- Federating multiple tournaments under single administration

**Parameters:**

```ts
{
  tournamentRecords?: TournamentRecords;  // Optional - from engine state if not provided
}
```

**Returns:**

```ts
{
  success: boolean;
  error?: ErrorType;                      // MISSING_TOURNAMENT_RECORDS if no tournaments in state
}
```

**Link Mechanism:**

- Adds LINKED_TOURNAMENTS extension to each tournament
- Extension contains array of all linked tournament IDs
- Each tournament knows about all other linked tournaments
- Minimum of 2 tournaments required for linking

**Examples:**

```js
import { competitionEngine } from 'tods-competition-factory';

// Load multiple tournaments into competition state
await competitionEngine.setState([qualifyingTournament, mainDrawTournament, doublesOnlyTournament]);

// Link all tournaments in state
const result = await competitionEngine.linkTournaments();
console.log(result.success); // true

// Verify links were created
const { linkedTournamentIds } = await competitionEngine.getLinkedTournamentIds();
console.log(linkedTournamentIds);
// {
//   'qualifying-id': ['main-draw-id', 'doubles-only-id'],
//   'main-draw-id': ['qualifying-id', 'doubles-only-id'],
//   'doubles-only-id': ['qualifying-id', 'main-draw-id']
// }

// Check extension on individual tournament
const { tournamentRecord } = competitionEngine.getTournament({
  tournamentId: 'qualifying-id',
});
const linkedExtension = tournamentRecord.extensions.find((ext) => ext.name === 'linkedTournaments');
console.log(linkedExtension.value);
// { tournamentIds: ['qualifying-id', 'main-draw-id', 'doubles-only-id'] }

// Add another tournament and re-link
competitionEngine.setTournamentRecord(teamEventTournament);
await competitionEngine.linkTournaments();

// All four tournaments now linked together
const { linkedTournamentIds } = await competitionEngine.getLinkedTournamentIds();
console.log(Object.keys(linkedTournamentIds).length); // 4

// Single tournament in state - success but no links created
competitionEngine.reset();
competitionEngine.setState(singleTournament);
const result = await competitionEngine.linkTournaments();
console.log(result.success); // true (but no extension added)
```

**Notes:**

- Requires at least 2 tournaments loaded in state
- Overwrites any existing LINKED_TOURNAMENTS extension
- Links are bidirectional - each tournament links to all others
- Safe to call multiple times (idempotent with current state)
- New tournament added after initial linking requires relinking
- Enables cross-tournament venue sharing and scheduling
- Required for `allCompetitionMatchUps()` to work across tournaments
- Does not copy venues between tournaments automatically
- Tournament must have at least tournamentId property
- Returns success with single tournament (no-op)

---

## unlinkTournament

Unlinks a specific tournament from other tournaments loaded in state by removing it from LINKED_TOURNAMENTS extensions across all linked tournaments.

**Purpose:** Remove a tournament from a linked competition while preserving links between remaining tournaments. Useful for removing qualifying tournaments after completion or isolating a tournament for independent management.

**When to Use:**

- Removing completed qualifying tournament from active competition
- Isolating a tournament for independent scheduling
- Handling tournament withdrawal from series
- Breaking up competition into separate managements
- Removing test tournaments from production data

**Parameters:**

```ts
{
  tournamentId: string;                   // Required - ID of tournament to unlink
  tournamentRecords?: TournamentRecords;  // Optional - from engine state if not provided
}
```

**Returns:**

```ts
{
  success: boolean;
  error?: ErrorType;                      // MISSING_TOURNAMENT_ID, INVALID_VALUES, etc.
}
```

**Unlinking Logic:**

- Removes tournamentId from LINKED_TOURNAMENTS extensions in other tournaments
- Removes LINKED_TOURNAMENTS extension from unlinked tournament
- If remaining linked tournaments = 1, removes their extension too (no point linking to self)
- Preserves links between remaining tournaments (if 2+)

**Examples:**

```js
import { competitionEngine } from 'tods-competition-factory';

// Setup: Link three tournaments
await competitionEngine.setState([qualifyingTournament, mainDrawTournament, doublesOnlyTournament]);
await competitionEngine.linkTournaments();

// Unlink the qualifying tournament (now complete)
const result = await competitionEngine.unlinkTournament({
  tournamentId: 'qualifying-id',
});
console.log(result.success); // true

// Check remaining links
const { linkedTournamentIds } = await competitionEngine.getLinkedTournamentIds();
console.log(linkedTournamentIds);
// {
//   'main-draw-id': ['doubles-only-id'],
//   'doubles-only-id': ['main-draw-id']
// }
// Note: qualifying-id no longer appears

// Verify qualifying tournament has no links
const { tournamentRecord } = competitionEngine.getTournament({
  tournamentId: 'qualifying-id',
});
const linkedExtension = tournamentRecord.extensions?.find((ext) => ext.name === 'linkedTournaments');
console.log(linkedExtension); // undefined

// Unlink down to single tournament - removes extension entirely
await competitionEngine.unlinkTournament({
  tournamentId: 'doubles-only-id',
});

const { tournamentRecord: mainRecord } = competitionEngine.getTournament({
  tournamentId: 'main-draw-id',
});
const stillLinked = mainRecord.extensions?.find((ext) => ext.name === 'linkedTournaments');
console.log(stillLinked); // undefined (can't be linked to only yourself)

// Error handling
result = await competitionEngine.unlinkTournament({
  tournamentId: 'nonexistent-id',
});
console.log(result.error); // MISSING_TOURNAMENT_ID

// Unlinking already unlinked tournament succeeds
result = await competitionEngine.unlinkTournament({
  tournamentId: 'qualifying-id',
});
console.log(result.success); // true (idempotent)

// Multi-tournament workflow example
// Day 1-3: Qualifying
await competitionEngine.setState([qualifyingTournament]);
// ... run qualifying ...

// Day 4-10: Main draw starts, link with qualifying
await competitionEngine.setState([qualifyingTournament, mainDrawTournament]);
await competitionEngine.linkTournaments();
// ... access combined data ...

// Day 11+: Qualifying done, unlink it
await competitionEngine.unlinkTournament({
  tournamentId: qualifyingTournament.tournamentId,
});
// ... continue with just main draw ...
```

**Notes:**

- Tournament must exist in state
- Modifies LINKED_TOURNAMENTS extension across all affected tournaments
- When 2 tournaments remain after unlinking, they stay linked to each other
- When 1 tournament remains after unlinking, its extension is removed (can't self-link)
- Unlinked tournament's extension is always removed
- Does not remove tournament from state - only removes links
- Safe to call on already unlinked tournaments (idempotent)
- Does not affect venues, participants, or schedule
- Useful for phased competition management (qualifying → main → finals)
- Does not automatically update `allCompetitionMatchUps()` results

---

## unlinkTournaments

Removes LINKED_TOURNAMENTS extension from all tournaments currently loaded in state. Effectively dissolves the competition into independent tournaments.

**Purpose:** Break all links between tournaments in a competition, returning each tournament to independent management. Useful for competition teardown or converting linked competitions back to standalone tournaments.

**When to Use:**

- Ending a competition series
- Resetting tournament relationships for fresh linking
- Converting linked competition back to independent tournaments
- Cleaning up test data
- Preparing tournaments for export as standalone records

**Parameters:**

```ts
{
  tournamentRecords?: TournamentRecords;  // Optional - from engine state if not provided
  discover?: boolean;                     // Traverse extensions to find nested links
}
```

**Returns:**

```ts
{
  success: boolean;
  error?: ErrorType;                      // MISSING_TOURNAMENT_RECORDS if no tournaments
}
```

**Examples:**

```js
import { competitionEngine } from 'tods-competition-factory';

// Setup: Linked competition
await competitionEngine.setState([
  qualifyingTournament,
  mainDrawTournament,
  doublesOnlyTournament,
  teamEventTournament,
]);
await competitionEngine.linkTournaments();

// Verify links exist
let { linkedTournamentIds } = await competitionEngine.getLinkedTournamentIds();
console.log(Object.keys(linkedTournamentIds).length); // 4 tournaments linked

// Unlink all tournaments
const result = await competitionEngine.unlinkTournaments();
console.log(result.success); // true

// Verify all links removed
({ linkedTournamentIds } = await competitionEngine.getLinkedTournamentIds());
console.log(linkedTournamentIds); // {} (empty object)

// Check individual tournament
const { tournamentRecord } = competitionEngine.getTournament({
  tournamentId: 'main-draw-id',
});
const linkedExtension = tournamentRecord.extensions?.find((ext) => ext.name === 'linkedTournaments');
console.log(linkedExtension); // undefined

// Competition teardown workflow
// 1. Competition complete
// 2. Unlink all tournaments
await competitionEngine.unlinkTournaments();

// 3. Export individual tournaments
const tournaments = await competitionEngine.getState();
for (const [tournamentId, tournamentRecord] of Object.entries(tournaments)) {
  await exportTournament(tournamentRecord); // Independent exports
}

// Fresh start workflow
// Reset links before establishing new relationships
await competitionEngine.unlinkTournaments();
// ... modify tournament composition ...
await competitionEngine.linkTournaments(); // Create fresh links

// Idempotent - safe to call multiple times
await competitionEngine.unlinkTournaments();
const result2 = await competitionEngine.unlinkTournaments();
console.log(result2.success); // true
```

**Notes:**

- Removes LINKED_TOURNAMENTS extension from all tournaments in state
- Does not remove tournaments from state - only removes links
- Equivalent to calling `unlinkTournament()` for each tournament
- More efficient than unlinking individually
- Idempotent - safe to call when no links exist
- Does not affect venues, participants, schedules, or other extensions
- Required before creating new link structure with different tournaments
- Use `removeExtension({ name: 'linkedTournaments' })` for same effect

---

## removeExtension

Removes a specified extension from all `tournamentRecords` loaded in shared state. Useful for bulk extension management across linked tournaments.

**Purpose:** Remove a specific extension type from all tournaments in competition state. Supports both direct removal and discovery mode that traverses tournament records.

**When to Use:**

- Cleaning up temporary extensions after processing
- Removing deprecated extensions across competitions
- Resetting competition-wide settings
- Bulk data cleanup before export
- Removing test/debug extensions from production data

**Parameters:**

```ts
{
  name: string;                           // Required - extension name to remove
  tournamentRecords?: TournamentRecords;  // Optional - from engine state if not provided
  discover?: boolean;                     // Traverse all tournament records (default: false)
  element?: any;                          // Optional - single element to remove from
}
```

**Returns:**

```ts
{
  success: boolean;
  info?: string;                          // NOT_FOUND if extension doesn't exist
  error?: ErrorType;                      // MISSING_VALUE, INVALID_VALUES, etc.
}
```

**Examples:**

```js
import { competitionEngine } from 'tods-competition-factory';

// Setup: Multiple tournaments with custom extensions
await competitionEngine.setState([tournament1, tournament2, tournament3]);

// Remove extension from all tournaments in state
const result = await competitionEngine.removeExtension({
  name: 'customAnalytics',
  discover: true,
});
console.log(result.success); // true

// Verify removal across all tournaments
const tournaments = await competitionEngine.getState();
for (const [tournamentId, tournamentRecord] of Object.entries(tournaments)) {
  const hasExtension = tournamentRecord.extensions?.some((ext) => ext.name === 'customAnalytics');
  console.log(`${tournamentId} has extension: ${hasExtension}`); // false
}

// Remove linkedTournaments extension (same as unlinkTournaments)
await competitionEngine.removeExtension({
  name: 'linkedTournaments',
  discover: true,
});

// Remove extension from single tournament
await competitionEngine.removeExtension({
  element: specificTournament,
  name: 'temporaryData',
});

// Cleanup workflow - remove multiple extensions
const extensionsToRemove = ['testData', 'debugInfo', 'tempCalculations', 'draftSettings'];

for (const extensionName of extensionsToRemove) {
  await competitionEngine.removeExtension({
    name: extensionName,
    discover: true,
  });
}

// Safe to call on non-existent extension
const result = await competitionEngine.removeExtension({
  name: 'nonexistentExtension',
  discover: true,
});
console.log(result.success); // true
console.log(result.info); // NOT_FOUND

// Error handling
result = await competitionEngine.removeExtension({
  // Missing name parameter
  discover: true,
});
console.log(result.error); // MISSING_VALUE

result = await competitionEngine.removeExtension({
  name: 'someExtension',
  element: 'invalid', // Not an object
});
console.log(result.error); // INVALID_VALUES
```

**Notes:**

- `discover: true` removes extension from all tournaments in tournamentRecords
- Without `discover`, only removes from specified `element`
- Returns success even if extension not found (check `info` for NOT_FOUND)
- Does not cascade to events, draws, or other nested structures
- Name parameter is required
- Use for bulk operations across competition
- More efficient than iterating tournaments manually
- Does not modify extension history or audit trails
- Safe to call repeatedly (idempotent)
- Extension arrays are filtered, not replaced (preserves other extensions)

---

## getTournamentIds

Returns an array of all tournament IDs currently loaded in the competition engine state.

```js
const { tournamentIds } = competitionEngine.getTournamentIds();
console.log(tournamentIds); // ['tournament-1-id', 'tournament-2-id']
```

**Returns:**

```ts
{
  tournamentIds: string[];
  success: boolean;
}
```

**Use Cases:**

- Iterate over all tournaments in competition
- Verify tournaments are loaded
- Check competition size

---

## getLinkedTournamentIds

Returns a mapping object where each tournament ID maps to an array of other tournament IDs it is linked to via the LINKED_TOURNAMENTS extension.

```js
const { linkedTournamentIds } = competitionEngine.getLinkedTournamentIds();
console.log(linkedTournamentIds);
// {
//   'qualifying-id': ['main-draw-id', 'doubles-id'],
//   'main-draw-id': ['qualifying-id', 'doubles-id'],
//   'doubles-id': ['qualifying-id', 'main-draw-id']
// }

// Check if specific tournament is linked
const qualifyingLinks = linkedTournamentIds['qualifying-id'];
if (qualifyingLinks?.includes('main-draw-id')) {
  console.log('Qualifying is linked to main draw');
}
```

**Returns:**

```ts
{
  linkedTournamentIds: {
    [tournamentId: string]: string[];  // Array of linked tournament IDs
  };
  error?: ErrorType;  // MISSING_TOURNAMENT_RECORDS if no tournaments in state
}
```

**Notes:**

- Each tournament ID maps to an array of OTHER tournament IDs (excludes itself)
- Empty array means tournament has no links
- Only returns tournaments that have LINKED_TOURNAMENTS extension
- Use after `linkTournaments()` to verify links were created

---

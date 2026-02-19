---
title: Event Handlers & Integration
---

The ScoringEngine fires event handlers at key moments during scoring. These enable reactive UI updates, logging, analytics, and integration with external systems.

## Event Handlers

### Handler Interface

```ts
interface ScoringEventHandlers {
  onPoint?: (context: ScoringEventContext) => void;
  onGameComplete?: (context: ScoringEventContext & { gameWinner: 0 | 1 }) => void;
  onSetComplete?: (context: ScoringEventContext & { setWinner: 0 | 1 }) => void;
  onMatchComplete?: (context: ScoringEventContext & { matchWinner: 0 | 1 }) => void;
  onUndo?: (context: ScoringEventContext) => void;
  onRedo?: (context: ScoringEventContext) => void;
  onReset?: (context: ScoringEventContext) => void;
}

interface ScoringEventContext {
  state: MatchUp;
  score: ScoreResult;
}
```

All handlers receive a `ScoringEventContext` containing the current matchUp state and score after the action completes. Handlers are called synchronously — keep them fast or dispatch async work.

### Setting Handlers

Handlers can be set at construction time or updated at runtime:

```js
// At construction
const engine = new ScoringEngine({
  matchUpFormat: 'SET3-S:6/TB7',
  eventHandlers: {
    onPoint: (ctx) => console.log('Point!', ctx.score),
    onMatchComplete: (ctx) => console.log('Match over!', ctx.state.winningSide),
  },
});

// At runtime
engine.setEventHandlers({
  onPoint: (ctx) => updateScoreboard(ctx.score),
  onGameComplete: ({ gameWinner }) => playGameAnimation(gameWinner),
  onSetComplete: ({ setWinner }) => playSetAnimation(setWinner),
  onMatchComplete: ({ matchWinner }) => showMatchResult(matchWinner),
  onUndo: (ctx) => updateScoreboard(ctx.score),
  onRedo: (ctx) => updateScoreboard(ctx.score),
});

// Get current handlers
const handlers = engine.getEventHandlers();

// Clear all handlers
engine.setEventHandlers(undefined);
```

### Handler Descriptions

| Handler           | Fired When                           | Extra Context         |
| ----------------- | ------------------------------------ | --------------------- |
| `onPoint`         | After every `addPoint()` call        | —                     |
| `onGameComplete`  | A game completes (within `addPoint`) | `gameWinner: 0 \| 1`  |
| `onSetComplete`   | A set completes (within `addPoint`)  | `setWinner: 0 \| 1`   |
| `onMatchComplete` | The match completes                  | `matchWinner: 0 \| 1` |
| `onUndo`          | After `undo()` succeeds              | —                     |
| `onRedo`          | After `redo()` succeeds              | —                     |
| `onReset`         | After `reset()` is called            | —                     |

:::note
Multiple handlers can fire for a single `addPoint()` call. For example, a point that completes a game, a set, and the match will fire `onPoint`, `onGameComplete`, `onSetComplete`, and `onMatchComplete` in that order.
:::

### Example: Live Scoreboard

```js
const engine = new ScoringEngine({
  matchUpFormat: 'SET3-S:6/TB7',
  eventHandlers: {
    onPoint: ({ score }) => {
      renderScore(score);
      saveState(engine.getState());
    },
    onGameComplete: () => {
      playSound('game-complete');
    },
    onSetComplete: ({ setWinner }) => {
      showSetBanner(`Set won by ${setWinner === 0 ? 'Player 1' : 'Player 2'}`);
    },
    onMatchComplete: ({ matchWinner, state }) => {
      showMatchResult(state);
      submitFinalScore(state);
    },
    onUndo: ({ score }) => renderScore(score),
    onRedo: ({ score }) => renderScore(score),
  },
});
```

---

## competitionFormat Integration

The `competitionFormat` interface allows you to pass a full competition profile that goes beyond the matchUpFormat string. This is used by sports and organizations that need penalty profiles, timer configurations, substitution rules, and other gameplay metadata.

### Passing a competitionFormat

```js
const engine = new ScoringEngine({
  competitionFormat: {
    competitionFormatName: 'INTENNSE Doubles',
    matchUpFormat: 'SET3-S:TB11',
    sport: 'INTENNSE',
    timerProfile: {
      shotClockSeconds: 25,
      changeoverSeconds: 90,
    },
    penaltyProfile: {
      sport: 'INTENNSE',
      penaltyTypes: [
        { penaltyType: 'TIME_VIOLATION', label: 'Time Violation', category: 'delay' },
        { penaltyType: 'CODE_VIOLATION', label: 'Code Violation', category: 'conduct' },
      ],
      escalation: [
        { step: 1, consequence: 'WARNING' },
        { step: 2, consequence: 'POINT_PENALTY' },
        { step: 3, consequence: 'GAME_PENALTY' },
      ],
    },
    pointProfile: {
      sport: 'INTENNSE',
      pointResults: [
        { result: 'Ace', label: 'Ace', isServe: true },
        { result: 'Double Fault', label: 'Double Fault', isServe: true, isError: true },
        { result: 'Winner', label: 'Winner' },
        { result: 'Unforced Error', label: 'Unforced Error', isError: true },
      ],
      strokeTypes: ['forehand', 'backhand', 'volley', 'overhead', 'serve'],
    },
    substitutionRules: {
      allowed: true,
      maxPerMatchUp: 3,
      timing: 'BETWEEN_GAMES',
    },
    pointMultipliers: [{ condition: { result: 'Ace' }, multiplier: 2 }],
    serverRule: 'ALTERNATE_GAMES',
  },
});
```

When a `competitionFormat` is provided, the engine automatically extracts the `matchUpFormat`, `pointMultipliers`, and `serverRule` from it.

### Profile Accessors

Access individual profiles from the competition format:

```js
// Penalty types and escalation rules
const penalties = engine.getPenaltyProfile();
// { sport: 'INTENNSE', penaltyTypes: [...], escalation: [...] }

// Point result types and stroke classifications
const points = engine.getPointProfile();
// { sport: 'INTENNSE', pointResults: [...], strokeTypes: [...] }

// Shot clock and changeover timers
const timers = engine.getTimerProfile();
// { shotClockSeconds: 25, changeoverSeconds: 90 }

// Timeout rules
const timeouts = engine.getTimeoutRules();
// { count: 2, per: 'SET', durationSeconds: 120 }

// Substitution rules
const subs = engine.getSubstitutionRules();
// { allowed: true, maxPerMatchUp: 3, timing: 'BETWEEN_GAMES' }

// Player rules (e.g., minutes per segment)
const playerRules = engine.getPlayerRules();
// { maxMinutesPerSegment: 10 }
```

All profile accessors return `undefined` if no `competitionFormat` was provided or if the specific profile is not defined in the format.

---

## Point Multipliers

Point multipliers allow conditional scaling of point values. This is useful for sports like INTENNSE where aces are worth 2x points.

### Setting Multipliers

```js
// Via constructor
const engine = new ScoringEngine({
  matchUpFormat: 'SET2XA-S:T10P',
  pointMultipliers: [{ condition: { result: 'Ace' }, multiplier: 2 }],
});

// Or at runtime
engine.setPointMultipliers([{ condition: { result: 'Ace' }, multiplier: 2 }]);

// Query current multipliers
const multipliers = engine.getPointMultipliers();
```

When `addPoint()` is called with a matching `result`, the multiplier is applied to the point value during score calculation.

---

## Substitutions & LineUps

The ScoringEngine tracks team lineups and substitutions for doubles or team formats.

### Setting Up LineUps

```js
engine.setLineUp(1, [
  { participantId: 'player-A', participantName: 'Alice' },
  { participantId: 'player-B', participantName: 'Bob' },
]);

engine.setLineUp(2, [
  { participantId: 'player-C', participantName: 'Carol' },
  { participantId: 'player-D', participantName: 'Dave' },
]);
```

### Making Substitutions

```js
engine.substitute({
  sideNumber: 1,
  outParticipantId: 'player-B',
  inParticipantId: 'player-E',
});
```

Substitutions are recorded in the unified timeline and are undoable/redoable like any other action.

### Querying Active Players

```js
const active = engine.getActivePlayers();
// { side1: ['player-A', 'player-E'], side2: ['player-C', 'player-D'] }
```

When lineups are set, each point automatically records which players were active at the time of the point, enabling per-player statistics.

---

## Related Documentation

- **[Overview](./scoring-engine-overview)** — Introduction and architecture
- **[Core API Reference](./scoring-engine-api)** — Complete method reference
- **[Multi-Sport Format Support](./format-support)** — Format strings for different sports
- **[Visualization Applications](./visualization-applications)** — Building visualizations with ScoringEngine data

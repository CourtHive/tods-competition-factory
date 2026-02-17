/**
 * UMO v4.0 - TODS TypeScript Interfaces
 * 
 * Pure TypeScript types matching TODS specification
 * All structures are JSON-serializable
 */

// ============================================================================
// TODS Core Types
// ============================================================================

/**
 * TODS MatchUp - Central data structure
 */
export interface MatchUp {
  matchUpId: string;
  matchUpFormat: string;
  matchUpStatus: MatchUpStatus;
  matchUpType: MatchUpType;
  sides: Side[];
  score: Score;
  winningSide?: number;
  startTime?: string;
  endTime?: string;
  schedule?: Schedule;
  collectionPosition?: number;
  roundNumber?: number;
  roundPosition?: number;
  createdAt?: string;
  updatedAt?: string;
  
  // Optional: History for undo functionality
  history?: MatchUpHistory;
}

/**
 * Side represents one player or team
 */
export interface Side {
  sideNumber: number;
  participantId?: string;
  participant?: Participant;
  lineUp?: TeamCompetitor[];
}

/**
 * TODS Participant
 */
export interface Participant {
  participantId: string;
  participantName?: string;
  participantType: ParticipantType;
  participantRole: ParticipantRole;
  participantStatus?: ParticipantStatus;
  person?: Person;
  individualParticipants?: Participant[];
}

/**
 * Person information
 */
export interface Person {
  personId?: string;
  standardGivenName?: string;
  standardFamilyName?: string;
  nationalityCode?: string;
  sex?: 'MALE' | 'FEMALE' | 'OTHER';
}

/**
 * Team competitor in a lineUp (for substitution tracking)
 */
export interface TeamCompetitor {
  participantId: string;
  collectionAssignments?: CollectionAssignment[];
}

/**
 * Collection assignment for team lineUp
 */
export interface CollectionAssignment {
  collectionId: string;
  collectionPosition?: number;
  previousParticipantId?: string;
  substitutionOrder?: number;
}

/**
 * Substitution event recorded in match history
 */
export interface SubstitutionEvent {
  sideNumber: 1 | 2;
  outParticipantId: string;
  inParticipantId: string;
  beforePointIndex: number;
  timestamp?: string;
}

/**
 * Score structure
 */
export interface Score {
  sets: SetScore[];
  scoreStringSide1?: string;
  scoreStringSide2?: string;
}

/**
 * Set score
 */
export interface SetScore {
  setNumber: number;
  side1Score?: number;
  side2Score?: number;
  side1TiebreakScore?: number;
  side2TiebreakScore?: number;
  side1GameScores?: number[];
  side2GameScores?: number[];
  winningSide?: number;
  setFormat?: string;
  /** Game indices that are hard boundaries (not recalculated past) */
  hardBoundaries?: number[];
  /** Current consecutive point streak for TYPTI format */
  currentStreak?: { side: 0 | 1; count: number };
  /** Whether this set is tiebreak-only (the entire set is one tiebreak game) */
  isTiebreakOnly?: boolean;
  /** Whether this set is timed */
  isTimed?: boolean;
}

/**
 * Schedule information
 */
export interface Schedule {
  scheduledTime?: string;
  scheduledDate?: string;
  venueId?: string;
  courtId?: string;
}

/**
 * History for undo functionality
 */
export interface MatchUpHistory {
  points: Point[];
  states?: MatchUpState[];
  entries?: ScoreEntry[];
  substitutions?: SubstitutionEvent[];
}

/**
 * Score entry for tracking game/set/segment-level inputs
 * alongside point-level entries in history
 */
export interface ScoreEntry {
  type: 'point' | 'game' | 'set' | 'endSegment' | 'setInitialScore' | 'substitution';
  data: any;
  timestamp: string;
  pointIndex?: number;
}

/**
 * Point record stored in match history
 * 
 * @remarks
 * Points use 0-based player indices (NOT TODS sideNumber):
 * - 0 = side 1 (first player/team)  
 * - 1 = side 2 (second player/team)
 * 
 * **MCP Decorations:**
 * Rich point metadata from Match Charting Project includes serve locations,
 * stroke types, court positions, and rally sequences. These decorations are
 * compatible with hive-eye-tracker visualization requirements.
 */
export interface Point {
  /** Sequential point number (1-indexed) */
  pointNumber: number;
  
  /** Winner of the point: 0 = side 1, 1 = side 2 (player index, not sideNumber) */
  winner: 0 | 1;
  
  /** Server of the point: 0 = side 1, 1 = side 2 (player index, not sideNumber) */
  server?: 0 | 1;
  
  /** ISO 8601 timestamp when point was played */
  timestamp?: string;
  
  /** Number of shots in the rally */
  rallyLength?: number;
  
  /** Score after this point (e.g., "15-0") */
  score?: string;
  
  // MCP Decorations (from Match Charting Project data)
  /** Result of the point */
  result?: PointResult;
  
  /** Stroke type used on the final shot */
  stroke?: StrokeType;
  
  /** Hand/wing used on the final shot */
  hand?: 'Forehand' | 'Backhand';
  
  /** Which serve (1st or 2nd) */
  serve?: 1 | 2;
  
  /** Serve location */
  serveLocation?: ServeLocation;
  
  /** Full rally shot sequence with details */
  rally?: RallyShot[];
  
  /** Court location information */
  location?: string;
  
  /** Was this a break point? */
  breakpoint?: boolean;

  /** Original MCP code for traceability */
  code?: string;

  // Engine-computed decorations
  /** Points each side needs to win current game: [side1, side2] */
  pointsToGame?: [number, number];

  /** Points each side needs to win current set: [side1, side2] */
  pointsToSet?: [number, number];

  /** Points each side needs to win the match: [side1, side2] */
  pointsToMatch?: [number, number];

  /** Games each side needs to win current set: [side1, side2] */
  gamesToSet?: [number, number];

  /** Which court side the serve is from */
  serveSide?: 'deuce' | 'ad';

  /** Whether the receiver is one point from winning the game */
  isBreakpoint?: boolean;

  // Score value & active players (Phase 3)
  /** Effective score increment (1 for normal, 2+ with multipliers) */
  scoreValue?: number;

  /** Active players per side at the time of this point */
  activePlayers?: [string, string] | [string[], string[]];

  // Override decorations (set by tracker/user)
  /** Serve was from the wrong court side */
  wrongSide?: boolean;

  /** Wrong player was serving */
  wrongServer?: boolean;

  /** Point was awarded as a penalty */
  penaltyPoint?: boolean;

  /** Specific penalty type from competition format profile */
  penaltyType?: string;

  /** Game boundary after this point should not be recalculated past */
  hardBoundary?: boolean;
}

/**
 * Point result types (how the point ended)
 */
export type PointResult = 
  | 'Ace'
  | 'Winner'
  | 'Serve Winner'
  | 'Forced Error'
  | 'Unforced Error'
  | 'Double Fault'
  | 'Penalty'
  | 'Unknown';

/**
 * Stroke types in tennis
 */
export type StrokeType =
  | 'Forehand'
  | 'Backhand'
  | 'Forehand Slice'
  | 'Backhand Slice'
  | 'Forehand Volley'
  | 'Backhand Volley'
  | 'Overhead Smash'
  | 'Backhand Overhead Smash'
  | 'Forehand Drop Shot'
  | 'Backhand Drop Shot'
  | 'Forehand Lob'
  | 'Backhand Lob'
  | 'Forehand Half-volley'
  | 'Backhand Half-volley'
  | 'Forehand Drive Volley'
  | 'Backhand Drive Volley'
  | 'Trick Shot'
  | 'Unknown Shot';

/**
 * Serve locations
 */
export type ServeLocation = 'Wide' | 'Body' | 'T';

/**
 * Rally shot with court position and stroke details
 */
export interface RallyShot {
  /** Shot number in the rally (1-indexed) */
  shotNumber: number;
  
  /** Player who hit this shot (0 or 1) */
  player: 0 | 1;
  
  /** Stroke type */
  stroke: StrokeType;
  
  /** Direction of shot (1=FH side, 2=middle, 3=BH side) */
  direction?: 1 | 2 | 3;
  
  /** Depth of shot */
  depth?: 'shallow' | 'deep' | 'very deep';
  
  /** Court position */
  position?: 'baseline' | 'net' | 'approach';
  
  /** Original MCP code for this shot */
  code?: string;
}

/**
 * Saved state for undo
 */
export interface MatchUpState {
  score: Score;
  matchUpStatus: MatchUpStatus;
  winningSide?: number;
}

// ============================================================================
// Enums & Constants
// ============================================================================

export type MatchUpStatus = 
  | 'TO_BE_PLAYED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ABANDONED'
  | 'DEFAULTED'
  | 'RETIRED'
  | 'WALKOVER';

export type MatchUpType = 
  | 'SINGLES'
  | 'DOUBLES'
  | 'TEAM';

export type ParticipantType = 
  | 'INDIVIDUAL'
  | 'PAIR'
  | 'TEAM';

export type ParticipantRole = 
  | 'COMPETITOR'
  | 'ALTERNATE'
  | 'SEED';

export type ParticipantStatus = 
  | 'ACTIVE'
  | 'INACTIVE'
  | 'WITHDRAWN';

// ============================================================================
// Function Options
// ============================================================================

/**
 * Options for creating a matchUp
 */
export interface CreateMatchUpOptions {
  matchUpId?: string;
  matchUpFormat: string;
  participants?: Participant[];
  isDoubles?: boolean;
  matchUpType?: MatchUpType;
}

/**
 * Options for adding a point
 * 
 * @remarks
 * The winner and server use 0-based player indices (NOT TODS sideNumber):
 * - 0 = side 1 (first player/team)
 * - 1 = side 2 (second player/team)
 * 
 * This matches the common point-by-point notation used in tennis datasets
 * where points are represented as strings like "0011001100..." where each
 * character indicates the winner of that point (0 or 1).
 * 
 * @example
 * ```typescript
 * // Player 1 (side 1) wins the point
 * addPoint(matchUp, { winner: 0 });
 * 
 * // Player 2 (side 2) wins the point  
 * addPoint(matchUp, { winner: 1, server: 0 });
 * ```
 */
export interface AddPointOptions {
  /** Winner of the point: 0 = side 1, 1 = side 2 (player index, not sideNumber) */
  winner: 0 | 1;

  /** Server of the point: 0 = side 1, 1 = side 2 (player index, not sideNumber) */
  server?: 0 | 1;

  /** ISO 8601 timestamp when point was played */
  timestamp?: string;

  /** Number of shots in the rally (optional metadata) */
  rallyLength?: number;

  /** Point result for multiplier resolution (e.g., 'Ace', 'Winner') */
  result?: PointResult;

  /** Specific penalty type from competition format profile */
  penaltyType?: string;

  // Override decorations
  /** Serve was from the wrong court side */
  wrongSide?: boolean;

  /** Wrong player was serving */
  wrongServer?: boolean;

  /** Point was awarded as a penalty */
  penaltyPoint?: boolean;
}

/**
 * Options for getting scoreboard
 */
export interface GetScoreboardOptions {
  perspective?: number;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// ============================================================================
// Internal Scoring Types (not exposed in TODS)
// ============================================================================

/**
 * Internal format structure (from parseFormat / matchUpFormatCode.parse)
 *
 * Matches the full ParsedFormat from tods-competition-factory grammar:
 * SET3-S:6/TB7, SET7XA-S:T10P, HAL2A-S:T45, SET3-S:TB11@RALLY, SET5-S:5-G:3C, etc.
 */
export interface FormatStructure {
  bestOf?: number;
  exactly?: number;
  aggregate?: boolean;
  matchRoot?: string;           // Only when NOT 'SET': 'HAL' | 'QTR' | 'PER' | 'INN' | 'RND' | 'FRM' | 'MAP' | 'MAT'
  matchMods?: string[];         // Unknown modifier letters (forward compat)
  setFormat?: SetFormatStructure;
  finalSetFormat?: SetFormatStructure;
  gameFormat?: GameFormatStructure;
  simplified?: boolean;         // True for standalone timed (T20, T10P)
}

/**
 * Set format structure
 *
 * Three mutually exclusive set types:
 * 1. Standard set: has setTo (e.g., S:6/TB7)
 * 2. Tiebreak-only set: has tiebreakSet (e.g., S:TB11)
 * 3. Timed set: has timed+minutes (e.g., S:T10P)
 */
export interface SetFormatStructure {
  // Standard set
  setTo?: number;
  tiebreakAt?: number | string;
  tiebreakFormat?: TiebreakFormatStructure;
  noTiebreak?: boolean;
  NoAD?: boolean;
  winBy?: number;
  // Tiebreak-only set (mutually exclusive with setTo)
  tiebreakSet?: TiebreakFormatStructure;
  // Timed set
  timed?: boolean;
  minutes?: number;
  based?: string;               // 'P' (points) | 'G' (games, default) | 'A' (aggregate)
  modifier?: string;
  // Game format within set
  gameFormat?: GameFormatStructure;
}

/**
 * Tiebreak format structure
 */
export interface TiebreakFormatStructure {
  tiebreakTo?: number;
  modifier?: string;            // 'RALLY' for rally scoring
  NoAD?: boolean;               // Win-by-1 tiebreak
}

/**
 * Game format structure
 */
export interface GameFormatStructure {
  type?: 'AGGR' | 'CONSECUTIVE';
  count?: number;               // Consecutive points per game (for TYPTI)
  NoAD?: boolean;
}

/**
 * Set type resolved from format + current state
 */
export type SetType = 'standard' | 'tiebreakOnly' | 'timed' | 'matchTiebreak';

// ============================================================================
// Engine API Types
// ============================================================================

/**
 * Options for ending a timed segment
 */
export interface EndSegmentOptions {
  /** Which set/segment to end (1-indexed, defaults to current) */
  setNumber?: number;
  /** When the segment ended */
  timestamp?: string;
  /** Reason for ending */
  reason?: 'time' | 'mercy' | 'manual';
}

/**
 * Options for setting initial score (late arrival)
 */
export interface InitialScoreOptions {
  /** Completed sets */
  sets: Array<{
    side1Score: number;
    side2Score: number;
    side1TiebreakScore?: number;
    side2TiebreakScore?: number;
    winningSide?: number;
  }>;
  /** Current in-progress set's game score */
  currentSetScore?: {
    side1Score: number;
    side2Score: number;
  };
  /** Current in-progress game's point score */
  currentGameScore?: {
    side1Points: number;
    side2Points: number;
  };
  /** Who is currently serving */
  server?: 0 | 1;
}

/**
 * Options for adding a complete set score (Phase 2: set-level input)
 */
export interface AddSetOptions {
  /** Side 1 game/point score for this set */
  side1Score: number;
  /** Side 2 game/point score for this set */
  side2Score: number;
  /** Side 1 tiebreak score (if tiebreak was played) */
  side1TiebreakScore?: number;
  /** Side 2 tiebreak score (if tiebreak was played) */
  side2TiebreakScore?: number;
  /** Winning side (1 or 2). Can be inferred from scores + format */
  winningSide?: 1 | 2;
  /** ISO 8601 timestamp */
  timestamp?: string;
}

/**
 * Options for adding a game result (Phase 2: game-level input)
 */
export interface AddGameOptions {
  /** Winner of the game: 0 = side 1, 1 = side 2 (player index) */
  winner: 0 | 1;
  /** Tiebreak score if this was a tiebreak game [side1, side2] */
  tiebreakScore?: [number, number];
  /** ISO 8601 timestamp */
  timestamp?: string;
}

// ============================================================================
// Result Types
// ============================================================================

/**
 * Score query result
 */
export interface ScoreResult {
  sets: SetScore[];
  scoreString: string;
  games?: number[];
  points?: number[];
}

/**
 * Statistics result
 */
export interface Statistics {
  totalPoints: number;
  pointsWon: number[];
  gamesWon: number[];
  setsWon: number[];
  aces?: number[];
  doubleFaults?: number[];
  breakPoints?: number[];
}

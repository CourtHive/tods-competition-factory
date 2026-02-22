/**
 * Temporal Engine - Barrel Export
 *
 * Court availability as continuous time-based capacity streams.
 * UI-agnostic state machine for tournament scheduling.
 */

// Core engine
export { TemporalEngine } from './TemporalEngine';

// Types
export type * from './types';
export { BLOCK_TYPES } from './types';

// Rail derivation utilities
export {
  buildDayRange,
  buildEdges,
  clampToDayRange,
  courtDayKey,
  courtKey,
  deriveRailSegments,
  diffMinutes,
  extractDay,
  mergeAdjacentSegments,
  overlappingRange,
  rangesOverlap,
  resolveCourtId,
  resolveStatus,
  resolveVenueId,
  sortEdges,
  validateSegments,
  venueDayKey,
  venueKey,
} from './railDerivation';

// Capacity curve
export {
  calculateCapacityStats,
  compareCapacityCurves,
  filterCapacityCurve,
  generateCapacityCurve,
  sampleCapacityCurve,
  type CapacityDiff,
  type CapacityStats,
} from './capacityCurve';

// Collision detection
export {
  clampDragToCollisions,
  findBlocksContainingTime,
  intervalsOverlap,
  sortBlocksByStart,
  timeInsideBlock,
} from './collisionDetection';

// Conflict evaluators
export {
  adjacentBlockEvaluator,
  blockDurationEvaluator,
  courtOverlapEvaluator,
  createFollowByEvaluator,
  dayBoundaryEvaluator,
  defaultEvaluators,
  EvaluatorRegistry,
  formatConflicts,
  getHighestSeverity,
  groupConflictsBySeverity,
  lightingEvaluator,
  maintenanceWindowEvaluator,
  matchWindowEvaluator,
} from './conflictEvaluators';

// Time granularity
export {
  hhmmToMinutes,
  iterateDayTicks,
  minutesToHhmm,
  snapIsoToGranularity,
  snapToGranularity,
} from './timeGranularity';

// Plan state
export { computePlanItemId, type DayPlan, type PlanItem } from './planState';

// Validation pipeline
export {
  runValidationPipeline,
  type FixAction,
  type IssueIndex,
  type RuleResult,
  type ValidationPhase,
  type ValidationPipelineParams,
  type ValidationPipelineResult,
  type ValidationSeverity,
} from './validationPipeline';

// Factory bridge
export {
  applyTemporalAvailabilityToTournamentRecord,
  buildSchedulingProfileFromUISelections,
  calculateCourtHours,
  mergeOverlappingAvailability,
  railsToDateAvailability,
  todsAvailabilityToBlocks,
  validateDateAvailability,
  validateSchedulingProfileFormat,
  type BridgeConfig,
  type SchedulingProfile,
  type SchedulingProfileItem,
  type SchedulingProfileRound,
  type SchedulingSelection,
  type TodsDateAvailability,
  type TodsCourt,
  type TodsVenue,
} from './bridge';

export const APPLIED_POLICIES = 'appliedPolicies';
export const AUDIT_POSITION_ACTIONS = 'positionActions';
export const CONTEXT = 'context';
export const DELEGATED_OUTCOME = 'delegatedOutcome';
export const DISABLED = 'disabled';
export const DISABLE_LINKS = 'disableLinks';
export const DISABLE_AUTO_CALC = 'disableAutoCalc';
export const DRAW_DELETIONS = 'drawDeletions';
export const DRAW_PROFILE = 'drawProfile';
export const ENTRY_PROFILE = 'entryProfile';
export const EVENT_PROFILE = 'eventProfile';
export const FACTORY = 'factory';
export const FLIGHT_PROFILE = 'flightProfile';
export const GROUPING_ATTRIBUTE = 'groupingAttribute';
export const LINEUPS = 'lineUps';
export const LINKED_TOURNAMENTS = 'linkedTournamentsIds';
export const MATCHUP_HISTORY = 'matchUpHistory';
export const PARTICIPANT_REPRESENTATIVES = 'participantRepresentatives';
export const PERSON_REQUESTS = 'personRequests';
export const RANKING_POINTS = 'rankingPoints';
export const ROUND_TARGET = 'roundTarget';
export const SCHEDULE_LIMITS = 'scheduleLimits';
export const SCHEDULE_TIMING = 'scheduleTiming';
export const SCHEDULING_PROFILE = 'schedulingProfile';
export const SUB_ORDER = 'subOrder';
export const TALLY = 'tally';
export const TIE_FORMAT_MODIFICATIONS = 'tieFormatModification';

export const extensionConstants = {
  APPLIED_POLICIES,
  AUDIT_POSITION_ACTIONS,
  CONTEXT, // used to capture, e.g. context in which a venue was added
  DELEGATED_OUTCOME,
  DISABLED,
  DISABLE_LINKS,
  DISABLE_AUTO_CALC,
  DRAW_DELETIONS,
  DRAW_PROFILE,
  ENTRY_PROFILE, // used for drawGeneration; not relevant for anonymized tournaments
  EVENT_PROFILE,
  FLIGHT_PROFILE,
  GROUPING_ATTRIBUTE, // for generating teams; not relevant for anonymized tournaments
  LINEUPS,
  LINKED_TOURNAMENTS,
  MATCHUP_HISTORY,
  PARTICIPANT_REPRESENTATIVES,
  PERSON_REQUESTS,
  RANKING_POINTS, // for attaching points awarded to tournamentRecord
  ROUND_TARGET,
  SCHEDULE_LIMITS,
  SCHEDULE_TIMING,
  SCHEDULING_PROFILE,
  SUB_ORDER,
  TALLY,
  TIE_FORMAT_MODIFICATIONS, // for auditing, not important when anonymized
  FACTORY, // used for capturing versioning of factory and other TODS document processors
};

export const internalExtensions = [
  DELEGATED_OUTCOME,
  DISABLED,
  DISABLE_LINKS,
  FLIGHT_PROFILE,
  LINEUPS,
  MATCHUP_HISTORY,
  PARTICIPANT_REPRESENTATIVES,
  PERSON_REQUESTS,
  ROUND_TARGET,
  SCHEDULE_LIMITS,
  SCHEDULE_TIMING,
  SCHEDULING_PROFILE,
  SUB_ORDER,
  TALLY,
];

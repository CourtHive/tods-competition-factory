export const POLICY_TYPE_VOLUNTARY_CONSOLATION = 'voluntaryConsolation';
export const POLICY_TYPE_COMPETITIVE_BANDS = 'competitiveBands';
export const POLICY_TYPE_ROUND_ROBIN_TALLY = 'roundRobinTally';
export const POLICY_TYPE_POSITION_ACTIONS = 'positionActions';
export const POLICY_TYPE_MATCHUP_ACTIONS = 'matchUpActions';
export const POLICY_TYPE_RANKING_POINTS = 'rankingPoints';
export const POLICY_TYPE_ROUND_NAMING = 'roundNaming';
export const POLICY_TYPE_PARTICIPANT = 'participant';
export const POLICY_TYPE_PROGRESSION = 'progression';
export const POLICY_TYPE_SCHEDULING = 'scheduling';
export const POLICY_TYPE_AVOIDANCE = 'avoidance';
export const POLICY_TYPE_PRIVACY = 'participant'; // TODO: this should be 'privacy'
export const POLICY_TYPE_DISPLAY = 'display'; // storage for client type displays, e.g. { public: {}, admin: {} }
export const POLICY_TYPE_SCORING = 'scoring';
export const POLICY_TYPE_SEEDING = 'seeding';
export const POLICY_TYPE_FEED_IN = 'feedIn';
export const POLICY_TYPE_AUDIT = 'audit';
export const POLICY_TYPE_DRAWS = 'draws';

export type ValidPolicyTypes =
  | typeof POLICY_TYPE_VOLUNTARY_CONSOLATION
  | typeof POLICY_TYPE_COMPETITIVE_BANDS
  | typeof POLICY_TYPE_ROUND_ROBIN_TALLY
  | typeof POLICY_TYPE_POSITION_ACTIONS
  | typeof POLICY_TYPE_MATCHUP_ACTIONS
  | typeof POLICY_TYPE_RANKING_POINTS
  | typeof POLICY_TYPE_ROUND_NAMING
  | typeof POLICY_TYPE_PARTICIPANT
  | typeof POLICY_TYPE_PROGRESSION
  | typeof POLICY_TYPE_SCHEDULING
  | typeof POLICY_TYPE_AVOIDANCE
  | typeof POLICY_TYPE_DISPLAY
  | typeof POLICY_TYPE_PRIVACY
  | typeof POLICY_TYPE_FEED_IN
  | typeof POLICY_TYPE_SCORING
  | typeof POLICY_TYPE_SEEDING
  | typeof POLICY_TYPE_AUDIT
  | typeof POLICY_TYPE_DRAWS;

export const policyConstants = {
  POLICY_TYPE_VOLUNTARY_CONSOLATION,
  POLICY_TYPE_COMPETITIVE_BANDS,
  POLICY_TYPE_ROUND_ROBIN_TALLY,
  POLICY_TYPE_POSITION_ACTIONS,
  POLICY_TYPE_MATCHUP_ACTIONS,
  POLICY_TYPE_RANKING_POINTS,
  POLICY_TYPE_ROUND_NAMING,
  POLICY_TYPE_PARTICIPANT,
  POLICY_TYPE_PROGRESSION,
  POLICY_TYPE_SCHEDULING,
  POLICY_TYPE_AVOIDANCE,
  POLICY_TYPE_DISPLAY,
  POLICY_TYPE_PRIVACY,
  POLICY_TYPE_FEED_IN,
  POLICY_TYPE_SCORING,
  POLICY_TYPE_SEEDING,
  POLICY_TYPE_AUDIT,
  POLICY_TYPE_DRAWS,
} as const;

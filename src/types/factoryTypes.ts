import { MatchUpFilters } from '../drawEngine/getters/getMatchUps/filterMatchUps';
import { MatchUpsMap } from '../drawEngine/getters/getMatchUps/getMatchUpsMap';
import { SignedInStatusEnum } from '../constants/participantConstants';
import { HydratedMatchUp, HydratedParticipant } from './hydrated';
import { ErrorType } from '../constants/errorConditionConstants';
import { ValidPolicyTypes } from '../constants/policyConstants';
import {
  Category,
  DrawDefinition,
  Entry,
  Event,
  Extension,
  GenderEnum,
  MatchUpFinishingPositionRange,
  Participant,
  ParticipantRoleEnum,
  ParticipantTypeEnum,
  SexEnum,
  Side,
  StageTypeEnum,
  TimeItem,
  Tournament,
  TypeEnum,
} from './tournamentFromSchema';

export type FactoryEngine = {
  [key: string]: any;
};

export type TournamentRecordsArgs = {
  tournamentRecords: { [key: string]: Tournament } | Tournament[];
};

export type ScheduleTimesResult = { scheduleTime: string };

export type SeedBlock = {
  drawPositions: number[];
  seedNumbers: number[];
};

export type SeedingProfile = {
  groupSeedingThreshold?: number;
  positioning?: string;
};

export type ScaleAttributes = {
  eventType: TypeEnum;
  scaleType: string;
  scaleName: string;
  accessor?: string; // optional - string determining how to access attribute if scaleValue is an object
};

export type ScaleItem = {
  scaleDate?: string | Date;
  eventType: TypeEnum;
  scaleName: string;
  scaleType: string;
  scaleValue: any;
};

export type Flight = {
  manuallyAdded?: boolean;
  drawEntries: Entry[]; // entries allocated to target draw
  flightNumber: number;
  drawName: string; // custom name for generated draw
  drawId: string; // unique identifier for generating drawDefinitions
};

export type FlightProfile = {
  scaleAttributes?: ScaleAttributes;
  splitMethod?: string;
  flights: Flight[];
};

export type PolicyDefinitions = {
  [key in ValidPolicyTypes]?: { [key: string]: any };
};

export type QueueMethod = {
  params: { [key: string]: any };
  method: string;
};

export type RoundProfile = {
  [key: number]: {
    finishingPositionRange: MatchUpFinishingPositionRange;
    pairedDrawPositions: number[][];
    abbreviatedRoundName?: string;
    participantsCount?: number;
    drawPositions?: number[];
    inactiveRound?: boolean;
    feedRoundIndex?: number;
    inactiveCount?: number;
    finishingRound?: number;
    preFeedRound?: boolean;
    matchUpsCount: number;
    roundFactor?: number;
    feedRound?: boolean;
    roundIndex?: number;
    roundNumber: number;
    roundName?: string;
  };
};

export type ParticipantFilters = {
  accessorValues?: { accessor: string; value: any }[];
  participantRoleResponsibilities?: string[];
  participantRoles?: ParticipantRoleEnum[];
  participantTypes?: ParticipantTypeEnum[];
  signInStatus?: SignedInStatusEnum;
  positionedParticipants?: boolean; // boolean - participantIds that are included in any structure.positionAssignments
  eventEntryStatuses?: string[]; // {string[]} participantIds that are in entry.entries with entryStatuses
  drawEntryStatuses?: string[]; // {string[]} participantIds that are in draw.entries or flightProfile.flights[].drawEnteredParticipantIds with entryStatuses
  enableOrFiltering?: boolean;
  participantIds?: string[];
  genders?: GenderEnum;
  eventIds?: string[];
};

export type StructureSortConfig = {
  deprioritizeCompleted?: boolean;
  mode?: { [key: string]: number };
};

export type PersonData = {
  participantExtensions?: Extension[];
  participantTimeItems?: TimeItem[];
  [key: string]: any;
};

export type AddressProps = {
  postalCodesCount?: number;
  citiesCount?: number;
  statesCount?: number;
  [key: string]: any;
};

export type TeamKey = {
  participantAttribute?: string;
  addParticipants?: boolean;
  personAttribute?: string;
  teamNames?: string[];
  accessor?: string;
  uuids?: string[];
};

export type ScheduleAnalysis =
  | boolean
  | {
      scheduledMinutesDifference: number;
    };

export type ParticipantsProfile = {
  participantType?: ParticipantTypeEnum;
  scaledParticipantsCount?: number;
  rankingRange?: [number, number];
  nationalityCodesCount?: number;
  scaleAllParticipants?: boolean;
  personExtensions?: Extension[];
  valuesInstanceLimit?: number;
  addressProps?: AddressProps;
  convertExtensions?: boolean;
  participantsCount?: number;
  addParticipants?: boolean;
  withScaleValues?: boolean;
  personAttribute?: string;
  consideredDate?: string;
  withGroupings?: boolean;
  personData?: PersonData;
  personIds?: string[];
  inContext?: boolean;
  category?: Category;
  withISO2?: boolean;
  withIOC?: boolean;
  teamKey?: TeamKey;
  idPrefix?: string;
  uuids?: string[];
  sex?: SexEnum;

  // Usage via participantsProfile unconfirmed...
  usePublishState?: boolean;
  withStatistics?: boolean;
  withOpponents?: boolean;
  withMatchUps?: boolean;
  withSeeding?: boolean;
  withEvents?: boolean;
  withDraws?: boolean;

  participantFilters?: ParticipantFilters;
  scheduleAnalysis?: ScheduleAnalysis;
  policyDefinitions?: PolicyDefinitions;
};

export type ScheduleVisibilityFilters = {
  visibilityThreshold: string;
  eventIds?: string[];
  drawIds?: string[];
};

export type ContextContent = {
  policies?: PolicyDefinitions;
};

export type ContextProfile = {
  withCompetitiveness?: boolean;
  withScaleValues?: boolean;
  inferGender?: boolean;
  exclude?: string[];
};

type Counters = {
  walkoverWins: number;
  defaultWins: number;
  walkovers: number;
  defaults: number;
  losses: number;
  wins: number;
};

export type ScheduleConflict = {
  priorScheduledMatchUpId: string;
  matchUpIdWithConflict: string;
};

export type StructureParticipation = {
  rankingStage: StageTypeEnum;
  walkoverWinCount: number;
  defaultWinCount: number;
  stageSequence: number;
  structureId: string;
  winCount: number;
  drawId: string;
};

export type MappedParticipant = {
  structureParticipation:
    | { [key: string]: StructureParticipation }
    | StructureParticipation[];
  potentialMatchUps: {
    tournamentId: string;
    matchUpId: string;
    eventId: string;
    drawId: string;
  }[];
  scheduleConflicts: ScheduleConflict[];
  scheduleItems: any[];
  participant: HydratedParticipant & {
    groupParticipantIds: string[];
    pairParticipantIds: string[];
    teamParticipantIds: string[];
    groups: {
      participantRoleResponsibilities?: string[];
      participantOtherName?: string;
      participantName: string;
      participantId: string;
    }[];
    teams: {
      participantRoleResponsibilities?: string[];
      participantOtherName?: string;
      participantName: string;
      participantId: string;
      teamId: string;
    }[];
  };
  // NOTE: for the following an Object is used for the aggregation step and the reuslt is returned as an array
  statistics: { [key: string]: any } | any[];
  opponents: { [key: string]: any } | any[];
  pairIdMap: { [key: string]: any } | any[];
  matchUps: { [key: string]: any } | any[];
  events: { [key: string]: any } | any[];
  draws: { [key: string]: any } | any[];
  counters: Counters & {
    [TypeEnum.Doubles]: Counters;
    [TypeEnum.Singles]: Counters;
    [TypeEnum.Team]: Counters;
  };
};

export type ParticipantMap = { [key: string]: MappedParticipant };

export type GetMatchUpsArgs = {
  scheduleVisibilityFilters?: ScheduleVisibilityFilters;
  tournamentAppliedPolicies?: PolicyDefinitions;
  participantsProfile?: ParticipantsProfile;
  participants?: HydratedParticipant[];
  policyDefinitions?: PolicyDefinitions;
  context?: { [key: string]: any };
  contextFilters?: MatchUpFilters;
  matchUpFilters?: MatchUpFilters;
  contextContent?: ContextContent;
  participantMap?: ParticipantMap;
  tournamentRecord?: Tournament;
  contextProfile?: ContextProfile;
  drawDefinition?: DrawDefinition;
  afterRecoveryTimes?: boolean;
  useParticipantMap?: boolean;
  nextMatchUps?: boolean;
  tournamentId?: string;
  inContext?: boolean;
  event?: Event;
};

export type HydratedSide = Side & {
  individualParticipants?: Participant[];
  participant?: Participant;
};

export type GroupsMatchUpsResult = {
  abandonedMatchUps?: HydratedMatchUp[];
  completedMatchUps?: HydratedMatchUp[];
  upcomingMatchUps?: HydratedMatchUp[];
  pendingMatchUps?: HydratedMatchUp[];
  byeMatchUps?: HydratedMatchUp[];
  matchUpsMap?: MatchUpsMap;
  matchUpsCount?: number;
  success?: boolean;
  error?: ErrorType;
};

export type TournamentRecords = {
  [key: string]: Tournament;
};

export type ExitProfiles = { [key: string]: string[] };

type MinutesMapping = {
  categoryNames: string[];
  minutes: any;
};

export type ScheduleTiming = {
  matchUpRecoveryTimes: {
    [key: string]: {
      recoveryTiming: MinutesMapping[];
      matchUpFormatCodes: string[];
    };
  }[];
  matchUpAverageTimes: {
    [key: string]: {
      [key: string]: {
        averageTiming: MinutesMapping[];
        matchUpFormatCodes: string[];
      };
    };
  }[];
};

export type Substitution = {
  previousParticipantId: string;
  substitutionOrder: number;
  participantId: string;
};

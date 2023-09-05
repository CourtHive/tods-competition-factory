import { ErrorType } from '../constants/errorConditionConstants';
import { SignedInStatusEnum } from '../constants/participantConstants';
import { MatchUpsMap } from '../drawEngine/getters/getMatchUps/getMatchUpsMap';
import { HydratedMatchUp, HydratedParticipant } from './hydrated';
import {
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
  [key: string]: any;
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
  [key: string]: any;
  positionedParticipants?: boolean; // boolean - participantIds that are included in any structure.positionAssignments
  eventEntryStatuses?: string[]; // {string[]} participantIds that are in entry.entries with entryStatuses
  drawEntryStatuses?: string[]; // {string[]} participantIds that are in draw.entries or flightProfile.flights[].drawEnteredParticipantIds with entryStatuses
  accessorValues?: { accessor: string; value: any }[];
  participantRoleResponsibilities?: string[];
  participantRoles?: ParticipantRoleEnum[];
  participantTypes?: ParticipantTypeEnum[];
  signInStatus?: SignedInStatusEnum;
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
  withISO2?: boolean;
  withIOC?: boolean;
  teamKey?: TeamKey;
  idPrefix?: string;
  uuids?: string[];
  category?: any;
  sex?: SexEnum;

  // Usage via participantsProfile unconfirmed...
  usePublishState?: boolean;
  withStatistics?: boolean;
  withOpponents?: boolean;
  withMatchUps?: boolean;
  withSeeding?: boolean;
  withEvents?: boolean;
  withDraws?: boolean;

  scheduleAnalysis?: ScheduleAnalysis;
  participantFilters?: any;
  policyDefinitions?: any;
};

export type ScheduleVisibilityFilters = {
  visibilityThreshold: string;
  eventIds?: string[];
  drawIds?: string[];
}[];

export type GetMatchUpsArgs = {
  participantMap?: { [key: string]: HydratedParticipant[] };
  scheduleVisibilityFilters?: ScheduleVisibilityFilters;
  participantsProfile?: ParticipantsProfile;
  participants?: HydratedParticipant[];
  tournamentAppliedPolicies?: any;
  tournamentRecord?: Tournament;
  drawDefinition?: DrawDefinition;
  afterRecoveryTimes?: boolean;
  useParticipantMap?: boolean;
  policyDefinitions?: any;
  nextMatchUps?: boolean;
  tournamentId?: string;
  contextFilters?: any;
  contextContent?: any;
  matchUpFilters?: any;
  contextProfile?: any;
  inContext?: boolean;
  context?: any;
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

export interface Tournament {
  createdAt?: Date | string;
  /**
   * Date on which the tournament ends
   */
  endDate?: string;
  events?: Event[];
  extensions?: Extension[];
  formalName?: string;
  hostCountryCode?: CountryCodeEnum;
  indoorOutdoor?: IndoorOutdoorEnum;
  isMock?: boolean;
  localTimeZone?: string;
  matchUps?: MatchUp[];
  notes?: string;
  onlineResources?: OnlineResource[];
  parentOrganisationId?: string;
  parentOrganisation?: Organisation;
  participants?: Participant[];
  processCodes?: string[];
  promotionalName?: string;
  registrationProfile?: RegistrationProfile;
  season?: string;
  /**
   * Date on which the tournament starts
   */
  startDate?: string;
  surfaceCategory?: SurfaceCategoryEnum;
  timeItems?: TimeItem[];
  totalPrizeMoney?: PrizeMoney[];
  tournamentCategories?: Category[];
  tournamentGroups?: string[];
  tournamentId: string;
  tournamentLevel?: TournamentLevelEnum;
  tournamentName?: string;
  tournamentOtherIds?: UnifiedTournamentID[];
  tournamentRank?: string;
  updatedAt?: Date | string;
  venues?: Venue[];
}

export interface Organisation {
  onlineResources?: OnlineResource[];
  organisationAbbreviation: string;
  parentOrganisationId?: string;
  extensions?: Extension[];
  organisationName: string;
  organisationId: string;
  notes?: string;
}

export interface Event {
  allowedDrawTypes?: DrawTypeUnion[];
  category?: Category;
  createdAt?: Date | string;
  discipline?: DisciplineEnum;
  drawDefinitions?: DrawDefinition[];
  /**
   * Date on which the event ends
   */
  endDate?: string;
  entries?: Entry[];
  eventAbbreviation?: string;
  eventId: string;
  eventLevel?: TournamentLevelEnum;
  eventName?: string;
  eventOrder?: number;
  eventRank?: string;
  eventType?: EventTypeUnion;
  extensions?: Extension[];
  gender?: GenderUnion;
  indoorOutdoor?: IndoorOutdoorEnum;
  isMock?: boolean;
  links?: DrawLink[];
  matchUpFormat?: string;
  notes?: string;
  processCodes?: string[];
  /**
   * Date on which the event starts
   */
  startDate?: string;
  surfaceCategory?: SurfaceCategoryEnum;
  tennisOfficialIds?: string[];
  tieFormat?: TieFormat;
  tieFormatId?: string;
  tieFormats?: TieFormat[];
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
  wheelchairClass?: WheelchairClassEnum;
}

export enum DrawTypeEnum {
  AD_HOC = 'AD_HOC',
  COMPASS = 'COMPASS',
  CURTIS_cONSOLATION = 'CURTIS_CONSOLATION',
  DOUBLE_eLIMINATION = 'DOUBLE_ELIMINATION',
  FEED_IN = 'FEED_IN',
  FEED_IN_CHAMPIONSHIP = 'FEED_IN_CHAMPIONSHIP',
  FEED_IN_CHAMPIONSHIP_TO_QF = 'FEED_IN_CHAMPIONSHIP_TO_QF',
  FEED_IN_CHAMPIONSHIP_TO_R16 = 'FEED_IN_CHAMPIONSHIP_TO_R16',
  FEED_In_CHAMPIONSHIP_TO_SF = 'FEED_IN_CHAMPIONSHIP_TO_SF',
  FIRST_MATCH_LOSER_CONSOLATION = 'FIRST_MATCH_LOSER_CONSOLATION',
  FIRST_ROUND_LOSER_CONSOLATION = 'FIRST_ROUND_LOSER_CONSOLATION',
  MODIFIED_FEED_IN_CHAMPIONSHIP = 'MODIFIED_FEED_IN_CHAMPIONSHIP',
  LUCKY_DRAW = 'LUCKY_DRAW',
  OLYMPIC = 'OLYMPIC',
  OTHER = 'OTHER',
  PLAYOFF = 'PLAYOFF',
  ROUND_ROBIN = 'ROUND_ROBIN',
  ROUND_ROBIN_WITH_PLAYOFF = 'ROUND_ROBIN_WITH_PLAYOFF',
  SINGLE_ELIMINATION = 'SINGLE_ELIMINATION',
}

export type DrawTypeUnion = keyof typeof DrawTypeEnum;

export interface Category {
  ageCategoryCode?: string;
  ageMax?: number;
  ageMaxDate?: string;
  ageMin?: number;
  ageMinDate?: string;
  ballType?: BallTypeEnum;
  categoryName?: string;
  categoryType?: string;
  createdAt?: Date | string;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  ratingMax?: number;
  ratingMin?: number;
  ratingType?: string;
  subType?: string;
  timeItems?: TimeItem[];
  type?: CategoryEnum;
  updatedAt?: Date | string;
}

export enum BallTypeEnum {
  HIGH_ALTITUDE = 'HIGH_ALTITUDE',
  Stage1Green = 'STAGE1GREEN',
  Stage2Orange = 'STAGE2ORANGE',
  Stage3Red = 'STAGE3RED',
  T2STANDARD_PRESSURELESS = 'T2STANDARD_PRESSURELESS',
  T2STANDARD_PRESSURISED = 'T2STANDARD_PRESSURISED',
  TYPE1FAST = 'TYPE1FAST',
  TYPE3SLOW = 'TYPE3SLOW',
}
export type BallTypeUnion = keyof typeof BallTypeEnum;

export interface Extension {
  description?: string;
  name: string;
  value: any;
}

export interface TimeItem {
  createdAt?: Date | string;
  itemDate?: Date | string;
  itemSubTypes?: string[];
  itemType?: string;
  itemValue?: any;
}

export enum CategoryEnum {
  AGE = 'AGE',
  BOTH = 'BOTH',
  LEVEL = 'LEVEL',
}
export type CategoryUnion = keyof typeof CategoryEnum;

export enum DisciplineEnum {
  BEACH_TENNIS = 'BEACH_TENNIS',
  TENNIS = 'TENNIS',
  WHEELCHAIR_TENNIS = 'WHEELCHAIR_TENNIS',
}
export type DisciplineUnion = keyof typeof DisciplineEnum;

export interface DrawDefinition {
  automated?: boolean;
  createdAt?: Date | string;
  drawId: string;
  drawName?: string;
  drawOrder?: number;
  drawRepresentativeIds?: string[];
  drawStatus?: DrawStatusEnum;
  drawType?: DrawTypeUnion;
  /**
   * Date on which the draw ends
   */
  endDate?: string;
  entries?: Entry[];
  extensions?: Extension[];
  isMock?: boolean;
  links?: DrawLink[];
  matchUpFormat?: string;
  matchUps?: MatchUp[];
  matchUpType?: EventTypeUnion;
  notes?: string;
  processCodes?: string[];
  /**
   * Date on which the draw begins
   */
  startDate?: string;
  structures?: Structure[];
  tieFormat?: TieFormat;
  tieFormatId?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
}

export enum DrawStatusEnum {
  COMPLETE = 'COMPLETE',
  IN_PROGRESS = 'IN_PROGRESS',
  TO_BE_PLAYED = 'TO_BE_PLAYED',
}
export type DrawStatusUnion = keyof typeof DrawStatusEnum;

export interface Entry {
  createdAt?: Date | string;
  entryId?: string;
  entryPosition?: number;
  entryStage?: StageTypeUnion;
  entryStageSequence?: number;
  entryStatus?: EntryStatusUnion;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  participantId: string;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
  scaleValue?: number;
}

export enum StageTypeEnum {
  CONSOLATION = 'CONSOLATION',
  MAIN = 'MAIN',
  PLAY_OFF = 'PLAY_OFF',
  QUALIFYING = 'QUALIFYING',
  VOLUNTARY_CONSOLATION = 'VOLUNTARY_CONSOLATION',
}
export type StageTypeUnion = keyof typeof StageTypeEnum;

export enum EntryStatusEnum {
  ALTERNATE = 'ALTERNATE',
  CONFIRMED = 'CONFIRMED',
  DIRECT_ACCEPTANCE = 'DIRECT_ACCEPTANCE',
  FEED_IN = 'FEED_IN',
  JUNIOR_EXEMPT = 'JUNIOR_EXEMPT',
  LUCKY_LOSER = 'LUCKY_LOSER',
  ORGANISER_ACCEPTANCE = 'ORGANISER_ACCEPTANCE',
  QUALIFIER = 'QUALIFIER',
  REGISTERED = 'REGISTERED',
  SPECIAL_EXEMPT = 'SPECIAL_EXEMPT',
  UNGROUPED = 'UNGROUPED',
  UNPAIRED = 'UNPAIRED',
  WILDCARD = 'WILDCARD',
  WITHDRAWN = 'WITHDRAWN',
}
export type EntryStatusUnion = keyof typeof EntryStatusEnum;

export interface DrawLink {
  createdAt?: Date | string;
  extensions?: Extension[];
  isMock?: boolean;
  linkCondition?: string;
  linkType: LinkTypeUnion;
  notes?: string;
  source: DrawLinkSource;
  target: DrawLinkTarget;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
}

export enum LinkTypeEnum {
  LOSER = 'LOSER',
  POSITION = 'POSITION',
  WINNER = 'WINNER',
}
export type LinkTypeUnion = keyof typeof LinkTypeEnum;

export interface DrawLinkSource {
  createdAt?: Date | string;
  drawId?: string;
  extensions?: Extension[];
  finishingPositions?: number[];
  isMock?: boolean;
  notes?: string;
  roundNumber?: number;
  structureId: string;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
}

export interface DrawLinkTarget {
  createdAt?: Date | string;
  drawId?: string;
  extensions?: Extension[];
  feedProfile: PositioningProfileEnum;
  groupedOrder?: number[];
  isMock?: boolean;
  notes?: string;
  positionInterleave?: Interleave;
  roundNumber: number;
  structureId: string;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
}

export enum PositioningProfileEnum {
  BottomUp = 'BOTTOM_UP',
  Draw = 'DRAW',
  LossPosition = 'LOSS_POSITION',
  Random = 'RANDOM',
  TopDown = 'TOP_DOWN',
  Waterfall = 'WATERFALL',
}
export type PositioningProfileUnion = keyof typeof PositioningProfileEnum;

export enum SeedingProfileEnum {
  Cluster = 'CLUSTER',
  Separate = 'SEPARATE',
  Waterfall = 'WATERFALL',
}
export type SeedingProfileUnion = keyof typeof SeedingProfileEnum;

export interface Interleave {
  interleave: number;
  offset: number;
}

export type EventTypeUnion = 'SINGLES' | 'DOUBLES' | 'TEAM';

export interface MatchUp {
  collectionId?: string;
  collectionPosition?: number;
  createdAt?: Date | string;
  drawPositions?: number[];
  /**
   * Date on which the matchUp ends
   */
  endDate?: string;
  extensions?: Extension[];
  finishingPositionRange?: MatchUpFinishingPositionRange;
  finishingRound?: number;
  indoorOutdoor?: IndoorOutdoorEnum;
  isMock?: boolean;
  loserMatchUpId?: string;
  matchUpDuration?: string;
  matchUpFormat?: string;
  matchUpId: string;
  matchUpStatus?: MatchUpStatusUnion;
  matchUpStatusCodes?: any[];
  matchUpType?: EventTypeUnion;
  notes?: string;
  orderOfFinish?: number;
  processCodes?: string[];
  roundName?: string;
  roundNumber?: number;
  roundPosition?: number;
  score?: Score;
  sides?: Side[];
  /**
   * Date on which matchUp begins
   */
  startDate?: string;
  surfaceCategory?: SurfaceCategoryEnum;
  tieFormat?: TieFormat;
  tieFormatId?: string;
  tieMatchUps?: MatchUp[];
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
  winnerMatchUpId?: string;
  winningSide?: number;
}

export interface MatchUpFinishingPositionRange {
  loser: number[];
  winner: number[];
}

export enum IndoorOutdoorEnum {
  Indoor = 'INDOOR',
  Mixed = 'MIXED',
  Outdoor = 'OUTDOOR',
}
export type IndoorOutdoorUnion = keyof typeof IndoorOutdoorEnum;

export enum MatchUpStatusEnum {
  Abandoned = 'ABANDONED',
  AwaitingResult = 'AWAITING_RESULT',
  Bye = 'BYE',
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  DeadRubber = 'DEAD_RUBBER',
  Defaulted = 'DEFAULTED',
  DoubleDefault = 'DOUBLE_DEFAULT',
  DoubleWalkover = 'DOUBLE_WALKOVER',
  InProgress = 'IN_PROGRESS',
  Incomplete = 'INCOMPLETE',
  NotPlayed = 'NOT_PLAYED',
  Retired = 'RETIRED',
  Suspended = 'SUSPENDED',
  ToBePlayed = 'TO_BE_PLAYED',
  Walkover = 'WALKOVER',
}
export type MatchUpStatusUnion = keyof typeof MatchUpStatusEnum;

export interface Score {
  createdAt?: Date | string;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  scoreStringSide1?: string;
  scoreStringSide2?: string;
  sets?: Set[];
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
}

export interface Set {
  createdAt?: Date | string;
  extensions?: Extension[];
  games?: Game[];
  isMock?: boolean;
  notes?: string;
  setDuration?: string;
  setFormat?: string;
  setNumber?: number;
  side1PointScore?: number;
  side1Score?: number;
  side1TiebreakScore?: number;
  side2PointScore?: number;
  side2Score?: number;
  side2TiebreakScore?: number;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
  winningSide?: number;
}

export interface Game {
  createdAt?: Date | string;
  extensions?: Extension[];
  gameDuration?: string;
  gameFormat?: string;
  gameNumber?: number;
  isMock?: boolean;
  notes?: string;
  points?: Point[];
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
  winningSide?: number;
  winReason?: WinReasonEnum;
}

export interface Point {
  createdAt?: Date | string;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  pointDuration?: string;
  pointNumber?: number;
  shots?: Shot[];
  side1Score?: string;
  side2Score?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
  winningSide?: number;
  winReason?: WinReasonEnum;
}

export interface Shot {
  bounceAt?: CourtPosition;
  createdAt?: Date | string;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  participantId: string;
  shotDetail?: ShotDetailEnum;
  shotMadeFrom?: CourtPosition;
  shotNumber?: number;
  shotOutcome?: ShotOutcomeEnum;
  shotType?: ShotTypeEnum;
  sideNumber?: number;
  speed?: number;
  spin?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
}

export interface CourtPosition {
  createdAt?: Date | string;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  positionName?: CourtPositionEnum;
  timeAtPosition?: Date | string;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
  x?: number;
  y?: number;
}

export enum CourtPositionEnum {
  Baseline = 'BASELINE',
  LeftServiceCourt = 'LEFT_SERVICE_COURT',
  Net = 'NET',
  RightServiceCourt = 'RIGHT_SERVICE_COURT',
  Serviceline = 'SERVICELINE',
}
export type CourtPositionUnion = keyof typeof CourtPositionEnum;

export enum ShotDetailEnum {
  Drive = 'DRIVE',
  DriveVolley = 'DRIVE_VOLLEY',
  DropShot = 'DROP_SHOT',
  GroundStroke = 'GROUND_STROKE',
  HalfVolley = 'HALF_VOLLEY',
  Lob = 'LOB',
  PassingShot = 'PASSING_SHOT',
  Smash = 'SMASH',
  Trick = 'TRICK',
  Volley = 'VOLLEY',
}
export type ShotDetailUnion = keyof typeof ShotDetailEnum;

export enum ShotOutcomeEnum {
  In = 'IN',
  Let = 'LET',
  Net = 'NET',
  Out = 'OUT',
}
export type ShotOutcomeUnion = keyof typeof ShotOutcomeEnum;

export enum ShotTypeEnum {
  Backhand = 'BACKHAND',
  Forehand = 'FOREHAND',
  Serve = 'SERVE',
}
export type ShotTypeUnion = keyof typeof ShotTypeEnum;

export enum WinReasonEnum {
  Ace = 'ACE',
  DoubleFault = 'DOUBLE_FAULT',
  Error = 'ERROR',
  Forced = 'FORCED',
  NetCord = 'NET_CORD',
  Penalty = 'PENALTY',
  Unforced = 'UNFORCED',
  Winner = 'WINNER',
}
export type WinReasonUnion = keyof typeof WinReasonEnum;

export interface Side {
  createdAt?: Date | string;
  extensions?: Extension[];
  isMock?: boolean;
  lineUp?: TeamCompetitor[];
  notes?: string;
  participantId?: string;
  participant?: Participant;
  sideNumber?: number;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
}

export interface TeamCompetitor {
  collectionAssignments?: CollectionAssignment[];
  createdAt?: Date | string;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  participantId: string;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
}

export interface CollectionAssignment {
  collectionId: string;
  collectionPosition: number;
}

export enum SurfaceCategoryEnum {
  Artificial = 'ARTIFICIAL',
  Carpet = 'CARPET',
  Clay = 'CLAY',
  Grass = 'GRASS',
  Hard = 'HARD',
}
export type SurfaceCategoryUnion = keyof typeof SurfaceCategoryEnum;

export interface TieFormat {
  collectionDefinitions: CollectionDefinition[];
  collectionGroups?: CollectionGroup[];
  createdAt?: Date | string;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  tieFormatId?: string;
  tieFormatName?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
  winCriteria: WinCriteria;
}

export interface CollectionDefinition {
  category?: Category;
  collectionGroupNumber?: number;
  collectionId: string;
  collectionName?: string;
  collectionOrder?: number;
  collectionValue?: number;
  collectionValueProfiles?: CollectionValueProfile[];
  createdAt?: Date | string;
  extensions?: Extension[];
  gender?: GenderUnion;
  isMock?: boolean;
  matchUpCount?: number;
  matchUpFormat?: string;
  matchUpType?: EventTypeUnion;
  matchUpValue?: number;
  notes?: string;
  processCodes?: string[];
  scoreValue?: number;
  setValue?: number;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
  winCriteria?: WinCriteria;
}

export interface CollectionValueProfile {
  collectionPosition: number;
  createdAt?: Date | string;
  extensions?: Extension[];
  isMock?: boolean;
  matchUpValue: number;
  notes?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
}

export enum GenderEnum {
  ANY = 'ANY',
  FEMALE = 'FEMALE',
  MALE = 'MALE',
  MIXED = 'MIXED',
}
export type GenderUnion = keyof typeof GenderEnum;

export interface WinCriteria {
  aggregateValue?: boolean;
  createdAt?: Date | string;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
  valueGoal: number;
}

export interface CollectionGroup {
  createdAt?: Date | string;
  extensions?: Extension[];
  groupName?: string;
  groupNumber: number;
  groupValue?: number;
  isMock?: boolean;
  notes?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
  winCriteria?: WinCriteria;
}

export interface Structure {
  createdAt?: Date | string;
  extensions?: Extension[];
  finishingPosition?: FinishingPositionEnum;
  isMock?: boolean;
  matchUpFormat?: string;
  matchUps?: MatchUp[];
  matchUpType?: EventTypeUnion;
  notes?: string;
  positionAssignments?: PositionAssignment[];
  processCodes?: string[];
  qualifyingRoundNumber?: number;
  roundLimit?: number;
  roundOffset?: number;
  seedAssignments?: SeedAssignment[];
  seedingProfile?: SeedingProfileEnum;
  seedLimit?: number;
  stage?: StageTypeUnion;
  stageSequence?: number;
  structureAbbreviation?: string;
  structureId: string;
  structureName?: string;
  structures?: Structure[];
  structureOrder?: number;
  structureType?: StructureTypeEnum;
  tieFormat?: TieFormat;
  tieFormatId?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
}

export enum FinishingPositionEnum {
  RoundOutcome = 'ROUND_OUTCOME',
  WinRatio = 'WIN_RATIO',
}
export type FinishingPositionUnion = keyof typeof FinishingPositionEnum;

export interface PositionAssignment {
  bye?: boolean;
  createdAt?: Date | string;
  drawPosition: number;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  participantId?: string;
  qualifier?: boolean;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
}

export interface SeedAssignment {
  createdAt?: Date | string;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  participantId?: string;
  seedNumber: number;
  seedValue: number | string;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
}

export enum StructureTypeEnum {
  Container = 'CONTAINER',
  Item = 'ITEM',
}
export type StructureTypeUnion = keyof typeof StructureTypeEnum;

export enum TournamentLevelEnum {
  Club = 'CLUB',
  District = 'DISTRICT',
  International = 'INTERNATIONAL',
  Local = 'LOCAL',
  National = 'NATIONAL',
  Recreational = 'RECREATIONAL',
  Regional = 'REGIONAL',
  Zonal = 'ZONAL',
}
export type TournamentLevelUnion = keyof typeof TournamentLevelEnum;

export enum WheelchairClassEnum {
  Quad = 'QUAD',
  Standard = 'STANDARD',
}
export type WheelchairClassUnion = keyof typeof WheelchairClassEnum;

export enum CountryCodeEnum {
  ASM = 'ASM',
  ATA = 'ATA',
  Abw = 'ABW',
  Afg = 'AFG',
  Ago = 'AGO',
  Aia = 'AIA',
  Ala = 'ALA',
  Alb = 'ALB',
  And = 'AND',
  Ant = 'ANT',
  Are = 'ARE',
  Arg = 'ARG',
  Arm = 'ARM',
  Atf = 'ATF',
  Atg = 'ATG',
  Aus = 'AUS',
  Aut = 'AUT',
  Aze = 'AZE',
  Bdi = 'BDI',
  Bel = 'BEL',
  Ben = 'BEN',
  Bfa = 'BFA',
  Bgd = 'BGD',
  Bgr = 'BGR',
  Bhr = 'BHR',
  Bhs = 'BHS',
  Bih = 'BIH',
  Blm = 'BLM',
  Blr = 'BLR',
  Blz = 'BLZ',
  Bmu = 'BMU',
  Bol = 'BOL',
  Bra = 'BRA',
  Brb = 'BRB',
  Brn = 'BRN',
  Btn = 'BTN',
  Bvt = 'BVT',
  Bwa = 'BWA',
  COM = 'COM',
  Caf = 'CAF',
  Can = 'CAN',
  Cck = 'CCK',
  Cgd = 'CGD',
  Che = 'CHE',
  Chl = 'CHL',
  Chn = 'CHN',
  Civ = 'CIV',
  Cmr = 'CMR',
  Cod = 'COD',
  Cog = 'COG',
  Cok = 'COK',
  Col = 'COL',
  Cpv = 'CPV',
  Cri = 'CRI',
  Cub = 'CUB',
  Cuw = 'CUW',
  Cxr = 'CXR',
  Cym = 'CYM',
  Cyp = 'CYP',
  Cze = 'CZE',
  DMA = 'DMA',
  DOM = 'DOM',
  Deu = 'DEU',
  Dji = 'DJI',
  Dnk = 'DNK',
  Dza = 'DZA',
  Ecu = 'ECU',
  Egy = 'EGY',
  Eri = 'ERI',
  Ese = 'ESE',
  Esh = 'ESH',
  Esp = 'ESP',
  Eth = 'ETH',
  FSM = 'FSM',
  Fin = 'FIN',
  Fji = 'FJI',
  Flk = 'FLK',
  Fra = 'FRA',
  Fro = 'FRO',
  Gab = 'GAB',
  Gbr = 'GBR',
  Geo = 'GEO',
  Ggy = 'GGY',
  Gha = 'GHA',
  Gib = 'GIB',
  Gin = 'GIN',
  Glp = 'GLP',
  Gmb = 'GMB',
  Gnb = 'GNB',
  Gnq = 'GNQ',
  Grc = 'GRC',
  Grd = 'GRD',
  Grl = 'GRL',
  Gtm = 'GTM',
  Guf = 'GUF',
  Gum = 'GUM',
  Guy = 'GUY',
  Hkg = 'HKG',
  Hmd = 'HMD',
  Hnd = 'HND',
  Hrv = 'HRV',
  Hti = 'HTI',
  Hun = 'HUN',
  IRQ = 'IRQ',
  ISR = 'ISR',
  Idn = 'IDN',
  Imn = 'IMN',
  Ind = 'IND',
  Iot = 'IOT',
  Irl = 'IRL',
  Irn = 'IRN',
  Isl = 'ISL',
  Ita = 'ITA',
  Jam = 'JAM',
  Jey = 'JEY',
  Jor = 'JOR',
  Jpn = 'JPN',
  Kaz = 'KAZ',
  Ken = 'KEN',
  Kgz = 'KGZ',
  Khm = 'KHM',
  Kir = 'KIR',
  Kna = 'KNA',
  Kor = 'KOR',
  Kos = 'KOS',
  Kwt = 'KWT',
  Lao = 'LAO',
  Lbn = 'LBN',
  Lbr = 'LBR',
  Lby = 'LBY',
  Lca = 'LCA',
  Lie = 'LIE',
  Lka = 'LKA',
  Lso = 'LSO',
  Ltu = 'LTU',
  Lux = 'LUX',
  Lva = 'LVA',
  MAC = 'MAC',
  MDA = 'MDA',
  MNG = 'MNG',
  Maf = 'MAF',
  Mar = 'MAR',
  Mco = 'MCO',
  Mdg = 'MDG',
  Mdv = 'MDV',
  Mex = 'MEX',
  Mhl = 'MHL',
  Mkd = 'MKD',
  Mli = 'MLI',
  Mlt = 'MLT',
  Mmr = 'MMR',
  Mne = 'MNE',
  Mnp = 'MNP',
  Moz = 'MOZ',
  Mrt = 'MRT',
  Msr = 'MSR',
  Mtq = 'MTQ',
  Mus = 'MUS',
  Mwi = 'MWI',
  Mys = 'MYS',
  Myt = 'MYT',
  NIC = 'NIC',
  NPL = 'NPL',
  Nam = 'NAM',
  Ncl = 'NCL',
  Ner = 'NER',
  Nfk = 'NFK',
  Nga = 'NGA',
  Niu = 'NIU',
  Nld = 'NLD',
  Nmp = 'NMP',
  Nor = 'NOR',
  Nru = 'NRU',
  Nzl = 'NZL',
  Omn = 'OMN',
  PNG = 'PNG',
  Pak = 'PAK',
  Pan = 'PAN',
  Pcn = 'PCN',
  Per = 'PER',
  Phl = 'PHL',
  Plw = 'PLW',
  Pol = 'POL',
  Pri = 'PRI',
  Prk = 'PRK',
  Prt = 'PRT',
  Pry = 'PRY',
  Pse = 'PSE',
  Pyf = 'PYF',
  Qat = 'QAT',
  Reu = 'REU',
  Rou = 'ROU',
  Rus = 'RUS',
  Rwa = 'RWA',
  SDN = 'SDN',
  SPM = 'SPM',
  SSD = 'SSD',
  Sau = 'SAU',
  Sen = 'SEN',
  Sgp = 'SGP',
  Sgs = 'SGS',
  Shn = 'SHN',
  Sjm = 'SJM',
  Slb = 'SLB',
  Sle = 'SLE',
  Slv = 'SLV',
  Smr = 'SMR',
  Smx = 'SMX',
  Som = 'SOM',
  Srb = 'SRB',
  Stp = 'STP',
  Sur = 'SUR',
  Svk = 'SVK',
  Svn = 'SVN',
  Swe = 'SWE',
  Swz = 'SWZ',
  Syc = 'SYC',
  Syr = 'SYR',
  TLS = 'TLS',
  Tca = 'TCA',
  Tcd = 'TCD',
  Tgo = 'TGO',
  Tha = 'THA',
  Tjk = 'TJK',
  Tkl = 'TKL',
  Tkm = 'TKM',
  Ton = 'TON',
  Tto = 'TTO',
  Tun = 'TUN',
  Tur = 'TUR',
  Tuv = 'TUV',
  Twn = 'TWN',
  Tza = 'TZA',
  Uga = 'UGA',
  Ukr = 'UKR',
  Umi = 'UMI',
  Ury = 'URY',
  Usa = 'USA',
  Uzb = 'UZB',
  Vat = 'VAT',
  Vct = 'VCT',
  Ven = 'VEN',
  Vgb = 'VGB',
  Vir = 'VIR',
  Vnm = 'VNM',
  Vut = 'VUT',
  Wlf = 'WLF',
  Wsm = 'WSM',
  Yem = 'YEM',
  Zaf = 'ZAF',
  Zmb = 'ZMB',
  Zwe = 'ZWE',
}
export type CountryCodeUnion = keyof typeof CountryCodeEnum;

export interface OnlineResource {
  createdAt?: Date | string;
  extensions?: Extension[];
  identifier?: string;
  isMock?: boolean;
  name?: string;
  notes?: string;
  provider?: string;
  resourceSubType?: string;
  resourceType?: OnlineResourceTypeUnion;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
}

export enum OnlineResourceTypeEnum {
  EMAIL = 'EMAIL',
  OTHER = 'OTHER',
  SOCIAl_MEDIA = 'SOCIAL_MEDIA',
  URL = 'URL',
}
export type OnlineResourceTypeUnion = keyof typeof OnlineResourceTypeEnum;

export interface Participant {
  contacts?: Contact[];
  createdAt?: Date | string;
  extensions?: Extension[];
  individualParticipantIds?: string[];
  isMock?: boolean;
  notes?: string;
  onlineResources?: OnlineResource[];
  participantId: string;
  participantName?: string;
  participantOtherName?: string;
  participantRole?: ParticipantRoleUnion;
  participantRoleResponsibilities?: string[];
  participantStatus?: ParticipantStatusEnum;
  participantType?: ParticipantTypeUnion;
  penalties?: Penalty[];
  person?: Person;
  personId?: string;
  representing?: CountryCodeEnum;
  teamId?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
}

export interface Contact {
  createdAt?: Date | string;
  emailAddress?: string;
  extensions?: Extension[];
  fax?: string;
  isMock?: boolean;
  isPublic?: boolean;
  mobileTelephone?: string;
  name?: string;
  notes?: string;
  telephone?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
}

export enum ParticipantRoleEnum {
  ADMINISTRATION = 'ADMINISTRATION',
  CAPTAIN = 'CAPTAIN',
  COACH = 'COACH',
  COMPETITOR = 'COMPETITOR',
  MEDIA = 'MEDIA',
  MEDICAL = 'MEDICAL',
  OFFICIAL = 'OFFICIAL',
  OTHER = 'OTHER',
  SECURITY = 'SECURITY',
}
export type ParticipantRoleUnion = keyof typeof ParticipantRoleEnum;

export enum ParticipantStatusEnum {
  Active = 'ACTIVE',
  Withdrawn = 'WITHDRAWN',
}
export type ParticipantStatusUnion = keyof typeof ParticipantStatusEnum;

export enum ParticipantTypeEnum {
  GROUP = 'GROUP',
  INDIVIDUAL = 'INDIVIDUAL',
  PAIR = 'PAIR',
  TEAM = 'TEAM',
}
export type ParticipantTypeUnion = keyof typeof ParticipantTypeEnum;

export interface Penalty {
  createdAt?: Date | string;
  extensions?: Extension[];
  isMock?: boolean;
  issuedAt?: string;
  matchUpId?: string;
  notes?: string;
  penaltyCode?: string;
  penaltyId: string;
  penaltyType: PenaltyTypeUnion;
  refereeParticipantId?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
}

export enum PenaltyTypeEnum {
  BALL_ABUSE = 'BALL_ABUSE',
  COACHING = 'COACHING',
  DRESS_CODE_VIOLATION = 'DRESS_CODE_VIOLATION',
  EQUIMENT_VIOLATION = 'EQUIMENT_VIOLATION',
  FAILUIRE_TO_SIGN_IN = 'FAILUIRE_TO_SIGN_IN',
  FAILURE_TO_COMPLETE = 'FAILURE_TO_COMPLETE',
  INELIGIBILITY = 'INELIGIBILITY',
  LEAVING_THE_COURT = 'LEAVING_THE_COURT',
  NO_SHOW = 'NO_SHOW',
  OTHER = 'OTHER',
  PHYSICAL_ABUSE = 'PHYSICAL_ABUSE',
  PROHIBITED_SUBSTANCE = 'PROHIBITED_SUBSTANCE',
  PUNCTUALITY = 'PUNCTUALITY',
  RACKET_ABUSE = 'RACKET_ABUSE',
  REFUSAL_TO_PLAY = 'REFUSAL_TO_PLAY',
  UNSPORTSMANLIKE_CONDUCT = 'UNSPORTSMANLIKE_CONDUCT',
  VERBAL_ABUSE = 'VERBAL_ABUSE',
}
export type PenaltyTypeUnion = keyof typeof PenaltyTypeEnum;

export interface Person {
  addresses?: Address[];
  biographicalInformation?: BiographicalInformation;
  birthDate?: string;
  contacts?: Contact[];
  createdAt?: Date | string;
  extensions?: Extension[];
  isMock?: boolean;
  nationalityCode?: string;
  nativeFamilyName?: string;
  nativeGivenName?: string;
  notes?: string;
  onlineResources?: OnlineResource[];
  otherNames?: string[];
  parentOrganisationId?: string;
  passportFamilyName?: string;
  passportGivenName?: string;
  personId: string;
  personOtherIds?: UnifiedPersonID[];
  previousNames?: string[];
  sectionId?: string;
  sex?: SexUnion;
  standardFamilyName?: string;
  standardGivenName?: string;
  status?: string;
  tennisId?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
  wheelchair?: boolean;
}

export interface Address {
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressName?: string;
  addressType?: AddressTypeEnum;
  city?: string;
  countryCode?: CountryCodeEnum;
  createdAt?: Date | string;
  extensions?: Extension[];
  isMock?: boolean;
  latitude?: string;
  longitude?: string;
  notes?: string;
  postalCode?: string;
  state?: string;
  timeItems?: TimeItem[];
  timeZone?: string;
  updatedAt?: Date | string;
}

export enum AddressTypeEnum {
  Home = 'HOME',
  Mail = 'MAIL',
  Primary = 'PRIMARY',
  Residential = 'RESIDENTIAL',
  Venue = 'VENUE',
  Work = 'WORK',
}
export type AddressTypeUnion = keyof typeof AddressTypeEnum;

export interface BiographicalInformation {
  ageBeganTennis?: number;
  ageTurnedPro?: number;
  birthCountryCode?: CountryCodeEnum;
  coachId?: string;
  createdAt?: Date | string;
  doublePlayingHand?: PlayingDoubleHandCodeEnum;
  extensions?: Extension[];
  height?: number;
  heightUnit?: LengthUnitEnum;
  isMock?: boolean;
  notes?: string;
  organisationIds?: string[];
  placeOfResidence?: string;
  playingHand?: PlayingHandCodeEnum;
  residenceCountryCode?: CountryCodeEnum;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
  weight?: number;
  weightUnit?: WeightUnitEnum;
}

export enum PlayingDoubleHandCodeEnum {
  Backhand = 'BACKHAND',
  Both = 'BOTH',
  Forehand = 'FOREHAND',
  None = 'NONE',
}
export type PlayingDoubleHandCodeUnion = keyof typeof PlayingDoubleHandCodeEnum;

export enum LengthUnitEnum {
  Centimeter = 'CENTIMETER',
  Meter = 'METER',
  Millimeter = 'MILLIMETER',
}
export type LengthUnitUnion = keyof typeof LengthUnitEnum;

export enum PlayingHandCodeEnum {
  Ambidextrous = 'AMBIDEXTROUS',
  Left = 'LEFT',
  Right = 'RIGHT',
}
export type PlayingHandCodeUnion = keyof typeof PlayingHandCodeEnum;

export enum WeightUnitEnum {
  Gram = 'GRAM',
  Kilogram = 'KILOGRAM',
}
export type WeightUnitUnion = keyof typeof WeightUnitEnum;

export interface UnifiedPersonID {
  createdAt?: Date | string;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  organisationId: string;
  personId: string;
  timeItems?: TimeItem[];
  uniqueOrganisationName?: string;
  updatedAt?: Date | string;
}

export enum SexEnum {
  FEMALE = 'FEMALE',
  MALE = 'MALE',
  OTHER = 'OTHER',
}
export type SexUnion = keyof typeof SexEnum;

export interface RegistrationProfile {
  createdAt?: Date | string;
  entriesClose?: Date | string;
  entriesOpen?: Date | string;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
  withdrawalDeadline?: Date | string;
}

export interface PrizeMoney {
  amount: number;
  createdAt?: Date | string;
  currencyCode: string;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
}

export interface UnifiedTournamentID {
  createdAt?: Date | string;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  organisationId: string;
  timeItems?: TimeItem[];
  tournamentId: string;
  uniqueOrganisationName?: string;
  updatedAt?: Date | string;
}

export interface Venue {
  addresses?: Address[];
  contacts?: Contact[];
  courts?: Court[];
  createdAt?: Date | string;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  onlineResources?: OnlineResource[];
  parentOrganisationId?: string;
  roles?: string[];
  subVenues?: Venue[];
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
  venueAbbreviation?: string;
  venueId: string;
  venueName?: string;
  venueOtherIds?: UnifiedVenueID[];
  venueType?: string;
}

export interface Court {
  altitude?: number;
  courtDimensions?: string;
  courtId: string;
  courtName?: string;
  createdAt?: Date | string;
  dateAvailability?: Availability[];
  extensions?: Extension[];
  floodlit?: boolean;
  indoorOutdoor?: IndoorOutdoorEnum;
  isMock?: boolean;
  latitude?: string;
  longitude?: string;
  notes?: string;
  onlineResources?: OnlineResource[];
  pace?: string;
  surfaceCategory?: SurfaceCategoryEnum;
  surfacedDate?: Date | string;
  surfaceType?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
}

export interface Availability {
  bookings?: Booking[];
  createdAt?: Date | string;
  date?: string;
  endTime?: string;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  startTime?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
}

export interface Booking {
  bookingType?: string;
  createdAt?: Date | string;
  endTime?: string;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  startTime?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date | string;
}

export interface UnifiedVenueID {
  createdAt?: Date | string;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  organisationId: string;
  timeItems?: TimeItem[];
  uniqueOrganisationName?: string;
  updatedAt?: Date | string;
  venueId: string;
}

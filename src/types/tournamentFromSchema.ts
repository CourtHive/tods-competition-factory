export interface Tournament {
  createdAt?: Date;
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
  updatedAt?: Date;
  venues?: Venue[];
}

export interface Event {
  allowedDrawTypes?: DrawTypeEnum[];
  category?: Category;
  createdAt?: Date;
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
  eventRank?: string;
  eventType?: TypeEnum;
  extensions?: Extension[];
  gender?: GenderEnum;
  indoorOutdoor?: IndoorOutdoorEnum;
  isMock?: boolean;
  links?: DrawLink[];
  notes?: string;
  processCodes?: string[];
  /**
   * Date on which the event starts
   */
  startDate?: string;
  surfaceCategory?: SurfaceCategoryEnum;
  tennisOfficialIds?: string[];
  tieFormat?: TieFormat;
  timeItems?: TimeItem[];
  updatedAt?: Date;
  wheelchairClass?: WheelchairClassEnum;
}

export enum DrawTypeEnum {
  AdHoc = 'AD_HOC',
  Compass = 'COMPASS',
  CurtisConsolation = 'CURTIS_CONSOLATION',
  DoubleElimination = 'DOUBLE_ELIMINATION',
  FeedIn = 'FEED_IN',
  FeedInChampionship = 'FEED_IN_CHAMPIONSHIP',
  FeedInChampionshipToQf = 'FEED_IN_CHAMPIONSHIP_TO_QF',
  FeedInChampionshipToR16 = 'FEED_IN_CHAMPIONSHIP_TO_R16',
  FeedInChampionshipToSf = 'FEED_IN_CHAMPIONSHIP_TO_SF',
  FirstMatchLoserConsolation = 'FIRST_MATCH_LOSER_CONSOLATION',
  FirstRoundLoserConsolation = 'FIRST_ROUND_LOSER_CONSOLATION',
  ModifiedFeedInChampionship = 'MODIFIED_FEED_IN_CHAMPIONSHIP',
  Olympic = 'OLYMPIC',
  Other = 'OTHER',
  Playoff = 'PLAYOFF',
  RoundRobin = 'ROUND_ROBIN',
  RoundRobinWithPlayoff = 'ROUND_ROBIN_WITH_PLAYOFF',
  SingleElimination = 'SINGLE_ELIMINATION',
}

export interface Category {
  ageCategoryCode?: string;
  ageMax?: number;
  ageMaxDate?: string;
  ageMin?: number;
  ageMinDate?: string;
  ballType?: BallTypeEnum;
  categoryName?: string;
  createdAt?: Date;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  ratingMax?: number;
  ratingMin?: number;
  ratingType?: string;
  subType?: string;
  timeItems?: TimeItem[];
  type?: CategoryEnum;
  updatedAt?: Date;
}

export enum BallTypeEnum {
  HighAltitude = 'HIGH_ALTITUDE',
  Stage1Green = 'STAGE1GREEN',
  Stage2Orange = 'STAGE2ORANGE',
  Stage3Red = 'STAGE3RED',
  T2StandardPressureless = 'T2STANDARD_PRESSURELESS',
  T2StandardPressurised = 'T2STANDARD_PRESSURISED',
  Type1Fast = 'TYPE1FAST',
  Type3Slow = 'TYPE3SLOW',
}

export interface Extension {
  description?: string;
  name: string;
  value: any;
}

export interface TimeItem {
  createdAt?: Date;
  itemDate?: Date;
  itemSubTypes?: string[];
  itemType?: string;
  itemValue?: any;
}

export enum CategoryEnum {
  Age = 'AGE',
  Both = 'BOTH',
  Level = 'LEVEL',
}

export enum DisciplineEnum {
  BeachTennis = 'BEACH_TENNIS',
  Tennis = 'TENNIS',
  WheelchairTennis = 'WHEELCHAIR_TENNIS',
}

export interface DrawDefinition {
  automated?: boolean;
  createdAt?: Date;
  drawId: string;
  drawName?: string;
  drawOrder?: number;
  drawRepresentativeIds?: string[];
  drawStatus?: DrawStatusEnum;
  drawType?: DrawTypeEnum;
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
  matchUpType?: TypeEnum;
  notes?: string;
  processCodes?: string[];
  /**
   * Date on which the draw begins
   */
  startDate?: string;
  structures?: Structure[];
  tieFormat?: TieFormat;
  timeItems?: TimeItem[];
  updatedAt?: Date;
}

export enum DrawStatusEnum {
  Complete = 'COMPLETE',
  InProgress = 'IN_PROGRESS',
  ToBePlayed = 'TO_BE_PLAYED',
}

export interface Entry {
  createdAt?: Date;
  entryId?: string;
  entryPosition?: number;
  entryStage?: StageTypeEnum;
  entryStageSequence?: number;
  entryStatus?: EntryStatusEnum;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  participantId: string;
  timeItems?: TimeItem[];
  updatedAt?: Date;
}

export enum StageTypeEnum {
  Consolation = 'CONSOLATION',
  Main = 'MAIN',
  PlayOff = 'PLAY_OFF',
  Qualifying = 'QUALIFYING',
  VoluntaryConsolation = 'VOLUNTARY_CONSOLATION',
}

export enum EntryStatusEnum {
  Alternate = 'ALTERNATE',
  Confirmed = 'CONFIRMED',
  DirectAcceptance = 'DIRECT_ACCEPTANCE',
  FeedIn = 'FEED_IN',
  JuniorExempt = 'JUNIOR_EXEMPT',
  LuckyLoser = 'LUCKY_LOSER',
  OrganiserAcceptance = 'ORGANISER_ACCEPTANCE',
  Qualifier = 'QUALIFIER',
  SpecialExempt = 'SPECIAL_EXEMPT',
  Ungrouped = 'UNGROUPED',
  Unpaired = 'UNPAIRED',
  Wildcard = 'WILDCARD',
  Withdrawn = 'WITHDRAWN',
}

export interface DrawLink {
  createdAt?: Date;
  extensions?: Extension[];
  isMock?: boolean;
  linkCondition?: string;
  linkType: LinkTypeEnum;
  notes?: string;
  source: DrawLinkSource;
  target: DrawLinkTarget;
  timeItems?: TimeItem[];
  updatedAt?: Date;
}

export enum LinkTypeEnum {
  Loser = 'LOSER',
  Position = 'POSITION',
  Winner = 'WINNER',
}

export interface DrawLinkSource {
  createdAt?: Date;
  drawId?: string;
  extensions?: Extension[];
  finishingPositions?: number[];
  isMock?: boolean;
  notes?: string;
  roundNumber?: number;
  structureId: string;
  timeItems?: TimeItem[];
  updatedAt?: Date;
}

export interface DrawLinkTarget {
  createdAt?: Date;
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
  updatedAt?: Date;
}

export enum PositioningProfileEnum {
  BottomUp = 'BOTTOM_UP',
  Draw = 'DRAW',
  LossPosition = 'LOSS_POSITION',
  Random = 'RANDOM',
  TopDown = 'TOP_DOWN',
  Waterfall = 'WATERFALL',
}

export interface Interleave {
  interleave: number;
  offset: number;
}

export enum TypeEnum {
  Doubles = 'DOUBLES',
  Singles = 'SINGLES',
  Team = 'TEAM',
}

export interface MatchUp {
  collectionId?: string;
  collectionPosition?: number;
  createdAt?: Date;
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
  matchUpStatus?: MatchUpStatusEnum;
  matchUpStatusCodes?: any[];
  matchUpType?: TypeEnum;
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
  tieMatchUps?: MatchUp[];
  timeItems?: TimeItem[];
  updatedAt?: Date;
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

export interface Score {
  createdAt?: Date;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  scoreStringSide1?: string;
  scoreStringSide2?: string;
  sets?: Set[];
  timeItems?: TimeItem[];
  updatedAt?: Date;
}

export interface Set {
  createdAt?: Date;
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
  updatedAt?: Date;
  winningSide?: number;
}

export interface Game {
  createdAt?: Date;
  extensions?: Extension[];
  gameDuration?: string;
  gameFormat?: string;
  gameNumber?: number;
  isMock?: boolean;
  notes?: string;
  points?: Point[];
  timeItems?: TimeItem[];
  updatedAt?: Date;
  winningSide?: number;
  winReason?: WinReasonEnum;
}

export interface Point {
  createdAt?: Date;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  pointDuration?: string;
  pointNumber?: number;
  shots?: Shot[];
  side1Score?: string;
  side2Score?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date;
  winningSide?: number;
  winReason?: WinReasonEnum;
}

export interface Shot {
  bounceAt?: CourtPosition;
  createdAt?: Date;
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
  updatedAt?: Date;
}

export interface CourtPosition {
  createdAt?: Date;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  positionName?: CourtPositionEnum;
  timeAtPosition?: Date;
  timeItems?: TimeItem[];
  updatedAt?: Date;
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

export enum ShotOutcomeEnum {
  In = 'IN',
  Let = 'LET',
  Net = 'NET',
  Out = 'OUT',
}

export enum ShotTypeEnum {
  Backhand = 'BACKHAND',
  Forehand = 'FOREHAND',
  Serve = 'SERVE',
}

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

export interface Side {
  createdAt?: Date;
  extensions?: Extension[];
  isMock?: boolean;
  lineUp?: TeamCompetitor[];
  notes?: string;
  participantId?: string;
  sideNumber?: number;
  timeItems?: TimeItem[];
  updatedAt?: Date;
}

export interface TeamCompetitor {
  collectionAssignments?: CollectionAssignment[];
  createdAt?: Date;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  participantId: string;
  timeItems?: TimeItem[];
  updatedAt?: Date;
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

export interface TieFormat {
  collectionDefinitions: CollectionDefinition[];
  collectionGroups?: CollectionGroup[];
  createdAt?: Date;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  tieFormatName?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date;
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
  createdAt?: Date;
  extensions?: Extension[];
  gender?: GenderEnum;
  isMock?: boolean;
  matchUpCount?: number;
  matchUpFormat?: string;
  matchUpType?: TypeEnum;
  matchUpValue?: number;
  notes?: string;
  processCodes?: string[];
  scoreValue?: number;
  setValue?: number;
  timeItems?: TimeItem[];
  updatedAt?: Date;
  winCriteria?: WinCriteria;
}

export interface CollectionValueProfile {
  collectionPosition: number;
  createdAt?: Date;
  extensions?: Extension[];
  isMock?: boolean;
  matchUpValue: number;
  notes?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date;
}

export enum GenderEnum {
  Any = 'ANY',
  Female = 'FEMALE',
  Male = 'MALE',
  Mixed = 'MIXED',
}

export interface WinCriteria {
  aggregateValue?: boolean;
  createdAt?: Date;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date;
  valueGoal: number;
}

export interface CollectionGroup {
  createdAt?: Date;
  extensions?: Extension[];
  groupName?: string;
  groupNumber: number;
  groupValue?: number;
  isMock?: boolean;
  notes?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date;
  winCriteria?: WinCriteria;
}

export interface Structure {
  createdAt?: Date;
  extensions?: Extension[];
  finishingPosition?: FinishingPositionEnum;
  isMock?: boolean;
  matchUpFormat?: string;
  matchUps?: MatchUp[];
  notes?: string;
  positionAssignments?: PositionAssignment[];
  qualifyingRoundNumber?: number;
  roundLimit?: number;
  roundOffset?: number;
  seedAssignments?: SeedAssignment[];
  seedingProfile?: PositioningProfileEnum;
  seedLimit?: number;
  stage?: StageTypeEnum;
  stageSequence?: number;
  structureAbbreviation?: string;
  structureId: string;
  structureName?: string;
  structures?: Structure[];
  structureOrder?: number;
  structureType?: StructureTypeEnum;
  tieFormat?: TieFormat;
  timeItems?: TimeItem[];
  updatedAt?: Date;
}

export enum FinishingPositionEnum {
  RoundOutcome = 'ROUND_OUTCOME',
  WinRatio = 'WIN_RATIO',
}

export interface PositionAssignment {
  bye?: boolean;
  createdAt?: Date;
  drawPosition: number;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  participantId?: string;
  qualifier?: boolean;
  timeItems?: TimeItem[];
  updatedAt?: Date;
}

export interface SeedAssignment {
  createdAt?: Date;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  participantId?: string;
  seedNumber: number;
  seedValue: number | string;
  timeItems?: TimeItem[];
  updatedAt?: Date;
}

export enum StructureTypeEnum {
  Container = 'CONTAINER',
  Item = 'ITEM',
}

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

export enum WheelchairClassEnum {
  Quad = 'QUAD',
  Standard = 'STANDARD',
}

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

export interface OnlineResource {
  createdAt?: Date;
  extensions?: Extension[];
  identifier?: string;
  isMock?: boolean;
  name?: string;
  notes?: string;
  provider?: string;
  resourceSubType?: string;
  resourceType?: OnlineResourceTypeEnum;
  timeItems?: TimeItem[];
  updatedAt?: Date;
}

export enum OnlineResourceTypeEnum {
  Email = 'EMAIL',
  Other = 'OTHER',
  SocialMedia = 'SOCIAL_MEDIA',
  URL = 'URL',
}

export interface Participant {
  contacts?: Contact[];
  createdAt?: Date;
  extensions?: Extension[];
  individualParticipantIds?: string[];
  isMock?: boolean;
  notes?: string;
  onlineResources?: OnlineResource[];
  participantId: string;
  participantName?: string;
  participantOtherName?: string;
  participantRole?: ParticipantRoleEnum;
  participantRoleResponsibilities?: string[];
  participantStatus?: ParticipantStatusEnum;
  participantType?: ParticipantTypeEnum;
  penalties?: Penalty[];
  person?: Person;
  personId?: string;
  representing?: CountryCodeEnum;
  teamId?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date;
}

export interface Contact {
  createdAt?: Date;
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
  updatedAt?: Date;
}

export enum ParticipantRoleEnum {
  Administration = 'ADMINISTRATION',
  Captain = 'CAPTAIN',
  Coach = 'COACH',
  Competitor = 'COMPETITOR',
  Media = 'MEDIA',
  Medical = 'MEDICAL',
  Official = 'OFFICIAL',
  Other = 'OTHER',
  Security = 'SECURITY',
}

export enum ParticipantStatusEnum {
  Active = 'ACTIVE',
  Withdrawn = 'WITHDRAWN',
}

export enum ParticipantTypeEnum {
  Group = 'GROUP',
  Individual = 'INDIVIDUAL',
  Pair = 'PAIR',
  Team = 'TEAM',
}

export interface Penalty {
  createdAt?: Date;
  extensions?: Extension[];
  isMock?: boolean;
  issuedAt?: string;
  matchUpId?: string;
  notes?: string;
  penaltyCode?: string;
  penaltyId: string;
  penaltyType: PenaltyTypeEnum;
  refereeParticipantId?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date;
}

export enum PenaltyTypeEnum {
  BallAbuse = 'BALL_ABUSE',
  Coaching = 'COACHING',
  DressCodeViolation = 'DRESS_CODE_VIOLATION',
  EquimentViolation = 'EQUIMENT_VIOLATION',
  FailuireToSignIn = 'FAILUIRE_TO_SIGN_IN',
  FailureToComplete = 'FAILURE_TO_COMPLETE',
  Ineligibility = 'INELIGIBILITY',
  LeavingTheCourt = 'LEAVING_THE_COURT',
  NoShow = 'NO_SHOW',
  Other = 'OTHER',
  PhysicalAbuse = 'PHYSICAL_ABUSE',
  ProhibitedSubstance = 'PROHIBITED_SUBSTANCE',
  Punctuality = 'PUNCTUALITY',
  RacketAbuse = 'RACKET_ABUSE',
  RefusalToPlay = 'REFUSAL_TO_PLAY',
  UnsportsmanlikeConduct = 'UNSPORTSMANLIKE_CONDUCT',
  VerbalAbuse = 'VERBAL_ABUSE',
}

export interface Person {
  addresses?: Address[];
  biographicalInformation?: BiographicalInformation;
  birthDate?: string;
  contacts?: Contact[];
  createdAt?: Date;
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
  sex?: SexEnum;
  standardFamilyName?: string;
  standardGivenName?: string;
  status?: string;
  tennisId?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date;
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
  createdAt?: Date;
  extensions?: Extension[];
  isMock?: boolean;
  latitude?: string;
  longitude?: string;
  notes?: string;
  postalCode?: string;
  state?: string;
  timeItems?: TimeItem[];
  timeZone?: string;
  updatedAt?: Date;
}

export enum AddressTypeEnum {
  Home = 'HOME',
  Mail = 'MAIL',
  Primary = 'PRIMARY',
  Residential = 'RESIDENTIAL',
  Venue = 'VENUE',
  Work = 'WORK',
}

export interface BiographicalInformation {
  ageBeganTennis?: number;
  ageTurnedPro?: number;
  birthCountryCode?: CountryCodeEnum;
  coachId?: string;
  createdAt?: Date;
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
  updatedAt?: Date;
  weight?: number;
  weightUnit?: WeightUnitEnum;
}

export enum PlayingDoubleHandCodeEnum {
  Backhand = 'BACKHAND',
  Both = 'BOTH',
  Forehand = 'FOREHAND',
  None = 'NONE',
}

export enum LengthUnitEnum {
  Centimeter = 'CENTIMETER',
  Meter = 'METER',
  Millimeter = 'MILLIMETER',
}

export enum PlayingHandCodeEnum {
  Ambidextrous = 'AMBIDEXTROUS',
  Left = 'LEFT',
  Right = 'RIGHT',
}

export enum WeightUnitEnum {
  Gram = 'GRAM',
  Kilogram = 'KILOGRAM',
}

export interface UnifiedPersonID {
  createdAt?: Date;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  organisationId: string;
  personId: string;
  timeItems?: TimeItem[];
  uniqueOrganisationName?: string;
  updatedAt?: Date;
}

export enum SexEnum {
  Female = 'FEMALE',
  Male = 'MALE',
  Other = 'OTHER',
}

export interface RegistrationProfile {
  createdAt?: Date;
  entriesClose?: Date;
  entriesOpen?: Date;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date;
  withdrawalDeadline?: Date;
}

export interface PrizeMoney {
  amount: number;
  createdAt?: Date;
  currencyCode: string;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date;
}

export interface UnifiedTournamentID {
  createdAt?: Date;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  organisationId: string;
  timeItems?: TimeItem[];
  tournamentId: string;
  uniqueOrganisationName?: string;
  updatedAt?: Date;
}

export interface Venue {
  addresses?: Address[];
  contacts?: Contact[];
  courts?: Court[];
  createdAt?: Date;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  onlineResources?: OnlineResource[];
  parentOrganisationId?: string;
  roles?: string[];
  subVenues?: Venue[];
  timeItems?: TimeItem[];
  updatedAt?: Date;
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
  createdAt?: Date;
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
  surfacedDate?: string;
  surfaceType?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date;
}

export interface Availability {
  bookings?: Booking;
  createdAt?: Date;
  date?: string;
  endTime?: string;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  startTime?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date;
}

export interface Booking {
  bookingType?: string;
  createdAt?: Date;
  endTime?: string;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  startTime?: string;
  timeItems?: TimeItem[];
  updatedAt?: Date;
}

export interface UnifiedVenueID {
  createdAt?: Date;
  extensions?: Extension[];
  isMock?: boolean;
  notes?: string;
  organisationId: string;
  timeItems?: TimeItem[];
  uniqueOrganisationName?: string;
  updatedAt?: Date;
  venueId: string;
}

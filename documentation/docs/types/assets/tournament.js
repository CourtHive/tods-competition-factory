export const tournament = {
  endDate: '{\\"type\\":\\"string\\",\\"required\\":\\"true\\"}',
  events:
    '{\\"type\\":\\"object\\",\\"object\\":\\"event\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',
  startDate: '{\\"type\\":\\"string\\",\\"required\\":\\"true\\"}',
  tournamentName: '{\\"type\\":\\"string\\",\\"required\\":\\"true\\"}',
  formalName: '{\\"type\\":\\"string\\",\\"required\\":\\"false\\"}',
  hostCountryCode:
    '{\\"type\\":\\"enum\\",\\"enum\\": \\"ISO3166-3\\",\\"required\\":\\"false\\"}',
};
/*

  hostCountryCode?: CountryCodeEnum; * The Country Hosting the Tournament (ISO3166-3 standards). Please see Wikipedia ISO_3166-1_alpha-3

   * An indoor or outdoor tournament
  indoorOutdoor?: IndoorOutdoorEnum;

   * The local time zone. This is useful as the start date doesn't carry time zone information.
  localTimeZone?: string;

   * List of matches if tournament does not have any draw structure defined.
  matchUps?: MatchUp[];

   * Tournament web sites and social media handles
  onlineResources?: OnlineResource[];

   * Organisation that owns / administers tournament.
  parentOrganisationId?: string;

   * Any Coach, Official, Umpire, Player, Management,... participation role associated with the Tournament.
   * Single person can have many participation roles.
  participants?: Participant[];

   * This is for a media-friendly name that is used to promote the tournament, for example ‘Wimbledon 2019’
  promotionalName?: string;

   * Defines entry and withdrawal timeframes.
  registrationProfile?: RegistrationProfile;

   * The Season in which the Tournament is run eg Summer 2019
  season?: string;

   * The start date of the tournament
  startDate?: Date;

   * Surface played on.
  surfaceCategory?: SurfaceCategoryEnum;

   * The total amount of prize money given.
   * Allows the prize money to be split into different currencies.
  totalPrizeMoney?: PrizeMoney[];

   * Valid categories for events in this tournament.
  tournamentCategories?: Category[];

   * Determines what point tables to use, also known as Grade.
  tournamentRank?: string;

   * Which other tournaments is this related to. For example it’s part of ATP Challenger Tour, WTA International, Grand Slam
  tournamentGroups?: string[];

   * Tournament id.
   * If within ClubSpark then ClubSpark unique tournament id.
  tournamentId: string;

   * National, International, Regional, etc.. tournament
  tournamentLevel?: TournamentLevelEnum;

   * The name of the tournament.
  tournamentName?: string;

   * Defines list of references to this tournament by other organisations.
   * For instance?: USTA uses ITA tournaments for its ranklist, etc..
  tournamentOtherIds?: UnifiedTournamentId[];

   * List of venues associated with the tournament.
   * If within Clubspark then ClubSpark unique venue id.
  venueIds?: string[];
*/
export default tournament;

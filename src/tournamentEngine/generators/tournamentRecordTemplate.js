export const tournamentRecordTemplate = ({ tournamentId }) => ({
  tournamentId,
  tournamentRank: undefined,
  tournamentCategories: [],

  formalName: undefined,
  tournamentName: undefined,
  promotionalName: undefined,
  onlineResources: [],

  localTimeZone: undefined,
  startDate: undefined,
  endDate: undefined,

  hostCountryCode: undefined,
  tournamentContacts: [],
  tournamentAddresses: [],
  tournamaentOfficials: [],

  venues: [],
  events: [],
  participants: [],

  indoorOutdoor: undefined,
  surfaceCategory: undefined,

  registrationProfile: {
    entriesOpen: undefined,
    entriesClose: undefined,
    withdrawalDeadline: undefined,
  },

  unifiedTournamentId: {
    tournamentId,
    organisation: {
      organisationId: undefined,
      organisationName: undefined,
      organisationAbbreviation: undefined,
    },
  },
});

export default tournamentRecordTemplate;

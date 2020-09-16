export const tournamentRecordTemplate = ({ tournamentId }) => ({
  tournamentId,
  tournamentRank: null,
  tournamentCategories: [],

  formalName: null,
  tournamentName: null,
  promotionalName: null,
  onlineResources: [],

  localTimeZone: null,
  startDate: null,
  endDate: null,

  hostCountryCode: null,
  tournamentContacts: [],
  tournamentAddresses: [],
  tournamaentOfficials: [],

  venues: [],
  events: [],
  participants: [],

  indoorOutdoor: null,
  surfaceCategory: null,

  registrationProfile: {
    entriesOpen: null,
    entriesClose: null,
    withdrawalDeadline: null,
  },

  unifiedTournamentId: {
    tournamentId,
    organisation: {
      organisationId: null,
      organisationName: null,
      organisationAbbreviation: null,
    },
  },
});

export default tournamentRecordTemplate;

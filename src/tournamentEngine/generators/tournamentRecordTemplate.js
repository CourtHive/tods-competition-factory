export const tournamentRecordTemplate = () => ({
  tournamentId: null,

  formalName: null,
  tournamentName: null,
  promotionalName: null,

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

  entriesOpen: null,
  entriesClose: null,
  withdrawalDeadline: null,
});

export default tournamentRecordTemplate;

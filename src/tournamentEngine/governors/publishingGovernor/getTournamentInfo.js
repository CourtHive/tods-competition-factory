import { SUCCESS } from '../../../constants/resultConstants';

export function getTournamentInfo({ tournamentRecord, event }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const tournamentInfo = (({
    tournamentId,
    tournamentRank,

    formalName,
    tournamentName,
    promotionalName,
    onlineResources,

    localTimeZone,
    startDate,
    endDate,

    hostCountryCode,
    tournamentContacts,
    tournamentAddresses,
    tournamaentOfficials,
  }) => ({
    tournamentId,
    tournamentRank,

    formalName,
    tournamentName,
    promotionalName,
    onlineResources,

    localTimeZone,
    startDate,
    endDate,

    hostCountryCode,
    tournamentContacts,
    tournamentAddresses,
    tournamaentOfficials,
  }))(tournamentRecord);

  return Object.assign({}, SUCCESS, { tournamentInfo });
}

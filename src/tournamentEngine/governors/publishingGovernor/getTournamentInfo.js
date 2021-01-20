import { makeDeepCopy } from '../../../utilities';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function getTournamentInfo({ tournamentRecord }) {
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
  }))(tournamentRecord);

  return Object.assign({}, SUCCESS, {
    tournamentInfo: makeDeepCopy(tournamentInfo),
  });
}

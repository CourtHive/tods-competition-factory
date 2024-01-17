import { makeDeepCopy } from '../../tools/makeDeepCopy';

import { SUCCESS } from '../../constants/resultConstants';
import { ErrorType, MISSING_TOURNAMENT_RECORD } from '../../constants/errorConditionConstants';

export function getTournamentInfo({ tournamentRecord }): {
  tournamentInfo?: any;
  error?: ErrorType;
} {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const tournamentInfo = (({
    tournamentId,
    tournamentRank,
    tournamentStatus,

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
    tournamentStatus,

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

  return {
    ...SUCCESS,
    tournamentInfo: makeDeepCopy(tournamentInfo, false, true),
  };
}

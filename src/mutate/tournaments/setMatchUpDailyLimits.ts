import { addExtension } from '../extensions/addExtension';

import { SCHEDULE_LIMITS } from '../../constants/extensionConstants';
import { ResultType } from '../../functions/global/decorateResult';
import { TournamentRecords } from '../../types/factoryTypes';
import { SUCCESS } from '../../constants/resultConstants';
import { Tournament } from '../../types/tournamentTypes';
import { INVALID_OBJECT, INVALID_VALUES, MISSING_TOURNAMENT_RECORDS } from '../../constants/errorConditionConstants';

type SetMatchUpDailyLimitsArgs = {
  tournamentRecords?: TournamentRecords;
  tournamentRecord?: Tournament;
  tournamentId: string;
  dailyLimits: any;
};
export function setMatchUpDailyLimits(params: SetMatchUpDailyLimitsArgs): ResultType {
  const { tournamentRecord, tournamentId, dailyLimits } = params;

  const tournamentRecords =
    params.tournamentRecords ||
    (tournamentRecord && {
      [tournamentRecord.tournamentId]: tournamentRecord,
    }) ||
    {};

  if (typeof tournamentRecords !== 'object' || !Object.keys(tournamentRecords).length)
    return { error: MISSING_TOURNAMENT_RECORDS };
  if (typeof dailyLimits !== 'object') return { error: INVALID_OBJECT };

  const tournamentIds = Object.keys(tournamentRecords).filter(
    (currentTournamentId) => !tournamentId || tournamentId === currentTournamentId,
  );

  if (tournamentId && !tournamentIds.includes(tournamentId)) return { error: INVALID_VALUES };

  for (const currentTournamentId of tournamentIds) {
    const tournamentRecord = tournamentRecords[currentTournamentId];
    const result = addExtension({
      element: tournamentRecord,
      extension: { name: SCHEDULE_LIMITS, value: { dailyLimits } },
    });
    if (result.error) return result;
  }

  return { ...SUCCESS };
}

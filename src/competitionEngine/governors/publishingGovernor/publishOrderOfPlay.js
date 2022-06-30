import { publishOrderOfPlay as publishTournamentOrderOfPlay } from '../../../tournamentEngine/governors/publishingGovernor/publishOrderOfPlay';

import { MISSING_TOURNAMENT_RECORDS } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function publishOrderOfPlay(params) {
  const tournamentRecords = params?.tournamentRecords;
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = publishTournamentOrderOfPlay({
      tournamentRecord,
      ...params,
    });
    if (result.error) return result;
  }

  return { ...SUCCESS };
}

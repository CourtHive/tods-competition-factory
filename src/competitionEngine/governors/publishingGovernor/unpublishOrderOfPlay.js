import { unPublishOrderOfPlay as unPublishTournamentOrderOfPlay } from '../../../tournamentEngine/governors/publishingGovernor/unPublishOrderOfPlay';

import { MISSING_TOURNAMENT_RECORDS } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function unPublishOrderOfPlay(params) {
  const tournamentRecords = params?.tournamentRecords;
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = unPublishTournamentOrderOfPlay({
      tournamentRecord,
      ...params,
    });
    if (result.error) return result;
  }

  return { ...SUCCESS };
}

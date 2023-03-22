import { updateTieMatchUpScore as autoScore } from '../../../tournamentEngine/governors/eventGovernor/updateTieMatchUpScore';
import { findTournamentId } from './findTournamentId';

import {
  MISSING_TOURNAMENT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function updateTieMatchUpScore(params) {
  const tournamentRecords = params.tournamentRecords;
  // find tournamentId by brute force if not provided
  const tournamentId = params.tournamentId || findTournamentId(params);
  if (typeof tournamentId !== 'string') return { error: MISSING_TOURNAMENT_ID };

  const tournamentRecord = tournamentRecords[tournamentId];
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  return autoScore({ ...params, tournamentRecord });
}

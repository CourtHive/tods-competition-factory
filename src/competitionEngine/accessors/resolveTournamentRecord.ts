import { findTournamentId } from '../governors/competitionsGovernor/findTournamentId';
import {
  MISSING_TOURNAMENT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../constants/errorConditionConstants';

export function resolveTournamentRecord(params) {
  const { method, tournamentRecords, ...args } = params;
  // find tournamentId by brute force if not provided
  const tournamentId = params.tournamentId || findTournamentId(args);
  if (typeof tournamentId !== 'string') return { error: MISSING_TOURNAMENT_ID };

  const tournamentRecord = tournamentRecords[tournamentId];
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  return method({ ...args, tournamentRecord });
}

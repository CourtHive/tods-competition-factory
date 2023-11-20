import { findTournamentId } from '../governors/competitionsGovernor/findTournamentId';

import { TournamentRecords } from '../../types/factoryTypes';
import {
  MISSING_TOURNAMENT_ID,
  MISSING_VALUE,
} from '../../constants/errorConditionConstants';

/**
 * internal utility function to get tournamentRecord from tournamentRecords given tournamentId, drawId or eventId
 */

type ResolveTournamentRecordArgs = {
  tournamentRecords: TournamentRecords;
  tournamentId?: string;
  eventId?: string;
  drawId?: string;
  method: any;
};

export function resolveTournamentRecord(params: ResolveTournamentRecordArgs) {
  const { method, tournamentRecords, ...args } = params;

  if (!method) return { error: MISSING_VALUE };

  // find tournamentId by brute force if not provided
  const tournamentId =
    params.tournamentId || findTournamentId({ tournamentRecords, ...args });
  if (typeof tournamentId !== 'string') return { error: MISSING_TOURNAMENT_ID };

  const tournamentRecord = tournamentRecords[tournamentId];

  return method({ ...args, tournamentRecord });
}

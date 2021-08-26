import { matchUpActions as tournamentMatchUpActions } from '../../../tournamentEngine/getters/matchUpActions';
import { findEvent } from '../../../tournamentEngine/getters/eventGetter';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../constants/errorConditionConstants';

export function matchUpActions({
  tournamentRecords,
  tournamentId,
  matchUpId,
  eventId,
  drawId,
}) {
  if (
    typeof tournamentId !== 'string' ||
    typeof matchUpId !== 'string' ||
    typeof drawId !== 'string'
  )
    return { error: INVALID_VALUES };

  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  const tournamentRecord = tournamentRecords[tournamentId];
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORDS };

  const { drawDefinition } = findEvent({ tournamentRecord, eventId, drawId });

  return tournamentMatchUpActions({
    tournamentRecord,
    drawDefinition,
    drawId,
    matchUpId,
  });
}

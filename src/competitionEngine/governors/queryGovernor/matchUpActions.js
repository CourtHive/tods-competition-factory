import { matchUpActions as tournamentMatchUpActions } from '../../../tournamentEngine/getters/matchUpActions';
import { findEvent } from '../../../tournamentEngine/getters/eventGetter';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function matchUpActions({
  tournamentRecords,
  tournamentId,
  matchUpId,
  eventId, // optional
  drawId,
} = {}) {
  if (
    typeof tournamentRecords !== 'object' ||
    typeof tournamentId !== 'string' ||
    typeof matchUpId !== 'string' ||
    typeof drawId !== 'string'
  )
    return { error: INVALID_VALUES };

  const tournamentRecord = tournamentRecords[tournamentId];
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const { drawDefinition, error } = findEvent({
    tournamentRecord,
    eventId,
    drawId,
  });
  if (error) return { error };

  return tournamentMatchUpActions({
    tournamentRecord,
    drawDefinition,
    drawId,
    matchUpId,
  });
}

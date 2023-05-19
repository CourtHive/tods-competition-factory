import { matchUpActions as tournamentMatchUpActions } from '../../../tournamentEngine/getters/matchUpActions';
import { findEvent } from '../../../tournamentEngine/getters/eventGetter';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function matchUpActions({
  tournamentRecords,
  participantId,
  tournamentId,
  sideNumber,
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

  const result = findEvent({
    tournamentRecord,
    eventId,
    drawId,
  });
  if (result.error) return result;

  return tournamentMatchUpActions({
    drawDefinition: result.drawDefinition,
    tournamentRecord,
    participantId,
    sideNumber,
    matchUpId,
    drawId,
  });
}

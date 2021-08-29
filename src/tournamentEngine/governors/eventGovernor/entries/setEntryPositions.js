import { SUCCESS } from '../../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';

export function setEntryPosition({
  tournamentRecord,
  drawDefinition,
  participantId,
  entryPosition,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  if (entryPosition !== undefined && !Number.isSafeInteger(entryPosition))
    return { error: INVALID_VALUES, entryPosition };

  (event?.entries || []).forEach((entry) => {
    if (entry.participantId === participantId) {
      entry.entryPosition = entryPosition;
    }
  });

  (drawDefinition?.entries || []).forEach((entry) => {
    if (entry.participantId === participantId) {
      entry.entryPosition = entryPosition;
    }
  });

  return SUCCESS;
}

export function setEntryPositions({
  tournamentRecord,
  entryPositions,
  drawDefinition,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!Array.isArray(entryPositions)) return { error: INVALID_VALUES };

  for (const positioning of entryPositions) {
    const { participantId, entryPosition } = positioning;
    const result = setEntryPosition({
      tournamentRecord,
      drawDefinition,
      participantId,
      entryPosition,
      event,
    });
    if (result.error) return result;
  }

  return { ...SUCCESS };
}

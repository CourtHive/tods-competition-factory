import {
  INVALID_VALUES,
  MISSING_EVENT,
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function setEntryPosition({
  tournamentRecord,
  participantId,
  entryPosition,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };
  if (!event) return { error: MISSING_EVENT };
  if (!event.entries) event.entries = [];

  // setting entryPosition to 0 is the same as removing entryPosition
  if (entryPosition === 0) entryPosition = undefined;

  if (entryPosition !== undefined && isNaN(parseInt(entryPosition)))
    return { error: INVALID_VALUES, entryPosition };

  event.entries.forEach((entry) => {
    if (entry.participantId === participantId) {
      entry.entryPosition = entryPosition;
    }
  });

  return SUCCESS;
}

export function setEntryPositions({ tournamentRecord, entryPositions, event }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const errors = [];
  entryPositions.forEach((positioning) => {
    const { participantId, entryPosition } = positioning;
    const result = setEntryPosition({
      tournamentRecord,
      event,
      participantId,
      entryPosition,
    });
    if (result.error) errors.push(result.error);
  });

  return errors.length ? { error: errors } : SUCCESS;
}

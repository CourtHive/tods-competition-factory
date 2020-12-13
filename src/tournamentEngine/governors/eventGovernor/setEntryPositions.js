import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function setEntryPosition({
  tournamentRecord,
  participantId,
  entryPosition,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

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

  entryPositions.forEach((positioning) => {
    const { participantId, entryPosition } = positioning;
    setEntryPosition({ tournamentRecord, event, participantId, entryPosition });
  });

  return SUCCESS;
}

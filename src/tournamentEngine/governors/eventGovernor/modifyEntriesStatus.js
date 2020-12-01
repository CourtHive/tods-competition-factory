import {
  INVALID_ENTRY_STATUS,
  INVALID_PARTICIPANT_ID,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { STRUCTURE_ENTERED_TYPES } from '../../../constants/entryStatusConstants';

export function modifyEntriesStatus({
  tournamentRecord,
  event,
  participantIds,
  entryStatus,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantIds || !Array.isArray(participantIds))
    return { error: INVALID_PARTICIPANT_ID };
  if (!event) return { error: MISSING_EVENT };
  if (!STRUCTURE_ENTERED_TYPES.includes(entryStatus))
    return { error: INVALID_ENTRY_STATUS };

  // TODO: check that entries are not present in any drawDefinitions/structures
  event.entries.forEach(entry => {
    if (participantIds.includes(entry.participantId)) {
      entry.entryStatus = entryStatus;
    }
  });
}

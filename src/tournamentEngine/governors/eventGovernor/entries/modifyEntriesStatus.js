import {
  INVALID_ENTRY_STATUS,
  INVALID_PARTICIPANT_ID,
  MISSING_EVENT,
} from '../../../../constants/errorConditionConstants';
import { VALID_ENTERED_TYPES } from '../../../../constants/entryStatusConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function modifyEntriesStatus({
  drawDefinition,
  participantIds,
  entryStatus,
  event,
}) {
  if (!participantIds || !Array.isArray(participantIds))
    return {
      error: INVALID_PARTICIPANT_ID,
      participantIds,
      method: 'modifyEntriesStatus',
    };
  if (!VALID_ENTERED_TYPES.includes(entryStatus))
    return { error: INVALID_ENTRY_STATUS };

  if (!drawDefinition && !event) return { error: MISSING_EVENT };
  // TODO: check that entries are not present in any drawDefinitions/structures

  if (event) {
    event.entries.forEach((entry) => {
      if (participantIds.includes(entry.participantId)) {
        entry.entryStatus = entryStatus;
      }
    });
  }

  if (drawDefinition) {
    drawDefinition.entries.forEach((entry) => {
      if (participantIds.includes(entry.participantId)) {
        entry.entryStatus = entryStatus;
      }
    });
  }

  return SUCCESS;
}

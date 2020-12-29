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

  // build up an array of participantIds to be modified which are present in drawDefinitions as well
  const participantIdsPresentinDraws = [];
  event.drawDefinitions?.forEach((drawDefinition) => {
    drawDefinition.entries.forEach((entry) => {
      if (participantIds.includes(entry.participantId)) {
        participantIdsPresentinDraws.push(entry.participantId);
      }
    });
  });

  // if a drawDefinition is specified, modify entryStatus of participantIds
  if (drawDefinition) {
    drawDefinition.entries.forEach((entry) => {
      if (participantIds.includes(entry.participantId)) {
        entry.entryStatus = entryStatus;
      }
    });
  }

  if (event) {
    event.entries.forEach((entry) => {
      const presentInDraws =
        !drawDefinition &&
        participantIdsPresentinDraws.includes(entry.participantId);

      // if a participantId is also present in a drawDefinition...
      // ...and a specific drawDefinition is NOT being modified as well:
      // prevent modifying status in event.
      if (participantIds.includes(entry.participantId) && !presentInDraws) {
        entry.entryStatus = entryStatus;
      }
    });
  }

  return SUCCESS;
}

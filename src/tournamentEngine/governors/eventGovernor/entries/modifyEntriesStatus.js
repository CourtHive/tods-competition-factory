import { findParticipant } from '../../../../drawEngine/getters/participantGetter';

import {
  INVALID_ENTRY_STATUS,
  INVALID_PARTICIPANT_ID,
  MISSING_EVENT,
} from '../../../../constants/errorConditionConstants';
import {
  UNPAIRED,
  VALID_ENTERED_TYPES,
} from '../../../../constants/entryStatusConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import { PAIR } from '../../../../constants/participantTypes';

export function modifyEntriesStatus({
  tournamentRecord,
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

  // build up an array of participantIds which are present in drawDefinitions as well
  const participantIdsPresentinDraws = [];
  event.drawDefinitions?.forEach((drawDefinition) => {
    drawDefinition.entries.forEach((entry) => {
      if (participantIdsPresentinDraws.includes(entry.participantId)) {
        participantIdsPresentinDraws.push(entry.participantId);
      }
    });
  });

  const tournamentParticipants = tournamentRecord?.participants || [];

  const validEntryStatusForAllParticipantIds = participantIds.every(
    (participantId) => {
      const { participantType } = findParticipant({
        tournamentParticipants,
        participantId,
      });
      return !(participantType === PAIR && entryStatus === UNPAIRED);
    }
  );

  if (!validEntryStatusForAllParticipantIds)
    return { error: INVALID_ENTRY_STATUS };

  // if a drawDefinition is specified, modify entryStatus of participantIds
  if (drawDefinition) {
    drawDefinition.entries.forEach((entry) => {
      if (participantIds.includes(entry.participantId)) {
        entry.entryStatus = entryStatus;
        delete entry.entryPosition;
      }
    });
  }

  if (event) {
    event.entries.forEach((entry) => {
      const presentInDraws = participantIdsPresentinDraws.includes(
        entry.participantId
      );

      // if a participantId is also present in a drawDefinition...
      // ...and a specific drawDefinition is NOT being modified as well:
      // prevent modifying status in event.
      if (participantIds.includes(entry.participantId) && !presentInDraws) {
        entry.entryStatus = entryStatus;
        delete entry.entryPosition;
      }
    });
  }

  return SUCCESS;
}

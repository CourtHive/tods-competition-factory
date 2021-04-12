import { getAssignedParticipantIds } from '../../../../drawEngine/getters/getAssignedParticipantIds';
import { refreshEntryPositions } from '../../../../common/producers/refreshEntryPositions';
import { removeDrawEntries } from '../drawDefinitions/removeDrawEntries';
import { intersection } from '../../../../utilities';

import {
  MISSING_EVENT,
  EVENT_NOT_FOUND,
  MISSING_PARTICIPANT_IDS,
  EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT,
} from '../../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function removeEventEntries({
  participantIds,
  drawId,
  drawDefinition,
  event,
  autoEntryPositions = true,
}) {
  if (!event) return { error: MISSING_EVENT };
  if (!participantIds || !participantIds.length)
    return { error: MISSING_PARTICIPANT_IDS };

  if (!event || !event.eventId) return { error: EVENT_NOT_FOUND };
  if (!event.entries) event.entries = [];

  const assignedParticipantIds = getAssignedParticipantIds({ drawDefinition });
  const someAssignedParticipantIds = intersection(
    participantIds,
    assignedParticipantIds
  ).length;

  if (someAssignedParticipantIds)
    return { error: EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT };

  event.entries = event.entries.filter((entry) => {
    const entryId =
      entry.participantId ||
      (entry.participant && entry.participant.participantId);
    return participantIds.includes(entryId) ? false : true;
  });
  if (autoEntryPositions) {
    event.entries = refreshEntryPositions({
      entries: event.entries,
    });
  }

  if (drawId) {
    removeDrawEntries({ participantIds, drawId, drawDefinition, event });
  }

  return SUCCESS;
}

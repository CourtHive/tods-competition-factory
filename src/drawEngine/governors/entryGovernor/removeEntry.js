import { refreshEntryPositions } from '../../../common/producers/refreshEntryPositions';
import { getAssignedParticipantIds } from '../../getters/getAssignedParticipantIds';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT,
  MISSING_DRAW_DEFINITION,
  MISSING_PARTICIPANT_ID,
} from '../../../constants/errorConditionConstants';

export function removeEntry({
  participantId,
  drawDefinition,
  autoEntryPositions = true,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const assignedParticipantIds = getAssignedParticipantIds({ drawDefinition });
  const isAssignedParticipant = assignedParticipantIds.includes(participantId);

  if (isAssignedParticipant)
    return { error: EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT };

  if (drawDefinition?.entries) {
    drawDefinition.entries = drawDefinition.entries.filter(
      (entry) => entry.participantId !== participantId
    );
  }

  if (autoEntryPositions) {
    drawDefinition.entries = refreshEntryPositions({
      entries: drawDefinition.entries,
    });
  }

  return SUCCESS;
}

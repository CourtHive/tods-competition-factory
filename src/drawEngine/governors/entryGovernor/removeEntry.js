import { refreshEntryPositions } from '../../../global/functions/producers/refreshEntryPositions';
import { getAssignedParticipantIds } from '../../getters/getAssignedParticipantIds';
import { modifyDrawNotice } from '../../notifications/drawNotifications';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT,
  MISSING_DRAW_DEFINITION,
  MISSING_PARTICIPANT_ID,
} from '../../../constants/errorConditionConstants';

export function removeEntry({
  autoEntryPositions = true,
  drawDefinition,
  participantId,
  stages,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const assignedParticipantIds = getAssignedParticipantIds({
    drawDefinition,
    stages,
  });
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

  modifyDrawNotice({ drawDefinition });

  return { ...SUCCESS };
}

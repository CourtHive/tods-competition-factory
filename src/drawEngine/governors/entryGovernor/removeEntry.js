import { structureAssignedDrawPositions } from '../../getters/positionsGetter';

import {
  EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT,
  MISSING_DRAW_DEFINITION,
  MISSING_PARTICIPANT_ID,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function removeEntry({ participantId, drawDefinition }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const isAssignedParticipant = (drawDefinition.structures || []).find(
    (structure) => {
      const { positionAssignments } = structureAssignedDrawPositions({
        structure,
      });
      const participantIsAssigned = positionAssignments.find(
        (assignment) => assignment.participantId === participantId
      );
      return participantIsAssigned;
    }
  );

  if (isAssignedParticipant)
    return { error: EXISTING_PARTICIPANT_DRAW_POSITION_ASSIGNMENT };

  if (drawDefinition?.entries) {
    drawDefinition.entries = drawDefinition.entries.filter(
      (entry) => entry.participantId !== participantId
    );
  }
  return SUCCESS;
}

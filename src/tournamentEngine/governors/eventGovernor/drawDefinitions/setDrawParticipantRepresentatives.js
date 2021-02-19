import { getDrawDefinition } from '../../../getters/eventGetter';
import {
  DRAW_DEFINITION_NOT_FOUND,
  EVENT_NOT_FOUND,
} from '../../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function setDrawParticipantRepresentatives({
  tournamentRecord,
  drawId,
  representativeParticipantIds,
}) {
  const { event, drawDefinition } = getDrawDefinition({
    tournamentRecord,
    drawId,
  });
  if (!event) return { error: EVENT_NOT_FOUND };
  if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };

  (drawDefinition.entries || []).forEach((entry) => {
    const isRep = representativeParticipantIds.includes(entry.participantId);
    if (isRep) {
      entry.representative = true;
    } else {
      delete entry.representative;
    }
  });

  return SUCCESS;
}

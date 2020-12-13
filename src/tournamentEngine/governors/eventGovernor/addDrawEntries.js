import { getDrawDefinition } from '../../getters/eventGetter';
import {
  DRAW_DEFINITION_NOT_FOUND,
  EVENT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function addDrawEntries({
  tournamentRecord,
  drawEngine,

  participantIds,
  entryStatus,
  entryStage,
  drawId,
}) {
  const { drawDefinition, event } = getDrawDefinition({
    tournamentRecord,
    drawId,
  });
  if (!event) return { error: EVENT_NOT_FOUND };
  if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };

  const result = drawEngine
    .setState(drawDefinition)
    .addDrawEntries({ participantIds, stage: entryStage, entryStatus });
  if (result.error) return result;

  const { drawDefinition: updatedDrawDefinition } = drawEngine.getState();
  event.drawDefinitions = event.drawDefinitions.map((drawDefinition) => {
    return drawDefinition.drawId === drawId
      ? updatedDrawDefinition
      : drawDefinition;
  });

  return SUCCESS;
}

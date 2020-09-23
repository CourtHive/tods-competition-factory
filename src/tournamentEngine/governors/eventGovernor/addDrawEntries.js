import { getDrawDefinition } from '../../getters/eventGetter';
import { SUCCESS } from '../../../constants/resultConstants';

export function addDrawEntries({
  tournamentRecord,
  drawEngine,
  drawId,
  participantIds,
  entryStage,
  entryStatus,
}) {
  const { drawDefinition, event } = getDrawDefinition({
    tournamentRecord,
    drawId,
  });
  if (!event) return { error: 'event not found' };
  if (!drawDefinition) return { error: 'drawDefinition not found' };

  const result = drawEngine
    .setState(drawDefinition)
    .addDrawEntries({ participantIds, stage: entryStage, entryStatus });
  if (result.error) return result;

  const { drawDefinition: updatedDrawDefinition } = drawEngine.getState();
  event.drawDefinitions = event.drawDefinitions.map(drawDefinition => {
    return drawDefinition.drawId === drawId
      ? updatedDrawDefinition
      : drawDefinition;
  });

  return SUCCESS;
}

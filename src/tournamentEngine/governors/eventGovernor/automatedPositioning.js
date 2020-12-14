import { getPlayoffStructures } from '../../getters/structureGetter';
import {
  DRAW_DEFINITION_NOT_FOUND,
  EVENT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

/**
 *
 * @param {string} drawId - tournamentEngine will resovle event and drawDefinition
 * @param {string} structureId - structure within which positioning should occur
 */
export function automatedPositioning({
  event,
  drawEngine,
  structureId,
  drawDefinition,
  tournamentRecord,
}) {
  if (!event) return { error: EVENT_NOT_FOUND };
  if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };
  const participants = tournamentRecord?.participants;

  const result = drawEngine
    .setState(drawDefinition)
    .automatedPositioning({ participants, structureId });

  const errorsCount = result?.errors?.length;

  if (!result?.errors?.length) {
    const { drawId } = drawDefinition;
    const { drawDefinition: updatedDrawDefinition } = drawEngine.getState();

    event.drawDefinitions = event.drawDefinitions.map((drawDefinition) => {
      return drawDefinition.drawId === drawId
        ? updatedDrawDefinition
        : drawDefinition;
    });
  }

  return errorsCount ? { error: result.errors } : SUCCESS;
}

export function automatedPlayoffPositioning({
  event,
  deepCopy,
  drawEngine,
  structureId,
  drawDefinition,
  tournamentRecord,
}) {
  if (!event) return { error: EVENT_NOT_FOUND };
  if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };
  const participants = tournamentRecord?.participants;

  const { playoffStructures } = getPlayoffStructures({
    drawDefinition,
    structureId,
  });

  drawEngine.setState(drawDefinition, deepCopy);

  const errors = [];
  playoffStructures &&
    playoffStructures.forEach((structure) => {
      const { structureId: playoffStructureId } = structure;
      const result = drawEngine.automatedPositioning({
        participants,
        structureId: playoffStructureId,
      });
      result.errors.forEach((error) => errors.push(error));
    });

  if (!errors.length) {
    const { drawId } = drawDefinition;
    const { drawDefinition: updatedDrawDefinition } = drawEngine.getState();

    event.drawDefinitions = event.drawDefinitions.map((drawDefinition) => {
      return drawDefinition.drawId === drawId
        ? updatedDrawDefinition
        : drawDefinition;
    });
  }

  return errors.length ? { error: errors } : SUCCESS;
}

import { findStructure } from '../../../drawEngine/getters/findStructure';
import { SUCCESS } from '../../../constants/resultConstants';
import { PLAYOFF } from '../../../constants/drawDefinitionConstants';

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
}) {
  if (!event) return { error: 'event not found' };
  if (!drawDefinition) return { error: 'drawDefinition not found' };

  const result = drawEngine
    .setState(drawDefinition)
    .automatedPositioning({ structureId });

  const errorsCount = result?.errors?.length;

  if (!result?.errors?.length) {
    const { drawId } = drawDefinition;
    const { drawDefinition: updatedDrawDefinition } = drawEngine.getState();

    event.drawDefinitions = event.drawDefinitions.map(drawDefinition => {
      return drawDefinition.drawId === drawId
        ? updatedDrawDefinition
        : drawDefinition;
    });
  }

  return errorsCount ? { error: result.errors } : SUCCESS;
}

export function automatedPlayoffPositioning({
  event,
  drawEngine,
  structureId,
  drawDefinition,
}) {
  if (!event) return { error: 'event not found' };
  if (!drawDefinition) return { error: 'drawDefinition not found' };

  const targetStructureIds = drawDefinition.links
    .filter(link => link.source?.structureId === structureId)
    .map(link => link.target?.structureId);

  const playoffStructures = drawDefinition.structures?.filter(
    structure =>
      targetStructureIds.includes(structure.structureId) &&
      structure.stage === PLAYOFF
  );

  drawEngine.setState(drawDefinition);

  const errors = [];
  playoffStructures.forEach(structure => {
    const { structureId: playoffStructureId } = structure;
    const result = drawEngine.automatedPositioning({
      structureId: playoffStructureId,
    });
    result.errors.forEach(error => errors.push(error));
  });

  if (!errors.length) {
    const { drawId } = drawDefinition;
    const { drawDefinition: updatedDrawDefinition } = drawEngine.getState();

    event.drawDefinitions = event.drawDefinitions.map(drawDefinition => {
      return drawDefinition.drawId === drawId
        ? updatedDrawDefinition
        : drawDefinition;
    });
  }

  return errors.length ? { error: errors } : SUCCESS;
}

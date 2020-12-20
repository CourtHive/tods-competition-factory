import { getPlayoffStructures } from '../../getters/structureGetter';
import { automatedPositioning as drawEngineAutomatedPositioning } from '../../../drawEngine/governors/positionGovernor/automatedPositioning';

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
  structureId,
  drawDefinition,
  tournamentRecord,
}) {
  if (!event) return { error: EVENT_NOT_FOUND };
  if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };
  const participants = tournamentRecord?.participants;

  const result = drawEngineAutomatedPositioning({
    drawDefinition,
    participants,
    structureId,
  });

  return result?.errors?.length ? { error: result.errors } : SUCCESS;
}

export function automatedPlayoffPositioning({
  event,
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

  const errors = [];
  playoffStructures &&
    playoffStructures.forEach((structure) => {
      const { structureId: playoffStructureId } = structure;
      const result = drawEngineAutomatedPositioning({
        drawDefinition,
        participants,
        structureId: playoffStructureId,
      });
      result.errors.forEach((error) => errors.push(error));
    });

  return errors.length ? { error: errors } : SUCCESS;
}

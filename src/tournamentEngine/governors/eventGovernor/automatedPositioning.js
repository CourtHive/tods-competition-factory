import { automatedPositioning as drawEngineAutomatedPositioning } from '../../../drawEngine/governors/positionGovernor/automatedPositioning';
import { getPlayoffStructures } from '../../getters/structureGetter';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  DRAW_DEFINITION_NOT_FOUND,
  EVENT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

/**
 *
 * @param {string} drawId - tournamentEngine will resovle event and drawDefinition
 * @param {string} structureId - structure within which positioning should occur
 */
export function automatedPositioning({
  tournamentRecord,
  drawDefinition,
  structureId,
  seedsOnly,
  event,
}) {
  if (!event) return { error: EVENT_NOT_FOUND };
  if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };
  const participants = tournamentRecord?.participants;

  const result = drawEngineAutomatedPositioning({
    drawDefinition,
    participants,
    structureId,
    seedsOnly,
  });

  return result.error
    ? result
    : result?.errors?.length
    ? { error: result.errors }
    : SUCCESS;
}

export function automatedPlayoffPositioning({
  candidatesCount = 1,
  tournamentRecord,
  drawDefinition,
  structureId,
  seedsOnly,
  event,
}) {
  if (!event) return { error: EVENT_NOT_FOUND };
  if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };

  const participants = tournamentRecord?.participants;
  const { playoffStructures } = getPlayoffStructures({
    drawDefinition,
    structureId,
  });

  if (playoffStructures) {
    for (const structure of playoffStructures) {
      const { structureId: playoffStructureId } = structure;
      const result = drawEngineAutomatedPositioning({
        structureId: playoffStructureId,
        candidatesCount,
        drawDefinition,
        participants,
        seedsOnly,
      });
      if (result.error) return result;
    }
  }

  return { ...SUCCESS };
}

import { automatedPositioning as drawEngineAutomatedPositioning } from '../../../drawEngine/governors/positionGovernor/automatedPositioning';
import { isCompletedStructure } from '../../../drawEngine/governors/queryGovernor/structureActions';
import { getPlayoffStructures } from '../../getters/structureGetter';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  DRAW_DEFINITION_NOT_FOUND,
  EVENT_NOT_FOUND,
  INCOMPLETE_SOURCE_STRUCTURE,
} from '../../../constants/errorConditionConstants';

/**
 *
 * @param {string} drawId - tournamentEngine will resovle event and drawDefinition
 * @param {string} structureId - structure within which positioning should occur
 */
export function automatedPositioning({
  applyPositioning = true,
  tournamentRecord,
  drawDefinition,
  seedingProfile,
  structureId,
  placeByes,
  seedsOnly,
  event,
}) {
  if (!event) return { error: EVENT_NOT_FOUND };
  if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };

  const participants = tournamentRecord?.participants;

  return drawEngineAutomatedPositioning({
    tournamentRecord,
    applyPositioning,
    drawDefinition,
    seedingProfile,
    participants,
    structureId,
    placeByes,
    seedsOnly,
  });
}

export function automatedPlayoffPositioning({
  applyPositioning = true,
  candidatesCount = 1,
  tournamentRecord,
  drawDefinition,
  seedingProfile,
  structureId,
  placeByes,
  seedsOnly,
  event,
}) {
  if (!event) return { error: EVENT_NOT_FOUND };
  if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };

  const structureIsComplete = isCompletedStructure({
    drawDefinition,
    structureId,
  });
  if (!structureIsComplete) return { error: INCOMPLETE_SOURCE_STRUCTURE };

  const { playoffStructures } = getPlayoffStructures({
    drawDefinition,
    structureId,
  });
  const structurePositionAssignments = [];

  const participants = tournamentRecord?.participants;

  if (playoffStructures) {
    for (const structure of playoffStructures) {
      const { structureId: playoffStructureId } = structure;
      const result = drawEngineAutomatedPositioning({
        structureId: playoffStructureId,
        applyPositioning,
        candidatesCount,
        drawDefinition,
        seedingProfile,
        participants,
        placeByes,
        seedsOnly,
      });

      if (result.error) return result;

      if (result.positionAssignments) {
        structurePositionAssignments.push({
          positionAssignments: result.positionAssignments,
          structureId: playoffStructureId,
        });
      }
    }
  }

  return { ...SUCCESS, structurePositionAssignments };
}

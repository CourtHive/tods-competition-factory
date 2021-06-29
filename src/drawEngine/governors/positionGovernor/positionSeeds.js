import { generateRange } from '../../../utilities';
import { findStructure } from '../../getters/findStructure';
import { getValidSeedBlocks, getNextSeedBlock } from '../../getters/seedGetter';
import { getAppliedPolicies } from '../policyGovernor/getAppliedPolicies';
import { assignDrawPosition } from './positionAssignment';

import { SUCCESS } from '../../../constants/resultConstants';
import { MISSING_DRAW_POSITION } from '../../../constants/errorConditionConstants';

export function positionSeedBlocks({
  drawDefinition,
  participants,
  groupsCount,
  structureId,
  structure,

  matchUpsMap,
}) {
  const errors = [];
  let placedSeedBlocks = 0;

  if (!structure)
    ({ structure } = findStructure({ drawDefinition, structureId }));
  if (!structureId) ({ structureId } = structure);

  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });
  const { validSeedBlocks, error } = getValidSeedBlocks({
    structure,
    drawDefinition,
    appliedPolicies,
  });
  if (error) errors.push(error);

  groupsCount = groupsCount || validSeedBlocks.length;

  generateRange(0, groupsCount).forEach(() => {
    if (placedSeedBlocks < groupsCount) {
      const result = positionSeedBlock({
        drawDefinition,
        participants,
        structureId,

        matchUpsMap,
      });
      if (result && result.success) placedSeedBlocks++;
      if (result.error) {
        errors.push({ seedPositionError: result.error });
      }
    }
  });
  return { errors };
}

function positionSeedBlock({
  drawDefinition,
  structureId,
  participants,

  matchUpsMap,
}) {
  const { unplacedSeedParticipantIds, unfilledPositions } = getNextSeedBlock({
    drawDefinition,
    structureId,
    randomize: true,
  });

  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });
  const { avoidance } = appliedPolicies || {};
  if (avoidance && participants && unplacedSeedParticipantIds?.length > 2) {
    // console.log('implement seed placement avoidance');
  }

  for (const participantId of unplacedSeedParticipantIds) {
    const drawPosition = unfilledPositions.pop();
    if (!drawPosition) return { error: MISSING_DRAW_POSITION };
    const result = assignDrawPosition({
      drawDefinition,
      structureId,
      drawPosition,
      participantId,
      automaticPlacement: true,

      matchUpsMap,
    });
    if (!result.success) return result;
  }

  return SUCCESS;
}

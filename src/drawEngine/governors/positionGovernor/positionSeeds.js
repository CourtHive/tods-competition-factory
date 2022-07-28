import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';
import { getValidSeedBlocks, getNextSeedBlock } from '../../getters/seedGetter';
import { findStructure } from '../../getters/findStructure';
import { assignDrawPosition } from './positionAssignment';
import { generateRange } from '../../../utilities';

import { MISSING_DRAW_POSITION } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function positionSeedBlocks({
  inContextDrawMatchUps,
  tournamentRecord,
  drawDefinition,
  seedingProfile,
  participants,
  groupsCount,
  structureId,
  matchUpsMap,
  structure,
}) {
  const errors = [];
  let placedSeedBlocks = 0;

  if (!structure)
    ({ structure } = findStructure({ drawDefinition, structureId }));
  if (!structureId) ({ structureId } = structure);

  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });
  const { validSeedBlocks, error } = getValidSeedBlocks({
    drawDefinition,
    appliedPolicies,
    structure,
  });
  if (error) errors.push(error);

  groupsCount = groupsCount || validSeedBlocks.length;

  generateRange(0, groupsCount).forEach(() => {
    if (placedSeedBlocks < groupsCount) {
      const result = positionSeedBlock({
        inContextDrawMatchUps,
        tournamentRecord,
        drawDefinition,
        seedingProfile,
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
  inContextDrawMatchUps,
  tournamentRecord,
  drawDefinition,
  seedingProfile,
  participants,
  structureId,
  matchUpsMap,
}) {
  const { unplacedSeedParticipantIds, unfilledPositions } = getNextSeedBlock({
    randomize: true,
    drawDefinition,
    structureId,
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
      automaticPlacement: true,
      inContextDrawMatchUps,
      tournamentRecord,
      drawDefinition,
      seedingProfile,
      participantId,
      drawPosition,
      matchUpsMap,
      structureId,
    });

    if (!result.success) return result;
  }

  return { ...SUCCESS };
}

import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';
import { getValidSeedBlocks, getNextSeedBlock } from '../../getters/seedGetter';
import { findStructure } from '../../getters/findStructure';
import { assignDrawPosition } from './positionAssignment';
import { generateRange } from '../../../utilities';

import { MISSING_DRAW_POSITION } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function positionSeedBlocks({
  provisionalPositioning,
  inContextDrawMatchUps,
  tournamentRecord,
  appliedPolicies,
  validSeedBlocks,
  drawDefinition,
  seedingProfile,
  seedBlockInfo,
  participants,
  groupsCount,
  structureId,
  matchUpsMap,
  structure,
  event,
}) {
  let placedSeedBlocks = 0;
  const seedPositions = [];
  const errors = [];

  if (!structure)
    ({ structure } = findStructure({ drawDefinition, structureId }));
  if (!structureId) ({ structureId } = structure);

  if (!appliedPolicies) {
    appliedPolicies = getAppliedPolicies({ drawDefinition }).appliedPolicies;
  }
  if (!validSeedBlocks) {
    const result = getValidSeedBlocks({
      provisionalPositioning,
      appliedPolicies,
      drawDefinition,
      structure,
      event,
    });
    if (result.error) errors.push(result.error);
    validSeedBlocks = result.validSeedBlocks;
  }

  groupsCount = groupsCount || validSeedBlocks.length;

  generateRange(0, groupsCount).forEach(() => {
    if (placedSeedBlocks < groupsCount) {
      const result = positionSeedBlock({
        provisionalPositioning,
        inContextDrawMatchUps,
        tournamentRecord,
        validSeedBlocks,
        drawDefinition,
        seedingProfile,
        seedBlockInfo,
        participants,
        structureId,
        matchUpsMap,
        event,
      });
      if (result?.success) {
        placedSeedBlocks++;
        seedPositions.push(...result.seedPositions);
      }
      if (result.error) {
        errors.push({ seedPositionError: result.error });
      }
    }
  });

  if (errors.length) return { error: errors };
  return { ...SUCCESS, seedPositions };
}

function positionSeedBlock({
  provisionalPositioning,
  inContextDrawMatchUps,
  tournamentRecord,
  drawDefinition,
  seedingProfile,
  seedBlockInfo,
  participants,
  structureId,
  matchUpsMap,
  event,
}) {
  const { unplacedSeedParticipantIds, unfilledPositions } = getNextSeedBlock({
    provisionalPositioning,
    randomize: true,
    drawDefinition,
    seedBlockInfo,
    structureId,
    event,
  });

  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });
  const { avoidance } = appliedPolicies || {};
  if (avoidance && participants && unplacedSeedParticipantIds?.length > 2) {
    // console.log('implement seed placement avoidance');
  }

  const seedPositions = [];

  for (const participantId of unplacedSeedParticipantIds) {
    const drawPosition = unfilledPositions.pop();
    if (!drawPosition) return { error: MISSING_DRAW_POSITION };
    seedPositions.push(drawPosition);

    const result = assignDrawPosition({
      automaticPlacement: true,
      provisionalPositioning,
      inContextDrawMatchUps,
      tournamentRecord,
      drawDefinition,
      seedingProfile,
      participantId,
      seedBlockInfo,
      drawPosition,
      matchUpsMap,
      structureId,
      event,
    });

    if (!result.success) return result;
  }

  return { ...SUCCESS, seedPositions };
}

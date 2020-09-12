import { generateRange } from '../../../utilities';
import { findStructure } from '../../getters/findStructure';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { getValidSeedBlocks, getNextSeedBlock } from '../../getters/seedGetter';
import { getStructureSeedAssignments } from '../../getters/getStructureSeedAssignments';

import { SUCCESS } from '../../../constants/resultConstants';
import { assignDrawPosition } from './positionAssignment';

export function getStructurePositionedSeeds({ structure }) {
  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const { seedAssignments } = getStructureSeedAssignments({ structure });
  const seedMap = Object.assign(
    {},
    ...seedAssignments
      .filter(assignment => assignment.participantId)
      .map(assignment => ({ [assignment.participantId]: assignment }))
  );
  const positionedSeeds = positionAssignments
    .map(assignment => {
      return !seedMap[assignment.participantId]
        ? ''
        : Object.assign(assignment, {
            seedNumber: seedMap[assignment.participantId].seedNumber,
            seedValue: seedMap[assignment.participantId].seedValue,
          });
    })
    .filter(f => f);
  return positionedSeeds;
}

export function positionSeedBlocks({
  drawDefinition,
  policies,
  structure,
  structureId,
  groupsCount,
}) {
  const errors = [];
  let placedSeedBlocks = 0;

  if (!structure)
    ({ structure } = findStructure({ drawDefinition, structureId }));
  if (!structureId) ({ structureId } = structure);

  const { validSeedBlocks, error } = getValidSeedBlocks({
    structure,
    policies,
  });
  if (error) errors.push(error);

  groupsCount = groupsCount || validSeedBlocks.length;

  generateRange(0, groupsCount).forEach(() => {
    if (placedSeedBlocks < groupsCount) {
      const result = positionSeedBlock({
        drawDefinition,
        policies,
        structureId,
      });
      if (result && result.success) placedSeedBlocks++;
      if (result.error) {
        errors.push({ seedPositionError: result.error });
      }
    }
  });
  return { errors };
}

function positionSeedBlock({ drawDefinition, policies, structureId }) {
  const { unplacedSeedParticipantIds, unfilledPositions } = getNextSeedBlock({
    policies,
    drawDefinition,
    structureId,
    randomize: true,
  });

  for (const participantId of unplacedSeedParticipantIds) {
    const drawPosition = unfilledPositions.pop();
    if (!drawPosition) return { error: 'Missing drawPosition' };
    const result = assignDrawPosition({
      policies,
      drawDefinition,
      structureId,
      drawPosition,
      participantId,
    });
    if (!result.success) return result;
  }

  return SUCCESS;
}

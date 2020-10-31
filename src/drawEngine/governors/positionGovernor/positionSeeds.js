import { generateRange } from '../../../utilities';
import { findStructure } from '../../getters/findStructure';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { getValidSeedBlocks, getNextSeedBlock } from '../../getters/seedGetter';
import { getStructureSeedAssignments } from '../../getters/getStructureSeedAssignments';

import { SUCCESS } from '../../../constants/resultConstants';
import { assignDrawPosition } from './positionAssignment';
import { getAppliedPolicies } from '../policyGovernor/getAppliedPolicies';

export function getStructurePositionedSeeds({ drawDefinition, structure }) {
  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const { seedAssignments } = getStructureSeedAssignments({
    drawDefinition,
    structure,
  });
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
  participants,
  groupsCount,
  structureId,
  structure,
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
      });
      if (result && result.success) placedSeedBlocks++;
      if (result.error) {
        errors.push({ seedPositionError: result.error });
      }
    }
  });
  return { errors };
}

function positionSeedBlock({ drawDefinition, structureId, participants }) {
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
    if (!drawPosition) return { error: 'Missing drawPosition' };
    const result = assignDrawPosition({
      drawDefinition,
      structureId,
      drawPosition,
      participantId,
    });
    if (!result.success) return result;
  }

  return SUCCESS;
}

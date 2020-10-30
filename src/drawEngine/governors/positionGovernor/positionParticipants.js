import { shuffleArray } from '../../../utilities';
import { stageEntries } from '../../getters/stageGetter';
import { findStructure } from '../../getters/findStructure';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { randomUnseededSeparation } from './avoidance/randomUnseededSeparation';
import { getStructureSeedAssignments } from '../../getters/getStructureSeedAssignments';

import {
  WILDCARD,
  DIRECT_ACCEPTANCE,
} from '../../../constants/entryStatusConstants';

import { SUCCESS } from '../../../constants/resultConstants';
import { assignDrawPosition } from './positionAssignment';
import { getAppliedPolicies } from '../policyGovernor/getAppliedPolicies';

export function positionUnseededParticipants({
  drawDefinition,
  participants,
  structureId,
  structure,
}) {
  if (!structure)
    ({ structure } = findStructure({ drawDefinition, structureId }));
  if (!structureId) ({ structureId } = structure);

  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const { seedAssignments } = getStructureSeedAssignments({ structure });

  const assignedSeedParticipantIds = seedAssignments
    .map(assignment => assignment.participantId)
    .filter(f => f);

  const { stage, stageSequence } = structure;
  const entryTypes = [DIRECT_ACCEPTANCE, WILDCARD];
  const entries = stageEntries({
    drawDefinition,
    stageSequence,
    structureId,
    entryTypes,
    stage,
  });
  const unseededEntries = entries.filter(
    entry => !assignedSeedParticipantIds.includes(entry.participantId)
  );
  const unseededParticipantIds = unseededEntries.map(
    entry => entry.participantId
  );
  const unfilledDrawPositions = positionAssignments
    .filter(assignment => {
      return (
        !assignment.participantId && !assignment.bye && !assignment.qualifier
      );
    })
    .map(assignment => assignment.drawPosition);

  if (unseededParticipantIds.length > unfilledDrawPositions.length) {
    return { error: 'Insufficient drawPositions to accommodate entries' };
  }

  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });
  const { avoidance } = appliedPolicies || {};

  if (avoidance && participants) {
    return randomUnseededSeparation({
      avoidance,
      structureId,
      participants,
      drawDefinition,
      unseededParticipantIds,
    });
  } else {
    return randomUnseededDistribution({
      structureId,
      drawDefinition,
      unseededParticipantIds,
      unfilledDrawPositions,
    });
  }
}

function randomUnseededDistribution({
  structureId,
  drawDefinition,
  unseededParticipantIds,
  unfilledDrawPositions,
}) {
  const shuffledDrawPositions = shuffleArray(unfilledDrawPositions);
  for (const participantId of unseededParticipantIds) {
    const drawPosition = shuffledDrawPositions.pop();
    const result = assignDrawPosition({
      structureId,
      drawPosition,
      participantId,
      drawDefinition,
    });
    if (result && result.error) return result;
  }
  return SUCCESS;
}

import { getSeedsCount } from '../../../tournamentEngine/governors/policyGovernor/getSeedsCount';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { modifyDrawNotice } from '../../notifications/drawNotifications';
import { findStructure } from '../../getters/findStructure';
import { generateRange } from '../../../utilities';

import { SEEDSCOUNT_GREATER_THAN_DRAW_SIZE } from '../../../constants/errorConditionConstants';
import { POLICY_TYPE_SEEDING } from '../../../constants/policyConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function initializeStructureSeedAssignments({
  requireParticipantCount = true,
  enforcePolicyLimits = true,
  drawSizeProgression,
  participantCount,
  appliedPolicies,
  drawDefinition,
  structureId,
  seedsCount,
}) {
  const { structure, error } = findStructure({ drawDefinition, structureId });
  if (error) return { error };

  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const drawSize = positionAssignments.length;

  if (seedsCount > drawSize)
    return { error: SEEDSCOUNT_GREATER_THAN_DRAW_SIZE };

  const { seedsCount: maxSeedsCount } = getSeedsCount({
    policyDefinitions: appliedPolicies,
    requireParticipantCount,
    drawSizeProgression,
    participantCount,
    drawSize,
  });

  if (
    appliedPolicies?.[POLICY_TYPE_SEEDING] &&
    seedsCount > maxSeedsCount &&
    enforcePolicyLimits &&
    maxSeedsCount
  ) {
    seedsCount = maxSeedsCount;
  }

  structure.seedLimit = seedsCount;
  structure.seedAssignments = generateRange(1, seedsCount + 1).map(
    (seedNumber) => ({
      seedNumber,
      seedValue: seedNumber?.toString(),
      participantId: undefined,
    })
  );

  modifyDrawNotice({ drawDefinition, structureIds: [structureId] });

  return { ...SUCCESS, seedLimit: seedsCount };
}

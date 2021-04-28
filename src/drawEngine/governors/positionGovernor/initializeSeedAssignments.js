import { getPolicyDefinition } from '../../../tournamentEngine/governors/queryGovernor/getPolicyDefinition';
import { getSeedsCount } from '../../../tournamentEngine/governors/policyGovernor/getSeedsCount';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { findStructure } from '../../getters/findStructure';
import { generateRange } from '../../../utilities';

import {
  MISSING_STRUCTURE,
  SEEDSCOUNT_GREATER_THAN_DRAW_SIZE,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { POLICY_TYPE_SEEDING } from '../../../constants/policyConstants';

export function initializeStructureSeedAssignments({
  requireParticipantCount = true,
  drawSizeProgression = true,
  enforcePolicyLimits = true,
  participantCount,
  drawDefinition,
  structureId,
  seedsCount,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const drawSize = positionAssignments.length;

  if (!structure) return { error: MISSING_STRUCTURE };
  if (seedsCount > drawSize)
    return { error: SEEDSCOUNT_GREATER_THAN_DRAW_SIZE };

  const { policyDefinition } = getPolicyDefinition({
    drawDefinition,
    policyType: POLICY_TYPE_SEEDING,
  });

  const { seedsCount: maxSeedsCount } = getSeedsCount({
    requireParticipantCount,
    drawSizeProgression,
    policyDefinition,
    participantCount,
    drawSize,
  });

  if (
    policyDefinition &&
    maxSeedsCount &&
    seedsCount > maxSeedsCount &&
    enforcePolicyLimits
  ) {
    seedsCount = maxSeedsCount;
  }

  structure.seedLimit = seedsCount;
  structure.seedAssignments = generateRange(1, seedsCount + 1).map(
    (seedNumber) => ({
      seedNumber,
      seedValue: seedNumber,
      participantId: undefined,
    })
  );

  return Object.assign({}, SUCCESS, { seedLimit: seedsCount });
}

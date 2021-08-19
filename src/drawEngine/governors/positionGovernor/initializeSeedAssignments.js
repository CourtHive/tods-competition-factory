import { getPolicyDefinition } from '../../../tournamentEngine/governors/queryGovernor/getPolicyDefinition';
import { getSeedsCount } from '../../../tournamentEngine/governors/policyGovernor/getSeedsCount';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { modifyDrawNotice } from '../../notifications/drawNotifications';
import { findStructure } from '../../getters/findStructure';
import { generateRange } from '../../../utilities';

import { POLICY_TYPE_SEEDING } from '../../../constants/policyConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_STRUCTURE,
  SEEDSCOUNT_GREATER_THAN_DRAW_SIZE,
} from '../../../constants/errorConditionConstants';

export function initializeStructureSeedAssignments({
  requireParticipantCount = true,
  enforcePolicyLimits = true,
  drawSizeProgression,
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

  modifyDrawNotice({ drawDefinition });

  return { ...SUCCESS, seedLimit: seedsCount };
}

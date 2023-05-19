import { getSeedsCount } from '../../../tournamentEngine/governors/policyGovernor/getSeedsCount';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { modifyDrawNotice } from '../../notifications/drawNotifications';
import { isConvertableInteger } from '../../../utilities/math';
import { findStructure } from '../../getters/findStructure';
import { generateRange } from '../../../utilities';
import { getSeedGroups } from './getSeedBlocks';

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
  seedingProfile,
  structureId,
  seedsCount,
}) {
  const result = findStructure({ drawDefinition, structureId });
  if (result.error) return result;
  const structure = result.structure;

  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const drawSize = positionAssignments.length;

  if (seedsCount > drawSize)
    return { error: SEEDSCOUNT_GREATER_THAN_DRAW_SIZE };

  const roundRobinGroupsCount = structure.structures?.length;
  const roundsCount = structure.structures?.[0]?.matchUps?.reduce(
    (maxRoundNumber, { roundNumber }) => Math.max(roundNumber, maxRoundNumber),
    0
  );
  const groupSeedingThreshold =
    isConvertableInteger(seedingProfile?.groupSeedingThreshold) &&
    seedingProfile.groupSeedingThreshold;

  const seedGroups = getSeedGroups({
    roundRobinGroupsCount,
    roundsCount,
    drawSize,
  })?.seedGroups;

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
    (seedNumber) => {
      const seedGroup =
        seedGroups &&
        seedGroups.find((seedGroup) => seedGroup.includes(seedNumber));
      const groupSeedValue = seedGroup && Math.min(...seedGroup);
      const seedValue =
        groupSeedingThreshold && seedNumber >= groupSeedingThreshold
          ? groupSeedValue
          : seedNumber;

      return {
        participantId: undefined,
        seedNumber,
        seedValue,
      };
    }
  );

  modifyDrawNotice({ drawDefinition, structureIds: [structureId] });

  return { ...SUCCESS, seedLimit: seedsCount };
}

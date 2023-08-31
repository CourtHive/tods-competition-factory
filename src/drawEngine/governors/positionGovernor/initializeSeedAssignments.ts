import { getSeedsCount } from '../../../tournamentEngine/governors/policyGovernor/getSeedsCount';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { modifyDrawNotice } from '../../notifications/drawNotifications';
import { isConvertableInteger } from '../../../utilities/math';
import { findStructure } from '../../getters/findStructure';
import { generateRange } from '../../../utilities';
import { getSeedGroups } from './getSeedBlocks';

import { POLICY_TYPE_SEEDING } from '../../../constants/policyConstants';
import { DrawDefinition } from '../../../types/tournamentFromSchema';
import { SUCCESS } from '../../../constants/resultConstants';
import { SeedingProfile } from '../../../types/factoryTypes';
import {
  ErrorType,
  SEEDSCOUNT_GREATER_THAN_DRAW_SIZE,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

type InitializeStructureSeedAssignmentsArgs = {
  requireParticipantCount?: boolean;
  enforcePolicyLimits?: boolean;
  drawSizeProgression?: boolean;
  seedingProfile: SeedingProfile;
  drawDefinition: DrawDefinition;
  participantCount: number;
  appliedPolicies?: any;
  structureId: string;
  seedsCount: number;
};
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
}: InitializeStructureSeedAssignmentsArgs): {
  error?: ErrorType;
  success?: boolean;
  seedLimit?: number;
} {
  const result = findStructure({ drawDefinition, structureId });
  if (result.error) return result;
  const structure = result.structure;
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const drawSize = positionAssignments?.length || 0;

  if (seedsCount > drawSize)
    return { error: SEEDSCOUNT_GREATER_THAN_DRAW_SIZE };

  const roundRobinGroupsCount = structure.structures?.length;
  const groupSeedingThreshold =
    isConvertableInteger(seedingProfile?.groupSeedingThreshold) &&
    seedingProfile.groupSeedingThreshold;

  const seedGroups = getSeedGroups({
    roundRobinGroupsCount,
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
    maxSeedsCount &&
    appliedPolicies?.[POLICY_TYPE_SEEDING] &&
    seedsCount > maxSeedsCount &&
    enforcePolicyLimits
  ) {
    seedsCount = maxSeedsCount;
  }

  structure.seedLimit = seedsCount;
  structure.seedAssignments = generateRange(1, seedsCount + 1).map(
    (seedNumber) => {
      const seedGroup = seedGroups?.find((seedGroup) =>
        seedGroup.includes(seedNumber)
      );
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

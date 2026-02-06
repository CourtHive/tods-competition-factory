import { getValidSeedBlocks, getNextSeedBlock } from '@Query/drawDefinition/seedGetter';
import { getAppliedPolicies } from '@Query/extensions/getAppliedPolicies';
import { assignDrawPosition } from './positionAssignment';
import { findStructure } from '@Acquire/findStructure';
import { generateRange } from '@Tools/arrays';

// constants and types
import { PolicyDefinitions, SeedBlock, SeedingProfile, MatchUpsMap } from '@Types/factoryTypes';
import { ErrorType, MISSING_DRAW_POSITION } from '@Constants/errorConditionConstants';
import { DrawDefinition, Event, Structure, Tournament } from '@Types/tournamentTypes';
import { HydratedMatchUp, HydratedParticipant } from '@Types/hydrated';
import { SUCCESS } from '@Constants/resultConstants';

type PositionSeedBlocksArgs = {
  inContextDrawMatchUps?: HydratedMatchUp[];
  participants?: HydratedParticipant[];
  appliedPolicies?: PolicyDefinitions;
  provisionalPositioning?: boolean;
  tournamentRecord?: Tournament;
  validSeedBlocks?: SeedBlock[];
  seedingProfile?: SeedingProfile;
  drawDefinition: DrawDefinition;
  matchUpsMap?: MatchUpsMap;
  structure?: Structure;
  groupsCount?: number;
  structureId?: string;
  seedBlockInfo?: any;
  event?: Event;
};
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
}: PositionSeedBlocksArgs) {
  const seedPositions: number[] = [];
  const errors: any[] = [];
  let placedSeedBlocks = 0;

  if (!structure) ({ structure } = findStructure({ drawDefinition, structureId }));
  if (!structureId) structureId = structure?.structureId;

  if (!appliedPolicies) {
    appliedPolicies = getAppliedPolicies({ drawDefinition }).appliedPolicies;
  }
  if (!validSeedBlocks) {
    const result =
      structure &&
      getValidSeedBlocks({
        provisionalPositioning,
        appliedPolicies,
        drawDefinition,
        seedingProfile,
        structure,
      });
    if (result?.error) errors.push(result.error);
    validSeedBlocks = result?.validSeedBlocks;
  }

  groupsCount = groupsCount ?? validSeedBlocks?.length ?? 0;

  generateRange(0, groupsCount).forEach(() => {
    if (placedSeedBlocks < (groupsCount || 0)) {
      const result = positionSeedBlock({
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
      });
      if (result?.success) {
        placedSeedBlocks++;
        seedPositions.push(...(result.seedPositions ?? []));
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
}): { success?: boolean; error?: ErrorType; seedPositions?: number[] } {
  const { unplacedSeedParticipantIds, unfilledPositions } = getNextSeedBlock({
    provisionalPositioning,
    randomize: true,
    drawDefinition,
    seedingProfile,
    seedBlockInfo,
    structureId,
    event,
  });

  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });
  const { avoidance } = appliedPolicies ?? {};
  if (avoidance && participants && unplacedSeedParticipantIds?.length > 2) {
    // implement avoidance logic to reorder unplacedSeedParticipantIds
  }

  const seedPositions: number[] = [];

  for (const participantId of unplacedSeedParticipantIds) {
    const drawPosition = unfilledPositions.pop();
    if (!drawPosition) return { error: MISSING_DRAW_POSITION };
    seedPositions.push(drawPosition);

    const result = assignDrawPosition({
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

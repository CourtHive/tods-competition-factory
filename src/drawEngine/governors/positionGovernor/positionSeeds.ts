import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';
import { getValidSeedBlocks, getNextSeedBlock } from '../../getters/seedGetter';
import { findStructure } from '../../getters/findStructure';
import { assignDrawPosition } from './positionAssignment';
import { generateRange } from '../../../utilities';

import { HydratedMatchUp, HydratedParticipant } from '../../../types/hydrated';
import { MatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { SUCCESS } from '../../../constants/resultConstants';
import { PolicyDefinitions, SeedingProfile } from '../../../types/factoryTypes';
import {
  ErrorType,
  MISSING_DRAW_POSITION,
} from '../../../constants/errorConditionConstants';
import {
  DrawDefinition,
  Event,
  Structure,
  Tournament,
} from '../../../types/tournamentFromSchema';

type PositionSeedBlocksArgs = {
  inContextDrawMatchUps?: HydratedMatchUp[];
  participants?: HydratedParticipant[];
  appliedPolicies?: PolicyDefinitions;
  provisionalPositioning?: boolean;
  tournamentRecord?: Tournament;
  seedingProfile?: SeedingProfile;
  drawDefinition: DrawDefinition;
  matchUpsMap?: MatchUpsMap;
  structure?: Structure;
  validSeedBlocks?: any;
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

  if (!structure)
    ({ structure } = findStructure({ drawDefinition, structureId }));
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
        structure,
      });
    if (result?.error) errors.push(result.error);
    validSeedBlocks = result?.validSeedBlocks;
  }

  groupsCount = groupsCount ?? validSeedBlocks.length;

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
    seedBlockInfo,
    structureId,
    event,
  });

  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });
  const { avoidance } = appliedPolicies ?? {};
  if (avoidance && participants && unplacedSeedParticipantIds?.length > 2) {
    // TODO: 'implement seed placement avoidance';
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

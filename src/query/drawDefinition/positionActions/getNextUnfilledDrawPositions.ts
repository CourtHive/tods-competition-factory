import { structureAssignedDrawPositions } from '../positionsGetter';
import { getNextSeedBlock } from '../seedGetter';
import { findStructure } from '../../../acquire/findStructure';

import { ResultType } from '../../../global/functions/decorateResult';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
} from '../../../constants/errorConditionConstants';
import { DrawDefinition, Event } from '../../../types/tournamentTypes';
import { SeedingProfile } from '../../../types/factoryTypes';

type GetNextUfilledDrawPositionsArgs = {
  provisionalPositioning?: boolean;
  drawDefinition: DrawDefinition;
  seedingProfile?: SeedingProfile;
  seedBlockInfo?: any;
  structureId: string;
  event?: Event;
};
export function getNextUnfilledDrawPositions({
  provisionalPositioning,
  drawDefinition,
  seedBlockInfo,
  seedingProfile,
  structureId,
  event,
}: GetNextUfilledDrawPositionsArgs): ResultType & {
  nextUnfilledDrawPositions?: number[];
} {
  if (!drawDefinition) {
    const error = MISSING_DRAW_DEFINITION;
    return { error, nextUnfilledDrawPositions: [] };
  }
  if (!structureId) {
    const error = MISSING_STRUCTURE_ID;
    return { error, nextUnfilledDrawPositions: [] };
  }

  const result = findStructure({ drawDefinition, structureId });
  if (result.error) return result;

  const { positionAssignments = [] } = structureAssignedDrawPositions({
    structure: result.structure,
  });
  const { unfilledPositions } = getNextSeedBlock({
    provisionalPositioning,
    randomize: true,
    drawDefinition,
    seedingProfile,
    seedBlockInfo,
    structureId,
    event,
  });

  const unfilledDrawPositions = positionAssignments
    .filter((assignment) => {
      return (
        !assignment.participantId && !assignment.bye && !assignment.qualifier
      );
    })
    .map((assignment) => assignment.drawPosition);

  if (unfilledPositions?.length) {
    return { nextUnfilledDrawPositions: unfilledPositions };
  } else {
    return { nextUnfilledDrawPositions: unfilledDrawPositions };
  }
}

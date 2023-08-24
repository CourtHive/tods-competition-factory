import { getMatchUpDependencies } from '../../competitionEngine/governors/scheduleGovernor/scheduleMatchUps/getMatchUpDependencies';
import { getContainedStructures } from '../../tournamentEngine/governors/tournamentGovernor/getContainedStructures';
import { getAllDrawMatchUps } from './getMatchUps/drawMatchUps';
import { isAdHoc } from '../governors/queryGovernor/isAdHoc';
import { getPositionAssignments } from './positionsGetter';
import { numericSort, unique } from '../../utilities';
import { isActiveMatchUp } from './activeMatchUp';
import { findStructure } from './findStructure';

import { INVALID_DRAW_POSITION } from '../../constants/errorConditionConstants';
import {
  DrawDefinition,
  Event,
  Structure,
} from '../../types/tournamentFromSchema';

// active drawPositions occur in activeMatchUps...
// ...which have a winningSide, a scoreString, or a completed matchUpStatus

type GetStructureDrawPositionProfilesArgs = {
  drawDefinition: DrawDefinition;
  findContainer?: boolean;
  structure?: Structure;
  structureId?: string;
  event?: Event;
};
export function getStructureDrawPositionProfiles(
  params: GetStructureDrawPositionProfilesArgs
): { [key: string]: any } {
  const { drawDefinition, findContainer, structureId, event } = params;
  let structure = params.structure;

  const matchUpFilters = { isCollectionMatchUp: false };
  const { containedStructures } = getContainedStructures({ drawDefinition });
  const containedStructureIds = structureId
    ? containedStructures[structureId] || []
    : [];

  if (!structure) {
    const result = findStructure({ drawDefinition, structureId });
    if (result.error) return result;

    structure = findContainer
      ? result.containingStructure || result.structure
      : result.structure;
  }

  if (isAdHoc({ drawDefinition, structure })) {
    return { structure, isAdHoc: true, error: INVALID_DRAW_POSITION };
  }

  // must use all draw matchUps to get active matchUps across all connected structures
  const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    inContext: true,
    matchUpFilters,
    drawDefinition,
    event,
  });

  const inContextStructureMatchUps = inContextDrawMatchUps.filter(
    (matchUp) =>
      matchUp.structureId === structureId ||
      containedStructureIds.includes(matchUp.structureId)
  );

  // get a mapping of all matchUpIds to dependent matchUpIds
  const { matchUpDependencies } = getMatchUpDependencies({
    drawIds: [drawDefinition.drawId],
    matchUps: inContextDrawMatchUps,
    drawDefinition,
  });

  const activeDependentMatchUpIdsCollection: string[] = [];
  const drawPositionsCollection: number[] = [];
  const drawPositionInitialRounds = {};
  const activeMatchUps: any[] = [];

  for (const matchUp of inContextDrawMatchUps) {
    if (
      matchUp.structureId === structureId ||
      containedStructureIds.includes(matchUp.structureId)
    ) {
      drawPositionsCollection.push(...(matchUp.drawPositions || []));

      const roundNumber = matchUp.roundNumber;
      for (const drawPosition of (matchUp.drawPositions || []).filter(
        Boolean
      )) {
        if (
          !drawPositionInitialRounds[drawPosition] ||
          drawPositionInitialRounds[drawPosition] > roundNumber
        ) {
          drawPositionInitialRounds[drawPosition] = roundNumber;
        }
      }
    }

    if (isActiveMatchUp(matchUp)) {
      activeMatchUps.push(matchUp);
      activeDependentMatchUpIdsCollection.push(
        matchUp.matchUpId,
        ...(matchUpDependencies?.[matchUp?.matchUpId]?.matchUpIds || [])
      );
    }
  }

  // sorted drawPositions for the structure
  const drawPositions = unique(drawPositionsCollection.filter(Boolean)).sort(
    numericSort
  );

  const activeDependentMatchUpIds = unique(activeDependentMatchUpIdsCollection);

  const activeDrawPositions = unique(
    inContextStructureMatchUps
      .map(({ matchUpId, drawPositions }) =>
        activeDependentMatchUpIds.includes(matchUpId) ? drawPositions : []
      )
      .flat()
      .filter(Boolean)
  ).sort(numericSort);

  const { positionAssignments } = getPositionAssignments({
    drawDefinition,
    structure,
  });

  // determine which positions are BYEs
  const byeDrawPositions = positionAssignments
    ?.filter((assignment) => assignment.bye)
    .map((assignment) => assignment.drawPosition);

  // determine which positions are Qualifiers
  const qualifyingDrawPositions = positionAssignments
    ?.filter((assignment) => assignment.qualifier)
    .map((assignment) => assignment.drawPosition);

  const inactiveDrawPositions =
    drawPositions?.filter(
      (drawPosition) => !activeDrawPositions.includes(drawPosition)
    ) || [];

  return {
    allDrawPositions: drawPositions,
    inContextStructureMatchUps,
    drawPositionInitialRounds,
    activeDependentMatchUpIds,
    qualifyingDrawPositions,
    inactiveDrawPositions,
    positionAssignments,
    activeDrawPositions,
    byeDrawPositions,
    activeMatchUps,
    structure,
  };
}

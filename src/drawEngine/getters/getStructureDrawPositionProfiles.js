import { getMatchUpDependencies } from '../../competitionEngine/governors/scheduleGovernor/scheduleMatchUps/getMatchUpDependencies';
import { getAllStructureMatchUps } from './getMatchUps/getAllStructureMatchUps';
import { getPositionAssignments } from './positionsGetter';
import { numericSort, unique } from '../../utilities';
import { isActiveMatchUp } from './activeMatchUp';
import { findStructure } from './findStructure';

// active drawPositions occur in activeMatchUps...
// ...which have a winningSide, a scoreString, or a completed matchUpStatus
export function getStructureDrawPositionProfiles({
  drawDefinition,
  structureId,
  structure,
}) {
  const matchUpFilters = { isCollectionMatchUp: false };

  if (!structure) {
    const result = findStructure({ drawDefinition, structureId });
    if (result.error) return result;
    structure = result.structure;
  }

  const { matchUps: inContextStructureMatchUps } = getAllStructureMatchUps({
    inContext: true,
    drawDefinition,
    matchUpFilters,
    structure,
  });

  // get a mapping of all matchUpIds to dependent matchUpIds
  const { matchUpDependencies } = getMatchUpDependencies({
    matchUps: inContextStructureMatchUps,
    drawIds: [drawDefinition.drawId],
    drawDefinition,
  });

  const activeDependentMatchUpIdsCollection = [];
  const drawPositionInitialRounds = {};
  const drawPositionsCollection = [];
  const activeMatchUps = [];

  for (const matchUp of inContextStructureMatchUps) {
    drawPositionsCollection.push(...(matchUp.drawPositions || []));
    if (isActiveMatchUp(matchUp)) {
      activeMatchUps.push(matchUp);
      activeDependentMatchUpIdsCollection.push(
        matchUp.matchUpId,
        ...(matchUpDependencies[matchUp.matchUpId]?.matchUpIds || [])
      );
    }
    const roundNumber = matchUp.roundNumber;
    for (const drawPosition of (matchUp.drawPositions || []).filter(Boolean)) {
      if (
        !drawPositionInitialRounds[drawPosition] ||
        drawPositionInitialRounds[drawPosition] > roundNumber
      ) {
        drawPositionInitialRounds[drawPosition] = roundNumber;
      }
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
    .filter((assignment) => assignment.bye)
    .map((assignment) => assignment.drawPosition);

  // determine which positions are Qualifiers
  const qualifyingDrawPositions = positionAssignments
    .filter((assignment) => assignment.qualifier)
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
    structure,
  };
}

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

  // TODO: collect the lowest roundNumber at which each drawPosition occurs

  // first collect all drawPositions for the structure
  const drawPositions = unique(
    []
      .concat(
        ...inContextStructureMatchUps.map(
          (matchUp) => matchUp.drawPositions || []
        )
      )
      .filter(Boolean)
  ).sort(numericSort);

  // get a mapping of all matchUpIds to dependent matchUpIds
  const { matchUpDependencies } = getMatchUpDependencies({
    matchUps: inContextStructureMatchUps,
    drawIds: [drawDefinition.drawId],
    drawDefinition,
  });

  // determine which matchUps are active
  const activeMatchUps = inContextStructureMatchUps.filter(isActiveMatchUp);

  // create an array of all matchUpIds active because they are dependent
  const activeDependentMatchUpIds = unique(
    activeMatchUps
      .map((matchUp) =>
        [].concat(
          ...(matchUpDependencies[matchUp.matchUpId]?.matchUpIds || []),
          matchUp.matchUpId
        )
      )
      .flat()
  );

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
    activeDependentMatchUpIds,
    qualifyingDrawPositions,
    inactiveDrawPositions,
    positionAssignments,
    activeDrawPositions,
    byeDrawPositions,
    structure,
  };
}

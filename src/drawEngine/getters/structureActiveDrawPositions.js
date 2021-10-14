import { getMatchUpDependencies } from '../../competitionEngine/governors/scheduleGovernor/scheduleMatchUps/getMatchUpDependencies';
import { getAllStructureMatchUps } from './getMatchUps/getAllStructureMatchUps';
import { getPositionAssignments } from './positionsGetter';
import { numericSort, unique } from '../../utilities';
import { isActiveMatchUp } from './activeMatchUp';
import { findStructure } from './findStructure';

// active drawPositions occur in activeMatchUps...
// ...which have a winningSide, a scoreString, or a completed matchUpStatus
export function structureActiveDrawPositions({ drawDefinition, structureId }) {
  const matchUpFilters = { isCollectionMatchUp: false };
  const { structure, error } = findStructure({ drawDefinition, structureId });
  if (error) return { error };

  const { matchUps } = getAllStructureMatchUps({
    inContext: true,
    drawDefinition,
    matchUpFilters,
    structure,
  });

  // first collect all drawPositions for the structure
  const drawPositions = unique(
    []
      .concat(...matchUps.map((matchUp) => matchUp.drawPositions || []))
      .filter(Boolean)
  ).sort(numericSort);

  // get a mapping of all matchUpIds to dependent matchUpIds
  const { matchUpDependencies } = getMatchUpDependencies({
    drawIds: [drawDefinition.drawId],
    drawDefinition,
    matchUps,
  });

  // determine which matchUps are active
  const activeMatchUps = matchUps.filter(isActiveMatchUp);

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
    matchUps
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

  const inactiveDrawPositions = drawPositions.filter(
    (drawPosition) => !activeDrawPositions.includes(drawPosition)
  );

  return {
    allDrawPositions: drawPositions,
    inactiveDrawPositions,
    positionAssignments,
    activeDrawPositions,
    byeDrawPositions,
    structure,
  };
}

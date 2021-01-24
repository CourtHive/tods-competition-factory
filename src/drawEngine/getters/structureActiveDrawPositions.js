import { getAllStructureMatchUps } from './getMatchUps/getAllStructureMatchUps';
import { getPairedDrawPosition } from './getPairedDrawPosition';
import { getPositionAssignments } from './positionsGetter';
import { countValues, numericSort, unique } from '../../utilities';
import { findStructure } from './findStructure';

import { CONTAINER } from '../../constants/drawDefinitionConstants';

// active drawPositions occur more than once in the matchUps of a structure,
// OR are paired with active drawPositions
export function structureActiveDrawPositions({ drawDefinition, structureId }) {
  const matchUpFilters = { isCollectionMatchUp: false };
  const { structure } = findStructure({ drawDefinition, structureId });
  const { matchUps } = getAllStructureMatchUps({
    drawDefinition,
    structure,
    matchUpFilters,
  });
  const { positionAssignments } = getPositionAssignments({
    structure,
    drawDefinition,
  });

  // first collect all drawPositions for the structure
  const drawPositions = []
    .concat(...matchUps.map((matchUp) => matchUp.drawPositions || []))
    .filter((f) => f)
    .sort(numericSort);

  // determine which positions are BYEs
  const byeDrawPositions = positionAssignments
    .filter((assignment) => assignment.bye)
    .map((assignment) => assignment.drawPosition);

  const scoredMatchUps = matchUps.filter(
    (matchUp) => matchUp.score?.sets?.length || matchUp.winningSide
  );
  const drawPositionsInScoredMatchUps = unique(
    []
      .concat(...scoredMatchUps.map((matchUp) => matchUp.drawPositions || []))
      .filter((f) => f)
      .sort(numericSort)
  );
  const activeByeDrawPositions = byeDrawPositions.filter((drawPosition) => {
    const { pairedDrawPosition } = getPairedDrawPosition({
      matchUps,
      drawPosition,
    });
    return drawPositionsInScoredMatchUps.includes(pairedDrawPosition);
  });

  if (structure.structureType === CONTAINER) {
    // BYEs are never considered ACTIVE in a Round Robin group
    const inactiveDrawPositions = drawPositions.filter(
      (drawPosition) => !drawPositionsInScoredMatchUps.includes(drawPosition)
    );

    return {
      activeDrawPositions: drawPositionsInScoredMatchUps,
      inactiveDrawPositions,
      advancedDrawPositions: [],
      drawPositionsPairedWithAdvanced: [],
      byeDrawPositions,
      structure,
    };
  } else {
    const activeDrawPositions = drawPositionsInScoredMatchUps
      .concat(...activeByeDrawPositions)
      .sort(numericSort);
    const inactiveDrawPositions = drawPositions.filter(
      (drawPosition) => !activeDrawPositions.includes(drawPosition)
    );

    const positionCounts = countValues(drawPositions);
    const advancedDrawPositions = Object.keys(positionCounts)
      .reduce((active, key) => {
        return +key > 1 ? active.concat(...positionCounts[key]) : active;
      }, [])
      .map((p) => parseInt(p))
      .sort(numericSort);

    // drawPositionsPairedWithAdvanced are those positions which are paired with a position which has advanced
    const drawPositionsPairedWithAdvanced = [].concat(
      ...advancedDrawPositions.map((drawPosition) => {
        const { pairedDrawPosition } = getPairedDrawPosition({
          matchUps,
          drawPosition,
        });
        return pairedDrawPosition;
      })
    );

    return {
      activeDrawPositions,
      activeByeDrawPositions,
      inactiveDrawPositions,
      advancedDrawPositions,
      drawPositionsPairedWithAdvanced,
      byeDrawPositions,
      structure,
    };
  }
}

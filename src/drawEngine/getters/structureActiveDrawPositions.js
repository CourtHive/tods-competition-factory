import { getAllStructureMatchUps } from './getMatchUps/getAllStructureMatchUps';
import { getRoundMatchUps } from '../accessors/matchUpAccessor/getRoundMatchUps';
import { getPositionAssignments } from './positionsGetter';
import { isActiveMatchUp } from './activeMatchUp';
import { findStructure } from './findStructure';
import {
  generateRange,
  intersection,
  numericSort,
  unique,
} from '../../utilities';

import { CONTAINER } from '../../constants/drawDefinitionConstants';

// active drawPositions occur in activeMatchUps...
// ...which have a winningSide, a scoreString, or a completed matchUpStatus
export function structureActiveDrawPositions({ drawDefinition, structureId }) {
  const matchUpFilters = { isCollectionMatchUp: false };
  const { structure } = findStructure({ drawDefinition, structureId });
  const { matchUps } = getAllStructureMatchUps({
    drawDefinition,
    structure,
    matchUpFilters,
  });

  const activeMatchUps = matchUps.filter(isActiveMatchUp);

  const { positionAssignments } = getPositionAssignments({
    structure,
    drawDefinition,
  });

  // first collect all drawPositions for the structure
  const drawPositions = unique(
    []
      .concat(...matchUps.map((matchUp) => matchUp.drawPositions || []))
      .filter(Boolean)
  ).sort(numericSort);

  // determine which positions are BYEs
  const byeDrawPositions = positionAssignments
    .filter((assignment) => assignment.bye)
    .map((assignment) => assignment.drawPosition);

  const drawPositionsInActiveMatchUps = unique(
    []
      .concat(...activeMatchUps.map((matchUp) => matchUp.drawPositions || []))
      .filter(Boolean)
      .sort(numericSort)
  );

  if (structure.structureType === CONTAINER) {
    // BYEs are never considered ACTIVE in a Round Robin group
    const inactiveDrawPositions = drawPositions.filter(
      (drawPosition) => !drawPositionsInActiveMatchUps.includes(drawPosition)
    );

    return {
      activeDrawPositions: drawPositionsInActiveMatchUps,
      inactiveDrawPositions,
      byeDrawPositions,
      structure,
    };
  } else {
    const dependentDrawPositions = [];
    const { roundMatchUps } = getRoundMatchUps({ matchUps });
    activeMatchUps.forEach((matchUp) => {
      const { roundNumber, drawPositions } = matchUp;
      dependentDrawPositions.push(...drawPositions);
      const previousRoundNumbers = generateRange(1, roundNumber).reverse();
      previousRoundNumbers.forEach((targetRoundNumber) => {
        roundMatchUps[targetRoundNumber].forEach((targetRoundMatchUp) => {
          if (
            intersection(
              dependentDrawPositions,
              targetRoundMatchUp.drawPositions
            ).length
          ) {
            dependentDrawPositions.push(...targetRoundMatchUp.drawPositions);
          }
        });
      });
    });

    const activeDrawPositions = unique(dependentDrawPositions).sort(
      numericSort
    );

    const inactiveDrawPositions = drawPositions.filter(
      (drawPosition) => !activeDrawPositions.includes(drawPosition)
    );

    return {
      allDrawPositions: drawPositions,
      positionAssignments,
      activeDrawPositions,
      inactiveDrawPositions,
      byeDrawPositions,
      structure,
    };
  }
}

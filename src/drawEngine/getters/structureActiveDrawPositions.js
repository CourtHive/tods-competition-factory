import { isActiveMatchUpStatus } from '../governors/matchUpGovernor/checkStatusType';
import { getAllStructureMatchUps } from './getMatchUps/getAllStructureMatchUps';
import { getRoundMatchUps } from '../accessors/matchUpAccessor';
import { getPositionAssignments } from './positionsGetter';
import { findStructure } from './findStructure';
import {
  generateRange,
  intersection,
  numericSort,
  unique,
} from '../../utilities';

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
  const activeMatchUps = matchUps.filter(
    ({ score, winningSide, matchUpStatus }) =>
      score?.sets?.length ||
      winningSide ||
      isActiveMatchUpStatus({ matchUpStatus })
  );

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

  const drawPositionsInActiveMatchUps = unique(
    []
      .concat(...activeMatchUps.map((matchUp) => matchUp.drawPositions || []))
      .filter((f) => f)
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
      activeDrawPositions,
      inactiveDrawPositions,
      byeDrawPositions,
      structure,
    };
  }
}

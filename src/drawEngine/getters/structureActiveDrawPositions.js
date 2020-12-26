import { findStructure } from './findStructure';
import { getPositionAssignments } from './positionsGetter';
import { getAllStructureMatchUps } from './getMatchUps/getAllStructureMatchUps';

import { countValues, numericSort } from '../../utilities';
import { CONTAINER } from '../../constants/drawDefinitionConstants';

// TODO: write unit test for this method
// active drawPositions occur more than once in the matchUps of a structure
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
  const byeDrawPositions = positionAssignments
    .filter((assignment) => assignment.bye)
    .map((assignment) => assignment.drawPosition);
  const byePairedPositions = byeDrawPositions
    .map(getByePairedPosition)
    .flat(Infinity);

  if (structure.structureType === CONTAINER) {
    const relevantMatchUps = matchUps.filter(
      (matchUp) => matchUp.score?.sets?.length || matchUp.winningSide
    );
    const activeDrawPositions = []
      .concat(...relevantMatchUps.map((matchUp) => matchUp.drawPositions || []))
      .filter((f) => f)
      .sort(numericSort);

    return {
      activeDrawPositions,
      advancedDrawPositions: [],
      pairedDrawPositions: [],
      byeDrawPositions,
    };
  } else {
    const drawPositions = []
      .concat(...matchUps.map((matchUp) => matchUp.drawPositions || []))
      .filter((f) => f)
      .sort(numericSort);

    // now remove ONE INSTANCE of byePairedPositions from drawPositions
    const instancesToRemove = [].concat(
      ...byePairedPositions,
      ...byeDrawPositions
    );
    instancesToRemove.forEach((drawPosition) => {
      const index = drawPositions.indexOf(drawPosition);
      drawPositions.splice(index, 1);
    });

    const positionCounts = countValues(drawPositions);

    const advancedDrawPositions = Object.keys(positionCounts)
      .reduce((active, key) => {
        return +key > 1 ? active.concat(...positionCounts[key]) : active;
      }, [])
      .map((p) => parseInt(p));

    // pairedDrawPositions are those positions which are paired with a position which has advanced
    const pairedDrawPositions = [].concat(
      ...advancedDrawPositions.map(getPairedDrawPositions)
    );
    const activeDrawPositions = []
      .concat(...advancedDrawPositions, pairedDrawPositions)
      .filter((f) => f);

    return {
      activeDrawPositions,
      advancedDrawPositions,
      pairedDrawPositions,
      byeDrawPositions,
    };
  }

  function getPairedDrawPositions(drawPosition) {
    return matchUps
      .reduce((drawPositions, currentMatchup) => {
        return currentMatchup.drawPositions?.includes(drawPosition)
          ? drawPositions.concat(...currentMatchup.drawPositions)
          : drawPositions;
      }, [])
      .filter((dp) => dp && dp !== drawPosition);
  }

  function getByePairedPosition(drawPosition) {
    return matchUps
      .reduce((drawPositions, currentMatchup) => {
        return currentMatchup.drawPositions?.includes(drawPosition)
          ? drawPositions.concat(...currentMatchup.drawPositions)
          : drawPositions;
      }, [])
      .filter((dp) => dp && dp !== drawPosition);
  }
}

import { countValues, numericSort } from '../../utilities';
import { findStructure } from '../../drawEngine/getters/structureGetter';
import { getAllStructureMatchUps } from '../../drawEngine/getters/getMatchUps';

import { CONTAINER } from '../../constants/drawDefinitionConstants';

// TODO: write unit test for this method
export function getDrawPositions({ structure }) {
  if (structure && structure.structures) {
    return [].concat(
      ...structure.structures.map(structure => getDrawPositions({ structure }))
    );
  } else if (structure) {
    return structure.positionAssignments || [];
  }
}

// TESTED: positionsAssignment.test.js
export function getPositionAssignments({
  structure,
  drawDefinition,
  structureId,
}) {
  let error,
    positionAssignments = [];
  if (!structure) {
    if (!drawDefinition) {
      return { positionAssignments, error: 'Missing drawDefinition' };
    }
    ({ structure, error } = findStructure({ drawDefinition, structureId }));
    if (error) return { positionAssignments, error };
  }
  if (structure.structures) {
    positionAssignments = [].concat(
      ...structure.structures.map(structure => {
        return getPositionAssignments({ structure }).positionAssignments;
      })
    );
  } else if (structure.positionAssignments) {
    positionAssignments = structure.positionAssignments;
  } else {
    error = 'Missing positionAssignments';
  }
  return { positionAssignments, error };
}

// TESTED: positionsAssignment.test.js
export function structureAssignedDrawPositions({
  structure,
  drawDefinition,
  structureId,
}) {
  const { positionAssignments } = getPositionAssignments({
    structure,
    drawDefinition,
    structureId,
  });
  const assignedPositions = positionAssignments.filter(drawPosition => {
    return (
      drawPosition.participantId || drawPosition.bye || drawPosition.qualifier
    );
  });
  const allPositionsAssigned =
    positionAssignments.length === assignedPositions.length;
  const unassignedPositions = positionAssignments.filter(drawPosition => {
    return (
      !drawPosition.participantId &&
      !drawPosition.bye &&
      !drawPosition.qualifier
    );
  });
  const byePositions = positionAssignments.filter(drawPosition => {
    return !drawPosition.participantId && drawPosition.bye;
  });
  const qualifierPositions = positionAssignments.filter(drawPosition => {
    return !drawPosition.participantId && drawPosition.qualifier;
  });
  return {
    byePositions,
    assignedPositions,
    qualifierPositions,
    unassignedPositions,
    positionAssignments,
    allPositionsAssigned,
  };
}

// TODO: write unit test for this method
// active drawPositions occur more than once in the mmatchUps of a structure
export function structureActiveDrawPositions({
  drawDefinition,
  policies,
  structureId,
}) {
  const matchUpFilters = { isCollectionMatchUp: false };
  const { structure } = findStructure({ drawDefinition, structureId });
  const { matchUps } = getAllStructureMatchUps({
    drawDefinition,
    policies,
    structure,
    matchUpFilters,
  });
  const { positionAssignments } = getPositionAssignments({
    structure,
    drawDefinition,
  });
  const byeDrawPositions = positionAssignments
    .filter(assignment => assignment.bye)
    .map(assignment => assignment.drawPosition);
  const byePairedPositions = byeDrawPositions
    .map(getByePairedPosition)
    .flat(Infinity);

  if (structure.structureType === CONTAINER) {
    const relevantMatchUps = matchUps.filter(
      matchUp => matchUp.score || matchUp.winningSide
    );
    const activeDrawPositions = []
      .concat(...relevantMatchUps.map(matchUp => matchUp.drawPositions || []))
      .filter(f => f)
      .sort(numericSort);

    return {
      activeDrawPositions,
      advancedDrawPositions: [],
      pairedDrawPositions: [],
      byeDrawPositions,
    };
  } else {
    const drawPositions = []
      .concat(...matchUps.map(matchUp => matchUp.drawPositions || []))
      .filter(f => f)
      .sort(numericSort);

    // now remove ONE INSTANCE of byePairedPositions from drawPositions
    const instancesToRemove = [].concat(
      ...byePairedPositions,
      ...byeDrawPositions
    );
    instancesToRemove.forEach(drawPosition => {
      const index = drawPositions.indexOf(drawPosition);
      drawPositions.splice(index, 1);
    });

    const positionCounts = countValues(drawPositions);

    const advancedDrawPositions = Object.keys(positionCounts)
      .reduce((active, key) => {
        return +key > 1 ? active.concat(...positionCounts[key]) : active;
      }, [])
      .map(p => parseInt(p));

    // pairedDrawPositions are those positions which are paired with a position which has advanced
    const pairedDrawPositions = [].concat(
      ...advancedDrawPositions.map(getPairedDrawPositions)
    );
    const activeDrawPositions = []
      .concat(...advancedDrawPositions, pairedDrawPositions)
      .filter(f => f);

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
        return currentMatchup.drawPositions.includes(drawPosition)
          ? drawPositions.concat(...currentMatchup.drawPositions)
          : drawPositions;
      }, [])
      .filter(dp => dp && dp !== drawPosition);
  }

  function getByePairedPosition(drawPosition) {
    return matchUps
      .reduce((drawPositions, currentMatchup) => {
        return currentMatchup.drawPositions.includes(drawPosition)
          ? drawPositions.concat(...currentMatchup.drawPositions)
          : drawPositions;
      }, [])
      .filter(dp => dp && dp !== drawPosition);
  }
}

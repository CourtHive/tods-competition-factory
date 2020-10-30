import { getPlayoffStructures } from '../../../tournamentEngine/getters/structureGetter';
import { getStructureMatchUps } from '../../getters/getMatchUps';
import { findStructure } from '../../getters/findStructure';

/**
 *
 * @param {object} drawDefinition - complete drawDefinition object
 * @param {string} structureId - UUID of structure to be found within drawDefinition
 *
 */
export function drawActions(props) {
  const { structure } = findStructure(props);
  if (structure?.structure) {
    // structure is Round Robin
  } else {
    // structure is Elimination
  }
}

/**
 *
 * @param {object} drawDefinition
 * @param {string} structureId
 */
export function isCompletedStructure(props) {
  const structureMatchUps = getStructureMatchUps(props);

  const { completedMatchUps, pendingMatchUps, upcomingMatchUps } =
    structureMatchUps || {};

  const isComplete =
    completedMatchUps?.length &&
    !pendingMatchUps?.length &&
    !upcomingMatchUps.length;

  return !!isComplete;
}

/**
 *
 * @param {object} drawDefinition
 * @param {string} structureId - either drawDefinition and structureId or structure
 * @param {object} structure - optional
 */
export function allPlayoffPositionsFilled(props) {
  const { drawDefinition, structureId } = props;
  const playoffStructures = getPlayoffStructures({
    drawDefinition,
    structureId,
  });

  const allPositionsFilled = playoffStructures.reduce(
    (allFilled, structure) => {
      const structurePositionsFilled = !structure.positionAssignments.filter(
        assignment => {
          return !assignment.bye && !assignment.participantId;
        }
      ).length;
      return structurePositionsFilled && allFilled;
    },
    true
  );

  return allPositionsFilled;
}

import { getPlayoffStructures } from '../../../tournamentEngine/getters/structureGetter';
import { getStructureMatchUps } from '../../getters/getMatchUps';

/**
 *
 * @param {object} drawDefinition - complete drawDefinition object
 * @param {string} structureId - UUID of structure to be found within drawDefinition
 *
 */
export function structureActions(props) {
  const actions = [];
  const isComplete = isCompletedStructure(props);
  const hasPlayoffPositionsFilled = allPlayoffPositionsFilled(props);
  return { actions, state: { isComplete, hasPlayoffPositionsFilled } };
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

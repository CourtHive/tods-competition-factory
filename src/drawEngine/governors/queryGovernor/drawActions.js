import { findStructure } from '../../getters/findStructure';
import { getStructureMatchUps } from '../../getters/getMatchUps';

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
 * @param {string} structureId - return a boolean indicating whether structure is complete
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

export function isReadyToGenerate(props) {
  const { structure } = findStructure(props);
  console.log({ structure });
}

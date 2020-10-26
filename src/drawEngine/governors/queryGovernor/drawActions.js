import { findStructure } from '../../getters/findStructure';

/**
 *
 * @param {object} drawDefinition - complete drawDefinition object
 * @param {string} structureId - UUID of structure to be found within drawDefinition
 *
 */
export function drawActions(props) {
  const structure = findStructure(props);
  if (structure?.structure) {
    // structure is Round Robin
  } else {
    // structure is Elimination
  }
}

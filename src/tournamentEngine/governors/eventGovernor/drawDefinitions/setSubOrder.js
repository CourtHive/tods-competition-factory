import { setSubOrder as drawEngineSetSubOrder } from '../../../../drawEngine/governors/positionGovernor/setSubOrder';

/**
 *
 * Assigns a subOrder value to a participant within a structure by drawPosition where participant has been assigned
 *
 * @param {object} drawDefinition - added automatically by tournamentEngine with drawId
 * @param {string} drawId - used by tournamentEngine to retrieve drawDefinition
 * @param {string} structureId - structure identifier within drawDefinition
 * @param {number} drawPosition - drawPosition of the participant where subOrder is to be added
 * @param {number} subOrder - order in which tied participant should receive finishing position
 *
 */
export function setSubOrder(props) {
  return drawEngineSetSubOrder(props);
}

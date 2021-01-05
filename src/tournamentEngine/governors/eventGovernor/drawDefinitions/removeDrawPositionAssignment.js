import {
  assignDrawPositionBye,
  // getByesData,
} from '../../../../drawEngine/governors/positionGovernor/positionByes';
import { clearDrawPosition } from '../../../../drawEngine/governors/positionGovernor/positionClear';
import { modifyEntriesStatus } from '../entries/modifyEntriesStatus';
// import { findStructure } from '../../../../drawEngine/getters/findStructure';

import {
  ALTERNATE,
  WITHDRAWN,
} from '../../../../constants/entryStatusConstants';

/**
 *
 * @param {string} drawId - id of drawDefinition within which structure is found
 * @param {string} structureId - id of structure of drawPosition
 * @param {number} drawPosition - number of drawPosition for which actions are to be returned
 * @param {boolean} replaceWithBye - boolean whether or not to replace with BYE
 * @param {string} entryStatus - change the entry status of the removed participant to either ALTERNATE or WITHDRAWN
 *
 */
export function removeDrawPositionAssignment(props) {
  const { replaceWithBye, entryStatus } = props;

  const result = clearDrawPosition(props);
  if (result.error) return result;

  const { participantId } = result;

  const { drawDefinition, drawPosition, event, structureId } = props;
  /*
  const { structure } = findStructure({ drawDefinition, structureId });
  const { byesCount, placedByes } = getByesData({
    drawDefinition,
    structure,
  });

  const unplacedByes = placedByes < byesCount;
  */
  if ([ALTERNATE, WITHDRAWN].includes(entryStatus)) {
    if (participantId) {
      modifyEntriesStatus({
        participantIds: [participantId],
        entryStatus,
        drawDefinition,
        event,
      });
    }
  }

  if (replaceWithBye) {
    const result = assignDrawPositionBye({
      drawDefinition,
      structureId,
      drawPosition,
    });
    if (result.error) return result;
  }

  return result;
}

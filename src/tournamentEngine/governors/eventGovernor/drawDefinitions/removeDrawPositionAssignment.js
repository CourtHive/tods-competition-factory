import {
  assignDrawPositionBye,
  getByesData,
} from '../../../../drawEngine/governors/positionGovernor/positionByes';
import { clearDrawPosition } from '../../../../drawEngine/governors/positionGovernor/positionClear';
import { modifyEntriesStatus } from '../entries/modifyEntriesStatus';
import { findStructure } from '../../../../drawEngine/getters/findStructure';

import { ALTERNATE } from '../../../../constants/entryStatusConstants';

/**
 *
 * @param {string} drawId - id of drawDefinition within which structure is found
 * @param {string} structureId - id of structure of drawPosition
 * @param {number} drawPosition - number of drawPosition for which actions are to be returned
 *
 */
export function removeDrawPositionAssignment(props) {
  const { replaceWithBye, setAlternateEntryStatus } = props;
  if (setAlternateEntryStatus) console.log({ setAlternateEntryStatus });

  const result = clearDrawPosition(props);
  if (result.error) return result;

  const { participantId } = result;

  if (replaceWithBye) {
    const { drawDefinition, drawPosition, event, structureId } = props;
    if (participantId) {
      const { structure } = findStructure({ drawDefinition, structureId });
      const { byesCount, placedByes } = getByesData({
        drawDefinition,
        structure,
      });
      const unplacedByes = placedByes < byesCount;

      if (!unplacedByes) {
        modifyEntriesStatus({
          participantIds: [participantId],
          entryStatus: ALTERNATE,
          drawDefinition,
          event,
        });
      }
    }

    const result = assignDrawPositionBye({
      drawDefinition,
      structureId,
      drawPosition,
    });
    if (result.error) return result;
  }

  return result;
}

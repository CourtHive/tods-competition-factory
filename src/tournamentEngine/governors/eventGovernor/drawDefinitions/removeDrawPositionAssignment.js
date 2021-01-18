import { assignDrawPositionBye } from '../../../../drawEngine/governors/positionGovernor/byePositioning/assignDrawPositionBye';
import { clearDrawPosition } from '../../../../drawEngine/governors/positionGovernor/positionClear';
import { findTournamentParticipant } from '../../../getters/participants/participantGetter';
import { modifyEntriesStatus } from '../entries/modifyEntriesStatus';

import {
  ALTERNATE,
  WITHDRAWN,
} from '../../../../constants/entryStatusConstants';
import { PAIR } from '../../../../constants/participantTypes';
import { destroyPairEntry } from '../entries/destroyPairEntry';

/**
 *
 * @param {string} drawId - id of drawDefinition within which structure is found
 * @param {string} structureId - id of structure of drawPosition
 * @param {number} drawPosition - number of drawPosition for which actions are to be returned
 * @param {boolean} replaceWithBye - boolean whether or not to replace with BYE
 * @param {boolean} destroyPair - if { participantType: PAIR } it is possible to destroy pair entry before modifying entryStatus
 * @param {string} entryStatus - change the entry status of the removed participant to either ALTERNATE or WITHDRAWN
 *
 */
export function removeDrawPositionAssignment(props) {
  const { replaceWithBye, destroyPair, entryStatus } = props;

  const result = clearDrawPosition(props);
  if (result.error) return result;

  const { participantId } = result;
  const { drawDefinition, drawPosition, event, structureId } = props;

  if ([ALTERNATE, WITHDRAWN].includes(entryStatus)) {
    if (participantId) {
      const { tournamentRecord } = props;
      const { participant } = findTournamentParticipant({
        tournamentRecord,
        participantId,
      });
      const { participantType, individualParticipantIds } = participant || {};

      if (destroyPair && participantType === PAIR) {
        const result = destroyPairEntry({
          tournamentRecord,
          drawDefinition,
          participantId,
          event,
        });
        if (result.error) return result;
        modifyEntriesStatus({
          participantIds: [individualParticipantIds],
          entryStatus,
          drawDefinition,
          event,
        });
      } else {
        modifyEntriesStatus({
          participantIds: [participantId],
          entryStatus,
          drawDefinition,
          event,
        });
      }
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

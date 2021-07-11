import { destroyGroupEntry } from './destroyGroupEntry';

import { UNPAIRED } from '../../../../constants/entryStatusConstants';

/**
 *
 * @param {object} tournamentRecord - passed in by tournamentEngine
 * @param {string} participantId - id of TEAM/PAIR participant to remove
 * @param {string} eventId - resolved to { event } by tournamentEngine
 * @param {string} drawId - optional - resolved to { drawDefinition }
 * @param {string} entryStatus - assign to individuals removed from destroyed team
 * @param {boolean} removeGroupParticipant - whether to also remove grouping participant from tournamentRecord.participants
 *
 */

export function destroyPairEntry({
  removeGroupParticipant,
  tournamentRecord,
  drawDefinition,
  participantId,
  entryStatus,
  drawId,
  event,
}) {
  return destroyGroupEntry({
    removeGroupParticipant,
    individualEntryStatus: UNPAIRED,
    tournamentRecord,
    drawDefinition,
    participantId,
    entryStatus,
    drawId,
    event,
  });
}

import { SUCCESS } from '../../../constants/resultConstants';
import { SCALE } from '../../../constants/timeItemConstants';
import {
  MISSING_PARTICIPANT_IDS,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

/**
 *
 * @param {object} tournamentRecord - passed automatically if tournamentEngine.setState()
 * @param {string[]} participantIds
 * @param {string} scaleAttributes - { scaleType, scaleName, eventType }
 * @returns {boolean} { success: true } or { error }
 */
export function removeParticipantsScaleItems({
  tournamentRecord,
  scaleAttributes,
  participantIds,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantIds) return { error: MISSING_PARTICIPANT_IDS };
  if (!scaleAttributes)
    return { error: MISSING_VALUE, info: 'scaleAttributes required' };

  const { scaleType, eventType, scaleName } = scaleAttributes;
  const itemType = [SCALE, scaleType, eventType, scaleName].join('.');
  tournamentRecord.participants?.forEach((participant) => {
    if (participantIds.includes(participant.participantId)) {
      if (participant.timeItems) {
        participant.timeItems = participant.timeItems.filter((timeItem) => {
          return timeItem && timeItem?.itemType !== itemType;
        });
      }
    }
  });

  return { ...SUCCESS };
}

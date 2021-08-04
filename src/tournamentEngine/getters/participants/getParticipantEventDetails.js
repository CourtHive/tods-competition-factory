import { overlap } from '../../../utilities/arrays';

import {
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { PAIR, TEAM } from '../../../constants/participantTypes';

/**
 * Returns { eventDetails: { eventName, eventId }} for events in which participantId or TEAM/PAIR including participantId appears
 *
 * @param {object} tournamentRecord - tournament object (passed automatically from tournamentEngine state)
 * @param {string} participantId - id of participant for which events (eventName, eventId) are desired
 */
export function getParticipantEventDetails({
  tournamentRecord,
  participantId,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  // relveantParticipantIds is the target participantId along with any TEAM or PAIR participantIds to which participantId belongs
  const relevantParticipantIds = [participantId].concat(
    (tournamentRecord.participants || [])
      .filter(
        (participant) =>
          [TEAM, PAIR].includes(participant.participantType) &&
          participant.individualParticipantIds?.includes(participantId)
      )
      .map((participant) => participant.participantId)
  );

  const relevantEvents = (tournamentRecord.events || [])
    .filter((event) => {
      const enteredParticipantIds = (event?.entries || []).map(
        (entry) => entry.participantId
      );
      const presentInEvent = overlap(
        enteredParticipantIds,
        relevantParticipantIds
      );
      return presentInEvent;
    })
    .map((event) => ({ eventName: event.eventName, eventId: event.eventId }));

  return { eventDetails: relevantEvents };
}

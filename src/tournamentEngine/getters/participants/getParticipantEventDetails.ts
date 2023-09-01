import { overlap } from '../../../utilities/arrays';

import { PAIR, TEAM } from '../../../constants/participantConstants';
import {
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

import { Tournament } from '../../../types/tournamentFromSchema';
import { ResultType } from '../../../global/functions/decorateResult';

/**
 * Returns { eventDetails: { eventName, eventId }} for events in which participantId or TEAM/PAIR including participantId appears
 */

type getParticipantEventDetailsType = {
  tournamentRecord: Tournament;
  participantId: string;
};

export function getParticipantEventDetails({
  tournamentRecord,
  participantId,
}: getParticipantEventDetailsType): ResultType & {
  eventDetails?: { eventName?: string; eventId: string }[];
} {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  // relveantParticipantIds is the target participantId along with any TEAM or PAIR participantIds to which participantId belongs
  const relevantParticipantIds = [participantId].concat(
    (tournamentRecord.participants || [])
      .filter(
        (participant) =>
          participant?.participantType &&
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
      return overlap(enteredParticipantIds, relevantParticipantIds);
    })
    .map((event) => ({ eventName: event.eventName, eventId: event.eventId }));

  return { eventDetails: relevantEvents };
}

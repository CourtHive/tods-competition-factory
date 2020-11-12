import { UNPAIRED } from '../../../constants/entryStatusConstants';
import {
  INVALID_ENTRIES,
  MISSING_EVENT,
  MISSING_PARTICIPANTS,
  UNRECOGNIZED_EVENT_TYPE,
} from '../../../constants/errorConditionConstants';
import { DOUBLES, SINGLES, TEAM } from '../../../constants/matchUpTypes';
import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import { SUCCESS } from '../../../constants/resultConstants';

export function checkValidEntries({ event, participants }) {
  if (!event) return { error: MISSING_EVENT };
  if (!participants) return { error: MISSING_PARTICIPANTS };

  const { eventType } = event;
  if (![TEAM, SINGLES, DOUBLES].includes(eventType))
    return { error: UNRECOGNIZED_EVENT_TYPE };
  const participantType =
    eventType === SINGLES ? INDIVIDUAL : eventType === DOUBLES ? PAIR : TEAM;

  const enteredParticipantIds = event.entries?.map(
    entry => entry.participantId
  );
  const enteredParticipants = participants.filter(participant =>
    enteredParticipantIds.includes(participant.participantId)
  );

  const invalidEntries = enteredParticipants.filter(participant => {
    const mismatch = participant.participantType !== participantType;
    const unpairedDoublesParticipant =
      eventType === DOUBLES && participant.participantType === UNPAIRED;
    return mismatch && !unpairedDoublesParticipant;
  });

  if (invalidEntries.length) {
    const invalidParticipantIds = invalidEntries.map(
      participant => participant.participantId
    );
    return { error: INVALID_ENTRIES, invalidParticipantIds };
  }

  return SUCCESS;
}

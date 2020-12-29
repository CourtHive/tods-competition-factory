import {
  UNPAIRED,
  WITHDRAWN,
} from '../../../../constants/entryStatusConstants';
import {
  INVALID_ENTRIES,
  MISSING_EVENT,
  MISSING_PARTICIPANTS,
  UNRECOGNIZED_EVENT_TYPE,
} from '../../../../constants/errorConditionConstants';
import { FEMALE, MALE } from '../../../../constants/genderConstants';
import { DOUBLES, SINGLES, TEAM } from '../../../../constants/matchUpTypes';
import { INDIVIDUAL, PAIR } from '../../../../constants/participantTypes';
import { SUCCESS } from '../../../../constants/resultConstants';

export function checkValidEntries({ event, participants, ignoreGender }) {
  if (!event) return { error: MISSING_EVENT };
  if (!participants) return { error: MISSING_PARTICIPANTS };

  const { eventType, gender: eventGender } = event;
  if (![TEAM, SINGLES, DOUBLES].includes(eventType))
    return { error: UNRECOGNIZED_EVENT_TYPE };
  const participantType =
    eventType === SINGLES ? INDIVIDUAL : eventType === DOUBLES ? PAIR : TEAM;

  const entryStatusMap = Object.assign(
    {},
    ...event.entries.map((entry) => ({
      [entry.participantId]: entry.entryStatus,
    }))
  );

  const enteredParticipantIds = Object.keys(entryStatusMap);
  const enteredParticipants = participants.filter((participant) =>
    enteredParticipantIds.includes(participant.participantId)
  );

  const invalidEntries = enteredParticipants.filter((participant) => {
    const unpairedDoublesParticipant =
      eventType === DOUBLES &&
      participant.participantType === INDIVIDUAL &&
      [UNPAIRED, WITHDRAWN].includes(entryStatusMap[participant.participantId]);
    const mismatch =
      participant.participantType !== participantType &&
      !unpairedDoublesParticipant;

    // TODO: implement gender checking for teams & pairs
    const wrongGender =
      !ignoreGender &&
      eventType === INDIVIDUAL &&
      [MALE, FEMALE].includes(eventGender) &&
      participant.sex !== eventGender;

    return mismatch || wrongGender;
  });

  if (invalidEntries.length) {
    const invalidParticipantIds = invalidEntries.map(
      (participant) => participant.participantId
    );
    return { error: INVALID_ENTRIES, invalidParticipantIds };
  }

  return SUCCESS;
}

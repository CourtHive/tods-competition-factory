import { isUngrouped } from '../../../../global/functions/isUngrouped';

import { DOUBLES, SINGLES, TEAM } from '../../../../constants/matchUpTypes';
import { WITHDRAWN } from '../../../../constants/entryStatusConstants';
import { INDIVIDUAL, PAIR } from '../../../../constants/participantTypes';
import { FEMALE, MALE } from '../../../../constants/genderConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  INVALID_ENTRIES,
  MISSING_EVENT,
  MISSING_PARTICIPANTS,
} from '../../../../constants/errorConditionConstants';

export function checkValidEntries({ event, participants, ignoreGender }) {
  if (!participants) return { error: MISSING_PARTICIPANTS };
  if (!event) return { error: MISSING_EVENT };

  const { eventType, gender: eventGender } = event;
  const participantType =
    eventType === SINGLES ? INDIVIDUAL : eventType === DOUBLES ? PAIR : TEAM;

  const entryStatusMap = Object.assign(
    {},
    ...(event.entries || []).map((entry) => ({
      [entry.participantId]: entry.entryStatus,
    }))
  );

  const enteredParticipantIds = Object.keys(entryStatusMap);
  const enteredParticipants = participants.filter((participant) =>
    enteredParticipantIds.includes(participant.participantId)
  );

  const invalidEntries = enteredParticipants.filter((participant) => {
    const entryStatus = entryStatusMap[participant.participantId];
    const unpairedDoublesParticipant =
      eventType === DOUBLES &&
      participant.participantType === INDIVIDUAL &&
      (isUngrouped(entryStatus) || entryStatus === WITHDRAWN);
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

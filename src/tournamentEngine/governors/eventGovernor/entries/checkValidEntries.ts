import { isUngrouped } from '../../../../global/functions/isUngrouped';

import { WITHDRAWN } from '../../../../constants/entryStatusConstants';
import { FEMALE, MALE } from '../../../../constants/genderConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  INDIVIDUAL,
  PAIR,
  TEAM,
} from '../../../../constants/participantConstants';
import {
  DOUBLES_EVENT,
  TEAM_EVENT,
} from '../../../../constants/eventConstants';
import {
  INVALID_ENTRIES,
  INVALID_VALUES,
  MISSING_EVENT,
  MISSING_PARTICIPANTS,
} from '../../../../constants/errorConditionConstants';

export function checkValidEntries({ event, participants, ignoreGender }) {
  if (!participants) return { error: MISSING_PARTICIPANTS };
  if (!Array.isArray(participants)) return { error: INVALID_VALUES };
  if (!event) return { error: MISSING_EVENT };

  const { eventType, gender: eventGender } = event;
  const participantType =
    (eventType === TEAM_EVENT && TEAM) ||
    (eventType === DOUBLES_EVENT && PAIR) ||
    INDIVIDUAL;

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
    const ungroupedParticipant =
      [DOUBLES_EVENT, TEAM_EVENT].includes(eventType) &&
      participant.participantType === INDIVIDUAL &&
      (isUngrouped(entryStatus) || entryStatus === WITHDRAWN);
    const mismatch =
      participant.participantType !== participantType && !ungroupedParticipant;

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

  return { ...SUCCESS };
}

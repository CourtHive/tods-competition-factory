import { isUngrouped } from '../../../../global/functions/isUngrouped';

import { WITHDRAWN } from '../../../../constants/entryStatusConstants';
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
import {
  Entry,
  Event,
  GenderEnum,
  Participant,
  Tournament,
  TypeEnum,
} from '../../../../types/tournamentFromSchema';

type CheckValidEntriesArgs = {
  tournamentRecord?: Tournament;
  participants: Participant[];
  consideredEntries?: Entry[];
  enforceGender?: boolean;
  event: Event;
};
export function checkValidEntries({
  enforceGender = true,
  consideredEntries,
  tournamentRecord,
  participants,
  event,
}: CheckValidEntriesArgs) {
  participants = participants || tournamentRecord?.participants;

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
    ...(consideredEntries || event.entries || []).map((entry) => ({
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
      eventType &&
      [TypeEnum.Doubles, TypeEnum.Team].includes(eventType) &&
      participant.participantType === INDIVIDUAL &&
      (isUngrouped(entryStatus) || entryStatus === WITHDRAWN);
    const mismatch =
      participant.participantType !== participantType && !ungroupedParticipant;

    // TODO: implement gender checking for teams & pairs
    const personGender = participant?.person?.sex as unknown;
    const wrongGender =
      enforceGender &&
      eventGender &&
      eventType === TypeEnum.Singles &&
      [GenderEnum.Male, GenderEnum.Female].includes(eventGender) &&
      personGender !== eventGender;

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

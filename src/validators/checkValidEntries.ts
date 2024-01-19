import { getParticipants } from '../query/participants/getParticipants';
import { isUngrouped } from '../query/entries/isUngrouped';
import { unique } from '../tools/arrays';

import POLICY_MATCHUP_ACTIONS_DEFAULT from '../fixtures/policies/POLICY_MATCHUP_ACTIONS_DEFAULT';
import { Entry, Event, Participant, Tournament } from '../types/tournamentTypes';
import { POLICY_TYPE_MATCHUP_ACTIONS } from '../constants/policyConstants';
import { INDIVIDUAL, PAIR, TEAM } from '../constants/participantConstants';
import { ParticipantMap, PolicyDefinitions } from '../types/factoryTypes';
import { ANY, FEMALE, MALE, MIXED } from '../constants/genderConstants';
import { DOUBLES_EVENT, TEAM_EVENT } from '../constants/eventConstants';
import { WITHDRAWN } from '../constants/entryStatusConstants';
import { SUCCESS } from '../constants/resultConstants';
import {
  INVALID_ENTRIES,
  INVALID_VALUES,
  MISSING_EVENT,
  MISSING_PARTICIPANTS,
} from '../constants/errorConditionConstants';

type CheckValidEntriesArgs = {
  policyDefinitions?: PolicyDefinitions;
  appliedPolicies?: PolicyDefinitions;
  participantMap?: ParticipantMap;
  tournamentRecord?: Tournament;
  participants?: Participant[];
  consideredEntries?: Entry[];
  enforceGender?: boolean;
  event: Event;
};
export function checkValidEntries({
  consideredEntries,
  policyDefinitions,
  tournamentRecord,
  appliedPolicies,
  participantMap,
  enforceGender,
  participants,
  event,
}: CheckValidEntriesArgs) {
  if ((!participants || !participantMap) && tournamentRecord) {
    ({ participants, participantMap } = getParticipants({
      tournamentRecord,
    }));
  }

  if (!participants) return { error: MISSING_PARTICIPANTS };
  if (!Array.isArray(participants)) return { error: INVALID_VALUES };
  if (!event) return { error: MISSING_EVENT };

  const matchUpActionsPolicy =
    policyDefinitions?.[POLICY_TYPE_MATCHUP_ACTIONS] ??
    appliedPolicies?.[POLICY_TYPE_MATCHUP_ACTIONS] ??
    POLICY_MATCHUP_ACTIONS_DEFAULT[POLICY_TYPE_MATCHUP_ACTIONS];

  const genderEnforced = (enforceGender ?? matchUpActionsPolicy?.participants?.enforceGender) !== false;

  const { eventType, gender: eventGender } = event;
  const isDoubles = eventType === DOUBLES_EVENT;
  const participantType = (eventType === TEAM_EVENT && TEAM) || (isDoubles && PAIR) || INDIVIDUAL;

  const entryStatusMap = Object.assign(
    {},
    ...(consideredEntries ?? event.entries ?? []).map((entry) => ({
      [entry.participantId]: entry.entryStatus,
    })),
  );

  const enteredParticipantIds = Object.keys(entryStatusMap);
  const enteredParticipants = participants.filter((participant) =>
    enteredParticipantIds.includes(participant.participantId),
  );

  const invalidEntries = enteredParticipants.filter((participant) => {
    const mismatch = getMisMatch({ participant, participantType, eventType, entryStatusMap });
    const validGender = getValidGender({
      genderEnforced,
      participantMap,
      eventGender,
      participant,
      isDoubles,
      mismatch,
    });

    return mismatch || !validGender;
  });

  if (invalidEntries.length) {
    const invalidParticipantIds = invalidEntries.map((participant) => participant.participantId);
    return { error: INVALID_ENTRIES, invalidParticipantIds };
  }

  return { ...SUCCESS, valid: true };
}

function getMisMatch({ participant, participantType, eventType, entryStatusMap }) {
  const entryStatus = entryStatusMap[participant.participantId];
  const ungroupedParticipant =
    eventType &&
    [DOUBLES_EVENT, TEAM_EVENT].includes(eventType) &&
    participant.participantType === INDIVIDUAL &&
    (isUngrouped(entryStatus) || entryStatus === WITHDRAWN);
  return participant.participantType !== participantType && !ungroupedParticipant;
}

function getValidGender(params) {
  const { participant, participantMap, eventGender, mismatch, isDoubles, genderEnforced } = params;
  const pairGender: string[] =
    (!mismatch &&
      isDoubles &&
      unique(
        participant?.individualParticipantIds
          ?.map((id) => participantMap?.[id]?.participant?.person?.sex)
          .filter(Boolean) ?? [],
      )) ||
    [];

  const validPairGender =
    !eventGender ||
    !pairGender?.length ||
    ANY === eventGender ||
    ([MALE, FEMALE].includes(eventGender) && pairGender[0] === eventGender) ||
    (MIXED === eventGender &&
      ((pairGender.length == 1 && participant.individualParticipantIds?.length === 1) || pairGender.length === 2));

  const personGender = participant?.person?.sex as unknown;

  const validPersonGender =
    !participant?.person ||
    !eventGender ||
    [ANY, MIXED].includes(eventGender) ||
    ([MALE, FEMALE].includes(eventGender) && personGender === eventGender);

  return !genderEnforced || (validPairGender && validPersonGender);
}

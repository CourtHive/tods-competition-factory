import { getParticipants } from '../../../getters/participants/getParticipants';
import { isUngrouped } from '../../../../global/functions/isUngrouped';
import { unique } from '../../../../utilities';

import POLICY_MATCHUP_ACTIONS_DEFAULT from '../../../../fixtures/policies/POLICY_MATCHUP_ACTIONS_DEFAULT';
import { POLICY_TYPE_MATCHUP_ACTIONS } from '../../../../constants/policyConstants';
import { WITHDRAWN } from '../../../../constants/entryStatusConstants';
import {
  ParticipantMap,
  PolicyDefinitions,
} from '../../../../types/factoryTypes';
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
} from '../../../../types/tournamentTypes';

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

  const genderEnforced =
    (enforceGender ?? matchUpActionsPolicy?.participants?.enforceGender) !==
    false;

  const { eventType, gender: eventGender } = event;
  const isDoubles = eventType === DOUBLES_EVENT;
  const participantType =
    (eventType === TEAM_EVENT && TEAM) || (isDoubles && PAIR) || INDIVIDUAL;

  const entryStatusMap = Object.assign(
    {},
    ...(consideredEntries ?? event.entries ?? []).map((entry) => ({
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

    const pairGender =
      !mismatch &&
      isDoubles &&
      unique(
        participant?.individualParticipantIds
          ?.map((id) => participantMap?.[id]?.participant?.person?.sex)
          .filter(Boolean) ?? []
      );
    const validPairGender =
      !eventGender ||
      !pairGender?.length ||
      GenderEnum.Any === eventGender ||
      ([GenderEnum.Male, GenderEnum.Female].includes(eventGender) &&
        pairGender[0] === eventGender) ||
      (GenderEnum.Mixed === eventGender &&
        ((pairGender.length == 1 &&
          participant.individualParticipantIds?.length === 1) ||
          pairGender.length === 2));

    const personGender = participant?.person?.sex as unknown;
    const validPersonGender =
      !participant?.person ||
      !eventGender ||
      [GenderEnum.Any, GenderEnum.Mixed].includes(eventGender) ||
      ([GenderEnum.Male, GenderEnum.Female].includes(eventGender) &&
        personGender === eventGender);

    const validGender =
      !genderEnforced || (validPairGender && validPersonGender);

    return mismatch || !validGender;
  });

  if (invalidEntries.length) {
    const invalidParticipantIds = invalidEntries.map(
      (participant) => participant.participantId
    );
    return { error: INVALID_ENTRIES, invalidParticipantIds };
  }

  return { ...SUCCESS, valid: true };
}

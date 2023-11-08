import { isUngrouped } from '../../../../global/functions/isUngrouped';

import POLICY_MATCHUP_ACTIONS_DEFAULT from '../../../../fixtures/policies/POLICY_MATCHUP_ACTIONS_DEFAULT';
import { POLICY_TYPE_MATCHUP_ACTIONS } from '../../../../constants/policyConstants';
import { WITHDRAWN } from '../../../../constants/entryStatusConstants';
import { PolicyDefinitions } from '../../../../types/factoryTypes';
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
  policyDefinitions?: PolicyDefinitions;
  appliedPolicies?: PolicyDefinitions;
  tournamentRecord?: Tournament;
  participants: Participant[];
  consideredEntries?: Entry[];
  enforceGender?: boolean;
  event: Event;
};
export function checkValidEntries({
  consideredEntries,
  policyDefinitions,
  tournamentRecord,
  appliedPolicies,
  enforceGender,
  participants,
  event,
}: CheckValidEntriesArgs) {
  participants = participants || tournamentRecord?.participants;

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
  const participantType =
    (eventType === TEAM_EVENT && TEAM) ||
    (eventType === DOUBLES_EVENT && PAIR) ||
    INDIVIDUAL;

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

    // TODO: implement gender checking for teams & pairs
    const personGender = participant?.person?.sex as unknown;
    const wrongGender =
      genderEnforced &&
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

  return { ...SUCCESS, valid: true };
}

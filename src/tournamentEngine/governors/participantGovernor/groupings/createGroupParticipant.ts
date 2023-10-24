import { getParticipants } from '../../../getters/participants/getParticipants';
import { addNotice, getTopics } from '../../../../global/state/globalState';
import { definedAttributes } from '../../../../utilities/objects';
import { makeDeepCopy, UUID } from '../../../../utilities';
import { addParticipant } from '../addParticipants';

import { GROUP, INDIVIDUAL } from '../../../../constants/participantConstants';
import { ADD_PARTICIPANTS } from '../../../../constants/topicConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import { OTHER } from '../../../../constants/participantRoles';
import {
  ErrorType,
  INVALID_PARTICIPANT_TYPE,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../../constants/errorConditionConstants';

import {
  Participant,
  Tournament,
} from '../../../../types/tournamentFromSchema';

type CreateGroupParticipantType = {
  participantRoleResponsibilities?: string[];
  individualParticipantIds: string[];
  tournamentRecord: Tournament;
  participantRole?: string;
  participantId: string;
  groupName: string;
};

export function createGroupParticipant({
  individualParticipantIds = [],
  participantRoleResponsibilities,
  participantRole = OTHER,
  tournamentRecord,
  participantId,
  groupName,
}: CreateGroupParticipantType): {
  participant?: Participant;
  participantId?: string;
  success?: boolean;
  error?: ErrorType;
  info?: any;
} {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!groupName) return { error: MISSING_VALUE, info: 'Missing groupName' };
  if (!Array.isArray(individualParticipantIds))
    return {
      info: 'Invalid individualParticipantIds',
      error: INVALID_VALUES,
    };

  const participants =
    getParticipants({
      participantFilters: { participantTypes: [INDIVIDUAL] },
      tournamentRecord,
    }).participants ?? [];
  const tournamentIndividualParticipantIds = participants.map(
    (participant) => participant.participantId
  );

  for (const participantId of individualParticipantIds) {
    if (!tournamentIndividualParticipantIds.includes(participantId)) {
      return { error: INVALID_PARTICIPANT_TYPE, participantId };
    }
  }

  const groupParticipant = definedAttributes({
    participantId: participantId || UUID(),
    participantRoleResponsibilities,
    participantName: groupName,
    individualParticipantIds,
    participantType: GROUP,
    participantRole,
  });

  const result = addParticipant({
    participant: groupParticipant,
    tournamentRecord,
  });
  if (result.error) return result;

  const { topics } = getTopics();
  if (topics.includes(ADD_PARTICIPANTS)) {
    addNotice({
      topic: ADD_PARTICIPANTS,
      payload: {
        tournamentId: tournamentRecord.tournamentId,
        participants: [groupParticipant],
      },
    });
  }

  return { ...SUCCESS, participant: makeDeepCopy(groupParticipant) };
}

import { getTournamentParticipants } from '../../../getters/participants/getTournamentParticipants';
import { addNotice, getTopics } from '../../../../global/state/globalState';
import { definedAttributes } from '../../../../utilities/objects';
import { makeDeepCopy, UUID } from '../../../../utilities';
import { addParticipant } from '../addParticipants';

import { GROUP, INDIVIDUAL } from '../../../../constants/participantConstants';
import { ADD_PARTICIPANTS } from '../../../../constants/topicConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import { OTHER } from '../../../../constants/participantRoles';
import {
  INVALID_PARTICIPANT_TYPE,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../../constants/errorConditionConstants';

/*
import { Tournament } from '../../../../types/tournamentFromSchema';

type createGroupParticipantType = {
  participantRoleResponsibilities?: string[];
  individualParticipantIds: string[];
  tournamentRecord: Tournament;
  participantRole?: string;
  participantId: string;
  groupName: string;
};
*/

export function createGroupParticipant({
  individualParticipantIds = [],
  participantRoleResponsibilities,
  participantRole = OTHER,
  tournamentRecord,
  participantId,
  groupName,
}) {
  // }: createGroupParticipantType) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!groupName) return { error: MISSING_VALUE, info: 'Missing groupName' };
  if (!Array.isArray(individualParticipantIds))
    return {
      info: 'Invalid individualParticipantIds',
      error: INVALID_VALUES,
    };

  const { tournamentParticipants } = getTournamentParticipants({
    participantFilters: { participantTypes: [INDIVIDUAL] },
    tournamentRecord,
  });
  const tournamentIndividualParticipantIds = tournamentParticipants.map(
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

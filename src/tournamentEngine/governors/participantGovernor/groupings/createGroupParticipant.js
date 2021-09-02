import { getTournamentParticipants } from '../../../getters/participants/getTournamentParticipants';
import { addNotice, getTopics } from '../../../../global/globalState';
import { definedAttributes } from '../../../../utilities/objects';
import { makeDeepCopy, UUID } from '../../../../utilities';
import { addParticipant } from '../addParticipants';

import { GROUP, INDIVIDUAL } from '../../../../constants/participantTypes';
import { ADD_PARTICIPANTS } from '../../../../constants/topicConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import { OTHER } from '../../../../constants/participantRoles';
import {
  INVALID_PARTICIPANT_TYPE,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../../constants/errorConditionConstants';

// TODO: integrity check to ensure that participantIds to add are participantType: INDIVIDUAL
// would require that tournamentRecord be loaded in tournamentEngine

export function createGroupParticipant({
  tournamentRecord,
  participantId,
  individualParticipantIds = [],
  participantRoleResponsibilities,
  participantRole = OTHER,
  groupName,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!groupName) return { error: MISSING_VALUE, message: 'Missing groupName' };
  if (!Array.isArray(individualParticipantIds))
    return {
      error: INVALID_VALUES,
      message: 'Invalid individualParticipantIds',
    };

  const { tournamentParticipants } = getTournamentParticipants({
    tournamentRecord,
    participantFilters: { participantTypes: [INDIVIDUAL] },
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
    participantType: GROUP,
    participantRole,
    participantName: groupName,
    individualParticipantIds,
    participantRoleResponsibilities,
  });

  const result = addParticipant({
    tournamentRecord,
    participant: groupParticipant,
  });
  if (result.error) return result;

  const { topics } = getTopics();
  if (topics.includes(ADD_PARTICIPANTS)) {
    addNotice({
      topic: ADD_PARTICIPANTS,
      payload: { participants: [groupParticipant] },
    });
  }

  return { ...SUCCESS, participant: makeDeepCopy(groupParticipant) };
}

import { getTournamentParticipants } from '../../../getters/participants/getTournamentParticipants';
import { makeDeepCopy, UUID } from '../../../../utilities';
import { addParticipant } from '../addParticipants';

import { OTHER } from '../../../../constants/participantRoles';
import { GROUP, INDIVIDUAL } from '../../../../constants/participantTypes';
import {
  INVALID_PARTICIPANT_TYPE,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

// TODO: integrity check to insure that participantIds to add are participantType: INDIVIDUAL
// would require that tournamentRecord be loaded in tournamentEngine

export function createGroupParticipant({
  tournamentRecord,
  groupName,
  participantId,
  individualParticipantIds = [],
  participantRole = OTHER,
  devContext,
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

  const errors = [];
  individualParticipantIds.forEach((participantId) => {
    if (!tournamentIndividualParticipantIds.includes(participantId)) {
      errors.push({ error: INVALID_PARTICIPANT_TYPE, participantId });
    }
  });

  if (errors.length) return { error: errors };

  const groupParticipant = {
    participantId: participantId || UUID(),
    participantType: GROUP,
    participantRole,
    participantName: groupName,
    name: groupName, // for backwards compatability
    individualParticipantIds,
  };

  const result = addParticipant({
    tournamentRecord,
    participant: groupParticipant,
    devContext,
  });
  if (result.error) return result;

  if (devContext) {
    return Object.assign({}, SUCCESS, {
      participant: makeDeepCopy(groupParticipant),
    });
  } else {
    return SUCCESS;
  }
}

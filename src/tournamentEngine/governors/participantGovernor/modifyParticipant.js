import { findTournamentParticipant } from '../../getters/participants/participantGetter';

import {
  MISSING_PARTICIPANT,
  MISSING_TOURNAMENT_RECORD,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { addParticipant } from './addParticipants';
import {
  INDIVIDUAL,
  participantTypes,
} from '../../../constants/participantTypes';
import { participantRoles } from '../../../constants/participantRoles';
import { tournament } from '../../tests/integration/setStateGetState/tournament';
import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';

export function modifyParticipant({ tournamentRecord, participant }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participant) return { error: MISSING_PARTICIPANT };

  if (!participant.participantId)
    return addParticipant({ tournamentRecord, participant });

  const { participant: existingParticipant } = findTournamentParticipant({
    tournamentRecord,
    participantId: participant.participantId,
  });
  if (!participant) return { error: PARTICIPANT_NOT_FOUND };

  // validate new participant attributes
  const {
    participantName,
    onlineProfiles, // TODO: validate onlineProfiles
    individualParticipantIds,
    participantRole,
    participantType,
  } = participant;

  const newValues = {};
  if (onlineProfiles) newValues.onlineProfiles = onlineProfiles;
  if (participantName && typeof participantName === 'string')
    newValues.participantName = participantName;
  if (Array.isArray(individualParticipantIds)) {
    const { participants } = getTournamentParticipants({
      tournament,
      participantFilters: { participantTypes: [INDIVIDUAL] },
    });
    const allIndividualParticipantIds = participants.map(
      ({ participantId }) => participantId
    );
    newValues.individualParticipantIds = individualParticipantIds.filter(
      (participantId) =>
        typeof participantId === 'string' &&
        allIndividualParticipantIds.includes(participantId)
    );
  }
  if (participantRoles.includes(participantRole))
    newValues.participantRole = participantRole;
  if (participantTypes.includes(participantType))
    newValues.participantType = participantType;

  Object.assign(existingParticipant, newValues);

  return SUCCESS;
}

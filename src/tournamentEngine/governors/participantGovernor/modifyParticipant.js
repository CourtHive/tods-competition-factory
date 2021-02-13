import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { findTournamentParticipant } from '../../getters/participants/participantGetter';
import { addIndividualParticipantIds } from './groupings/addIndividualParticipantIds';
import { tournament } from '../../tests/integration/setStateGetState/tournament';
import { addParticipant } from './addParticipants';

import {
  MISSING_PARTICIPANT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { participantTypes } from '../../../constants/participantTypes';
import { participantRoles } from '../../../constants/participantRoles';
import { genderConstants } from '../../../constants/genderConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function modifyParticipant({
  tournamentRecord,
  participant,
  groupingParticipantId,
  removeFromOtherTeams,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participant) return { error: MISSING_PARTICIPANT };

  if (!participant.participantId)
    return addParticipant({ tournamentRecord, participant });

  const { participant: existingParticipant } = findTournamentParticipant({
    tournamentRecord,
    participantId: participant.participantId,
  });

  if (!existingParticipant)
    return addParticipant({ tournamentRecord, participant });

  const {
    participantName,
    onlineProfiles, // TODO: validate onlineProfiles
    individualParticipantIds,
    participantRole,
    participantType,
    person,
  } = participant;

  const newValues = {};
  // validate participant attributes
  if (onlineProfiles) newValues.onlineProfiles = onlineProfiles;
  if (participantName && typeof participantName === 'string')
    newValues.participantName = participantName;
  if (Array.isArray(individualParticipantIds)) {
    const { participants } = getTournamentParticipants({
      tournament,
      participantFilters: { participantTypes: [participantTypes.INDIVIDUAL] },
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
  if (Object.keys(participantRoles).includes(participantRole))
    newValues.participantRole = participantRole;
  if (Object.keys(participantTypes).includes(participantType))
    newValues.participantType = participantType;

  if (
    existingParticipant.participantType === participantTypes.INDIVIDUAL &&
    person
  ) {
    const newPersonValues = {};
    const {
      sex,
      nationalityCode,
      standardFamilyName,
      standardGivenName,
    } = person;
    if (sex && Object.keys(genderConstants).includes(sex))
      newPersonValues.sex = sex;
    if (
      nationalityCode &&
      typeof nationalityCode === 'string' &&
      nationalityCode.length < 4
    )
      newPersonValues.nationalityCode = nationalityCode;
    if (
      standardFamilyName &&
      typeof standardFamilyName === 'string' &&
      standardFamilyName.length > 1
    )
      newPersonValues.standardFamilyName = standardFamilyName;
    if (
      standardGivenName &&
      typeof standardGivenName === 'string' &&
      standardGivenName.length > 1
    )
      newPersonValues.standardGivenName = standardGivenName;
    Object.assign(existingParticipant.person, newPersonValues);
  }

  Object.assign(existingParticipant, newValues);

  if (groupingParticipantId) {
    const result = addIndividualParticipantIds({
      tournamentRecord,
      groupingParticipantId,
      individualParticipantIds: [existingParticipant.participantId],
      removeFromOtherTeams,
    });
    console.log({ result });
  }

  return SUCCESS;
}

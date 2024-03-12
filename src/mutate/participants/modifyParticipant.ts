import { findTournamentParticipant } from '@Acquire/findTournamentParticipant';
import { addIndividualParticipantIds } from './addIndividualParticipantIds';
import { getParticipants } from '@Query/participants/getParticipants';
import { getParticipantId } from '@Functions/global/extractors';
import { definedAttributes } from '@Tools/definedAttributes';
import { participantRoles } from '@Constants/participantRoles';
import { genderConstants } from '@Constants/genderConstants';
import { addNotice } from '@Global/state/globalState';
import { isValidDateString } from '@Tools/dateTime';
import { makeDeepCopy } from '@Tools/makeDeepCopy';
import { countries } from '@Fixtures/countryData';
import { addParticipant } from './addParticipant';
import { isString } from '@Tools/objects';

// constants
import { GROUP, INDIVIDUAL, PAIR, participantTypes } from '@Constants/participantConstants';
import { MODIFY_PARTICIPANTS } from '@Constants/topicConstants';
import { SUCCESS } from '@Constants/resultConstants';
import { TEAM } from '@Constants/matchUpTypes';
import {
  CANNOT_MODIFY_PARTICIPANT_TYPE,
  MISSING_PARTICIPANT,
  MISSING_TOURNAMENT_RECORD,
} from '@Constants/errorConditionConstants';

export function modifyParticipant(params) {
  const {
    updateParticipantName = true,
    groupingParticipantId,
    removeFromOtherTeams,
    tournamentRecord,
    pairOverride,
    participant,
  } = params;
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participant) return { error: MISSING_PARTICIPANT };

  if (!participant.participantId) return addParticipant({ tournamentRecord, participant });

  const { participant: existingParticipant } = findTournamentParticipant({
    participantId: participant.participantId,
    tournamentRecord,
  });

  if (!existingParticipant) return addParticipant({ tournamentRecord, participant });

  const {
    participantRoleResponsibilties,
    individualParticipantIds,
    participantOtherName,
    participantName,
    participantRole,
    participantType,
    onlineResources, // TODO: validate onlineResources
    contacts, // TODO: validate contacts
    person,
  } = participant;

  if (participantType && existingParticipant.participantType !== participantType)
    return { error: CANNOT_MODIFY_PARTICIPANT_TYPE };

  const newValues: any = {};

  // validate participant attributes
  if (contacts) newValues.contacts = contacts;
  if (onlineResources) newValues.onlineResources = onlineResources;

  if (participantOtherName && isString(participantOtherName)) newValues.participantOtherName = participantOtherName;
  if (participantName && isString(participantName)) newValues.participantName = participantName;

  if (Array.isArray(individualParticipantIds)) {
    const { participants: individualParticipants } = getParticipants({
      participantFilters: { participantTypes: [INDIVIDUAL] },
      tournamentRecord,
    });
    const allIndividualParticipantIds = individualParticipants?.map(getParticipantId);

    if (allIndividualParticipantIds) {
      // check that all new individualParticipantIds exist and are { participantType: INDIVIDUAL }
      const updatedIndividualParticipantIds = individualParticipantIds.filter(
        (participantId) => isString(participantId) && allIndividualParticipantIds.includes(participantId),
      );

      if (
        [GROUP, TEAM].includes(participantType || existingParticipant.participantType) ||
        (participantType === PAIR && (updatedIndividualParticipantIds.length === 2 || pairOverride))
      ) {
        newValues.individualParticipantIds = updatedIndividualParticipantIds;
      }

      // check whether to update PAIR participantName
      if (existingParticipant.participantType === participantTypes.PAIR && updateParticipantName) {
        newValues.participantName = generatePairParticipantName({
          individualParticipants,
          newValues,
        });
      }
    }
  }
  if (Object.keys(participantRoles).includes(participantRole)) newValues.participantRole = participantRole;
  if (Object.keys(participantTypes).includes(participantType)) newValues.participantType = participantType;

  if (Array.isArray(participantRoleResponsibilties))
    newValues.participantRoleResponsibilties = participantRoleResponsibilties;

  if (existingParticipant.participantType === participantTypes.INDIVIDUAL && person) {
    updatePerson({
      updateParticipantName,
      existingParticipant,
      newValues,
      person,
    });
  }

  Object.assign(existingParticipant, definedAttributes(newValues));

  if (groupingParticipantId) {
    addIndividualParticipantIds({
      individualParticipantIds: [existingParticipant.participantId],
      groupingParticipantId,
      removeFromOtherTeams,
      tournamentRecord,
    });
  }

  addNotice({
    topic: MODIFY_PARTICIPANTS,
    payload: {
      tournamentId: tournamentRecord.tournamentId,
      participants: [existingParticipant],
    },
  });

  return {
    participant: makeDeepCopy(existingParticipant),
    ...SUCCESS,
  };
}

function generatePairParticipantName({ individualParticipants, newValues }) {
  const individualParticipantIds = newValues.individualParticipantIds;
  let participantName = individualParticipants
    .filter(({ participantId }) => individualParticipantIds.includes(participantId))
    .map(({ person }) => person?.standardFamilyName)
    .filter(Boolean)
    .sort()
    .join('/');

  if (individualParticipantIds.length === 1) participantName += '/Unknown';
  return participantName;
}

function updatePerson({ updateParticipantName, existingParticipant, newValues, person }) {
  const newPersonValues: any = {};
  const { standardFamilyName, standardGivenName, nationalityCode, personId, birthdate, tennisId, sex } = person;
  if (sex && Object.keys(genderConstants).includes(sex)) newPersonValues.sex = sex;

  let personNameModified;
  if (isString(personId)) newPersonValues.personId = personId;

  if (
    nationalityCode &&
    isString(nationalityCode) &&
    (validNationalityCode(nationalityCode) || nationalityCode === '') // empty string to remove value
  ) {
    newPersonValues.nationalityCode = nationalityCode;
  }

  if (standardFamilyName && typeof isString(standardFamilyName) && standardFamilyName.length > 1) {
    newPersonValues.standardFamilyName = standardFamilyName;
    personNameModified = true;
  }

  if (standardGivenName && typeof isString(standardGivenName) && standardGivenName.length > 1) {
    newPersonValues.standardGivenName = standardGivenName;
    personNameModified = true;
  }

  if (personNameModified && updateParticipantName) {
    const participantName = `${newPersonValues.standardGivenName} ${newPersonValues.standardFamilyName}`;
    newValues.participantName = participantName;
  }

  if (birthdate && isValidDateString(birthdate)) {
    // TODO: validate that birthdate is not in the future
    // TODO: validate that birthdate is valid for event categories where participant is entered
    // TODO: validate that birthdate is valid for all tournamentCategories
    newPersonValues.birthdate = birthdate;
  }

  if (tennisId && isString(tennisId)) {
    // TODO: validate format of the tennisId
    newPersonValues.tennisId = tennisId;
  }

  Object.assign(existingParticipant.person, newPersonValues);
}

export function validNationalityCode(code) {
  return countries
    .flatMap(({ iso, ioc }) => [iso, ioc])
    .filter(Boolean)
    .includes(code);
}

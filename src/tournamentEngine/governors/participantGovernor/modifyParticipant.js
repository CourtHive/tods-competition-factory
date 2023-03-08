import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { findTournamentParticipant } from '../../getters/participants/participantGetter';
import { addIndividualParticipantIds } from './groupings/addIndividualParticipantIds';
import { getParticipantId } from '../../../global/functions/extractors';
import { participantRoles } from '../../../constants/participantRoles';
import { genderConstants } from '../../../constants/genderConstants';
import { definedAttributes } from '../../../utilities/objects';
import { addNotice } from '../../../global/state/globalState';
import { addParticipant } from './addParticipants';
import { makeDeepCopy } from '../../../utilities';

import { MODIFY_PARTICIPANTS } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  MISSING_PARTICIPANT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import {
  GROUP,
  PAIR,
  participantTypes,
} from '../../../constants/participantConstants';

export function modifyParticipant({
  updateParticipantName = true,
  groupingParticipantId,
  removeFromOtherTeams,
  tournamentRecord,
  pairOverride,
  participant,
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

  const newValues = {};

  // validate participant attributes
  if (contacts) newValues.contacts = contacts;
  if (onlineResources) newValues.onlineResources = onlineResources;

  if (participantName && typeof participantName === 'string')
    newValues.participantName = participantName;
  if (participantOtherName && typeof participantOtherName === 'string')
    newValues.participantOtherName = participantOtherName;

  if (Array.isArray(individualParticipantIds)) {
    const { tournamentParticipants: individualParticipants } =
      getTournamentParticipants({
        tournamentRecord,
        participantFilters: { participantTypes: [participantTypes.INDIVIDUAL] },
      });
    const allIndividualParticipantIds =
      individualParticipants?.map(getParticipantId);

    if (allIndividualParticipantIds) {
      // check that all new individualParticipantIds exist and are { participantType: INDIVIDUAL }
      const updatedIndividualParticipantIds = individualParticipantIds.filter(
        (participantId) =>
          typeof participantId === 'string' &&
          allIndividualParticipantIds.includes(participantId)
      );

      if (
        [GROUP, TEAM].includes(participantType) ||
        (participantType === PAIR &&
          (updatedIndividualParticipantIds.length === 2 || pairOverride))
      ) {
        newValues.individualParticipantIds = updatedIndividualParticipantIds;
      }

      // check whether to update PAIR participantName
      if (
        existingParticipant.participantType === participantTypes.PAIR &&
        updateParticipantName
      ) {
        newValues.participantName = generatePairParticipantName({
          individualParticipants,
          newValues,
        });
      }
    }
  }
  if (Object.keys(participantRoles).includes(participantRole))
    newValues.participantRole = participantRole;
  if (Object.keys(participantTypes).includes(participantType))
    newValues.participantType = participantType;

  if (Array.isArray(participantRoleResponsibilties))
    newValues.participantRoleResponsibilties = participantRoleResponsibilties;

  if (
    existingParticipant.participantType === participantTypes.INDIVIDUAL &&
    person
  ) {
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
      tournamentRecord,
      groupingParticipantId,
      individualParticipantIds: [existingParticipant.participantId],
      removeFromOtherTeams,
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
    ...SUCCESS,
    participant: makeDeepCopy(existingParticipant),
  };
}

function generatePairParticipantName({ individualParticipants, newValues }) {
  const individualParticipantIds = newValues.individualParticipantIds;
  let participantName = individualParticipants
    .filter(({ participantId }) =>
      individualParticipantIds.includes(participantId)
    )
    .map(({ person }) => person?.standardFamilyName)
    .filter(Boolean)
    .sort()
    .join('/');

  if (individualParticipantIds.length === 1) participantName += '/Unknown';
  return participantName;
}

function updatePerson({
  updateParticipantName,
  existingParticipant,
  newValues,
  person,
}) {
  const newPersonValues = {};
  const {
    sex,
    personId,
    nationalityCode,
    standardFamilyName,
    standardGivenName,
  } = person;
  if (sex && Object.keys(genderConstants).includes(sex))
    newPersonValues.sex = sex;

  let personNameModified;
  if (personId && typeof personId === 'string') {
    newPersonValues.personId = personId;
  }
  if (
    nationalityCode &&
    typeof nationalityCode === 'string' &&
    nationalityCode.length < 4
  ) {
    newPersonValues.nationalityCode = nationalityCode;
  }
  if (
    standardFamilyName &&
    typeof standardFamilyName === 'string' &&
    standardFamilyName.length > 1
  ) {
    newPersonValues.standardFamilyName = standardFamilyName;
    personNameModified = true;
  }

  if (
    standardGivenName &&
    typeof standardGivenName === 'string' &&
    standardGivenName.length > 1
  ) {
    newPersonValues.standardGivenName = standardGivenName;
    personNameModified = true;
  }

  if (personNameModified && updateParticipantName) {
    const participantName = `${newPersonValues.standardGivenName} ${newPersonValues.standardFamilyName}`;
    newValues.participantName = participantName;
  }
  Object.assign(existingParticipant.person, newPersonValues);
}

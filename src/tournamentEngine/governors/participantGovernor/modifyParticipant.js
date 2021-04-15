import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { findTournamentParticipant } from '../../getters/participants/participantGetter';
import { addIndividualParticipantIds } from './groupings/addIndividualParticipantIds';
import {
  GROUP,
  PAIR,
  participantTypes,
} from '../../../constants/participantTypes';
import { addNotice, getDevContext } from '../../../global/globalState';
import { participantRoles } from '../../../constants/participantRoles';
import { genderConstants } from '../../../constants/genderConstants';
import { addParticipant } from './addParticipants';
import { makeDeepCopy } from '../../../utilities';

import {
  MISSING_PARTICIPANT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { TEAM } from '../../../constants/matchUpTypes';
import { MODIFY_PARTICIPANTS } from '../../../constants/topicConstants';

export function modifyParticipant({
  tournamentRecord,
  groupingParticipantId,
  removeFromOtherTeams,
  updateParticipantName = true,
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
    const {
      tournamentParticipants: individualParticipants,
    } = getTournamentParticipants({
      tournamentRecord,
      participantFilters: { participantTypes: [participantTypes.INDIVIDUAL] },
    });
    const allIndividualParticipantIds = individualParticipants?.map(
      ({ participantId }) => participantId
    );
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
          updatedIndividualParticipantIds.length === 2)
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

  Object.assign(existingParticipant, newValues);

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
    payload: { participants: [existingParticipant] },
  });

  if (getDevContext()) {
    return Object.assign({}, SUCCESS, {
      participant: makeDeepCopy(existingParticipant),
    });
  }

  return SUCCESS;
}

function generatePairParticipantName({ individualParticipants, newValues }) {
  const individualParticipantIds = newValues.individualParticipantIds;
  return individualParticipants
    .filter(({ participantId }) =>
      individualParticipantIds.includes(participantId)
    )
    .map(({ person }) => person?.standardFamilyName)
    .filter((f) => f)
    .sort()
    .join('/');
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

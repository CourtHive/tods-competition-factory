import { addParticipantsToGrouping } from './participantGroupings';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  GROUP,
  INDIVIDUAL,
  PAIR,
  TEAM,
} from '../../../constants/participantTypes';
import {
  INVALID_PARTICIPANT_IDS,
  INVALID_PARTICIPANT_TYPE,
  MISSING_PARTICIPANT_ROLE,
  MISSING_PARTICIPANT_IDS,
  MISSING_PERSON_DETAILS,
  MISSING_TOURNAMENT_RECORD,
  PARTICIPANT_ID_EXISTS,
  MISSING_PARTICIPANT,
} from '../../../constants/errorConditionConstants';
import { makeDeepCopy, UUID } from '../../../utilities';

export function addParticipant({ tournamentRecord, participant }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participant) return { error: MISSING_PARTICIPANT };
  if (!participant.participantId) participant.participantId = UUID();
  const { participantId } = participant;

  if (!tournamentRecord.participants) tournamentRecord.participants = [];
  const idExists = tournamentRecord.participants.reduce(
    (p, c) => c.participant === participantId || p,
    false
  );
  if (idExists) return { error: PARTICIPANT_ID_EXISTS };

  const { participantType, participantRole } = participant;
  if (![PAIR, TEAM, INDIVIDUAL].includes(participantType))
    return { error: INVALID_PARTICIPANT_TYPE };

  if (!participantRole) return { error: MISSING_PARTICIPANT_ROLE };

  if (participantType === PAIR) {
    const tournamentParticipants = tournamentRecord.participants || [];

    if (!participant.individualParticipantIds) {
      return { error: MISSING_PARTICIPANT_IDS };
    } else if (participant.individualParticipantIds.length > 2) {
      return { error: INVALID_PARTICIPANT_IDS };
    } else {
      const individualParticipantIds = tournamentParticipants
        .filter(participant => participant.participantType === INDIVIDUAL)
        .map(participant => participant.participantId);
      const validPairParticipants = participant.individualParticipantIds.reduce(
        (valid, participantId) =>
          individualParticipantIds.includes(participantId) && valid,
        true
      );
      if (!validPairParticipants) return { error: INVALID_PARTICIPANT_IDS };
    }

    if (!participant.name) {
      const individualParticipants = tournamentParticipants.filter(
        tournamentParticipant =>
          participant.individualParticipantIds.includes(
            tournamentParticipant.participantId
          )
      );
      participant.name = individualParticipants
        .map(participant => participant.person?.standardFamilyName)
        .filter(f => f)
        .join('/');
    }
  } else if (participantType === INDIVIDUAL) {
    if (
      !participant.person ||
      !participant.person.standardFamilyName ||
      !participant.person.standardGivenName
    )
      return { error: MISSING_PERSON_DETAILS };

    if (!participant.name) {
      participant.name = `${participant.person.standardFamilyName.toUpperCase()}, ${
        participant.person.standardGivenName
      }`;
    }
  }

  tournamentRecord.participants.push(participant);
  return Object.assign({}, SUCCESS, { participant: makeDeepCopy(participant) });
}

export function addParticipants({
  tournamentRecord,
  participants = [],
  source,
  teamId,
  groupId,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!tournamentRecord.participants) tournamentRecord.participants = [];
  const existingParticipantIds =
    tournamentRecord.participants?.map(p => p.participantId) || [];

  participants.forEach(participant => {
    if (!participant.participantId) participant.participantId = UUID();
  });
  const newParticipants = participants.filter(
    participant => !existingParticipantIds.includes(participant.participantId)
  );

  if (newParticipants.length) {
    tournamentRecord.participants = tournamentRecord.participants.concat(
      ...newParticipants
    );
    if (source !== undefined) participantSource({ tournamentRecord, source });
    if (teamId || groupId) {
      const groupingType = teamId ? TEAM : GROUP;
      const participantIds = newParticipants.map(np => np.participantId);
      addParticipantsToGrouping({
        groupingType,
        participantIds,
        tournamentRecord,
        groupingParticipantId: teamId || groupId,
        removeFromOtherTeams: true,
      });
    }
    return SUCCESS;
  } else {
    return { error: 'No new participants to add' };
  }
}

function participantSource({ tournamentRecord, source }) {
  if (!tournamentRecord.tournamentProfile)
    tournamentRecord.tournamentProfile = {};
  tournamentRecord.tournamentProfile.participantSource = source;
}

import { intersection } from '../../../utilities/arrays';
import { addNotice } from '../../../global/globalState';
import { makeDeepCopy, UUID } from '../../../utilities';

import { ADD_PARTICIPANTS } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INDIVIDUAL,
  PAIR,
  participantTypes,
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
  INVALID_VALUES,
  PARTICIPANT_NOT_FOUND,
  EXISTING_PARTICIPANT,
} from '../../../constants/errorConditionConstants';

export function addParticipant({
  tournamentRecord,
  participant,
  disableNotice,
  allowDuplicateParticipantIdPairs,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participant) return { error: MISSING_PARTICIPANT };
  if (!participant.participantId) participant.participantId = UUID();
  if (!tournamentRecord.participants) tournamentRecord.participants = [];

  const { participantId } = participant;

  const idExists = tournamentRecord.participants.reduce(
    (p, c) => c.participantId === participantId || p,
    false
  );
  if (idExists) return { error: PARTICIPANT_ID_EXISTS };

  const { participantType, participantRole } = participant;
  if (!Object.keys(participantTypes).includes(participantType))
    return { error: INVALID_PARTICIPANT_TYPE, participantType };

  if (!participantRole) return { error: MISSING_PARTICIPANT_ROLE };

  const tournamentParticipants = tournamentRecord.participants || [];
  const tournamentIndividualParticipantIds = tournamentParticipants
    .filter(
      (tournamentParticipant) =>
        tournamentParticipant.participantType === INDIVIDUAL
    )
    .map((individualParticipant) => individualParticipant.participantId);

  if (participantType === PAIR) {
    if (participant.person)
      return { error: INVALID_VALUES, person: participant.person };
    if (!participant.individualParticipantIds) {
      return { error: MISSING_PARTICIPANT_IDS };
    } else if (participant.individualParticipantIds.length !== 2) {
      return {
        error: INVALID_PARTICIPANT_IDS,
        message: 'PAIR must be 2 individualParticipantIds',
      };
    } else {
      const individualParticipantIds = tournamentParticipants
        .filter((participant) => participant.participantType === INDIVIDUAL)
        .map((participant) => participant.participantId);
      const validPairParticipants = participant.individualParticipantIds.reduce(
        (valid, participantId) =>
          individualParticipantIds.includes(participantId) && valid,
        true
      );
      if (!validPairParticipants) return { error: INVALID_PARTICIPANT_IDS };
    }

    const existingPairParticipants = tournamentParticipants
      .filter((participant) => participant.participantType === PAIR)
      .map((participant) => ({
        participant,
        individualParticipantIds: participant.individualParticipantIds,
      }));

    // determine whether a PAIR participant already exists
    const existingPairParticipant =
      participant.participantType === PAIR &&
      existingPairParticipants.find(
        (existingPairParticipant) =>
          intersection(
            existingPairParticipant.individualParticipantIds,
            participant.individualParticipantIds
          ).length === 2
      );

    if (existingPairParticipant) {
      if (!allowDuplicateParticipantIdPairs) {
        return {
          ...SUCCESS,
          participant: makeDeepCopy(existingPairParticipant.participant),
        };
      }
    }

    if (!participant.participantName) {
      const individualParticipants = tournamentParticipants.filter(
        (tournamentParticipant) =>
          participant.individualParticipantIds.includes(
            tournamentParticipant.participantId
          )
      );
      const participantName = individualParticipants
        .map((participant) => participant.person?.standardFamilyName)
        .filter(Boolean)
        .join('/');
      participant.participantName = participantName;
    }
  } else if (participantType === INDIVIDUAL) {
    if (
      !participant.person ||
      !participant.person.standardFamilyName ||
      !participant.person.standardGivenName
    )
      return { error: MISSING_PERSON_DETAILS };

    if (!participant.participantName) {
      const participantName = `${participant.person.standardFamilyName.toUpperCase()}, ${
        participant.person.standardGivenName
      }`;
      participant.participantName = participantName;
      participant.name = participantName; // backwards compatabilty
    }
  } else {
    if (participant.person)
      return { error: INVALID_VALUES, person: participant.person };

    const { individualParticipantIds } = participant;
    if (individualParticipantIds?.length) {
      for (const individualParticipantId of individualParticipantIds) {
        if (typeof individualParticipantId !== 'string') {
          return {
            error: INVALID_VALUES,
            participantId: individualParticipantId,
          };
        }
        if (
          !tournamentIndividualParticipantIds.includes(individualParticipantId)
        ) {
          return {
            error: PARTICIPANT_NOT_FOUND,
            participantId: individualParticipantId,
          };
        }
      }
    }
  }

  tournamentRecord.participants.push(participant);

  if (!disableNotice) {
    addNotice({
      topic: ADD_PARTICIPANTS,
      payload: { participants: [participant] },
    });
  }

  const result = {
    ...SUCCESS,
    participant: makeDeepCopy(participant),
  };
  return result;
}

export function addParticipants({
  tournamentRecord,
  participants = [],

  allowDuplicateParticipantIdPairs,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!tournamentRecord.participants) tournamentRecord.participants = [];
  const tournamentParticipants = tournamentRecord.participants;

  const existingParticipantIds =
    tournamentParticipants.map((p) => p.participantId) || [];

  participants.forEach((participant) => {
    if (!participant.participantId) participant.participantId = UUID();
  });

  const newParticipants = participants.filter(
    (participant) => !existingParticipantIds.includes(participant.participantId)
  );

  const notAdded = participants.filter((participant) =>
    existingParticipantIds.includes(participant.participantId)
  );

  const individualParticipants = newParticipants.filter(
    (participant) => participant.participantType === INDIVIDUAL
  );

  const groupedParticipants = newParticipants.filter(
    (participant) => participant.participantType !== INDIVIDUAL
  );

  // add individual participants first so that grouped participants which include them are valid
  const participantsToAdd = individualParticipants.concat(
    ...groupedParticipants
  );

  if (participantsToAdd.length) {
    const addedParticipants = [];

    for (const participant of participantsToAdd) {
      const result = addParticipant({
        tournamentRecord,
        participant,
        disableNotice: true,

        allowDuplicateParticipantIdPairs,
      });
      const { success, error, participant: addedParticipant } = result;
      if (success) addedParticipants.push(addedParticipant);
      if (error) return { error };
    }

    addNotice({
      topic: ADD_PARTICIPANTS,
      payload: { participants: addedParticipants },
    });
    const result = {
      ...SUCCESS,
      participants: makeDeepCopy(addedParticipants),
    };
    if (notAdded.length) {
      Object.assign(result, { notAdded, message: EXISTING_PARTICIPANT });
    }
    return result;
  } else {
    return {
      ...SUCCESS,
      message: 'No new participants to add',
    };
  }
}

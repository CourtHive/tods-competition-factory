import { decorateResult } from '../../../global/functions/decorateResult';
import { definedAttributes } from '../../../utilities/objects';
import { addNotice } from '../../../global/state/globalState';
import { intersection } from '../../../utilities/arrays';
import { makeDeepCopy, UUID } from '../../../utilities';

import { Participant, Tournament } from '../../../types/tournamentFromSchema';
import { ADD_PARTICIPANTS } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  GROUP,
  INDIVIDUAL,
  PAIR,
  participantTypes,
  TEAM,
} from '../../../constants/participantConstants';
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

type AddParticipantType = {
  allowDuplicateParticipantIdPairs?: boolean;
  returnParticipant?: boolean;
  tournamentRecord: Tournament;
  disableNotice?: boolean;
  pairOverride?: boolean;
  participant: any; // participantId may be missing and is added by the method
};

export function addParticipant({
  allowDuplicateParticipantIdPairs,
  returnParticipant,
  tournamentRecord,
  disableNotice,
  pairOverride,
  participant,
}: AddParticipantType) {
  const stack = 'addParticipant';

  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participant)
    return decorateResult({ result: { error: MISSING_PARTICIPANT }, stack });
  if (!participant.participantId) participant.participantId = UUID();
  if (!tournamentRecord.participants) tournamentRecord.participants = [];

  const { participantId, individualParticipantIds } = participant;

  const idExists = tournamentRecord.participants.reduce(
    (p, c) => c.participantId === participantId || p,
    false
  );
  if (idExists) return { error: PARTICIPANT_ID_EXISTS };

  const { participantType, participantRole } = participant;
  if (
    !participantType ||
    !Object.keys(participantTypes).includes(participantType)
  )
    return { error: INVALID_PARTICIPANT_TYPE, participantType };

  if (!participantRole) return { error: MISSING_PARTICIPANT_ROLE };

  const tournamentParticipants = tournamentRecord.participants || [];
  const tournamentIndividualParticipantIds = tournamentParticipants
    .filter(
      (tournamentParticipant) =>
        tournamentParticipant.participantType === INDIVIDUAL
    )
    .map((individualParticipant) => individualParticipant.participantId);

  if (participantType !== INDIVIDUAL && participant.person)
    return { error: INVALID_VALUES, person: participant.person };

  if (individualParticipantIds && !Array.isArray(individualParticipantIds))
    return { error: INVALID_VALUES, individualParticipantIds };

  if (participantType === PAIR) {
    if (participant.person)
      return { error: INVALID_VALUES, person: participant.person };
    if (!participant.individualParticipantIds) {
      return decorateResult({
        result: { error: MISSING_PARTICIPANT_IDS },
        stack,
      });
    } else if (
      participant.individualParticipantIds.length !== 2 &&
      !pairOverride
    ) {
      return decorateResult({
        result: {
          error: INVALID_PARTICIPANT_IDS,
          info: 'PAIR must be 2 individualParticipantIds',
        },
        stack,
      });
    } else {
      const individualParticipantIds = tournamentParticipants
        .filter((participant) => participant.participantType === INDIVIDUAL)
        .map((participant) => participant.participantId);

      if (!Array.isArray(participant.individualParticipantIds))
        return decorateResult({
          result: { error: INVALID_PARTICIPANT_IDS },
          stack,
        });

      const validPairParticipants = participant.individualParticipantIds.reduce(
        (valid, participantId) =>
          individualParticipantIds.includes(participantId) && valid,
        true
      );
      if (!validPairParticipants)
        return decorateResult({
          result: { error: INVALID_PARTICIPANT_IDS },
          stack,
        });
    }

    const existingPairParticipants = tournamentParticipants
      .filter((participant) => participant.participantType === PAIR)
      .map((participant) => ({
        individualParticipantIds: participant.individualParticipantIds,
        participant,
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

    if (existingPairParticipant && !allowDuplicateParticipantIdPairs) {
      return {
        ...SUCCESS,
        existingParticipant: true,
        participant:
          returnParticipant &&
          makeDeepCopy(existingPairParticipant.participant),
      };
    }

    if (!participant.participantName) {
      const individualParticipants = tournamentParticipants.filter(
        (tournamentParticipant) =>
          participant.individualParticipantIds?.includes(
            tournamentParticipant.participantId
          )
      );

      let participantName = individualParticipants
        .map((participant) => participant.person?.standardFamilyName)
        .filter(Boolean)
        .join('/');
      if (individualParticipants.length === 1) participantName += '/Unknown';

      participant.participantName = participantName;
    }
  } else if (participantType === INDIVIDUAL) {
    if (
      !participant.person?.standardFamilyName ||
      !participant.person?.standardGivenName
    )
      return { error: MISSING_PERSON_DETAILS };

    if (!participant.participantName) {
      const participantName = `${participant.person.standardFamilyName.toUpperCase()}, ${
        participant.person.standardGivenName
      }`;
      participant.participantName = participantName;
    }
  } else if (participantType && [TEAM, GROUP].includes(participantType)) {
    if (!individualParticipantIds) participant.individualParticipantIds = [];
    if (participant.individualParticipantIds?.length) {
      for (const individualParticipantId of participant.individualParticipantIds) {
        if (typeof individualParticipantId !== 'string') {
          return decorateResult({
            result: {
              participantId: individualParticipantId,
              error: INVALID_VALUES,
            },
            stack,
          });
        }
        if (
          !tournamentIndividualParticipantIds.includes(individualParticipantId)
        ) {
          return decorateResult({
            result: {
              participantId: individualParticipantId,
              error: PARTICIPANT_NOT_FOUND,
            },
            stack,
          });
        }
      }
    }
  } else {
    return { error: INVALID_PARTICIPANT_TYPE };
  }

  tournamentRecord.participants.push(participant);

  if (!disableNotice) {
    addNotice({
      payload: {
        tournamentId: tournamentRecord.tournamentId,
        participants: [participant],
      },
      topic: ADD_PARTICIPANTS,
    });
  }

  const result = {
    participant: returnParticipant && makeDeepCopy(participant),
    ...SUCCESS,
  };
  return definedAttributes(result);
}

type AddParticipantsType = {
  allowDuplicateParticipantIdPairs?: boolean;
  returnParticipants?: boolean;
  participants: Participant[];
  tournamentRecord: Tournament;
};

export function addParticipants({
  allowDuplicateParticipantIdPairs,
  returnParticipants,
  participants = [],
  tournamentRecord,
}: AddParticipantsType) {
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

  const addedParticipants: Participant[] = [];
  if (participantsToAdd.length) {
    for (const participant of participantsToAdd) {
      const result = addParticipant({
        allowDuplicateParticipantIdPairs,
        returnParticipant: true,
        disableNotice: true,
        tournamentRecord,
        participant,
      });
      if (result.error) return result;

      if (result.success && !result.existingParticipant)
        addedParticipants.push(result.participant);
    }

    if (addedParticipants.length) {
      addNotice({
        topic: ADD_PARTICIPANTS,
        payload: {
          tournamentId: tournamentRecord.tournamentId,
          participants: addedParticipants,
        },
      });
    }

    const result = {
      participants: returnParticipants && makeDeepCopy(addedParticipants),
      addedCount: addedParticipants.length,
      ...SUCCESS,
    };

    if (notAdded.length) {
      Object.assign(result, { notAdded, info: EXISTING_PARTICIPANT });
    }

    return definedAttributes(result);
  } else {
    return {
      info: 'No new participants to add',
      addedCount: 0,
      ...SUCCESS,
    };
  }
}

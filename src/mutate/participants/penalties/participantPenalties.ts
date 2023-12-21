import { getParticipants } from '../../../query/participants/getParticipants';
import { addNotice } from '../../../global/state/globalState';
import { addExtension } from '../../extensions/addExtension';
import { extractAttributes as xa } from '../../../utilities';

import penaltyTemplate from '../../../tournamentEngine/generators/penaltyTemplate';
import { ResultType } from '../../../global/functions/decorateResult';
import { MODIFY_PARTICIPANTS } from '../../../constants/topicConstants';
import { TournamentRecords } from '../../../types/factoryTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  PENALTY_NOT_FOUND,
  MISSING_PENALTY_ID,
  MISSING_PENALTY_TYPE,
  PARTICIPANT_NOT_FOUND,
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  NO_VALID_ATTRIBUTES,
  INVALID_VALUES,
  ErrorType,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../constants/errorConditionConstants';
import {
  Extension,
  Participant,
  Penalty,
  PenaltyTypeUnion,
  Tournament,
} from '../../../types/tournamentTypes';

type AddPenaltyArgs = {
  refereeParticipantId?: string;
  tournamentRecords?: TournamentRecords;
  tournamentRecord?: Tournament;
  penaltyType: PenaltyTypeUnion;
  participantIds: string[];
  extensions?: Extension[];
  penaltyCode: string;
  penaltyId?: string;
  matchUpId?: string;
  issuedAt?: string;
  notes?: string;
};

export function addPenalty(
  params: AddPenaltyArgs
): ResultType & { penaltyId?: string } {
  const { tournamentRecord, participantIds } = params;
  const tournamentRecords =
    params.tournamentRecords ??
    (tournamentRecord && {
      [tournamentRecord.tournamentId]: tournamentRecord,
    }) ??
    {};

  let penaltyId;
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const participants =
      getParticipants({
        tournamentRecord,
      }).participants ?? [];

    const tournamentParticipantIds = participants
      ?.map(xa('participantId'))
      .filter((participantId) => participantIds.includes(participantId));

    if (tournamentParticipantIds.length) {
      const result = penaltyAdd({
        ...params,
        penaltyId: params.penaltyId ?? penaltyId,
        tournamentRecord,
        participantIds: tournamentParticipantIds,
      });
      penaltyId = result.penaltyId;
    }
  }

  return penaltyId
    ? { ...SUCCESS, penaltyId }
    : { error: PARTICIPANT_NOT_FOUND };
}

export function penaltyAdd({
  refereeParticipantId,
  tournamentRecord,
  participantIds,
  penaltyCode,
  penaltyType,
  extensions,
  penaltyId,
  matchUpId,
  issuedAt,
  notes,
}: AddPenaltyArgs): {
  penaltyId?: string;
  success?: boolean;
  error?: ErrorType;
} {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantIds) return { error: MISSING_PARTICIPANT_ID };
  if (!penaltyType) return { error: MISSING_PENALTY_TYPE };

  // TODO: add penalty timeItem to matchUp.timeItems[]

  const participants = tournamentRecord?.participants ?? [];
  const relevantParticipants = participants.filter((participant) =>
    participantIds.includes(participant.participantId)
  );
  if (!relevantParticipants.length) return { error: PARTICIPANT_NOT_FOUND };

  const createdAt = new Date().toISOString();
  const penaltyItem: Penalty = Object.assign(penaltyTemplate({ penaltyId }), {
    refereeParticipantId,
    penaltyCode,
    penaltyType,
    matchUpId,
    notes,

    issuedAt,
    createdAt,
  });

  if (Array.isArray(extensions)) {
    extensions.forEach((extension) =>
      addExtension({ element: penaltyItem, extension })
    );
  }

  relevantParticipants.forEach((participant) => {
    if (!participant.penalties) participant.penalties = [];
    participant.penalties.push(penaltyItem);
  });

  addNotice({
    topic: MODIFY_PARTICIPANTS,
    payload: {
      tournamentId: tournamentRecord.tournamentId,
      participants: relevantParticipants,
    },
  });

  return { ...SUCCESS, penaltyId: penaltyItem.penaltyId };
}

export function removePenalty(params) {
  const { tournamentRecords } = params;
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = penaltyRemove({ ...params, tournamentRecord });
    if (result.error && result.error !== PENALTY_NOT_FOUND) return result;
  }

  return { ...SUCCESS };
}

type RemovePenaltyArgs = {
  tournamentRecord: Tournament;
  penaltyId: string;
};
export function penaltyRemove({
  tournamentRecord,
  penaltyId,
}: RemovePenaltyArgs): {
  error?: ErrorType;
  success?: boolean;
  penalty?: Penalty;
} {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!penaltyId) return { error: MISSING_PENALTY_ID };

  const participants = tournamentRecord?.participants ?? [];
  const modifiedParticipants: Participant[] = [];

  let penaltyRemoved = false;
  let removedPenalty;
  participants.forEach((participant) => {
    let participantModified = false;
    participant.penalties = (participant.penalties ?? []).filter((penalty) => {
      if (penalty.penaltyId === penaltyId) {
        participantModified = true;
        if (!penaltyRemoved) {
          removedPenalty = penalty;
          penaltyRemoved = true;
        }
      }
      if (participantModified) modifiedParticipants.push(participant);
      return penalty.penaltyId !== penaltyId;
    });
  });

  if (removedPenalty) {
    addNotice({
      topic: MODIFY_PARTICIPANTS,
      payload: {
        tournamentId: tournamentRecord.tournamentId,
        participants: modifiedParticipants,
      },
    });
  }

  return removedPenalty
    ? { ...SUCCESS, penalty: removedPenalty }
    : { error: PENALTY_NOT_FOUND };
}

type GetTournamentPenaltiesArgs = {
  tournamentRecord: Tournament;
};
export function getTournamentPenalties({
  tournamentRecord,
}: GetTournamentPenaltiesArgs): { error?: ErrorType; penalties?: Penalty[] } {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const participants = tournamentRecord?.participants ?? [];
  const allPenalties = participants.reduce((penalties, participant) => {
    const { participantId } = participant;
    (participant.penalties ?? []).forEach((penalty) => {
      const { penaltyId } = penalty || {};
      if (penalties[penaltyId]) {
        penalties[penaltyId].participants.push(participantId);
      } else {
        penalties[penaltyId] = {
          ...penalty,
          participantIds: [participantId],
        };
      }
    });
    return penalties;
  }, {});

  return { penalties: Object.values(allPenalties) };
}

export function modifyPenalty(params) {
  const { tournamentRecords } = params;
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = penaltyModify({ ...params, tournamentRecord });
    if (result.error && result.error !== PENALTY_NOT_FOUND) return result;
    if (result.success) return result;
  }

  return { error: PENALTY_NOT_FOUND };
}

type ModifyPenaltyArgs = {
  tournamentRecord: Tournament;
  modifications: { [key: string]: any };
  penaltyId;
  string;
};

export function penaltyModify({
  tournamentRecord,
  modifications,
  penaltyId,
}: ModifyPenaltyArgs): {
  modifications?: any;
  error?: ErrorType;
  success?: boolean;
  penalty?: Penalty;
} {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!modifications) return { error: INVALID_VALUES, modifications };
  if (!penaltyId) return { error: MISSING_PENALTY_ID };

  const participants = tournamentRecord?.participants ?? [];

  const validAttributes = Object.keys(penaltyTemplate()).filter(
    (attribute) => attribute !== 'penaltyId'
  );

  const validModificationAttributes = Object.keys(modifications).filter(
    (attribute) => validAttributes.includes(attribute)
  );

  if (!validModificationAttributes.length)
    return { error: NO_VALID_ATTRIBUTES };

  let updatedPenalty;
  const modifiedParticipants: Participant[] = [];
  participants.forEach((participant) => {
    let participantModified = false;
    participant.penalties = (participant.penalties ?? []).map((penalty) => {
      if (penalty.penaltyId === penaltyId) {
        participantModified = true;
        validModificationAttributes.forEach((attribute) =>
          Object.assign(penalty, { [attribute]: modifications[attribute] })
        );

        if (!updatedPenalty) updatedPenalty = penalty;
      }

      return penalty;
    });
    if (participantModified) modifiedParticipants.push(participant);
  });

  if (updatedPenalty) {
    addNotice({
      topic: MODIFY_PARTICIPANTS,
      payload: {
        tournamentId: tournamentRecord.tournamentId,
        participants: modifiedParticipants,
      },
    });
  }

  return updatedPenalty
    ? { ...SUCCESS, penalty: updatedPenalty }
    : { error: PENALTY_NOT_FOUND };
}

type GetCompetitionPenaltiesArgs = {
  tournamentRecords: TournamentRecords;
};
export function getCompetitionPenalties({
  tournamentRecords,
}: GetCompetitionPenaltiesArgs) {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const allPenalties: Penalty[] = [];
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { penalties } = getTournamentPenalties({ tournamentRecord });
    allPenalties.push(...(penalties ?? []));
  }

  return { penalties: allPenalties };
}

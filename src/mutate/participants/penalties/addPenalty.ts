import { getParticipants } from '../../../query/participants/getParticipants';
import { xa } from '../../../utilities/objects';
import { addNotice } from '../../../global/state/globalState';
import { addExtension } from '../../extensions/addExtension';

import penaltyTemplate from '../../../assemblies/generators/templates/penaltyTemplate';
import { MODIFY_PARTICIPANTS } from '../../../constants/topicConstants';
import { ResultType } from '../../../global/functions/decorateResult';
import { TournamentRecords } from '../../../types/factoryTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_PENALTY_TYPE,
  PARTICIPANT_NOT_FOUND,
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  ErrorType,
} from '../../../constants/errorConditionConstants';
import { Extension, Penalty, PenaltyTypeUnion, Tournament } from '../../../types/tournamentTypes';

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

export function addPenalty(params: AddPenaltyArgs): ResultType & { penaltyId?: string } {
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

  return penaltyId ? { ...SUCCESS, penaltyId } : { error: PARTICIPANT_NOT_FOUND };
}

function penaltyAdd({
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
  const relevantParticipants = participants.filter((participant) => participantIds.includes(participant.participantId));
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
    extensions.forEach((extension) => addExtension({ element: penaltyItem, extension }));
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

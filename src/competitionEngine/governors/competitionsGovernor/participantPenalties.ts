import { getTournamentParticipants } from '../../../tournamentEngine/getters/participants/getTournamentParticipants';
import { getParticipantIds } from '../../../global/functions/extractors';
import {
  getTournamentPenalties,
  addPenalty as penaltyAdd,
  modifyPenalty as penaltyModify,
  removePenalty as penaltyRemove,
} from '../../../tournamentEngine/governors/participantGovernor/participantPenalties';

import { TournamentRecords } from '../../../types/factoryTypes';
import {
  Extension,
  Penalty,
  PenaltyTypeEnum,
} from '../../../types/tournamentFromSchema';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORDS,
  PARTICIPANT_NOT_FOUND,
  PENALTY_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { ResultType } from '../../../global/functions/decorateResult';

type AddPenaltyArgs = {
  tournamentRecords: TournamentRecords;
  penaltyType: PenaltyTypeEnum;
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
  const { tournamentRecords, participantIds } = params;

  let penaltyId;
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { tournamentParticipants } = getTournamentParticipants({
      tournamentRecord,
    });

    const tournamentParticipantIds = getParticipantIds(
      tournamentParticipants
    ).filter((participantId) => participantIds.includes(participantId));

    if (tournamentParticipantIds.length) {
      const result = penaltyAdd({
        ...params,
        penaltyId: params.penaltyId || penaltyId,
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

export function modifyPenalty(params) {
  const { tournamentRecords } = params;
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = penaltyModify({ tournamentRecord, ...params });
    if (result.error && result.error !== PENALTY_NOT_FOUND) return result;
  }

  return { ...SUCCESS };
}

export function removePenalty(params) {
  const { tournamentRecords } = params;
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = penaltyRemove({ tournamentRecord, ...params });
    if (result.error && result.error !== PENALTY_NOT_FOUND) return result;
  }

  return { ...SUCCESS };
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
    allPenalties.push(...(penalties || []));
  }

  return { penalties: allPenalties };
}

import { getTournamentParticipants } from '../../../tournamentEngine/getters/participants/getTournamentParticipants';
import {
  getTournamentPenalties,
  addPenalty as penaltyAdd,
  modifyPenalty as penaltyModify,
  removePenalty as penaltyRemove,
} from '../../../tournamentEngine/governors/participantGovernor/participantPenalties';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORDS,
  PARTICIPANT_NOT_FOUND,
  PENALTY_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function addPenalty(params) {
  const { tournamentRecords, participantIds } = params;

  let penaltyId;
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { tournamentParticipants } = getTournamentParticipants({
      tournamentRecord,
    });

    const tournamentParticipantIds = tournamentParticipants
      .map(({ participantId }) => participantId)
      .filter((participantId) => participantIds.includes(participantId));

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

export function getCompetitionPenalties({ tournamentRecords }) {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const allPenalties = [];
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { penalties } = getTournamentPenalties({ tournamentRecord });
    allPenalties.push(...penalties);
  }

  return { penalties: allPenalties };
}

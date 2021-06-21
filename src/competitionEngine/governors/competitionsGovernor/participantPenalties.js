import {
  getTournamentPenalties,
  addPenalty as penaltyAdd,
  modifyPenalty as penaltyModify,
  removePenalty as penaltyRemove,
} from '../../../tournamentEngine/governors/participantGovernor/participantPenalties';
import { getTournamentParticipants } from '../../../tournamentEngine/getters/participants/getTournamentParticipants';

import {
  MISSING_TOURNAMENT_RECORDS,
  PARTICIPANT_NOT_FOUND,
  PENALTY_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function addPenalty(props) {
  const { tournamentRecords, participantIds } = props;
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

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
        ...props,
        penaltyId: props.penaltyId || penaltyId,
        tournamentRecord,
        participantIds: tournamentParticipantIds,
      });
      penaltyId = result.penaltyId;
    }
  }

  return penaltyId
    ? Object.assign({}, SUCCESS, { penaltyId })
    : { error: PARTICIPANT_NOT_FOUND };
}

export function modifyPenalty(props) {
  const { tournamentRecords } = props;
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  let error;
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = penaltyModify({ tournamentRecord, ...props });
    if (result.error && result.error !== PENALTY_NOT_FOUND)
      error = result.error;
  }

  return error ? { error } : SUCCESS;
}

export function removePenalty(props) {
  const { tournamentRecords } = props;
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  let error;
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = penaltyRemove({ tournamentRecord, ...props });
    if (result.error && result.error !== PENALTY_NOT_FOUND)
      error = result.error;
  }

  return error ? { error } : SUCCESS;
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

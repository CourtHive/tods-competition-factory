import {
  getTournamentPenalties,
  addPenalty as penaltyAdd,
  modifyPenalty as penaltyModify,
  removePenalty as penaltyRemove,
} from '../../../tournamentEngine/governors/participantGovernor/participantPenalties';

import {
  MISSING_TOURNAMENT_ID,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../constants/errorConditionConstants';

export function addPenalty(props) {
  const { tournamentRecord, error } = getTournamentRecord(props);
  if (error) return { error };
  penaltyAdd({ tournamentRecord, ...props });
}
export function modifyPenalty(props) {
  const { tournamentRecord, error } = getTournamentRecord(props);
  if (error) return { error };
  penaltyModify({ tournamentRecord, ...props });
}

export function removePenalty(props) {
  const { tournamentRecord, error } = getTournamentRecord(props);
  if (error) return { error };
  penaltyRemove({ tournamentRecord, ...props });
}

export function getCompetitionPenalties({ tournamentRecords }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

  const allPenalties = [];
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { penalties } = getTournamentPenalties({ tournamentRecord });
    allPenalties.push(...penalties);
  }

  return { penalties: allPenalties };
}

function getTournamentRecord({ tournamentRecords, tournamentId }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (typeof tournamentId !== 'string') return { error: MISSING_TOURNAMENT_ID };

  const tournamentRecord = tournamentRecords[tournamentId];
  return { tournamentRecord };
}

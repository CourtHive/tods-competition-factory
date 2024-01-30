import { getTournamentPenalties } from './getTournamentPenalties';

import { MISSING_TOURNAMENT_RECORDS } from '@Constants/errorConditionConstants';
import { TournamentRecords } from '../../types/factoryTypes';
import { Penalty } from '../../types/tournamentTypes';

type GetCompetitionPenaltiesArgs = {
  tournamentRecords: TournamentRecords;
};
export function getCompetitionPenalties({ tournamentRecords }: GetCompetitionPenaltiesArgs) {
  if (typeof tournamentRecords !== 'object' || !Object.keys(tournamentRecords).length)
    return { error: MISSING_TOURNAMENT_RECORDS };

  const allPenalties: Penalty[] = [];
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { penalties } = getTournamentPenalties({ tournamentRecord });
    allPenalties.push(...(penalties ?? []));
  }

  return { penalties: allPenalties };
}

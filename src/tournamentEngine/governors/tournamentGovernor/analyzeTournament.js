import { analyzeDraws } from './analysis/analyzeDraws';
import { checkIsDual } from './analysis/checkIsDual';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function analyzeTournament({ tournamentRecord }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const { drawsAnalysis } = analyzeDraws({ tournamentRecord });

  const analysis = {
    isDual: checkIsDual(tournamentRecord),
    drawsAnalysis,
  };

  return { ...SUCCESS, analysis };
}

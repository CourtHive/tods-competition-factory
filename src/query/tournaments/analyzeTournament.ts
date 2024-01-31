import { analyzeDraws } from './analyzeDraws';
import { checkIsDual } from './checkIsDual';

import { MISSING_TOURNAMENT_RECORD } from '@Constants/errorConditionConstants';
import { SUCCESS } from '@Constants/resultConstants';

export function analyzeTournament({ tournamentRecord }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const { drawsAnalysis } = analyzeDraws({ tournamentRecord });

  const analysis = {
    isDual: checkIsDual(tournamentRecord),
    drawsAnalysis,
  };

  return { ...SUCCESS, analysis };
}

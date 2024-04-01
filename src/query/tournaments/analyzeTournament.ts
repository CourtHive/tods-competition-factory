import { getParticipants } from '@Query/participants/getParticipants';
import { analyzeDraws } from '@Query/tournaments/analyzeDraws';
import { checkIsDual } from '@Query/tournaments/checkIsDual';

// constants
import { MISSING_TOURNAMENT_RECORD } from '@Constants/errorConditionConstants';
import { SUCCESS } from '@Constants/resultConstants';

export function analyzeTournament({ tournamentRecord }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const { drawsAnalysis } = analyzeDraws({ tournamentRecord });

  const analysis: any = {
    isDual: checkIsDual(tournamentRecord),
    drawsAnalysis,
  };

  const participantResult = getParticipants({ tournamentRecord });
  if (participantResult.missingParticipantIds?.length) {
    analysis.missingParticipantIds = participantResult.missingParticipantIds;
  }

  return { ...SUCCESS, analysis };
}

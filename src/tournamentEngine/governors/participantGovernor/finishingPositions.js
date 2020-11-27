import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';

export function finishingPositions({ tournamentRecord }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
}

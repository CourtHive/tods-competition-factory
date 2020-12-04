import {
  MISSING_COURT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter';

export function getScheduledCourtMatchUps({
  tournamentRecord,
  drawEngine,
  courtId,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!courtId) return { error: MISSING_COURT_ID };

  const { matchUps: tournamentMatchUps } = allTournamentMatchUps({
    tournamentRecord,
    drawEngine,
  });
  const matchUps = tournamentMatchUps.filter(m => !m);

  return { matchUps };
}

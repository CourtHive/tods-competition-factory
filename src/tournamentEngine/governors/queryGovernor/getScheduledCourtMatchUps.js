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
  const matchUps = getCourtMatchUps({ matchUps: tournamentMatchUps, courtId });

  return { matchUps };

  function getCourtMatchUps({ matchUps, courtId }) {
    return matchUps
      .filter(matchUp => matchUp.schedule?.courtId === courtId)
      .sort(
        (a, b) =>
          new Date(a.scheduledTime).getTime() -
          new Date(b.scheduledTime).getTime()
      );
  }
}

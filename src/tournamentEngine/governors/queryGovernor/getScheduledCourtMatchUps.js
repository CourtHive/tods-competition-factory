import { scheduledSortedMatchUps } from '../../../global/sorting/scheduledSortedMatchUps';
import { getSchedulingProfile } from '../scheduleGovernor/schedulingProfile';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter';

import {
  MISSING_COURT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function getScheduledCourtMatchUps({
  tournamentRecord,
  courtId,

  scheduleVisibilityFilters,
  matchUpFilters,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!courtId) return { error: MISSING_COURT_ID };

  const { schedulingProfile } = getSchedulingProfile({ tournamentRecord });

  const { matchUps: tournamentMatchUps } = allTournamentMatchUps({
    tournamentRecord,

    scheduleVisibilityFilters,
    matchUpFilters,
  });
  const matchUps = getCourtMatchUps({ matchUps: tournamentMatchUps, courtId });

  return { matchUps };

  function getCourtMatchUps({ matchUps, courtId }) {
    const courtMatchUps = matchUps.filter(
      (matchUp) => matchUp.schedule?.courtId === courtId
    );
    return scheduledSortedMatchUps({
      matchUps: courtMatchUps,
      schedulingProfile,
    });
  }
}

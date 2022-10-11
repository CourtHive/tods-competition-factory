import { scheduledSortedMatchUps } from '../../../global/sorting/scheduledSortedMatchUps';
import { getSchedulingProfile } from '../scheduleGovernor/schedulingProfile';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter';

import {
  MISSING_COURT_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VENUE_ID,
} from '../../../constants/errorConditionConstants';

export function getScheduledCourtMatchUps({
  scheduleVisibilityFilters,
  tournamentRecord,
  matchUpFilters,
  venueMatchUps,
  courtId,
}) {
  if (!tournamentRecord && !Array.isArray(venueMatchUps))
    return { error: MISSING_TOURNAMENT_RECORD };
  if (!courtId) return { error: MISSING_COURT_ID };

  const { schedulingProfile } = getSchedulingProfile({ tournamentRecord });

  if (Array.isArray(venueMatchUps))
    return { matchUps: getCourtMatchUps({ matchUps: venueMatchUps, courtId }) };

  const { matchUps: tournamentMatchUps } = allTournamentMatchUps({
    scheduleVisibilityFilters,
    tournamentRecord,
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

export function getScheduledVenueMatchUps({
  scheduleVisibilityFilters,
  tournamentRecord,
  matchUpFilters,
  venueId,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!venueId) return { error: MISSING_VENUE_ID };

  const { schedulingProfile } = getSchedulingProfile({ tournamentRecord });

  const { matchUps: tournamentMatchUps } = allTournamentMatchUps({
    scheduleVisibilityFilters,
    tournamentRecord,
    matchUpFilters,
  });
  const matchUps = getVenueMatchUps({ matchUps: tournamentMatchUps, venueId });

  return { matchUps };

  function getVenueMatchUps({ matchUps, venueId }) {
    const venueMatchUps = matchUps.filter(
      (matchUp) => matchUp.schedule?.venueId === venueId
    );
    return scheduledSortedMatchUps({
      matchUps: venueMatchUps,
      schedulingProfile,
    });
  }
}

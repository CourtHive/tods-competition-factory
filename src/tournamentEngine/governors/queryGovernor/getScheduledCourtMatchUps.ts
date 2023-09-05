import { scheduledSortedMatchUps } from '../../../global/sorting/scheduledSortedMatchUps';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter/matchUpsGetter';
import { getSchedulingProfile } from '../scheduleGovernor/schedulingProfile';

import { ScheduleVisibilityFilters } from '../../../types/factoryTypes';
import { ResultType } from '../../../global/functions/decorateResult';
import { Tournament } from '../../../types/tournamentFromSchema';
import { HydratedMatchUp } from '../../../types/hydrated';
import {
  MISSING_COURT_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VENUE_ID,
} from '../../../constants/errorConditionConstants';

type GetScheduledCourtMatchUpsArgs = {
  scheduleVisibilityFilters?: ScheduleVisibilityFilters;
  venueMatchUps?: HydratedMatchUp[];
  tournamentRecord: Tournament;
  matchUpFilters?: any;
  courtId: string;
};

export function getScheduledCourtMatchUps(
  params: GetScheduledCourtMatchUpsArgs
): ResultType & { matchUps?: HydratedMatchUp[] } {
  if (!params?.tournamentRecord && !Array.isArray(params?.venueMatchUps))
    return { error: MISSING_TOURNAMENT_RECORD };
  if (!params?.courtId) return { error: MISSING_COURT_ID };

  const {
    scheduleVisibilityFilters,
    tournamentRecord,
    matchUpFilters,
    venueMatchUps,
    courtId,
  } = params;

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
    const courtMatchUps = matchUps.filter((matchUp) => {
      // allocatedCourtIds only applies to TEAM matchUps
      const allocatedCourtIds = matchUp.schedule?.allocatedCourts?.map(
        ({ courtId }) => courtId
      );
      return (
        matchUp.schedule?.courtId === courtId ||
        allocatedCourtIds?.includes(courtId)
      );
    });
    return scheduledSortedMatchUps({
      matchUps: courtMatchUps,
      schedulingProfile,
    });
  }
}

type GetScheduledVenueMatchUpsArgs = {
  scheduleVisibilityFilters?: ScheduleVisibilityFilters;
  tournamentRecord: Tournament;
  matchUpFilters?: any;
  venueId: string;
};
export function getScheduledVenueMatchUps({
  scheduleVisibilityFilters,
  tournamentRecord,
  matchUpFilters,
  venueId,
}: GetScheduledVenueMatchUpsArgs) {
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
    const venueMatchUps = matchUps.filter((matchUp) => {
      // allocatedCourtIds only applies to TEAM matchUps
      const allocatedVenueIds = matchUp.schedule?.allocatedCourts?.map(
        ({ venueId }) => venueId
      );
      return (
        matchUp.schedule?.venueId === venueId ||
        allocatedVenueIds?.includes(venueId)
      );
    });
    return scheduledSortedMatchUps({
      matchUps: venueMatchUps,
      schedulingProfile,
    });
  }
}

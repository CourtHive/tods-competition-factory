import {
  MISSING_SCHEDULE,
  MISSING_MATCHUP_IDS,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter';
// import { addMatchUpScheduledTime } from './scheduleItems';

export function bulkScheduleMatchUps({
  tournamentRecord,
  drawEngine,
  matchUpIds,
  schedule,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpIds || !Array.isArray(matchUpIds))
    return { error: MISSING_MATCHUP_IDS };

  if (!schedule || typeof scheudle !== 'object')
    return { error: MISSING_SCHEDULE };

  const { time, venueId, scheduledDate, scheduledTime } = schedule;
  console.log({ time, venueId, scheduledDate, scheduledTime });
  const { matchUps } = allTournamentMatchUps({ tournamentRecord, drawEngine });
  matchUps.forEach((matchUp) => {
    if (matchUpIds.includes(matchUp.matchUpId)) {
      // first must find the drawDefinition
    }
  });

  return SUCCESS;
}

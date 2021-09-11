import { hasSchedule } from '../../../competitionEngine/governors/scheduleGovernor/scheduleMatchUps/hasSchedule';
import { completedMatchUpStatuses } from '../../../constants/matchUpStatusConstants';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter';
import { bulkScheduleMatchUps } from './bulkScheduleMatchUps';

import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function clearScheduledMatchUps({
  tournamentRecord,
  ignoreMatchUpStatuses = completedMatchUpStatuses,
  scheduleAttributes = ['scheduledDate', 'scheduledTime'],
}) {
  if (typeof tournamentRecord !== 'object')
    return { error: MISSING_TOURNAMENT_RECORD };

  if (!Array.isArray(ignoreMatchUpStatuses)) return { error: INVALID_VALUES };

  const { matchUps } = allTournamentMatchUps({
    tournamentRecord,
  });

  const relevantMatchUpIds = matchUps
    .filter(
      (matchUp) =>
        !ignoreMatchUpStatuses.includes(matchUp.matchUpStatus) &&
        hasSchedule({ schedule: matchUp.schedule, scheduleAttributes })
    )
    .map(({ matchUpId }) => matchUpId);

  const clearedScheduleValues = {
    venueId: '',
    scheduledDate: '',
    scheduledTime: '',
  };

  return bulkScheduleMatchUps({
    tournamentRecord,
    matchUpIds: relevantMatchUpIds,
    schedule: clearedScheduleValues,
  });
}

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

  const hasSchedule = ({ schedule }) => {
    const matchUpScheduleKeys = Object.keys(schedule)
      .filter((key) => scheduleAttributes.includes(key))
      .filter((key) => schedule[key]);
    return !!matchUpScheduleKeys.length;
  };

  const relevantMatchUpIds = matchUps
    .filter(
      (matchUp) =>
        !ignoreMatchUpStatuses.includes(matchUp.matchUpStatus) &&
        hasSchedule(matchUp)
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

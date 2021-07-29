import { allTournamentMatchUps } from '../../getters/matchUpsGetter';

import { bulkScheduleMatchUps } from './bulkScheduleMatchUps';

import { completedMatchUpStatuses } from '../../../constants/matchUpStatusConstants';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function clearScheduledMatchUps({
  tournamentRecord,
  ignoreMatchUpStatuses = completedMatchUpStatuses,
}) {
  if (typeof tournamentRecord !== 'object')
    return { error: MISSING_TOURNAMENT_RECORD };

  if (!Array.isArray(ignoreMatchUpStatuses)) return { error: INVALID_VALUES };

  const { matchUps } = allTournamentMatchUps({
    tournamentRecord,
  });

  const hasSchedule = ({ schedule }) => {
    const scheduleKeys =
      schedule &&
      Object.keys(schedule).filter(
        (key) => key !== 'updatedAt' && schedule[key]
      );
    return !!scheduleKeys?.length;
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

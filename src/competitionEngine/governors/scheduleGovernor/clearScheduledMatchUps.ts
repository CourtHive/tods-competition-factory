import { clearScheduledMatchUps as clearSchedules } from '../../../tournamentEngine/governors/scheduleGovernor/clearScheduledMatchUps';
import { completedMatchUpStatuses } from '../../../constants/matchUpStatusConstants';
import { isObject } from '../../../utilities/objects';

import { MISSING_TOURNAMENT_RECORDS } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MatchUpStatusEnum,
  Tournament,
} from '../../../types/tournamentFromSchema';

type ClearScheduledMatchUpsArgs = {
  tournamentRecords: { [key: string]: Tournament };
  ignoreMatchUpStatuses?: MatchUpStatusEnum[];
  scheduleAttributes?: string[];
  scheduledDates: string[];
  venueIds?: string[];
};
export function clearScheduledMatchUps({
  scheduleAttributes = ['scheduledDate', 'scheduledTime'],
  ignoreMatchUpStatuses = completedMatchUpStatuses,
  tournamentRecords,
  scheduledDates,
  venueIds,
}: ClearScheduledMatchUpsArgs) {
  const tournamentIds = isObject(tournamentRecords)
    ? Object.values(tournamentRecords)
        .map(({ tournamentId }) => tournamentId)
        .filter(Boolean)
    : [];
  if (!tournamentIds?.length) return { error: MISSING_TOURNAMENT_RECORDS };

  for (const tournamentId of tournamentIds) {
    const tournamentRecord = tournamentRecords[tournamentId];
    const result = clearSchedules({
      ignoreMatchUpStatuses,
      scheduleAttributes,
      tournamentRecord,
      scheduledDates,
      venueIds,
    });
    if (result.error) return result;
  }

  return { ...SUCCESS };
}
